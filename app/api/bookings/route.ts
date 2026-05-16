import { getCurrentSessionUser } from "@/lib/auth/session";
import { corsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function isInsideTeachingHours(startsAt: Date, endsAt: Date) {
  const startHour = startsAt.getHours() + startsAt.getMinutes() / 60;
  const endHour = endsAt.getHours() + endsAt.getMinutes() / 60;

  return startHour >= 9 && endHour <= 18 && endsAt > startsAt;
}

export async function POST(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  let body: { slotId?: string; topic?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
  }

  const { slotId, topic } = body;
  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400, headers: corsHeaders() });
  }

  const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.isBooked) {
    return NextResponse.json({ error: "Slot not available" }, { status: 409, headers: corsHeaders() });
  }

  if (!isInsideTeachingHours(slot.startsAt, slot.endsAt)) {
    return NextResponse.json(
      { error: "Sessions can only be booked between 09:00 and 18:00." },
      { status: 400, headers: corsHeaders() },
    );
  }

  // Fetch instructor user + student profile to build notification
  const [instructorProfile, student] = await Promise.all([
    prisma.instructorProfile.findUnique({
      where: { id: slot.instructorId },
      include: { user: true },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true },
    }),
  ]);

  const booking = await prisma.$transaction(async (tx) => {
    await tx.availabilitySlot.update({ where: { id: slotId }, data: { isBooked: true } });
    const newBooking = await tx.sessionBooking.create({
      data: {
        studentId: session.id,
        instructorId: slot.instructorId,
        slotId,
        topic: topic ?? null,
        status: "pending",
        bookedAt: new Date(),
      },
    });

    // Notify instructor
    if (instructorProfile) {
      const studentName = student?.profile?.displayName ?? student?.email ?? "Një student";
      const slotTime = slot.startsAt.toLocaleString("sq-AL", {
        weekday: "long", day: "numeric", month: "long",
        hour: "2-digit", minute: "2-digit",
      });
      const durationMin = Math.round(
        (slot.endsAt.getTime() - slot.startsAt.getTime()) / 60000,
      );
      await tx.notification.create({
        data: {
          userId: instructorProfile.userId,
          type: "booking_request",
          message: JSON.stringify({
            bookingId: newBooking.id,
            studentId: session.id,
            studentName,
            slotTime,
            durationMin,
            topic: topic ?? null,
          }),
          isRead: false,
          createdAt: new Date(),
        },
      });
    }

    return newBooking;
  });

  return NextResponse.json({ bookingId: booking.id }, { status: 201, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  const bookings = await prisma.sessionBooking.findMany({
    where: { studentId: session.id },
    include: {
      slot: true,
      instructorProfile: { include: { user: { include: { profile: true } } } },
    },
    orderBy: { bookedAt: "desc" },
  });

  return NextResponse.json(
    bookings.map((b) => ({
      id: b.id,
      status: b.status,
      topic: b.topic,
      startsAt: b.slot.startsAt.toISOString(),
      endsAt: b.slot.endsAt.toISOString(),
      instructorName:
        b.instructorProfile.user.profile?.displayName ?? b.instructorProfile.user.email,
    })),
    { headers: corsHeaders() },
  );
}
