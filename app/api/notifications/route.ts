import { getCurrentSessionUser } from "@/lib/auth/session";
import { corsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function createSessionReminders(userId: string, role: string) {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const bookingWhere =
    role === "instructor"
      ? {
          status: "confirmed",
          slot: { startsAt: { gte: now, lte: inOneHour } },
          instructorProfile: { userId },
        }
      : {
          status: "confirmed",
          slot: { startsAt: { gte: now, lte: inOneHour } },
          studentId: userId,
        };

  const bookings = await prisma.sessionBooking.findMany({
    where: bookingWhere,
    include: {
      instructorProfile: { include: { user: { include: { profile: true } } } },
      slot: true,
      student: { include: { profile: true } },
    },
    take: 10,
  });

  for (const booking of bookings) {
    const minutesUntil = Math.round((booking.slot.startsAt.getTime() - now.getTime()) / 60000);
    const reminderType =
      minutesUntil <= 15
        ? "session_reminder_15"
        : minutesUntil <= 60
          ? "session_reminder_60"
          : null;

    if (!reminderType) continue;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: reminderType,
        message: { contains: booking.id },
      },
    });

    if (existing) continue;

    const otherName =
      role === "instructor"
        ? booking.student.profile?.displayName ?? booking.student.email
        : booking.instructorProfile.user.profile?.displayName ?? booking.instructorProfile.user.email;

    const startsAt = booking.slot.startsAt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await prisma.notification.create({
      data: {
        userId,
        type: reminderType,
        message: JSON.stringify({
          bookingId: booking.id,
          startsAt,
          minutesUntil: reminderType === "session_reminder_15" ? 15 : 60,
          title: `Session with ${otherName}`,
          joinUrl: `/sessions/${booking.id}/call`,
        }),
        isRead: false,
        createdAt: new Date(),
      },
    });
  }
}

export async function GET(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  await createSessionReminders(session.id, session.role);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(
    notifications.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    { headers: corsHeaders() },
  );
}

// Mark all as read
export async function PATCH(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  await prisma.notification.updateMany({
    where: { userId: session.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
