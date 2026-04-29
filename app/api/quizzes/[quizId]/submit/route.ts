import { z } from "zod";

import { QuizSubmissionError, submitQuizAttempt } from "@/lib/services/quiz-grading";

export const runtime = "nodejs";

const paramsSchema = z.object({
  quizId: z.string().uuid(),
});

const answerRecordSchema = z.record(z.string(), z.string().uuid().nullable().optional());
const answerListSchema = z.array(
  z.object({
    questionId: z.string().uuid(),
    selectedOptionId: z.string().uuid().nullable().optional(),
  }),
);

const bodySchema = z.object({
  answers: z.union([answerRecordSchema, answerListSchema]),
  userId: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return Response.json(
      {
        message: "Invalid quiz id.",
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
        message: "Please provide a valid userId and quiz answers.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await submitQuizAttempt({
      answers: parsedBody.data.answers,
      quizId: parsedParams.data.quizId,
      userId: parsedBody.data.userId,
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof QuizSubmissionError) {
      return Response.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Quiz submission error:", error);

    return Response.json(
      {
        message: "Something went wrong while grading the quiz.",
      },
      { status: 500 },
    );
  }
}
