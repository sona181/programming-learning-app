export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SessionsClient from "./_components/SessionsClient";

function getInitials(name: string) {
  const p = name.trim().split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "??";
}

const AVATAR_COLORS = ["#14b8a6", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default async function ProfessorSessionsPage() {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser?.role !== "instructor") redirect("/auth/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: sessionUser.id },
  });
  if (!instructor) redirect("/professor/dashboard");

  const now = new Date();

  const allBookings = await prisma.sessionBooking.findMany({
    where: { instructorId: instructor.id },
    include: {
      student: { include: { profile: true } },
      slot: true,
    },
    orderBy: { bookedAt: "desc" },
  });

  function mapBooking(b: (typeof allBookings)[0]) {
    const name = b.student.profile?.displayName ?? b.student.email;
    return {
      id: b.id,
      status: b.status,
      topic: b.topic ?? null,
      studentName: name,
      studentInitials: getInitials(name),
      avatarColor: avatarColor(name),
      startsAt: b.slot.startsAt.toISOString(),
      endsAt: b.slot.endsAt.toISOString(),
    };
  }

  const upcomingBookings = allBookings
    .filter((b) => new Date(b.slot.startsAt) >= now)
    .sort((a, b) => new Date(a.slot.startsAt).getTime() - new Date(b.slot.startsAt).getTime())
    .map(mapBooking);

  const pastBookings = allBookings
    .filter((b) => new Date(b.slot.startsAt) < now)
    .map(mapBooking);

  const availableSlots = await prisma.availabilitySlot.findMany({
    where: { instructorId: instructor.id, isBooked: false },
    orderBy: { startsAt: "asc" },
  });

  const slots = availableSlots.map((s) => ({
    id: s.id,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
  }));

  return (
    <SessionsClient
      upcomingBookings={upcomingBookings}
      pastBookings={pastBookings}
      existingSlots={slots}
    />
  );
}
