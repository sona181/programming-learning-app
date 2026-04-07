// page.tsx (Dashboard)
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Greeting from "./components/Greeting";
import StatsRow from "./components/StatsRow";
import TodaySessions from "./components/TodaySessions";
import AddMaterial from "./components/AddMaterial";
import LastEarnings from "./components/LastEarnings";
import StudentRatings from "./components/StudentRatings";

export default async function Dashboard() {
  const instructor = await prisma.instructorProfile.findFirst({
    include: { user: { include: { profile: true } } },
  });

  let sessions: any[] = [];
  if (instructor) {
    sessions = await prisma.sessionBooking.findMany({
      where: { instructorId: instructor.id },
      include: { student: true },
    });
  }

  const payments = await prisma.payment.findMany();
  const totalEarnings = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const now = new Date();
  const monthlyEarnings = payments
    .filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const uniqueStudents = new Set(sessions.map((s) => s.studentId)).size;
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    return d.toDateString() === now.toDateString();
  });

  // Time-based greeting
  const hour = now.getHours();
  let timeGreeting = "Hello";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 18) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";

  return (
    <div style={{ padding: "20px" }}>
      {/* GREETING */}
     <Greeting
  name={instructor?.user?.profile?.displayName || "Professor"}
  monthlyEarnings={monthlyEarnings}
  todaySessions={todaySessions.length}
  timeGreeting={timeGreeting}
/>

      {/* STATS */}
      <StatsRow
        students={uniqueStudents}
        sessions={sessions.length}
        rating={Number(instructor?.rating ?? 0)}
        totalEarnings={totalEarnings}
        monthlyEarnings={monthlyEarnings}
      />

      {/* TODAY SESSIONS + ADD MATERIAL */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 2 }}>
          <TodaySessions sessions={todaySessions} />
        </div>
        <div style={{ flex: 1 }}>
          <AddMaterial />
        </div>
      </div>

      {/* LAST EARNINGS + STUDENT RATINGS */}
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