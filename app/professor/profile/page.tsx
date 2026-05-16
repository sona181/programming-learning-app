export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileBanner from "./components/ProfileBanner";
import Availability from "./components/Availability";
import Courses from "./components/Courses";
import StudentReviews from "./components/StudentReviews";
import PersonalInfo from "./components/PersonalInfo";
import EarningsHistory from "./components/EarningsHistory";

type SlotItem = { time: string; isBooked: boolean };
type Slot = { day: string; items: SlotItem[] };

const weekOrder: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 7,
};

const fmt = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Tirane" });

const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Europe/Tirane" });

export default async function ProfessorProfilePage() {
  const session = await getCurrentSessionUser();
  if (session?.role !== "instructor") redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      profile: true,
      instructorProfile: true,
      courses: {
        include: {
          enrollments: true,
          chapters: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const instructor = user.instructorProfile;
  const totalStudents = user.courses.reduce((acc, c) => acc + c.enrollments.length, 0);
  const rating = Number(instructor?.rating ?? 0);

  // course_reviews table not yet migrated — use empty array until migration runs
  const allReviews: { id: string; rating: number; comment: string | null; userName: string | null }[] = [];

  // Monthly earnings
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const earningsResult = await prisma.payment.aggregate({
    where: {
      booking: { instructorId: instructor?.id },
      status: "completed",
      createdAt: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _sum: { amount: true },
  });
  const monthlyEarnings = Number(earningsResult._sum.amount ?? 0);

  // Recent session bookings for payment history
  const recentBookings = instructor?.id
    ? await prisma.sessionBooking.findMany({
        where: {
          instructorId: instructor.id,
          status: { in: ["confirmed", "completed"] },
          amountPaid: { not: null },
        },
        include: {
          student: { include: { profile: true } },
        },
        orderBy: { bookedAt: "desc" },
        take: 5,
      })
    : [];

  const earningsHistory = recentBookings.map((b) => ({
    id: b.id,
    date: b.bookedAt,
    label: b.student.profile?.displayName
      ? `Sesion · ${b.student.profile.displayName}`
      : "Sesion",
    amount: Number(b.amountPaid ?? 0),
  }));

  // Availability slots
  const slotsRaw = await prisma.availabilitySlot.findMany({
    where: { instructorId: instructor?.id ?? "" },
    orderBy: { startsAt: "asc" },
  });

  const grouped: Record<string, SlotItem[]> = {};
  for (const s of slotsRaw) {
    const day = fmtDay(s.startsAt);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push({ time: `${fmt(s.startsAt)} - ${fmt(s.endsAt)}`, isBooked: s.isBooked });
  }
  const slots: Slot[] = Object.keys(grouped)
    .sort((a, b) => (weekOrder[a] ?? 0) - (weekOrder[b] ?? 0))
    .map((day) => ({ day, items: grouped[day] }));


  return (
    <div style={{ padding: 30, background: "#F8FAFC", minHeight: "100vh" }}>
      {/* Profile banner — name card at top */}
      <ProfileBanner
        name={user.profile?.displayName ?? "Professor"}
        email={user.email}
        rating={rating}
        reviewsCount={0}
        students={totalStudents}
        courses={user.courses.length}
        earnings={monthlyEarnings}
        isVerified={instructor?.isVerified ?? false}
        isAvailable={instructor?.isAvailable ?? false}
        hourlyRate={instructor?.hourlyRate ? Number(instructor.hourlyRate) : null}
        country={user.profile?.country ?? null}
      />

      {/* Two-column body */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          alignItems: "flex-start",
        }}
      >
        {/* Left column: Professional Info + Availability */}
        <div
          style={{
            flex: "0 0 42%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <PersonalInfo
            name={user.profile?.displayName ?? ""}
            bio={user.instructorProfile?.bio ?? ""}
            specialties={user.instructorProfile?.specialties ?? ""}
            languages={user.instructorProfile?.languages ?? ""}
            hourlyRate={user.instructorProfile?.hourlyRate ? Number(user.instructorProfile.hourlyRate) : null}
            isAvailable={user.instructorProfile?.isAvailable ?? false}
          />
          <Availability slots={slots} />
        </div>

        {/* Right column: Courses + Earnings + Reviews */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Courses courses={user.courses} />
          <EarningsHistory entries={earningsHistory} monthlyTotal={monthlyEarnings} />
          <StudentReviews reviews={allReviews} />
        </div>
      </div>
    </div>
  );
}
