export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Greeting from "./_components/greeting";
import { StatsRow } from "./_components/stats-row";
import TodaySessions from "./_components/today-sessions";
import AddMaterial from "./_components/add-material";
import LastEarnings from "./_components/last-earnings";
import StudentRatings from "./_components/student-ratings";

export default async function Dashboard() {
  const userEmail = "timdoe@gmail.com";

  let user = null;

  try {
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        profile: true,
        instructorProfile: true,
      },
    });
  } catch (err) {
    console.error("User fetch error:", err);
    return <div>Error loading user</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const professorName = user.profile?.displayName || "Professor";
  const instructor = user.instructorProfile;

  let sessions: any[] = [];

  try {
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
  } catch (err) {
    console.error("Sessions error:", err);
  }

  let courses: any[] = [];

  try {
    courses = await prisma.course.findMany({
      where: {
        authorId: user.id,
      },
      select: {
        id: true,
      },
    });
  } catch (err) {
    console.error("Courses error:", err);
  }

  let enrollments: any[] = [];

  try {
    enrollments = await prisma.enrollment.findMany({
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
  } catch (err) {
    console.error("Enrollments error:", err);
  }

  const uniqueStudents = new Set(enrollments.map((e) => e.userId)).size;
  let paymentsRaw: any[] = [];

  try {
    paymentsRaw = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Payments error:", err);
  }

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

  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.bookedAt);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  let timeGreeting = "Good evening";
  const hour = now.getHours();

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
        students={uniqueStudents}
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