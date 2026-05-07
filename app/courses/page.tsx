import { prisma } from "@/lib/prisma";
import CourseBrowsePage from "./CourseBrowsePage";

export default async function Page({
  searchParams,
}: {
  searchParams?: { userId?: string };
}) {
  const userId = searchParams?.userId ?? null;

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: { status: "published" },
      include: {
        category: true,
        author: {
          include: {
            profile: true,
            instructorProfile: true,
          },
        },
        enrollments: true,
        _count: {
          select: { chapters: true, enrollments: true },
        },
        courseAuthors: {
          where: { authorRole: { not: "primary" } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.courseCategory.findMany({
      select: {
        name: true,
        _count: { select: { courses: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const safeCourses = courses.map((c) => {
    const isEnrolled = userId
      ? c.enrollments.some((e) => e.userId === userId)
      : false;

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
      coAuthorCount: c.courseAuthors.length,
      lessonCount: c._count.chapters,
      enrollmentCount: c._count.enrollments,
      isEnrolled,
      rating: c.author?.instructorProfile?.rating
        ? Number(c.author.instructorProfile.rating)
        : null,
    };
  });

  const safeCategories = categories.map((cat) => ({
    name: cat.name,
    count: cat._count.courses,
  }));

  return (
    <CourseBrowsePage
      courses={safeCourses}
      categories={safeCategories}
      userId={userId}
    />
  );
}