import { prisma } from "@/lib/prisma";
import ProfileBanner from "./components/ProfileBanner";
import Availability from "./components/Availability";
import Courses from "./components/Courses";
import StudentReviews from "./components/StudentReviews";

export const dynamic = "force-dynamic";

type SlotItem = {
  time: string;
  isBooked: boolean;
};

type Slot = {
  day: string;
  items: SlotItem[];
};

const weekOrder: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Tirane",
  });

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Europe/Tirane",
  });

export default async function ProfessorProfilePage() {
  const userEmail = "timdoe@gmail.com"; // must change depending on auth

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      profile: true,
      instructorProfile: true,
      courses: {
        include: {
          enrollments: true,
          chapters: true,
        },
      },
    },
  });

  if (!user) return <div>User not found</div>;

  const instructor = user.instructorProfile;

  const students = user.courses.reduce(
    (acc, c) => acc + c.enrollments.length,
    0
  );

  const rating = Number(instructor?.rating ?? 0);

  const courseIds = user.courses.map((c) => c.id);

const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const earningsThisMonth = await prisma.payment.aggregate({
  where: {
    courseId: { in: courseIds },
    status: "completed",
    createdAt: {
      gte: startOfMonth,
      lt: startOfNextMonth,
    },
  },
  _sum: { amount: true },
});

  const earnings = Number(earningsThisMonth._sum.amount ?? 0);

  const earningsMonthly = await prisma.payment.aggregate({
    where: {
      courseId: { in: courseIds },
      status: "completed",
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { amount: true },
  });

  const monthlyEarnings = Number(earningsMonthly._sum.amount ?? 0);

  const slotsRaw = await prisma.availabilitySlot.findMany({
    where: {
      instructorId: instructor?.id,
    },
    orderBy: { startsAt: "asc" },
  });

  const grouped: Record<string, SlotItem[]> = {};

  for (const s of slotsRaw) {
    const day = formatDay(s.startsAt);
    const time = `${formatTime(s.startsAt)} - ${formatTime(s.endsAt)}`;

    if (!grouped[day]) grouped[day] = [];

    grouped[day].push({
      time,
      isBooked: s.isBooked,
    });
  }

  const formattedSlots: Slot[] = Object.keys(grouped)
    .sort((a, b) => (weekOrder[a] ?? 0) - (weekOrder[b] ?? 0))
    .map((day) => ({
      day,
      items: grouped[day],
    }));

  return (
    <div style={{ padding: 30, background: "#F8FAFC" }}>
      <ProfileBanner
        name={user.profile?.displayName || "Professor"}
        email={user.email}
        rating={rating}
        reviewsCount={0}
        students={students}
        courses={user.courses.length}
        earnings={earnings}
      />

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Availability slots={formattedSlots} />
        <Courses courses={user.courses} />
      </div>

    
      <StudentReviews />
    </div>
  );
}