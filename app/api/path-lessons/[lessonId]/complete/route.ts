import { z } from "zod";

import {
  completePathLesson,
  PathProgressError,
} from "@/lib/services/path-progress";

export const runtime = "nodejs";

const paramsSchema = z.object({
  lessonId: z.string().uuid(),
});

const bodySchema = z.object({
  pathId: z.string().uuid().optional(),
  userId: z.string().uuid(),
});

export async function POST(
  request: Request,
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
        message: "Please provide a valid userId and optional pathId.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await completePathLesson({
      lessonId: parsedParams.data.lessonId,
      pathId: parsedBody.data.pathId,
      userId: parsedBody.data.userId,
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof PathProgressError) {
      return Response.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Path lesson completion error:", error);

    return Response.json(
      {
        message: "Something went wrong while completing the path lesson.",
      },
      { status: 500 },
    );
  }
}
