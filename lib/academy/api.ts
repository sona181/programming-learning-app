export type PathOverviewResponse = {
  path: {
    description: string | null;
    estimatedDays: number | null;
    id: string;
    language: string;
    level: string;
    slug: string;
    status: string;
    title: string;
    units: Array<{
      description: string | null;
      id: string;
      lessons: Array<{
        activityCount: number;
        id: string;
        orderIndex: number;
        title: string;
        xpReward: number;
      }>;
      orderIndex: number;
      quiz: {
        id: string;
        passScore: number;
        questionCount: number;
        title: string;
      } | null;
      title: string;
    }>;
  };
  progress: {
    completedLessonIds: string[];
    completedLessons: number;
    currentLessonId: string | null;
    enrollmentId: string | null;
    isPathComplete: boolean;
    totalLessons: number;
  };
};

export type PathLessonResponse = {
  lesson: {
    activities: Array<{
      activityType:
        | "multiple_choice"
        | "true_false"
        | "fill_blank"
        | "predict_output"
        | "reorder_tokens"
        | "trace_code";
      id: string;
      options: {
        acceptedAnswers?: string[];
        choices?: string[];
        code?: string;
        explanation?: string;
        starter?: string;
        tokens?: string[];
      } | null;
      orderIndex: number;
      prompt: string;
      xpReward: number;
    }>;
    id: string;
    orderIndex: number;
    path: {
      id: string;
      slug: string;
      title: string;
    };
    title: string;
    unit: {
      id: string;
      orderIndex: number;
      title: string;
    };
    xpReward: number;
  };
};

export type QuizResponse = {
  quiz: {
    id: string;
    passScore: number;
    path: {
      id: string;
      slug: string;
      title: string;
    } | null;
    questionCount: number;
    questions: Array<{
      body: string;
      id: string;
      options: Array<{
        body: string;
        id: string;
        orderIndex: number;
      }>;
      orderIndex: number;
      points: number;
      questionType: string;
    }>;
    timeLimitSeconds: number | null;
    title: string;
    unit: {
      id: string;
      orderIndex: number;
      title: string;
    } | null;
  };
};

export type ActivitySubmissionResponse = {
  correctAnswer: string | null;
  explanation: string | null;
  isCorrect: boolean;
  message: string;
  result: "correct" | "hint" | "incorrect";
  xpAwarded: number;
};

export type LessonCompletionResponse = {
  alreadyCompleted: boolean;
  enrollmentId: string;
  nextLesson: {
    id: string;
    title: string;
    unitId: string;
    unitTitle: string;
  } | null;
  progress: {
    completedLessons: number;
    totalLessons: number;
  };
  xpAwarded: number;
};

export type QuizSubmissionResponse = {
  attemptId: string;
  maxScore: number;
  passed: boolean;
  questionResults: Array<{
    correctAnswer: string | null;
    isCorrect: boolean;
    pointsEarned: number;
    questionId: string;
    selectedOptionId: string | null;
  }>;
  score: number;
};

type ApiErrorBody = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

export class AcademyApiError extends Error {
  fieldErrors?: Record<string, string[] | undefined>;
  status: number;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "AcademyApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = ((await response.json().catch(() => null)) ?? null) as ApiErrorBody | T | null;

  if (!response.ok) {
    const errorBody = (body ?? {}) as ApiErrorBody;

    throw new AcademyApiError(
      errorBody.message ?? "The academy request failed.",
      response.status,
      errorBody.fieldErrors,
    );
  }

  return body as T;
}

export function fetchJavaPath(userId: string | null) {
  const url = userId
    ? `/api/paths/java-beginner-path?userId=${encodeURIComponent(userId)}`
    : "/api/paths/java-beginner-path";

  return fetchJson<PathOverviewResponse>(url);
}

export function fetchPathLesson(lessonId: string) {
  return fetchJson<PathLessonResponse>(`/api/path-lessons/${lessonId}`);
}

export function fetchQuiz(quizId: string) {
  return fetchJson<QuizResponse>(`/api/quizzes/${quizId}`);
}

export function submitActivity(activityId: string, userId: string, answer: unknown) {
  return fetchJson<ActivitySubmissionResponse>(
    `/api/path-activities/${activityId}/submit`,
    {
      body: JSON.stringify({
        answer,
        userId,
      }),
      method: "POST",
    },
  );
}

export function completeLesson(lessonId: string, userId: string, pathId: string) {
  return fetchJson<LessonCompletionResponse>(
    `/api/path-lessons/${lessonId}/complete`,
    {
      body: JSON.stringify({
        pathId,
        userId,
      }),
      method: "POST",
    },
  );
}

export function submitQuiz(
  quizId: string,
  userId: string,
  answers: Record<string, string | null>,
) {
  return fetchJson<QuizSubmissionResponse>(`/api/quizzes/${quizId}/submit`, {
    body: JSON.stringify({
      answers,
      userId,
    }),
    method: "POST",
  });
}
