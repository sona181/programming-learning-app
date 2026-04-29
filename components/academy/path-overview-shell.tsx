"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AcademyApiError,
  fetchJavaPath,
  type PathOverviewResponse,
} from "@/lib/academy/api";
import { getCurrentUser } from "@/lib/auth/client-user";
import {
  getCurrentLesson,
  getLessonStatus,
  getLessonStatusLabel,
  getQuizAvailability,
  getUnitProgress,
  type LessonStatus,
  type QuizAvailability,
} from "@/lib/academy/progress";

type PathUnit = PathOverviewResponse["path"]["units"][number];
type PathLesson = PathUnit["lessons"][number];

const UNIT_THEMES = [
  {
    chip: "bg-sky-600 text-white",
    panel:
      "border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-[0_22px_60px_-42px_rgba(14,165,233,0.55)]",
    rail: "from-sky-200 via-cyan-100 to-slate-100",
    progress: "from-sky-500 to-cyan-400",
    surface: "border-sky-100/80 bg-white/80",
  },
  {
    chip: "bg-emerald-600 text-white",
    panel:
      "border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 shadow-[0_22px_60px_-42px_rgba(16,185,129,0.45)]",
    rail: "from-emerald-200 via-lime-100 to-slate-100",
    progress: "from-emerald-500 to-lime-400",
    surface: "border-emerald-100/80 bg-white/85",
  },
  {
    chip: "bg-amber-500 text-white",
    panel:
      "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-[0_22px_60px_-42px_rgba(245,158,11,0.45)]",
    rail: "from-amber-200 via-orange-100 to-slate-100",
    progress: "from-amber-500 to-orange-400",
    surface: "border-amber-100/80 bg-white/85",
  },
] as const;

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getUnitTheme(orderIndex: number) {
  return UNIT_THEMES[(orderIndex - 1) % UNIT_THEMES.length];
}

function getLessonTone(status: LessonStatus) {
  switch (status) {
    case "completed":
      return {
        badge: "border border-emerald-200 bg-emerald-50 text-emerald-900",
        card: "border-emerald-200 bg-white text-slate-900 shadow-[0_16px_34px_-26px_rgba(16,185,129,0.8)]",
        node: "border-emerald-200 bg-emerald-500 text-white shadow-[0_16px_30px_-16px_rgba(16,185,129,0.7)]",
        note: "Review any time",
      };
    case "current":
      return {
        badge: "border border-sky-200 bg-sky-50 text-sky-900",
        card: "border-sky-300 bg-white text-slate-900 shadow-[0_18px_38px_-24px_rgba(59,130,246,0.75)] ring-2 ring-sky-100",
        node: "border-sky-200 bg-sky-500 text-white shadow-[0_18px_34px_-16px_rgba(59,130,246,0.75)]",
        note: "Start here",
      };
    case "locked":
    default:
      return {
        badge: "border border-slate-200 bg-slate-100 text-slate-500",
        card: "border-slate-200 bg-slate-100/90 text-slate-500 shadow-none",
        node: "border-slate-200 bg-slate-200 text-slate-500 shadow-none",
        note: "Unlock the previous step first",
      };
  }
}

function getCheckpointTone(availability: QuizAvailability) {
  if (availability === "available") {
    return {
      badge: "border border-violet-200 bg-violet-50 text-violet-900",
      card: "border-violet-200 bg-white text-slate-900 shadow-[0_18px_38px_-24px_rgba(139,92,246,0.6)]",
      node: "border-violet-200 bg-violet-500 text-white shadow-[0_18px_34px_-16px_rgba(139,92,246,0.7)]",
      note: "Checkpoint ready",
    };
  }

  return {
    badge: "border border-slate-200 bg-slate-100 text-slate-500",
    card: "border-slate-200 bg-slate-100/90 text-slate-500 shadow-none",
    node: "border-slate-200 bg-slate-200 text-slate-500 shadow-none",
    note: "Complete all lessons to unlock",
  };
}

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === "completed") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.2]">
        <path d="M5 12.5 9.2 17 19 7.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === "current") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M8 6.8c0-1 1.1-1.6 1.9-1.1l8 5.1c.8.5.8 1.7 0 2.2l-8 5.1c-.8.5-1.9-.1-1.9-1.1V6.8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]">
      <path d="M8.5 10V8.3a3.5 3.5 0 1 1 7 0V10" strokeLinecap="round" />
      <rect x="5.5" y="10" width="13" height="9" rx="2.5" />
    </svg>
  );
}

