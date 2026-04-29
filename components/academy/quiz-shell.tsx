"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AcademyApiError,
  fetchJavaPath,
  fetchQuiz,
  submitQuiz,
  type PathOverviewResponse,
  type QuizResponse,
  type QuizSubmissionResponse,
} from "@/lib/academy/api";
import {
  getCurrentLesson,
  getQuizAvailability,
  getUnitProgress,
} from "@/lib/academy/progress";
import { getCurrentUser } from "@/lib/auth/client-user";

export function QuizShell({
  noticeText,
  quizId,
  userId,
}: {
  noticeText: string | null;
  quizId: string;
  userId: string | null;
}) {
  const [effectiveUserId] = useState(() => userId ?? getCurrentUser()?.id ?? null);
  const [quiz, setQuiz] = useState<QuizResponse["quiz"] | null>(null);
  const [pathData, setPathData] = useState<PathOverviewResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<QuizSubmissionResponse | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    Promise.all([fetchQuiz(quizId), fetchJavaPath(effectiveUserId)])
      .then(([quizResponse, pathResponse]) => {
        if (!isActive) {
          return;
        }

        setQuiz(quizResponse.quiz);
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
            : "Could not load this quiz.",
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
  }, [effectiveUserId, quizId]);

  const allAnswered =
    quiz != null && quiz.questions.every((question) => answers[question.id]);
  const answeredCount =
    quiz == null
      ? 0
      : quiz.questions.filter((question) => answers[question.id] != null).length;
  const currentLesson =
    pathData == null ? null : getCurrentLesson(pathData.path, pathData.progress);
  const quizUnitId = quiz?.unit?.id ?? null;
  const quizUnit =
    quizUnitId == null || pathData == null
      ? null
      : pathData.path.units.find((unit) => unit.id === quizUnitId) ?? null;
  const quizAvailability =
    quizUnit == null || pathData == null
      ? "available"
      : getQuizAvailability(quizUnit, pathData.progress.completedLessonIds);
  const isLocked = quizAvailability === "locked";
  const unitProgress =
    quizUnit == null || pathData == null
      ? null
      : getUnitProgress(quizUnit, pathData.progress.completedLessonIds);
  const correctCount =
    submission?.questionResults.filter((result) => result.isCorrect).length ?? 0;
  const submissionPercent =
    submission == null || submission.maxScore === 0
      ? null
      : Math.round((submission.score / submission.maxScore) * 100);
  const inputsDisabled = submission != null || isSubmitting || isLocked;

  function updateAnswer(questionId: string, optionId: string) {
    if (inputsDisabled) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
    setErrorMessage(null);
  }

  async function handleSubmitQuiz() {
    if (!quiz) {
      return;
    }

    if (!effectiveUserId) {
      setErrorMessage("A dev learner id is required before quiz submissions can work.");
      return;
    }

    if (isLocked) {
      setErrorMessage("Finish every lesson in this unit before taking the quiz.");
      return;
    }

    if (!allAnswered) {
      setErrorMessage("Choose one answer for every question before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitQuiz(quiz.id, effectiveUserId, answers);
      setSubmission(response);
    } catch (error) {
      setErrorMessage(
        error instanceof AcademyApiError
          ? error.message
          : "Could not submit this quiz.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Java Beginner Path</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Unit Checkpoint Quiz
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
            Loading quiz...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {quiz ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-500">
                {quiz.unit?.title ?? "Checkpoint"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {quiz.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Questions: {quiz.questionCount}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Pass score: {quiz.passScore}%
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Time limit: {quiz.timeLimitSeconds ?? "No limit"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 ${
                    isLocked
                      ? "bg-slate-100 text-slate-500"
                      : "bg-blue-50 text-blue-900"
                  }`}
                >
                  {isLocked ? "Quiz locked" : "Quiz available"}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Answer Progress
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {answeredCount}/{quiz.questionCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Questions answered
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

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Result
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {submissionPercent == null ? "--" : `${submissionPercent}%`}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {submission
                      ? submission.passed
                        ? "Passed"
                        : "Below the pass score"
                      : "Submit to see your score"}
                  </p>
                </div>
              </div>
            </section>

            {isLocked ? (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                <h3 className="text-lg font-semibold">This checkpoint is not unlocked yet</h3>
                <p className="mt-3 text-sm leading-6">
                  Finish every lesson in this unit first. Once the unit is complete,
                  this quiz becomes available from the path overview.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {currentLesson ? (
                    <Link
                      href={`/academy/java-beginner-path/lessons/${currentLesson.id}`}
                      className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      Continue Current Lesson
                    </Link>
                  ) : null}
                  <Link
                    href="/academy/java-beginner-path"
                    className="rounded-2xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    Return To Path
                  </Link>
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                {quiz.questions.map((question) => {
                  const questionResult = submission?.questionResults.find(
                    (result) => result.questionId === question.id,
                  );

                  return (
                    <div
                      key={question.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Question {question.orderIndex}
                          </p>
                          <h3 className="mt-3 text-lg font-semibold text-slate-950">
                            {question.body}
                          </h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {answers[question.id] ? "Answered" : "Not answered"}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        {question.options.map((option) => {
                          const isSelected = answers[question.id] === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => updateAnswer(question.id, option.id)}
                              disabled={inputsDisabled}
                              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                                isSelected
                                  ? "border-blue-300 bg-blue-50 text-blue-900"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              } disabled:cursor-not-allowed disabled:opacity-70`}
                            >
                              <span>{option.body}</span>
                              <span className="text-xs uppercase tracking-wide text-slate-400">
                                {isSelected ? "selected" : "choose"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {questionResult ? (
                        <div
                          className={`mt-5 rounded-2xl border px-4 py-4 text-sm leading-6 ${
                            questionResult.isCorrect
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-amber-200 bg-amber-50 text-amber-900"
                          }`}
                        >
                          <p className="font-semibold">
                            {questionResult.isCorrect ? "Correct." : "Incorrect."}
                          </p>
                          <p className="mt-2">
                            Points earned: {questionResult.pointsEarned}
                          </p>
                          {!questionResult.isCorrect && questionResult.correctAnswer ? (
                            <p className="mt-2">
                              Correct answer:{" "}
                              <span className="font-semibold">
                                {questionResult.correctAnswer}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Submit your quiz
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {isLocked
                      ? "Unlock this quiz by finishing every lesson in the unit first."
                      : submission
                        ? "Your result is saved below. Review the answers or return to the path."
                        : "Answer every question, then submit to see your score and pass status."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={
                    isSubmitting ||
                    !allAnswered ||
                    !effectiveUserId ||
                    isLocked ||
                    submission != null
                  }
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : submission
                      ? "Quiz Submitted"
                      : "Submit Quiz"}
                </button>
              </div>

              {submission ? (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-4 text-sm leading-6 ${
                    submission.passed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                >
                  <p className="text-lg font-semibold">
                    {submission.passed ? "Passed" : "Not passed yet"}
                  </p>
                  <p className="mt-2">
                    Score: {submission.score} / {submission.maxScore}
                  </p>
                  <p className="mt-2">
                    Correct answers: {correctCount} / {quiz.questionCount}
                  </p>
                  <p className="mt-2">
                    Percentage: {submissionPercent}% (pass target: {quiz.passScore}%)
                  </p>
                  <p className="mt-2">
                    {submission.passed
                      ? "This unit checkpoint is complete. You can move on in the path."
                      : "Review the question feedback above, then try again later if needed."}
                  </p>
                </div>
              ) : !isLocked ? (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {answeredCount} of {quiz.questionCount} questions answered so far.
                </p>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
