"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AcademyApiError,
  completeLesson,
  fetchJavaPath,
  fetchPathLesson,
  submitActivity,
  type ActivitySubmissionResponse,
  type LessonCompletionResponse,
  type PathLessonResponse,
  type PathOverviewResponse,
} from "@/lib/academy/api";
import { getCurrentUser } from "@/lib/auth/client-user";
import {
  getCurrentLesson,
  getLessonStatus,
  getLessonStatusClasses,
  getLessonStatusLabel,
  getNextLesson,
  getUnitProgress,
} from "@/lib/academy/progress";

export function PathLessonShell({
  lessonId,
  noticeText,
  userId,
}: {
  lessonId: string;
  noticeText: string | null;
  userId: string | null;
}) {
  const [effectiveUserId] = useState(() => userId ?? getCurrentUser()?.id ?? null);
  const [lesson, setLesson] = useState<PathLessonResponse["lesson"] | null>(null);
  const [pathData, setPathData] = useState<PathOverviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completion, setCompletion] = useState<LessonCompletionResponse | null>(
    null,
  );
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [activityResult, setActivityResult] =
    useState<ActivitySubmissionResponse | null>(null);
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.all([fetchPathLesson(lessonId), fetchJavaPath(effectiveUserId)])
      .then(([lessonResponse, pathResponse]) => {
        if (!isActive) {
          return;
        }

        setLesson(lessonResponse.lesson);
        setPathData(pathResponse);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof AcademyApiError
            ? error.message
            : "Could not load this lesson.",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [effectiveUserId, lessonId]);

  const lessonStatus =
    pathData == null ? "current" : getLessonStatus(pathData.progress, lessonId);
  const currentPathLesson =
    pathData == null ? null : getCurrentLesson(pathData.path, pathData.progress);
  const nextLesson =
    lesson == null || pathData == null
      ? null
      : getNextLesson(pathData.path, lesson.id);
  const unitProgress =
    lesson == null || pathData == null
      ? null
      : getUnitProgress(
          pathData.path.units.find((unit) => unit.id === lesson.unit.id) ?? {
            description: null,
            id: lesson.unit.id,
            lessons: [],
            orderIndex: lesson.unit.orderIndex,
            quiz: null,
            title: lesson.unit.title,
          },
          pathData.progress.completedLessonIds,
        );

  const submittedCount = completedActivityIds.length;
  const isLessonCompleted = lessonStatus === "completed" || completion != null;
  const isLocked = lessonStatus === "locked";
  const currentActivity = lesson?.activities[currentActivityIndex] ?? null;
  const allActivitiesCompleted =
    lesson != null &&
    lesson.activities.length > 0 &&
    completedActivityIds.length >= lesson.activities.length;

  async function handleSubmitActivity() {
    if (!currentActivity || !effectiveUserId || isSubmittingActivity) {
      return;
    }

    setIsSubmittingActivity(true);
    setErrorMessage(null);

    try {
      const response = await submitActivity(
        currentActivity.id,
        effectiveUserId,
        selectedAnswer.trim(),
      );

      setActivityResult(response);
      setCompletedActivityIds((current) =>
        current.includes(currentActivity.id)
          ? current
          : [...current, currentActivity.id],
      );

      if (response.isCorrect) {
        setCorrectCount((current) => current + 1);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof AcademyApiError
          ? error.message
          : "Could not submit this activity.",
      );
    } finally {
      setIsSubmittingActivity(false);
    }
  }

  function handleNextActivity() {
    setActivityResult(null);
    setSelectedAnswer("");
    setCurrentActivityIndex((current) =>
      lesson == null ? current : Math.min(current + 1, lesson.activities.length - 1),
    );
  }

  async function handleCompleteLesson() {
    if (!lesson) {
      return;
    }

    if (!effectiveUserId) {
      setErrorMessage("A dev learner id is required before lesson progress can be saved.");
      return;
    }

    if (isLocked) {
      setErrorMessage("This lesson is locked. Finish the current lesson first.");
      return;
    }

    setIsCompleting(true);
    setErrorMessage(null);

    try {
      const response = await completeLesson(lesson.id, effectiveUserId, lesson.path.id);
      setCompletion(response);

      setPathData((current) => {
        if (!current) {
          return current;
        }

        const completedLessonIds = current.progress.completedLessonIds.includes(lesson.id)
          ? current.progress.completedLessonIds
          : [...current.progress.completedLessonIds, lesson.id];

        return {
          ...current,
          progress: {
            completedLessonIds,
            completedLessons: response.progress.completedLessons,
            currentLessonId: response.nextLesson?.id ?? null,
            enrollmentId: response.enrollmentId,
            isPathComplete:
              response.progress.totalLessons > 0 &&
              response.progress.completedLessons >= response.progress.totalLessons,
            totalLessons: response.progress.totalLessons,
          },
        };
      });
    } catch (error) {
      setErrorMessage(
        error instanceof AcademyApiError
          ? error.message
          : "Could not mark this lesson complete.",
      );
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Java Beginner Path</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Lesson Workspace
            </h1>
          </div>
          <Link
            href="/academy/java-beginner-path"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            Back To Path
          </Link>
        </div>

        {noticeText ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {noticeText}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading lesson...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {lesson ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Unit {lesson.unit.orderIndex} • {lesson.unit.title}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {lesson.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Lesson reward: {lesson.xpReward} XP
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getLessonStatusClasses(
                    lessonStatus,
                  )}`}
                >
                  {getLessonStatusLabel(lessonStatus)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Activity Progress
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {submittedCount}/{lesson.activities.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Submitted in this visit
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Step
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {lesson.activities.length > 0
                      ? Math.min(currentActivityIndex + 1, lesson.activities.length)
                      : 0}{" "}
                    of{" "}
                    {lesson.activities.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Move through the activities one by one
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Unit Progress
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {unitProgress?.completedLessons ?? 0}/
                    {unitProgress?.totalLessons ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Lessons completed in this unit
                  </p>
                </div>
              </div>
            </section>

            {isLocked ? (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                <h3 className="text-lg font-semibold">This lesson is still locked</h3>
                <p className="mt-3 text-sm leading-6">
                  Finish the current unlocked lesson first, then come back here.
                </p>
                {currentPathLesson ? (
                  <Link
                    href={`/academy/java-beginner-path/lessons/${currentPathLesson.id}`}
                    className="mt-4 inline-flex rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                  >
                    Go To Current Lesson
                  </Link>
                ) : null}
              </section>
            ) : null}

            {isLessonCompleted && !completion ? (
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                <h3 className="text-lg font-semibold">This lesson is already completed</h3>
                <p className="mt-3 text-sm leading-6">
                  You can review the activity prompts below, then continue to the
                  next lesson when you are ready.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {nextLesson ? (
                    <Link
                      href={`/academy/java-beginner-path/lessons/${nextLesson.id}`}
                      className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Go To Next Lesson
                    </Link>
                  ) : null}
                  <Link
                    href="/academy/java-beginner-path"
                    className="rounded-2xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    Return To Path
                  </Link>
                </div>
              </section>
            ) : null}

            {!isLocked && !isLessonCompleted ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Practice Exercises
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">
                  Practice Exercises
                </h3>

                {currentActivity ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {currentActivity.prompt}
                    </p>

                    {currentActivity.options?.code ? (
                      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-50">
                        <code>{currentActivity.options.code}</code>
                      </pre>
                    ) : null}

                    {currentActivity.options?.choices?.length ? (
                      <div className="mt-4 grid gap-3">
                        {currentActivity.options.choices.map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setSelectedAnswer(choice)}
                            disabled={activityResult != null}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                              selectedAnswer === choice
                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        value={selectedAnswer}
                        onChange={(event) => setSelectedAnswer(event.target.value)}
                        disabled={activityResult != null}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Type your answer"
                      />
                    )}

                    {activityResult ? (
                      <div
                        className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                          activityResult.result === "correct"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : activityResult.result === "hint"
                              ? "border-amber-200 bg-amber-50 text-amber-900"
                              : "border-red-200 bg-red-50 text-red-900"
                        }`}
                      >
                        <p className="font-semibold">
                          {activityResult.result === "correct"
                            ? "Correct!"
                            : activityResult.result === "hint"
                              ? "Almost."
                              : "Incorrect."}
                        </p>
                        {activityResult.message ? (
                          <p className="mt-1">{activityResult.message}</p>
                        ) : null}
                        {activityResult.result === "incorrect" &&
                        activityResult.correctAnswer ? (
                          <p className="mt-1">
                            Correct answer: {activityResult.correctAnswer}
                          </p>
                        ) : null}
                        {activityResult.explanation ? (
                          <p className="mt-1">{activityResult.explanation}</p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {!activityResult ? (
                        <button
                          type="button"
                          onClick={handleSubmitActivity}
                          disabled={
                            !effectiveUserId ||
                            isSubmittingActivity ||
                            selectedAnswer.trim().length === 0
                          }
                          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          {isSubmittingActivity ? "Checking..." : "Submit"}
                        </button>
                      ) : currentActivityIndex < lesson.activities.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextActivity}
                          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Next
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    No practice exercises are available for this lesson yet.
                  </div>
                )}

                {allActivitiesCompleted ? (
                  <div className="mt-5">
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
                      Practice complete: {correctCount}/{lesson.activities.length} correct.
                      Mark the lesson complete to update progress and unlock the next lesson.
                    </div>
                    <button
                      type="button"
                      onClick={handleCompleteLesson}
                      disabled={isCompleting || !effectiveUserId || isLocked}
                      className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {isCompleting ? "Saving progress..." : "Mark Lesson Complete"}
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {completion ? (
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                <h3 className="text-xl font-semibold">Lesson completion saved</h3>
                <p className="mt-3 text-sm leading-6">
                  {completion.alreadyCompleted
                    ? "This lesson was already completed earlier."
                    : `Lesson XP awarded: ${completion.xpAwarded}.`}
                </p>
                <p className="mt-2 text-sm leading-6">
                  Path progress: {completion.progress.completedLessons}/
                  {completion.progress.totalLessons} lessons completed.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {completion.nextLesson ? (
                    <Link
                      href={`/academy/java-beginner-path/lessons/${completion.nextLesson.id}`}
                      className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Go To Next Lesson
                    </Link>
                  ) : null}
                  <Link
                    href="/academy/java-beginner-path"
                    className="rounded-2xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    Return To Path
                  </Link>
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
