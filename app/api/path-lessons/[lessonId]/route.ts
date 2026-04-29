import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  ActivityGenerationError,
  getOrGeneratePathLessonActivities,
} from "@/lib/gemini/services/activity-generator";

export const runtime = "nodejs";

const paramsSchema = z.object({
  lessonId: z.string().uuid(),
});

type LessonActivityResponseItem = {
  activityType: string;
  id: string;
  options: unknown;
  orderIndex: number;
  prompt: string;
  xpReward: number;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return Response.json(
      {
        message: "Invalid lesson id.",
      },
      { status: 400 },
    );
  }

  const lesson = await prisma.pathLesson.findUnique({
    where: {
      id: parsedParams.data.lessonId,
    },
    include: {
      pathActivities: {
        orderBy: {
          orderIndex: "asc",
        },
      },
      pathUnit: {
        include: {
          learningPath: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return Response.json(
      {
        message: "Path lesson not found.",
      },
      { status: 404 },
    );
  }

  let activities: LessonActivityResponseItem[] = lesson.pathActivities;

  if (activities.length === 0) {
    try {
      activities = await getOrGeneratePathLessonActivities(lesson.id);
    } catch (error) {
      if (error instanceof ActivityGenerationError) {
        return Response.json(
          {
            message: error.message,
          },
          { status: error.status },
        );
      }

      console.error("Path lesson activity generation error:", error);

      return Response.json(
        {
          message: "Could not generate activities for this lesson.",
        },
        { status: 500 },
      );
    }
  }

  return Response.json({
    lesson: {
      activities: activities.map((activity) => ({
        activityType: activity.activityType,
        id: activity.id,
        orderIndex: activity.orderIndex,
        options: activity.options,
        prompt: activity.prompt,
        xpReward: activity.xpReward,
      })),
      id: lesson.id,
      orderIndex: lesson.orderIndex,
      path: lesson.pathUnit.learningPath,
      title: lesson.title,
      unit: {
        id: lesson.pathUnit.id,
        orderIndex: lesson.pathUnit.orderIndex,
        title: lesson.pathUnit.title,
      },
      xpReward: lesson.xpReward,
    },
  });
}
