import "server-only";

import { prisma } from "@/lib/prisma";

type QuizAnswerRecord = Record<string, string | null | undefined>;
type QuizAnswerList = Array<{
  questionId: string;
  selectedOptionId?: string | null;
}>;

type QuizSubmissionInput = {
  answers: QuizAnswerList | QuizAnswerRecord;
  quizId: string;
  userId: string;
};

type QuizQuestionResult = {
  correctAnswer: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  questionId: string;
  selectedOptionId: string | null;
};

type QuizSubmissionResult = {
  attemptId: string;
  maxScore: number;
  passed: boolean;
  questionResults: QuizQuestionResult[];
  score: number;
};

export class QuizSubmissionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "QuizSubmissionError";
    this.status = status;
  }
}

function normalizeAnswers(answers: QuizAnswerList | QuizAnswerRecord) {
  const selections = new Map<string, string | null>();

  if (Array.isArray(answers)) {
    for (const answer of answers) {
      selections.set(answer.questionId, answer.selectedOptionId ?? null);
    }

    return selections;
  }

  for (const [questionId, selectedOptionId] of Object.entries(answers)) {
    selections.set(questionId, selectedOptionId ?? null);
  }

  return selections;
}

export async function submitQuizAttempt({
  answers,
  quizId,
  userId,
}: QuizSubmissionInput): Promise<QuizSubmissionResult> {
  const [user, quiz] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    }),
    prisma.quiz.findUnique({
      where: { id: quizId },
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
            },
          },
        },
      },
    }),
  ]);

  if (!user) {
    throw new QuizSubmissionError("User not found.", 404);
  }

  if (!quiz) {
    throw new QuizSubmissionError("Quiz not found.", 404);
  }

  const selections = normalizeAnswers(answers);
  const questionResults: QuizQuestionResult[] = [];
  let score = 0;
  let maxScore = 0;

  for (const question of quiz.questions) {
    const correctOption = question.answerOptions.find((option) => option.isCorrect);

    if (!correctOption) {
      throw new QuizSubmissionError(
        `Question ${question.id} is missing a correct answer option.`,
        500,
      );
    }

    const selectedOptionId = selections.get(question.id) ?? null;
    const selectedOption = selectedOptionId
      ? question.answerOptions.find((option) => option.id === selectedOptionId)
      : undefined;

    const isCorrect = Boolean(selectedOption && selectedOption.id === correctOption.id);
    const pointsEarned = isCorrect ? question.points : 0;

    score += pointsEarned;
    maxScore += question.points;

    questionResults.push({
      correctAnswer: correctOption.body,
      isCorrect,
      pointsEarned,
      questionId: question.id,
      selectedOptionId: selectedOption?.id ?? null,
    });
  }

  const passed =
    maxScore > 0 ? (score / maxScore) * 100 >= quiz.passScore : false;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      maxScore,
      passed,
      attemptedAt: new Date(),
      answers: {
        create: questionResults.map((result) => ({
          questionId: result.questionId,
          selectedOptionId: result.selectedOptionId,
          isCorrect: result.isCorrect,
        })),
      },
    },
    select: {
      id: true,
    },
  });

  return {
    attemptId: attempt.id,
    maxScore,
    passed,
    questionResults,
    score,
  };
}
