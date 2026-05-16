import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import MyCoursesPage from "./MyCoursesPage";

export default async function Page() {
  const session = await getCurrentSessionUser();

  if (!session) {
    return <MyCoursesPage enrolledCourses={[]} />;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.id },
    include: {
      course: {
        include: {
          category: true,
          author: {
            include: {
              profile: true,
              instructorProfile: true,
            },
          },
          _count: { select: { chapters: true, enrollments: true } },
          courseAuthors: {
            where: { authorRole: { not: "primary" } },
          },
        },
      },
      courseProgress: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const enrolledCourses = enrollments.map((e) => {
    const c = e.course;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: c.level as "beginner" | "intermediate" | "advanced",
      language: c.language as "sq" | "en" | "it",
      isPremium: c.isPremium,
      price: c.price ? Number(c.price) : null,
      thumbnailUrl: c.thumbnailUrl,
      category: c.category?.name ?? "General",
      instructor: c.author?.profile?.displayName ?? "Unknown",
      authorId: c.author?.id ?? "",
      coAuthorCount: c.courseAuthors.length,
      lessonCount: c._count.chapters,
      enrollmentCount: c._count.enrollments,
      rating: c.author?.instructorProfile?.rating
        ? Number(c.author.instructorProfile.rating)
        : null,
      enrolledAt: e.enrolledAt.toISOString(),
      progressPercent: e.courseProgress
        ? Number(e.courseProgress.progressPercent)
        : 0,
      completedAt: e.completedAt ? e.completedAt.toISOString() : null,
    };
  });

  return <MyCoursesPage enrolledCourses={enrolledCourses} />;
}