function TrophyIcon({ locked }: { locked: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={joinClasses(
        "h-5 w-5 fill-none stroke-current stroke-[2]",
        locked ? "opacity-80" : "",
      )}
    >
      <path d="M8 5h8v2.8A4 4 0 0 1 12 12a4 4 0 0 1-4-4.2V5Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 11" strokeLinecap="round" />
      <path d="M16 6h2.5A2.5 2.5 0 0 1 16 11" strokeLinecap="round" />
      <path d="M12 12v4" strokeLinecap="round" />
      <path d="M9 20h6" strokeLinecap="round" />
      <path d="M10 16h4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LessonCard({
  lesson,
  status,
}: {
  lesson: PathLesson;
  status: LessonStatus;
}) {
  const tone = getLessonTone(status);
  const isLocked = status === "locked";
  const cardClasses = joinClasses(
    "group block rounded-[28px] border px-5 py-5 transition md:px-6",
    tone.card,
    !isLocked && "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_38px_-28px_rgba(15,23,42,0.5)]",
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Lesson {lesson.orderIndex}
          </p>
          <h3 className={joinClasses("mt-3 text-lg font-semibold", isLocked ? "text-slate-500" : "text-slate-950")}>
            {lesson.title}
          </h3>
        </div>
        <span
          className={joinClasses(
            "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            tone.badge,
          )}
        >
          {getLessonStatusLabel(status)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <span className={joinClasses("rounded-full px-3 py-1", isLocked ? "bg-white/70 text-slate-500" : "bg-slate-100 text-slate-700")}>
          {lesson.activityCount} activities
        </span>
        <span className={joinClasses("rounded-full px-3 py-1", isLocked ? "bg-white/70 text-slate-500" : "bg-slate-100 text-slate-700")}>
          {lesson.xpReward} XP
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
        <p className={joinClasses("leading-6", isLocked ? "text-slate-500" : "text-slate-600")}>
          {tone.note}
        </p>
        {!isLocked ? (
          <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
            Open
            <ArrowIcon />
          </span>
        ) : null}
      </div>
    </>
  );

  if (isLocked) {
    return <div className={cardClasses}>{content}</div>;
  }

  return (
    <Link
      href={`/academy/java-beginner-path/lessons/${lesson.id}`}
      className={cardClasses}
    >
      {content}
    </Link>
  );
}

function LessonStep({
  alignRight,
  lesson,
  status,
}: {
  alignRight: boolean;
  lesson: PathLesson;
  status: LessonStatus;
}) {
  const tone = getLessonTone(status);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6">
      {!alignRight ? (
        <div className="hidden md:block">
          <LessonCard lesson={lesson} status={status} />
        </div>
      ) : (
        <div className="hidden md:block" />
      )}

      <div className="relative flex justify-center">
        {status === "current" ? (
          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-sky-200/60 blur-xl" />
        ) : null}
        <div
          className={joinClasses(
            "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-white",
            tone.node,
          )}
        >
          <StatusIcon status={status} />
        </div>
      </div>

      <div className="md:hidden">
        <LessonCard lesson={lesson} status={status} />
      </div>

      {alignRight ? (
        <div className="hidden md:block">
          <LessonCard lesson={lesson} status={status} />
        </div>
      ) : null}
    </div>
  );
}

