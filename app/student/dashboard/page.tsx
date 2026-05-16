import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseProgress, { type StudentCourse } from "./_components/course-progress";
import Greeting from "./_components/greeting";
import RecentActivity, { activityIcons } from "./_components/recent-activity";
import { StatsRow } from "./_components/stats-row";
import UpcomingSession from "./_components/upcoming-session";

export const dynamic = "force-dynamic";

const COURSE_COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"];

const FALLBACK_COURSES: StudentCourse[] = [
  {
    title: "C Programming",
    professor: "Prof. Arben Kodra",
    chapter: "Pointers & Memory",
    progress: 62,
    color: "#2563eb",
  },
  {
    title: "Java Programming",
    professor: "Prof. Elira Hoxha",
    chapter: "Object-Oriented Programming",
    progress: 88,
    color: "#10b981",
  },
  {
    title: "Web Development",
    professor: "Prof. Blerina Deda",
    chapter: "React Components",
    progress: 24,
    color: "#8b5cf6",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "P";
}

function timeAgo(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default async function StudentDashboard() {
  const sessionUser = await getCurrentSessionUser();

  if (sessionUser?.role !== "student") {
    redirect("/auth/login");
  }

  const now = new Date();

  const [user, enrollments, xpTotal, lessonCount, badgeCount, streak, xpLogs, badges, nextSession] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: { profile: true },
      }),
      prisma.enrollment.findMany({
        where: { userId: sessionUser.id, status: { not: "cancelled" } },
        include: {
          course: {
            include: {
              author: { include: { profile: true } },
              chapters: {
                orderBy: { orderIndex: "asc" },
                include: {
                  lessons: {
                    orderBy: { orderIndex: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
          courseProgress: true,
        },
        orderBy: { enrolledAt: "desc" },
        take: 5,
      }),
      prisma.xpLog.aggregate({
        where: { userId: sessionUser.id },
        _sum: { xpAmount: true },
      }),
      prisma.lessonProgress.count({
        where: { enrollment: { userId: sessionUser.id }, isCompleted: true },
      }),
      prisma.userBadge.count({
        where: { userId: sessionUser.id },
      }),
      prisma.userStreak.findUnique({
        where: { userId: sessionUser.id },
      }),
      prisma.xpLog.findMany({
        where: { userId: sessionUser.id },
        orderBy: { earnedAt: "desc" },
        take: 2,
      }),
      prisma.userBadge.findMany({
        where: { userId: sessionUser.id },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
        take: 1,
      }),
      prisma.sessionBooking.findFirst({
        where: {
          studentId: sessionUser.id,
          status: "confirmed",
          slot: { startsAt: { gte: now } },
        },
        include: {
          slot: true,
          instructorProfile: {
            include: {
              user: { include: { profile: true } },
            },
          },
        },
        orderBy: { slot: { startsAt: "asc" } },
      }),
    ]);

  const studentName = user?.profile?.displayName ?? user?.email ?? "Student";
  const xp = xpTotal._sum.xpAmount ?? 0;

  const courses =
    enrollments.length > 0
      ? enrollments.map((enrollment, index) => {
          const course = enrollment.course;
          const firstChapter = course.chapters[0];
          const firstLesson = firstChapter?.lessons[0];

          return {
            title: course.title,
            professor: course.author.profile?.displayName
              ? `Prof. ${course.author.profile.displayName}`
              : "Professor",
            chapter: firstLesson?.title ?? firstChapter?.title ?? "Next lesson",
            progress: Math.round(Number(enrollment.courseProgress?.progressPercent ?? 0)),
            color: COURSE_COLORS[index % COURSE_COLORS.length],
            slug: course.slug,
          };
        })
      : FALLBACK_COURSES;

  const recentActivities = [
    ...xpLogs.map((log) => ({
      title: log.description ?? `Earned ${log.xpAmount} XP`,
      time: timeAgo(log.earnedAt),
      icon: activityIcons.lesson,
    })),
    ...badges.map((badge) => ({
      title: `Earned badge: ${badge.badge.name}`,
      time: timeAgo(badge.earnedAt),
      icon: activityIcons.badge,
    })),
  ].slice(0, 3);

  const session = nextSession
    ? {
        id: nextSession.id,
        professorName:
          nextSession.instructorProfile.user.profile?.displayName ?? "Professor",
        courseTitle: nextSession.topic ?? "Live mentoring session",
        startsAt: nextSession.slot.startsAt.toISOString(),
        durationMinutes: Math.max(
          1,
          Math.round(
            (nextSession.slot.endsAt.getTime() - nextSession.slot.startsAt.getTime()) / 60000,
          ),
        ),
        initials: getInitials(nextSession.instructorProfile.user.profile?.displayName ?? "Professor"),
      }
    : null;

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100%",
      }}
    >
      <Greeting name={studentName} streak={streak?.currentStreak ?? 0} />

      <StatsRow
        courses={enrollments.length || courses.length}
        xp={xp}
        lessons={lessonCount}
        badges={badgeCount}
      />

      <div
        className="student-dashboard-content-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(300px, 1fr)",
          gap: "20px",
          marginTop: "22px",
        }}
      >
        <CourseProgress courses={courses} />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          <RecentActivity activities={recentActivities} />
          <UpcomingSession session={session} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .student-dashboard-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
