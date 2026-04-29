import { z } from "zod";

import {
  ActivityGenerationError,
  getOrGeneratePathLessonActivities,
} from "@/lib/gemini/services/activity-generator";

export const runtime = "nodejs";

const paramsSchema = z.object({
  lessonId: z.string().uuid(),
});

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

  try {
    const activities = await getOrGeneratePathLessonActivities(
      parsedParams.data.lessonId,
    );

    return Response.json({
      activities: activities.map((activity) => ({
        activityType: activity.activityType,
        id: activity.id,
        orderIndex: activity.orderIndex,
        options: activity.options,
        prompt: activity.prompt,
        xpReward: activity.xpReward,
      })),
    });
  } catch (error) {
    if (error instanceof ActivityGenerationError) {
      return Response.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Activity generation error:", error);

    return Response.json(
      {
        message: "Failed to load activities.",
      },
      { status: 500 },
    );
  }
}