function CheckpointCard({
  availability,
  quizId,
  quizTitle,
}: {
  availability: QuizAvailability;
  quizId: string;
  quizTitle: string;
}) {
  const tone = getCheckpointTone(availability);
  const isAvailable = availability === "available";
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Unit checkpoint
          </p>
          <h3 className={joinClasses("mt-3 text-lg font-semibold", isAvailable ? "text-slate-950" : "text-slate-500")}>
            {quizTitle}
          </h3>
        </div>
        <span
          className={joinClasses(
            "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            tone.badge,
          )}
        >
          {isAvailable ? "Available" : "Locked"}
        </span>
      </div>

      <p className={joinClasses("mt-4 text-sm leading-6", isAvailable ? "text-slate-600" : "text-slate-500")}>
        {tone.note}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
        <p className={joinClasses("font-medium", isAvailable ? "text-violet-700" : "text-slate-500")}>
          {isAvailable ? "Take the unit review" : "Complete every lesson above first"}
        </p>
        {isAvailable ? (
          <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
            Open
            <ArrowIcon />
          </span>
        ) : null}
      </div>
    </>
  );

  const cardClasses = joinClasses(
    "group block rounded-[28px] border px-5 py-5 transition md:px-6",
    tone.card,
    isAvailable && "hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_18px_38px_-26px_rgba(139,92,246,0.5)]",
  );

  if (!isAvailable) {
    return <div className={cardClasses}>{content}</div>;
  }

  return (
    <Link
      href={`/academy/java-beginner-path/quizzes/${quizId}`}
      className={cardClasses}
    >
      {content}
    </Link>
  );
}

function CheckpointStep({
  availability,
  quizId,
  quizTitle,
}: {
  availability: QuizAvailability;
  quizId: string;
  quizTitle: string;
}) {
  const tone = getCheckpointTone(availability);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6">
      <div className="hidden md:block" />

      <div className="relative flex justify-center">
        {availability === "available" ? (
          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-violet-200/70 blur-xl" />
        ) : null}
        <div
          className={joinClasses(
            "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-white",
            tone.node,
          )}
        >
          <TrophyIcon locked={availability !== "available"} />
        </div>
      </div>

      <CheckpointCard
        availability={availability}
        quizId={quizId}
        quizTitle={quizTitle}
      />
    </div>
  );
}

