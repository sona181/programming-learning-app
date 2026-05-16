export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/auth/session";
import CourseBrowsePage from "./CourseBrowsePage";
import type { CourseLevel, CourseLanguage } from "./types";

const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const COURSE_LANGUAGES = ["sq", "en", "it"] as const;

function safeLevel(level: string): CourseLevel {
  return COURSE_LEVELS.includes(level as CourseLevel) ? (level as CourseLevel) : "beginner";
}

function safeLanguage(language: string): CourseLanguage {
  return COURSE_LANGUAGES.includes(language as CourseLanguage) ? (language as CourseLanguage) : "sq";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const [{ userId: paramUserId = null }, sessionUser] = await Promise.all([
    searchParams,
    getCurrentSessionUser(),
  ]);

  const effectiveUserId = sessionUser?.id ?? paramUserId;

  const [courses, categories, userRecord] = await Promise.all([
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
    effectiveUserId
      ? prisma.user.findUnique({
          where: { id: effectiveUserId },
          select: {
            profile: { select: { displayName: true } },
            _count: { select: { enrollments: true } },
          },
        })
      : null,
  ]);

  const userName = userRecord?.profile?.displayName ?? null;

  const safeCourses = courses.map((c) => {
    const isEnrolled = effectiveUserId
      ? c.enrollments.some((e) => e.userId === effectiveUserId)
      : false;

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: safeLevel(c.level),
      language: safeLanguage(c.language),
      isPremium: c.isPremium,
      price: c.price ? Number(c.price) : null,
      thumbnailUrl: c.thumbnailUrl,
      category: c.category?.name ?? "General",
      instructor: c.author?.profile?.displayName ?? "Unknown",
      authorId: c.author?.id ?? "",
      coAuthorCount: c.courseAuthors.length,
      lessonCount: c._count.chapters,
      enrollmentCount: c._count.enrollments,
      isEnrolled,
      rating: null,
      reviewCount: 0,
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
      userId={effectiveUserId}
      userName={userName}
    />
  );
}
