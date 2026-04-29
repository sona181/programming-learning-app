import { z } from "zod";

import {
  ActivitySubmissionError,
  submitActivityAnswer,
} from "@/lib/services/activity-grading";

export const runtime = "nodejs";

const paramsSchema = z.object({
  activityId: z.string().uuid(),
});

const bodySchema = z.object({
  answer: z.unknown(),
  userId: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return Response.json(
      {
        message: "Invalid activity id.",
      },
      { status: 400 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        message: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const parsedBody = bodySchema.safeParse(payload);

  if (!parsedBody.success) {
    return Response.json(
      {
        fieldErrors: parsedBody.error.flatten().fieldErrors,
        message: "Please provide a valid userId and answer.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await submitActivityAnswer({
      activityId: parsedParams.data.activityId,
      answer: parsedBody.data.answer,
      userId: parsedBody.data.userId,
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof ActivitySubmissionError) {
      return Response.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Activity submission error:", error);

    return Response.json(
      {
        message: "Something went wrong while grading the activity.",
      },
      { status: 500 },
    );
  }
}
