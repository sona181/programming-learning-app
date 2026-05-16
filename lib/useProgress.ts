"use client";

import { useState, useEffect, useCallback } from "react";
import { CourseProgress, ExerciseProgress } from "./types";

function loadProgress(key: string): CourseProgress {
  if (globalThis.window === undefined) return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CourseProgress) : {};
  } catch {
    return {};
  }
}

function saveProgress(key: string, progress: CourseProgress) {
  localStorage.setItem(key, JSON.stringify(progress));
}

export function useProgress(courseSlug = "default") {
  const storageKey = `course-progress-${courseSlug}`;
  const [progress, setProgress] = useState<CourseProgress>({});

  useEffect(() => {
    setProgress(loadProgress(storageKey));
  }, [storageKey]);

  const markCompleted = useCallback((exerciseId: string) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        [exerciseId]: { ...prev[exerciseId], completed: true },
      };
      saveProgress(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const markViewedSolution = useCallback((exerciseId: string) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        [exerciseId]: { ...prev[exerciseId], viewedSolution: true },
      };
      saveProgress(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const getExerciseProgress = useCallback(
    (exerciseId: string): ExerciseProgress => {
      return progress[exerciseId] ?? { completed: false, viewedSolution: false };
    },
    [progress]
  );

  const countCompleted = useCallback(
    (exerciseIds: string[]): number => {
      return exerciseIds.filter((id) => progress[id]?.completed).length;
    },
    [progress]
  );

  return { progress, markCompleted, markViewedSolution, getExerciseProgress, countCompleted };
}
