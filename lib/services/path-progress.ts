import "server-only";

import { prisma } from "@/lib/prisma";

type CompletePathLessonInput = {
  lessonId: string;
  pathId?: string;
  userId: string;
};

type OrderedLesson = {
  id: string;
  orderIndex: number;
  title: string;
  unitId: string;
  unitOrderIndex: number;
  unitTitle: string;
};

type CompletePathLessonResult = {
  alreadyCompleted: boolean;
  enrollmentId: string;
  nextLesson: Omit<OrderedLesson, "orderIndex" | "unitOrderIndex"> | null;
  progress: {
    completedLessons: number;
    totalLessons: number;
  };
  xpAwarded: number;
};

export class PathProgressError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PathProgressError";
    this.status = status;
  }
}

function flattenLessons(
  units: Array<{
    id: string;
    orderIndex: number;
    title: string;
    pathLessons: Array<{
      id: string;
      orderIndex: number;
      title: string;
    }>;
  }>,
) {
  return units.flatMap<OrderedLesson>((unit) =>
    unit.pathLessons.map((lesson) => ({
      id: lesson.id,
      orderIndex: lesson.orderIndex,
      title: lesson.title,
      unitId: unit.id,
      unitOrderIndex: unit.orderIndex,
      unitTitle: unit.title,
    })),
  );
}

export async function completePathLesson({
  lessonId,
  pathId,
  userId,
}: CompletePathLessonInput): Promise<CompletePathLessonResult> {
  const lesson = await prisma.pathLesson.findUnique({
    where: { id: lessonId },
    include: {
      pathUnit: {
        include: {
          learningPath: {
            select: {
              id: true,
              level: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new PathProgressError("Path lesson not found.", 404);
  }

  const resolvedPathId = lesson.pathUnit.pathId;

  if (pathId && pathId !== resolvedPathId) {
    throw new PathProgressError("Lesson does not belong to the provided path.", 400);
  }

  const orderedUnits = await prisma.pathUnit.findMany({
    where: {
      pathId: resolvedPathId,
    },
    orderBy: {
      orderIndex: "asc",
    },
    include: {
      pathLessons: {
        orderBy: {
          orderIndex: "asc",
        },
        select: {
          id: true,
          orderIndex: true,
          title: true,
        },
      },
    },
  });

  const orderedLessons = flattenLessons(orderedUnits);
  const currentLessonIndex = orderedLessons.findIndex(
    (item) => item.id === lessonId,
  );

  const nextLesson =
    currentLessonIndex >= 0 ? orderedLessons[currentLessonIndex + 1] ?? null : null;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new PathProgressError("User not found.", 404);
    }

    const enrollment = await tx.userPathEnrollment.upsert({
      where: {
        userId_pathId: {
          userId,
          pathId: resolvedPathId,
        },
      },
      update: {
        isActive: true,
        level: lesson.pathUnit.learningPath.level,
        status: "active",
      },
      create: {
        userId,
        pathId: resolvedPathId,
        level: lesson.pathUnit.learningPath.level,
        status: "active",
        isActive: true,
        enrolledAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    const existingProgress = await tx.userPathProgress.findUnique({
      where: {
        enrollmentId_pathLessonId: {
          enrollmentId: enrollment.id,
          pathLessonId: lessonId,
        },
      },
      select: {
        completedAt: true,
        id: true,
        isCompleted: true,
      },
    });

    let xpAwarded = 0;
    const alreadyCompleted = Boolean(existingProgress?.isCompleted);

    if (!alreadyCompleted) {
      await tx.userPathProgress.upsert({
        where: {
          enrollmentId_pathLessonId: {
            enrollmentId: enrollment.id,
            pathLessonId: lessonId,
          },
        },
        update: {
          completedAt: new Date(),
          isCompleted: true,
          xpEarned: lesson.xpReward,
        },
        create: {
          enrollmentId: enrollment.id,
          pathLessonId: lessonId,
          completedAt: new Date(),
          isCompleted: true,
          xpEarned: lesson.xpReward,
        },
      });

      const existingXpLog = await tx.xpLog.findFirst({
        where: {
          sourceId: lessonId,
          sourceType: "path_lesson_completion",
          userId,
        },
        select: { id: true },
      });

      if (!existingXpLog) {
        await tx.xpLog.create({
          data: {
            userId,
            xpAmount: lesson.xpReward,
            sourceType: "path_lesson_completion",
            sourceId: lessonId,
            description: `Completed path lesson ${lesson.title}`,
            earnedAt: new Date(),
          },
        });

        xpAwarded = lesson.xpReward;
      }
    }

    const completedLessons = await tx.userPathProgress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
    });

    const totalLessons = orderedLessons.length;
    const isPathComplete = totalLessons > 0 && completedLessons >= totalLessons;

    await tx.userPathEnrollment.update({
      where: {
        id: enrollment.id,
      },
      data: isPathComplete
        ? {
            completedAt: new Date(),
            isActive: false,
            status: "completed",
          }
        : {
            completedAt: null,
            isActive: true,
            status: "active",
          },
    });

    return {
      alreadyCompleted,
      enrollmentId: enrollment.id,
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            unitId: nextLesson.unitId,
            unitTitle: nextLesson.unitTitle,
          }
        : null,
      progress: {
        completedLessons,
        totalLessons,
      },
      xpAwarded,
    };
  });
}
