import type { PathOverviewResponse } from "@/lib/academy/api";

export type LessonStatus = "completed" | "current" | "locked";
export type QuizAvailability = "locked" | "available";

type FlattenedLesson = {
  activityCount: number;
  id: string;
  lessonOrderIndex: number;
  title: string;
  unitId: string;
  unitOrderIndex: number;
  unitTitle: string;
  xpReward: number;
};

export function flattenPathLessons(path: PathOverviewResponse["path"]) {
  return path.units.flatMap<FlattenedLesson>((unit) =>
    unit.lessons.map((lesson) => ({
      activityCount: lesson.activityCount,
      id: lesson.id,
      lessonOrderIndex: lesson.orderIndex,
      title: lesson.title,
      unitId: unit.id,
      unitOrderIndex: unit.orderIndex,
      unitTitle: unit.title,
      xpReward: lesson.xpReward,
    })),
  );
}

export function getLessonStatus(
  progress: PathOverviewResponse["progress"],
  lessonId: string,
): LessonStatus {
  if (progress.completedLessonIds.includes(lessonId)) {
    return "completed";
  }

  if (progress.currentLessonId === lessonId) {
    return "current";
  }

  return "locked";
}

export function getLessonStatusLabel(status: LessonStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "current":
      return "Current lesson";
    case "locked":
    default:
      return "Locked";
  }
}

export function getLessonStatusClasses(status: LessonStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "current":
      return "border-blue-200 bg-blue-50 text-blue-900";
    case "locked":
    default:
      return "border-slate-200 bg-slate-100 text-slate-500";
  }
}

export function getNextLesson(
  path: PathOverviewResponse["path"],
  lessonId: string,
) {
  const orderedLessons = flattenPathLessons(path);
  const currentIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);

  return currentIndex >= 0 ? orderedLessons[currentIndex + 1] ?? null : null;
}

export function getCurrentLesson(
  path: PathOverviewResponse["path"],
  progress: PathOverviewResponse["progress"],
) {
  return flattenPathLessons(path).find(
    (lesson) => lesson.id === progress.currentLessonId,
  );
}

export function getUnitProgress(
  unit: PathOverviewResponse["path"]["units"][number],
  completedLessonIds: string[],
) {
  const completedLessons = unit.lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;

  return {
    completedLessons,
    totalLessons: unit.lessons.length,
  };
}

export function getQuizAvailability(
  unit: PathOverviewResponse["path"]["units"][number],
  completedLessonIds: string[],
): QuizAvailability {
  return unit.lessons.every((lesson) => completedLessonIds.includes(lesson.id))
    ? "available"
    : "locked";
}
