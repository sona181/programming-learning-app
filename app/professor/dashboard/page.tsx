export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Greeting from "./components/Greeting";
import { StatsRow } from "./components/StatsRow";
import TodaySessions from "./components/TodaySessions";
import AddMaterial from "./components/AddMaterial";
import LastEarnings from "./components/LastEarnings";
import StudentRatings from "./components/StudentRatings";

export default async function Dashboard() {
  const userEmail = "timdoe@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      profile: true,
      instructorProfile: true,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const professorName = user.profile?.displayName || "Professor";
  const instructor = user.instructorProfile;

  // =========================
  // SESSIONS (LIVE BOOKINGS)
  // =========================
  let sessions: any[] = [];

  if (instructor) {
    sessions = await prisma.sessionBooking.findMany({
      where: { instructorId: instructor.id },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        bookedAt: "desc",
      },
    });
  }

  // =========================
  // COURSES OWNED BY INSTRUCTOR
  // =========================
  const courses = await prisma.course.findMany({
    where: {
      authorId: user.id,
    },
    select: {
      id: true,
    },
  });

  // =========================
  // ENROLLMENTS (REAL STUDENTS)
  // =========================
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: {
        in: courses.map((c) => c.id),
      },
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  const uniqueStudents = new Set(
    enrollments.map((e) => e.userId)
  ).size;

  // =========================
  // PAYMENTS
  // =========================
  const paymentsRaw = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const payments = paymentsRaw.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));

  const totalEarnings = payments.reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  const now = new Date();

  const monthlyEarnings = payments
    .filter((p) => {
      const d = new Date(p.createdAt);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  // =========================
  // TODAY SESSIONS
  // =========================
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.bookedAt);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  // =========================
  // GREETING
  // =========================
  const hour = now.getHours();

  let timeGreeting = "Good evening";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 18) timeGreeting = "Good afternoon";

  return (
    <div
      style={{
        padding: "20px",
        background: "#F8FAFC",
        minHeight: "100%",
      }}
    >
      <Greeting
        name={professorName}
        monthlyEarnings={monthlyEarnings}
        todaySessions={todaySessions.length}
        timeGreeting={timeGreeting}
      />

      <StatsRow
        students={uniqueStudents}   // ✅ REAL DB STUDENTS
        sessions={sessions.length}
        rating={Number(instructor?.rating ?? 0)}
        totalEarnings={totalEarnings}
        monthlyEarnings={monthlyEarnings}
      />

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 2 }}>
          <TodaySessions sessions={todaySessions} />
        </div>

        <div style={{ flex: 1 }}>
          <AddMaterial />
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1 }}>
          <LastEarnings payments={payments} />
        </div>

        <div style={{ flex: 1 }}>
          <StudentRatings sessions={sessions} />
        </div>
      </div>
    </div>
  );
}