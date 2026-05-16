import { getCurrentSessionUser } from "@/lib/auth/session";
import { corsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ notificationId: string }> };

// PATCH: { action: "confirm" | "decline" } — acts on the booking_request notification
export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  const { notificationId } = await params;

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId: session.id },
  });
  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders() });
  }

  let body: { action?: string };
  try { body = await request.json(); } catch { body = {}; }
  const action = body.action;

  if (notification.type === "booking_request" && (action === "confirm" || action === "decline")) {
    let parsed: { bookingId?: string } = {};
    try { parsed = JSON.parse(notification.message); } catch { /* ignore */ }

    if (parsed.bookingId) {
      const newStatus = action === "confirm" ? "confirmed" : "cancelled";
      await prisma.$transaction(async (tx) => {
        const booking = await tx.sessionBooking.update({
          where: { id: parsed.bookingId },
          data: { status: newStatus },
          include: {
            instructorProfile: { include: { user: { include: { profile: true } } } },
            slot: true,
            student: { include: { profile: true } },
          },
        });

        const instructorName =
          booking.instructorProfile.user.profile?.displayName ??
          booking.instructorProfile.user.email;
        const slotTime = booking.slot.startsAt.toLocaleString("sq-AL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });

        if (action === "confirm") {
          await tx.liveSession.upsert({
            where: { bookingId: booking.id },
            create: {
              bookingId: booking.id,
              externalMeetingId: `unilearn-${booking.id.replace(/-/g, "")}`,
              joinUrl: `/sessions/${booking.id}/call`,
              provider: "jitsi",
              status: "scheduled",
            },
            update: {
              status: "scheduled",
              joinUrl: `/sessions/${booking.id}/call`,
            },
          });
        }

        if (action === "decline") {
          await tx.availabilitySlot.update({
            where: { id: booking.slotId },
            data: { isBooked: false },
          });
        }

        await tx.notification.create({
          data: {
            userId: booking.studentId,
            type: action === "confirm" ? "booking_confirmed" : "booking_declined",
            message:
              action === "confirm"
                ? `Prof. ${instructorName} confirmed your session for ${slotTime}.`
                : `Prof. ${instructorName} declined your session request for ${slotTime}.`,
            isRead: false,
            createdAt: new Date(),
          },
        });

        await tx.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
      });
    }
  } else {
    // Just mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
