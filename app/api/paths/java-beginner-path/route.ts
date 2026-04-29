import { z } from "zod";
import { type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PATH_SLUG = "java-beginner-path";
const userIdSchema = z.string().uuid();

type PathProgressSummary = {
  completedLessonIds: string[];
  completedLessons: number;
  currentLessonId: string | null;
  enrollmentId: string | null;
  isPathComplete: boolean;
  totalLessons: number;
};

export async function GET(request: NextRequest) {
  const rawUserId = request.nextUrl.searchParams.get("userId");
  const parsedUserId =
    rawUserId == null ? null : userIdSchema.safeParse(rawUserId);

  if (parsedUserId && !parsedUserId.success) {
    return Response.json(
      {
        message: "Invalid user id.",
      },
      { status: 400 },
    );
  }

  const path = await prisma.learningPath.findUnique({
    where: {
      slug: PATH_SLUG,
    },
    include: {
      pathUnits: {
        orderBy: {
          orderIndex: "asc",
        },
        include: {
          quizzes: {
            select: {
              id: true,
              passScore: true,
              title: true,
              questions: {
                select: {
                  id: true,
                },
              },
            },
          },
          pathLessons: {
            orderBy: {
              orderIndex: "asc",
            },
            include: {
              _count: {
                select: {
                  pathActivities: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!path) {
    return Response.json(
      {
        message: "Java beginner path not found.",
      },
      { status: 404 },
    );
  }

  const units = path.pathUnits.map((unit) => ({
    description: unit.description,
    id: unit.id,
    lessons: unit.pathLessons.map((lesson) => ({
      activityCount: lesson._count.pathActivities,
      id: lesson.id,
      orderIndex: lesson.orderIndex,
      title: lesson.title,
      xpReward: lesson.xpReward,
    })),
    orderIndex: unit.orderIndex,
    quiz:
      unit.quizzes[0] == null
        ? null
        : {
            id: unit.quizzes[0].id,
            passScore: unit.quizzes[0].passScore,
            questionCount: unit.quizzes[0].questions.length,
            title: unit.quizzes[0].title,
          },
    title: unit.title,
  }));

  const orderedLessons = units.flatMap((unit) => unit.lessons);
  let progress: PathProgressSummary = {
    completedLessonIds: [] as string[],
    completedLessons: 0,
    currentLessonId: orderedLessons[0]?.id ?? null,
    enrollmentId: null as string | null,
    isPathComplete: false,
    totalLessons: orderedLessons.length,
  };

  if (parsedUserId?.success) {
    const userId = parsedUserId.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return Response.json(
        {
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    const enrollment = await prisma.userPathEnrollment.findUnique({
      where: {
        userId_pathId: {
          pathId: path.id,
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (enrollment) {
      const completedEntries = await prisma.userPathProgress.findMany({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
        },
        select: {
          pathLessonId: true,
        },
      });

      const completedLessonIds = completedEntries.map((entry) => entry.pathLessonId);
      const currentLesson =
        orderedLessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ??
        null;

      progress = {
        completedLessonIds,
        completedLessons: completedLessonIds.length,
        currentLessonId: currentLesson?.id ?? null,
        enrollmentId: enrollment.id,
        isPathComplete:
          orderedLessons.length > 0 &&
          completedLessonIds.length >= orderedLessons.length,
        totalLessons: orderedLessons.length,
      };
    }
  }

  return Response.json({
    path: {
      description: path.description,
      estimatedDays: path.estimatedDays,
      id: path.id,
      language: path.language,
      level: path.level,
      slug: path.slug,
      status: path.status,
      title: path.title,
      units,
    },
    progress,
  });
}
