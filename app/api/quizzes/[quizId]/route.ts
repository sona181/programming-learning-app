import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const paramsSchema = z.object({
  quizId: z.string().uuid(),
});

export async function GET(
  _request: Request,
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

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: parsedParams.data.quizId,
    },
    include: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
        include: {
          answerOptions: {
            orderBy: {
              orderIndex: "asc",
            },
            select: {
              body: true,
              id: true,
              orderIndex: true,
            },
          },
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

  if (!quiz) {
    return Response.json(
      {
        message: "Quiz not found.",
      },
      { status: 404 },
    );
  }

  return Response.json({
    quiz: {
      id: quiz.id,
      passScore: quiz.passScore,
      path: quiz.pathUnit?.learningPath ?? null,
      questionCount: quiz.questions.length,
      questions: quiz.questions.map((question) => ({
        body: question.body,
        id: question.id,
        options: question.answerOptions,
        orderIndex: question.orderIndex,
        points: question.points,
        questionType: question.questionType,
      })),
      timeLimitSeconds: quiz.timeLimitSeconds,
      title: quiz.title,
      unit:
        quiz.pathUnit == null
          ? null
          : {
              id: quiz.pathUnit.id,
              orderIndex: quiz.pathUnit.orderIndex,
              title: quiz.pathUnit.title,
            },
    },
  });
}
