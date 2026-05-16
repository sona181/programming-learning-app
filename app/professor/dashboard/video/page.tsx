export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import VideoCallClient from "./_components/VideoCallClient";

const ALB_MONTHS = [
  "Janar","Shkurt","Mars","Prill","Maj","Qershor",
  "Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor",
];

function getInitials(name: string) {
  const p = name.trim().split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "??";
}

const AVATAR_COLORS = ["#14b8a6","#3b82f6","#f97316","#8b5cf6","#ec4899","#10b981","#f59e0b","#6366f1"];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default async function VideoDashboardPage() {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser?.role !== "instructor") redirect("/auth/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: sessionUser.id },
  });
  if (!instructor) redirect("/professor/dashboard");

  const now = new Date();

  const bookings = await prisma.sessionBooking.findMany({
    where: {
      instructorId: instructor.id,
      status: "confirmed",
      slot: { startsAt: { gte: now } },
    },
    include: {
      student: { include: { profile: true } },
      slot: true,
    },
    orderBy: { slot: { startsAt: "asc" } },
  });

  const sessions = bookings.map((b) => {
    const name = b.student.profile?.displayName ?? b.student.email;
    const d = b.slot.startsAt;
    const dur = Math.round((b.slot.endsAt.getTime() - d.getTime()) / 60000);
    const dateLabel = `${d.getDate()} ${ALB_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const timeLabel = d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
    return {
      id: b.id,
      studentName: name,
      studentInitials: getInitials(name),
      avatarColor: avatarColor(name),
      topic: b.topic ?? null,
      dateLabel,
      timeLabel,
      durationMin: dur,
      startsAt: d.toISOString(),
    };
  });

  return <VideoCallClient sessions={sessions} />;
}
