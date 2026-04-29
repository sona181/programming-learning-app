import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getAiActivityFeedback,
  type ActivityFeedbackResult,
} from "@/lib/services/activity-feedback";

type ActivityOptionMeta = {
  acceptedAnswers?: string[];
  choices?: string[];
  code?: string;
  explanation?: string;
  starter?: string;
  tokens?: string[];
};

type ActivitySubmissionInput = {
  activityId: string;
  answer: unknown;
  userId: string;
};

type ActivitySubmissionResult = {
  correctAnswer: string | null;
  explanation: string | null;
  isCorrect: boolean;
  message: string;
  result: ActivityFeedbackResult["result"];
  xpAwarded: number;
};

export class ActivitySubmissionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ActivitySubmissionError";
    this.status = status;
  }
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .map((item) => (typeof item === "string" ? item : String(item)))
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : undefined;
}

function parseActivityOptions(raw: unknown): ActivityOptionMeta {
  if (Array.isArray(raw)) {
    return { choices: asStringArray(raw) };
  }

  if (!raw || typeof raw !== "object") {
    return {};
  }

  const value = raw as Record<string, unknown>;

  return {
    acceptedAnswers: asStringArray(value.acceptedAnswers),
    choices: asStringArray(value.choices),
    code: typeof value.code === "string" ? value.code : undefined,
    explanation:
      typeof value.explanation === "string" ? value.explanation : undefined,
    starter: typeof value.starter === "string" ? value.starter : undefined,
    tokens: asStringArray(value.tokens),
  };
}

function stringifyAnswer(answer: unknown): string {
  if (Array.isArray(answer)) {
    return answer
      .map((item) => stringifyAnswer(item))
      .filter((item) => item.length > 0)
      .join(" ");
  }

  if (typeof answer === "boolean") {
    return answer ? "true" : "false";
  }

  if (answer == null) {
    return "";
  }

  return String(answer);
}

function normalizeAnswer(
  value: string,
  {
    collapseWhitespace = true,
    ignoreCase = false,
  }: {
    collapseWhitespace?: boolean;
    ignoreCase?: boolean;
  } = {},
) {
  let result = value.replace(/\r\n/g, "\n").trim();

  if (collapseWhitespace) {
    result = result.replace(/\s+/g, " ");
  }

  if (ignoreCase) {
    result = result.toLowerCase();
  }

  return result;
}

function buildCandidates(expected: string, options: ActivityOptionMeta) {
  return [expected, ...(options.acceptedAnswers ?? [])];
}

function evaluateAnswer(
  activityType: string,
  answer: unknown,
  expected: string,
  options: ActivityOptionMeta,
) {
  const submitted = stringifyAnswer(answer);

  if (!submitted) {
    return false;
  }

  const candidates = buildCandidates(expected, options);

  switch (activityType) {
    case "multiple_choice":
    case "true_false":
      return candidates.some(
        (candidate) =>
          normalizeAnswer(candidate, { ignoreCase: true }) ===
          normalizeAnswer(submitted, { ignoreCase: true }),
      );
    case "reorder_tokens":
      return candidates.some(
        (candidate) =>
          normalizeAnswer(candidate) === normalizeAnswer(submitted),
      );
    case "fill_blank":
    case "predict_output":
    case "trace_code":
      return candidates.some(
        (candidate) =>
          normalizeAnswer(candidate, { collapseWhitespace: false }) ===
          normalizeAnswer(submitted, { collapseWhitespace: false }),
      );
    default:
      return candidates.some(
        (candidate) => normalizeAnswer(candidate) === normalizeAnswer(submitted),
      );
  }
}

function buildDeterministicFeedback(
  activityType: string,
  answer: unknown,
  correctAnswer: string,
  options: ActivityOptionMeta,
): ActivityFeedbackResult | null {
  const submitted = stringifyAnswer(answer);

  if (!submitted) {
    return {
      message: "Choose an answer first.",
      result: "incorrect",
    };
  }

  if (activityType === "multiple_choice" || activityType === "true_false") {
    const isCorrect = evaluateAnswer(activityType, answer, correctAnswer, options);

    return {
      message: isCorrect
        ? "Correct!"
        : `Incorrect. The correct answer is ${correctAnswer}.`,
      result: isCorrect ? "correct" : "incorrect",
    };
  }

  if (activityType === "fill_blank") {
    const isCorrect = evaluateAnswer(activityType, answer, correctAnswer, options);

    if (isCorrect) {
      return {
        message: "Correct!",
        result: "correct",
      };
    }
  }

  return null;
}

export async function submitActivityAnswer({
  activityId,
  answer,
  userId,
}: ActivitySubmissionInput): Promise<ActivitySubmissionResult> {
  const [user, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    }),
    prisma.pathActivity.findUnique({
      where: { id: activityId },
      include: {
        pathLesson: {
          select: {
            pathUnit: {
              select: {
                learningPath: {
                  select: {
                    language: true,
                  },
                },
              },
            },
            title: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    throw new ActivitySubmissionError("User not found.", 404);
  }

  if (!activity) {
    throw new ActivitySubmissionError("Path activity not found.", 404);
  }

  if (!activity.correctAnswer) {
    throw new ActivitySubmissionError(
      "This activity is missing a correct answer configuration.",
      500,
    );
  }

  const correctAnswer = activity.correctAnswer;
  const options = parseActivityOptions(activity.options);
  const deterministicFeedback = buildDeterministicFeedback(
    activity.activityType,
    answer,
    correctAnswer,
    options,
  );
  const learnerAnswer = stringifyAnswer(answer);
  const feedback =
    deterministicFeedback ??
    (await getAiActivityFeedback({
      activityType:
        activity.activityType === "trace_code"
          ? "predict_output"
          : activity.activityType === "reorder_tokens"
            ? "fill_blank"
            : (activity.activityType as "fill_blank" | "predict_output" | "open_ended"),
      correctAnswer,
      language: activity.pathLesson.pathUnit.learningPath.language,
      learnerAnswer,
      question: activity.prompt,
    }).catch<ActivityFeedbackResult>(() => {
      const isCorrect = evaluateAnswer(
        activity.activityType,
        answer,
        correctAnswer,
        options,
      );

      return {
        message: isCorrect
          ? "Correct!"
          : `Incorrect. The correct answer is ${correctAnswer}.`,
        result: isCorrect ? "correct" : "incorrect",
      };
    }));
  const isCorrect = feedback.result === "correct";

  let xpAwarded = 0;

  if (isCorrect) {
    const existingXp = await prisma.xpLog.findFirst({
      where: {
        sourceId: activity.id,
        sourceType: "path_activity",
        userId,
      },
      select: { id: true },
    });

    if (!existingXp) {
      await prisma.xpLog.create({
        data: {
          userId,
          xpAmount: activity.xpReward,
          sourceType: "path_activity",
          sourceId: activity.id,
          description: `Completed activity in ${activity.pathLesson.title}`,
          earnedAt: new Date(),
        },
      });

      xpAwarded = activity.xpReward;
    }
  }

  return {
    correctAnswer:
      feedback.result === "hint" && activity.activityType === "predict_output"
        ? null
        : correctAnswer,
    explanation: options.explanation ?? null,
    isCorrect,
    message: feedback.message,
    result: feedback.result,
    xpAwarded,
  };
}
