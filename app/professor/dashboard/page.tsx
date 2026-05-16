export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Greeting from "./_components/greeting";
import { StatsRow } from "./_components/stats-row";
import TodaySessions from "./_components/today-sessions";
import LastEarnings from "./_components/last-earnings";
import SessionNotes from "./_components/session-notes";
import AddMaterial from "./_components/add-material";

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

const AVATAR_COLORS = [
  "#14b8a6", "#3b82f6", "#f97316", "#8b5cf6",
  "#ec4899", "#10b981", "#f59e0b", "#6366f1",
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default async function Dashboard() {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser?.role !== "instructor") redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
    include: { profile: true, instructorProfile: true },
  });

  if (!user?.instructorProfile) {
    return <div style={{ padding: 40 }}>Instructor profile not found.</div>;
  }

  const instructor = user.instructorProfile;
  const professorName = user.profile?.displayName ?? "Professor";
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // All bookings with slot + student
  const allBookings = await prisma.sessionBooking.findMany({
    where: { instructorId: instructor.id },
    include: {
      student: { include: { profile: true } },
      slot: true,
    },
    orderBy: { bookedAt: "desc" },
  });

  // Today's sessions filtered by slot start time
  const todayBookings = allBookings.filter((b) => {
    const t = new Date(b.slot.startsAt);
    return t >= todayStart && t < todayEnd;
  });

  // This month's bookings
  const monthBookings = allBookings.filter((b) => {
    const t = new Date(b.slot.startsAt);
    return t >= monthStart && t < monthEnd;
  });

  // Next upcoming booking
  const nextBooking = allBookings
    .filter((b) => new Date(b.slot.startsAt) > now)
    .sort((a, b) => new Date(a.slot.startsAt).getTime() - new Date(b.slot.startsAt).getTime())[0];

  const minutesUntilNext = nextBooking
    ? Math.round((new Date(nextBooking.slot.startsAt).getTime() - now.getTime()) / 60000)
    : null;

  // Authored courses + unique enrolled students
  const courses = await prisma.course.findMany({
    where: { authorId: user.id },
    include: { enrollments: true },
  });
  const uniqueStudents = new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId))).size;

  // Earnings: payments for this instructor's courses or sessions
  const courseIds  = courses.map((c) => c.id);
  const bookingIds = allBookings.map((b) => b.id);

  const paymentsRaw = await prisma.payment.findMany({
    where: {
      status: "completed",
      OR: [
        { courseId: { in: courseIds } },
        { bookingId: { in: bookingIds } },
      ],
    },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const allEarnings = paymentsRaw.map((p) => {
    const name = p.user?.profile?.displayName ?? p.user?.email ?? "Student";
    return {
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      createdAt: p.createdAt.toISOString(),
      type: p.bookingId ? ("session" as const) : ("course" as const),
      studentName: name,
      studentInitials: getInitials(name),
      avatarColor: avatarColor(name),
    };
  });

  const monthlyEarnings = allEarnings
    .filter((p) => { const d = new Date(p.createdAt); return d >= monthStart && d < monthEnd; })
    .reduce((s, p) => s + p.amount, 0);

  // Session notes
  const notesRaw = await prisma.sessionNote.findMany({
    where: { session: { booking: { instructorId: instructor.id } } },
    include: {
      session: {
        include: { booking: { include: { student: { include: { profile: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const notes = notesRaw.map((n) => {
    const studentName =
      n.session.booking.student.profile?.displayName ??
      n.session.booking.student.email;
    return {
      id: n.id,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      isSharedWithStudent: n.isSharedWithStudent,
      studentName,
      studentInitials: getInitials(studentName),
      avatarColor: avatarColor(studentName),
    };
  });

  // Sessions for display
  const todaySessionsDisplay = todayBookings.map((b) => {
    const name = b.student.profile?.displayName ?? b.student.email;
    const slotStart = new Date(b.slot.startsAt);
    return {
      id: b.id,
      studentName: name,
      studentInitials: getInitials(name),
      avatarColor: avatarColor(name),
      topic: b.topic ?? null,
      slotTime: slotStart.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" }),
      status: b.status,
    };
  });

  const hour = now.getHours();
  const timeGreeting = hour < 12 ? "Mirëmëngjes" : hour < 18 ? "Mirëdita" : "Mirëmbrëma";

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%" }}>
      <Greeting
        name={professorName}
        monthlyEarnings={monthlyEarnings}
        todaySessions={todayBookings.length}
        timeGreeting={timeGreeting}
        minutesUntilNext={minutesUntilNext}
      />

      <StatsRow
        students={uniqueStudents}
        monthlyEarnings={monthlyEarnings}
        sessionCount={monthBookings.length}
        todaySessionCount={todayBookings.length}
        rating={Number(instructor.rating ?? 0)}
      />

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <TodaySessions sessions={todaySessionsDisplay} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <LastEarnings earnings={allEarnings.slice(0, 5)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <SessionNotes notes={notes} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AddMaterial />
        </div>
      </div>
    </div>
  );
}