export function PathOverviewShell({
  noticeText,
  userId,
}: {
  noticeText: string | null;
  userId: string | null;
}) {
  const [effectiveUserId] = useState(() => userId ?? getCurrentUser()?.id ?? null);
  const [data, setData] = useState<PathOverviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetchJavaPath(effectiveUserId)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setData(response);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof AcademyApiError
            ? error.message
            : "Could not load the Java beginner path.",
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
  }, [effectiveUserId]);

  const currentLesson =
    data == null ? null : getCurrentLesson(data.path, data.progress);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f4fbf7_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
              Academy
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Java Beginner Path
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back Home
          </Link>
        </div>

        {noticeText ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {noticeText}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading the Java path...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {errorMessage}
          </div>
        ) : null}

        {data ? (
          <>
            <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_90px_-58px_rgba(15,23,42,0.55)]">
              <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.18),_transparent_48%)] lg:block" />
              <div className="relative grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[1.45fr_0.9fr] lg:px-10 lg:py-9">
                <div>
                  <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Guided Java Academy
                  </span>
                  <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Learn Java one guided step at a time.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    {data.path.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Level: {data.path.level}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Language: {data.path.language}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Estimated days: {data.path.estimatedDays ?? "N/A"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Units: {data.path.units.length}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {currentLesson ? (
                      <Link
                        href={`/academy/java-beginner-path/lessons/${currentLesson.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Resume current lesson
                        <ArrowIcon />
                      </Link>
                    ) : (
                      <div className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
                        Path complete
                      </div>
                    )}

                    <div className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600">
                      {data.progress.completedLessons}/{data.progress.totalLessons} lessons complete
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Overall progress
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      {data.progress.completedLessons}/{data.progress.totalLessons}
                    </p>
                    <div className="mt-4 h-2.5 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                        style={{
                          width: `${data.progress.totalLessons === 0 ? 0 : (data.progress.completedLessons / data.progress.totalLessons) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Current focus
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">
                      {currentLesson ? currentLesson.title : "All seeded lessons completed"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {currentLesson
                        ? `Unit ${currentLesson.unitOrderIndex} - ${currentLesson.unitTitle}`
                        : "You have finished the current Java path content."}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Learning rhythm
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">
                      Short lessons, fast wins
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Each node is a small step with a clear next move, then a checkpoint quiz at the end of the unit.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              {data.path.units.map((unit) => {
                const unitProgress = getUnitProgress(
                  unit,
                  data.progress.completedLessonIds,
                );
                const quizAvailability = getQuizAvailability(
                  unit,
                  data.progress.completedLessonIds,
                );
                const unitTheme = getUnitTheme(unit.orderIndex);
                const currentUnitLesson =
                  currentLesson?.unitId === unit.id ? currentLesson : null;
                const progressPercent =
                  unitProgress.totalLessons === 0
                    ? 0
                    : (unitProgress.completedLessons / unitProgress.totalLessons) * 100;

                return (
                  <section
                    key={unit.id}
                    className={joinClasses(
                      "overflow-hidden rounded-[34px] border px-5 py-6 sm:px-6 sm:py-7 lg:px-8",
                      unitTheme.panel,
                    )}
                  >
                    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
                      <div className="space-y-5">
                        <div>
                          <span
                            className={joinClasses(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                              unitTheme.chip,
                            )}
                          >
                            Unit {unit.orderIndex}
                          </span>
                          <h2 className="mt-4 text-2xl font-semibold text-slate-950 sm:text-[2rem]">
                            {unit.title}
                          </h2>
                          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                            {unit.description}
                          </p>
                        </div>

                        <div
                          className={joinClasses(
                            "rounded-[28px] border p-5 shadow-sm backdrop-blur",
                            unitTheme.surface,
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                            <span>Unit progress</span>
                            <span>
                              {unitProgress.completedLessons}/{unitProgress.totalLessons} lessons
                            </span>
                          </div>
                          <div className="mt-3 h-2.5 rounded-full bg-white/80">
                            <div
                              className={joinClasses(
                                "h-full rounded-full bg-gradient-to-r",
                                unitTheme.progress,
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                            <span className="rounded-full bg-white/85 px-3 py-1">
                              {unit.lessons.length} guided steps
                            </span>
                            <span className="rounded-full bg-white/85 px-3 py-1">
                              Quiz {quizAvailability === "available" ? "ready" : "locked"}
                            </span>
                          </div>
                        </div>

                        <div
                          className={joinClasses(
                            "rounded-[28px] border p-5 shadow-sm backdrop-blur",
                            currentUnitLesson
                              ? "border-sky-200 bg-sky-50/90"
                              : unitProgress.completedLessons === unitProgress.totalLessons
                                ? "border-emerald-200 bg-emerald-50/90"
                                : "border-slate-200 bg-white/80",
                          )}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            {currentUnitLesson
                              ? "Current unit step"
                              : unitProgress.completedLessons === unitProgress.totalLessons
                                ? "Unit ready"
                                : "What happens here"}
                          </p>
                          <p className="mt-3 text-lg font-semibold text-slate-950">
                            {currentUnitLesson
                              ? currentUnitLesson.title
                              : unitProgress.completedLessons === unitProgress.totalLessons
                                ? "Checkpoint unlocked"
                                : "Follow the guided lessons in order"}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {currentUnitLesson
                              ? "This is the next lesson your learner should take."
                              : unitProgress.completedLessons === unitProgress.totalLessons
                                ? "All lesson nodes in this unit are complete, so the quiz is ready."
                                : "Completed lessons turn green, the active lesson is highlighted, and future lessons stay locked."}
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <div
                          className={joinClasses(
                            "pointer-events-none absolute bottom-8 left-[1.45rem] top-5 w-1 rounded-full bg-gradient-to-b md:left-1/2 md:-translate-x-1/2",
                            unitTheme.rail,
                          )}
                        />

                        <div className="relative space-y-6">
                          {unit.lessons.map((lesson, index) => {
                            const status = getLessonStatus(data.progress, lesson.id);

                            return (
                              <LessonStep
                                key={lesson.id}
                                alignRight={index % 2 === 1}
                                lesson={lesson}
                                status={status}
                              />
                            );
                          })}

                          {unit.quiz ? (
                            <CheckpointStep
                              availability={quizAvailability}
                              quizId={unit.quiz.id}
                              quizTitle={unit.quiz.title}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
