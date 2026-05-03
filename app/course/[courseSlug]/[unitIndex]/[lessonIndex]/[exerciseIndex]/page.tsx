"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourse } from "@/lib/course";
import { useProgress } from "@/lib/useProgress";
import { ExecuteResult, MatchType } from "@/lib/types";
import CourseSidebar from "@/components/academy/course-sidebar";
import XpProgressBar from "@/components/academy/xp-progress-bar";
import AchievementToast, { Achievement } from "@/components/academy/achievement-toast";
import CodeExerciseFlow from "@/components/course/code-exercise-flow";
import MultipleChoiceExercise from "@/components/exercises/MultipleChoiceExercise";
import TrueFalseExercise from "@/components/exercises/TrueFalseExercise";
import FillBlankExercise from "@/components/exercises/FillBlankExercise";
import PredictOutputExercise from "@/components/exercises/PredictOutputExercise";

const XP_PER_EXERCISE = 10;
const CODE_TYPES = new Set(["write", "fix", "fill", "code_exercise"]);
const STREAK_KEY = "cq-streak-data";
const ACH_KEY = "cq-achievements-shown";

function checkCorrect(
  actualOutput: string,
  matchType: MatchType | undefined,
  matchPattern: string | undefined,
  expectedOutput: string,
  hasCompileError: boolean | null | string,
  hasRuntimeError: boolean | null | string
): boolean {
  if (hasCompileError || hasRuntimeError) return false;
  switch (matchType) {
    case "runs": return true;
    case "contains": return actualOutput.includes(matchPattern ?? expectedOutput);
    case "startsWith": return actualOutput.startsWith(matchPattern ?? expectedOutput);
    case "exact":
    default: return actualOutput === expectedOutput.trim();
  }
}

function fmtTimer(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function loadStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const { lastDate, count } = JSON.parse(raw) as { lastDate: string; count: number };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today || lastDate === yesterday) return count as number;
    return 0;
  } catch { return 0; }
}

function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: 1 }));
      return 1;
    }
    const { lastDate, count } = JSON.parse(raw) as { lastDate: string; count: number };
    if (lastDate === today) return count as number;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newCount = lastDate === yesterday ? (count as number) + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: newCount }));
    return newCount;
  } catch { return 1; }
}

function getShownAchievements(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ACH_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

function markAchievementShown(id: string): void {
  const shown = getShownAchievements();
  shown.add(id);
  localStorage.setItem(ACH_KEY, JSON.stringify([...shown]));
}

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter();

  const courseSlug = params.courseSlug as string;
  const unitIndex = parseInt(params.unitIndex as string, 10);
  const lessonIndex = parseInt(params.lessonIndex as string, 10);
  const exerciseIndex = parseInt(params.exerciseIndex as string, 10);

  const course = getCourse(courseSlug);
  const { progress, markCompleted, markViewedSolution, countCompleted } = useProgress();

  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  useEffect(() => { setStreak(loadStreak()); }, []);

  if (!course) return <div style={{ color: "white", padding: 32 }}>Kursi nuk u gjet.</div>;

  const unit = course.units[unitIndex];
  const lesson = unit?.lessons[lessonIndex];
  const exercise = lesson?.exercises[exerciseIndex];

  if (!exercise) return <div style={{ color: "white", padding: 32 }}>Ushtrim nuk u gjet.</div>;

  const isCodeExercise = CODE_TYPES.has(exercise.type);
  const allExerciseIds = course.units.flatMap((u) =>
    u.lessons.flatMap((l) => l.exercises.map((e) => e.id))
  );
  const completedCount = countCompleted(allExerciseIds);
  const xp = completedCount * XP_PER_EXERCISE;

  // Timer for quiz exercises — reset on each exercise
  useEffect(() => {
    if (isCodeExercise) return;
    setTimerSeconds(0);
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [exercise.id, isCodeExercise]);

  // Reset per-exercise state when navigating
  useEffect(() => {
    if (isCodeExercise) setCode(exercise.starterCode ?? "");
    setResult(null);
    setIsCorrect(null);
    setAiFeedback(null);
    setShowSuccess(false);
  }, [exercise.id]);

  const nextLocation = (): string | null => {
    if (exerciseIndex + 1 < lesson.exercises.length)
      return `/course/${courseSlug}/${unitIndex}/${lessonIndex}/${exerciseIndex + 1}`;
    if (lessonIndex + 1 < unit.lessons.length)
      return `/course/${courseSlug}/${unitIndex}/${lessonIndex + 1}/0`;
    if (unitIndex + 1 < course.units.length)
      return `/course/${courseSlug}/${unitIndex + 1}/0/0`;
    return null;
  };

  const prevLocation = (): string | null => {
    if (exerciseIndex > 0)
      return `/course/${courseSlug}/${unitIndex}/${lessonIndex}/${exerciseIndex - 1}`;
    if (lessonIndex > 0) {
      const prevLesson = unit.lessons[lessonIndex - 1];
      return `/course/${courseSlug}/${unitIndex}/${lessonIndex - 1}/${prevLesson.exercises.length - 1}`;
    }
    if (unitIndex > 0) {
      const prevUnit = course.units[unitIndex - 1];
      const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
      return `/course/${courseSlug}/${unitIndex - 1}/${prevUnit.lessons.length - 1}/${lastLesson.exercises.length - 1}`;
    }
    return null;
  };

  const handleNext = () => { const n = nextLocation(); if (n) router.push(n); };
  const handleBack = () => { const p = prevLocation(); if (p) router.push(p); };

  const triggerAchievement = useCallback(
    (wasAlreadyCompleted: boolean, newCount: number, newStreak: number) => {
      if (wasAlreadyCompleted) return;
      const newXp = newCount * XP_PER_EXERCISE;
      const oldXp = (newCount - 1) * XP_PER_EXERCISE;
      const shown = getShownAchievements();
      const unitIds = unit.lessons.flatMap((l) => l.exercises.map((e) => e.id));
      const unitDoneBefore = unitIds.filter((id) => id !== exercise.id && progress[id]?.completed).length;
      const unitAllDone = unitDoneBefore + 1 === unitIds.length;

      let ach: Achievement | null = null;
      if (newCount === 1 && !shown.has("first-exercise")) {
        ach = { id: "first-exercise", title: "Hapi i Parë", description: "Ke kompletuar ushtrimin e parë!" };
      } else if (unitAllDone && !shown.has(`unit-${unit.id}`)) {
        ach = { id: `unit-${unit.id}`, title: `${unit.title} Kompletuar`, description: "Ke kompletuar të gjitha ushtrimet e këtij kapitulli!" };
      } else if (newStreak >= 3 && !shown.has("streak-3")) {
        ach = { id: "streak-3", title: "3 Ditë Radhazi", description: "Je aktiv 3 ditë radhazi. Vazhdo kështu!" };
      } else if (oldXp < 100 && newXp >= 100 && !shown.has("xp-100")) {
        ach = { id: "xp-100", title: "100 XP Fituar", description: "Ke fituar 100 XP. Rruga drejt ekspertizës!" };
      }
      if (ach) { markAchievementShown(ach.id); setAchievement(ach); }
    },
    [exercise.id, unit, progress]
  );

  const handleNonCodeCorrect = useCallback(() => {
    const wasCompleted = !!progress[exercise.id]?.completed;
    markCompleted(exercise.id);
    setIsCorrect(true);
    const newStreak = updateStreak();
    setStreak(newStreak);
    const newCount = wasCompleted ? completedCount : completedCount + 1;
    triggerAchievement(wasCompleted, newCount, newStreak);
  }, [exercise.id, markCompleted, progress, completedCount, triggerAchievement]);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setIsCorrect(null);
    setAiFeedback(null);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, languageId: course.languageId }),
      });
      const data: ExecuteResult = await res.json();
      setResult(data);
      const hasCompileError = data.compileOutput && data.compileOutput.trim().length > 0;
      const hasRuntimeError = data.stderr && data.stderr.trim().length > 0 && !hasCompileError;
      const actualOutput = data.stdout?.trim() ?? "";
      const correct = checkCorrect(
        actualOutput,
        exercise.matchType as MatchType | undefined,
        exercise.matchPattern,
        exercise.expectedOutput ?? "",
        hasCompileError,
        hasRuntimeError
      );
      setIsCorrect(correct);
      if (correct) {
        const wasCompleted = !!progress[exercise.id]?.completed;
        markCompleted(exercise.id);
        setShowSuccess(true);
        const newStreak = updateStreak();
        setStreak(newStreak);
        const newCount = wasCompleted ? completedCount : completedCount + 1;
        triggerAchievement(wasCompleted, newCount, newStreak);
      } else {
        setAiFeedbackLoading(true);
        try {
          const errorType = hasCompileError ? "compile_error" : hasRuntimeError ? "runtime_error" : "wrong_output";
          const fbRes = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              errorType,
              errorDetail: data.compileOutput ?? data.stderr ?? "",
              exerciseDescription: exercise.description,
              expectedOutput: exercise.expectedOutput,
              actualOutput,
            }),
          });
          const fbData = await fbRes.json();
          setAiFeedback(fbData.feedback ?? null);
        } catch { /* AI feedback is non-critical */ } finally {
          setAiFeedbackLoading(false);
        }
      }
    } catch (err) {
      setResult({ status: "Error", statusId: 0, stdout: null, stderr: err instanceof Error ? err.message : "Unknown error", compileOutput: null, time: null });
    } finally {
      setIsRunning(false);
    }
  }, [code, course.languageId, exercise, markCompleted, progress, completedCount, triggerAchievement]);

  const next = nextLocation();
  const prev = prevLocation();
  const lessonExercises = lesson.exercises;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Fixed dark sidebar */}
      <CourseSidebar xp={xp} streak={streak} />

      {/* Main content shifted right of sidebar */}
      <div
        style={{
          marginLeft: 220,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: isCodeExercise ? "#0f1117" : "var(--bg-card)",
        }}
      >
        {/* XP / streak bar */}
        <XpProgressBar totalXp={xp} streak={streak} />

        {/* Top bar */}
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 24px",
            borderBottom: isCodeExercise
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid var(--border)",
            background: isCodeExercise ? "#0f1117" : "white",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: isCodeExercise ? "white" : "var(--text-primary)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              K.{unitIndex + 1} · {unit.title}
            </p>
            <p
              style={{
                fontSize: 11,
                color: isCodeExercise ? "rgba(255,255,255,0.4)" : "var(--text-secondary)",
                margin: 0,
              }}
            >
              Pyetja {exerciseIndex + 1} nga {lessonExercises.length}
            </p>
          </div>

          {!isCodeExercise && (
            <span
              style={{
                background: "#fff7ed",
                color: "#c2410c",
                border: "1px solid #fed7aa",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ⏱ {fmtTimer(timerSeconds)}
            </span>
          )}

          <span
            style={{
              background: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            +{XP_PER_EXERCISE} XP
          </span>

          <Link
            href={`/course/${courseSlug}`}
            style={{
              fontSize: 12,
              color: isCodeExercise ? "rgba(255,255,255,0.35)" : "var(--text-secondary)",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            ← Kursi
          </Link>
        </header>

        {/* Progress dots */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 24px",
            borderBottom: isCodeExercise
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid var(--border)",
            background: isCodeExercise ? "rgba(255,255,255,0.02)" : "white",
          }}
        >
          {lessonExercises.map((ex, ei) => {
            const isCurrent = ei === exerciseIndex;
            const isDone = progress[ex.id]?.completed;
            return (
              <div
                key={ex.id}
                style={{
                  width: isCurrent ? 14 : 10,
                  height: isCurrent ? 14 : 10,
                  borderRadius: "50%",
                  flexShrink: 0,
                  transition: "all 200ms",
                  background: isCurrent
                    ? "var(--accent-primary)"
                    : isDone
                    ? "#059669"
                    : isCodeExercise
                    ? "rgba(255,255,255,0.14)"
                    : "var(--border)",
                  boxShadow: isCurrent ? "0 0 0 3px rgba(26,86,219,0.2)" : "none",
                }}
              />
            );
          })}
          <span
            style={{
              marginLeft: 10,
              fontSize: 11,
              color: isCodeExercise ? "rgba(255,255,255,0.3)" : "var(--text-secondary)",
            }}
          >
            {completedCount}/{allExerciseIds.length} ushtrime
          </span>
        </div>

        {/* Content */}
        {isCodeExercise ? (
          <CodeExerciseFlow
            exercise={exercise}
            unitTitle={unit.title}
            lessonTitle={lesson.title}
            exerciseIndex={exerciseIndex}
            totalExercises={lessonExercises.length}
            code={code}
            onCodeChange={setCode}
            isRunning={isRunning}
            result={result}
            isCorrect={isCorrect}
            aiFeedback={aiFeedback}
            aiFeedbackLoading={aiFeedbackLoading}
            onRun={runCode}
            onNext={handleNext}
            onShowSolution={
              exercise.solutionCode
                ? () => { markViewedSolution(exercise.id); setCode(exercise.solutionCode!); }
                : undefined
            }
            hasNext={!!next}
            xpGained={XP_PER_EXERCISE}
          />
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 24px",
            }}
          >
            <div
              style={{
                maxWidth: 640,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {exercise.type === "multiple_choice" && (
                <MultipleChoiceExercise
                  key={exercise.id}
                  exercise={exercise}
                  onCorrect={handleNonCodeCorrect}
                  onNext={next ? handleNext : undefined}
                  onBack={prev ? handleBack : undefined}
                  xpPerQuestion={XP_PER_EXERCISE}
                />
              )}
              {exercise.type === "true_false" && (
                <TrueFalseExercise
                  key={exercise.id}
                  exercise={exercise}
                  onCorrect={handleNonCodeCorrect}
                  onNext={next ? handleNext : undefined}
                  onBack={prev ? handleBack : undefined}
                  xpPerQuestion={XP_PER_EXERCISE}
                />
              )}
              {exercise.type === "fill_blank" && (
                <FillBlankExercise
                  key={exercise.id}
                  exercise={exercise}
                  onCorrect={handleNonCodeCorrect}
                  xpPerQuestion={XP_PER_EXERCISE}
                />
              )}
              {exercise.type === "predict_output" && (
                <PredictOutputExercise
                  key={exercise.id}
                  exercise={exercise}
                  onCorrect={handleNonCodeCorrect}
                  xpPerQuestion={XP_PER_EXERCISE}
                />
              )}

              {/* Navigation for fill_blank / predict_output after correct */}
              {isCorrect === true &&
                exercise.type !== "multiple_choice" &&
                exercise.type !== "true_false" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                    {prev && (
                      <button
                        onClick={handleBack}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "var(--radius-btn)",
                          border: "1.5px solid var(--border)",
                          background: "white",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        ← Mbrapa
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "var(--radius-btn)",
                        background: "var(--accent-primary)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {next ? "Pyetja Tjetër →" : "Përfundo Kursin ✓"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Achievement toast */}
      <AchievementToast achievement={achievement} onDismiss={() => setAchievement(null)} />

      {/* Success overlay — code exercises only */}
      {showSuccess && isCodeExercise && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              background: "#0f1117",
              border: "1px solid rgba(5,122,85,0.3)",
              borderRadius: 20,
              padding: "36px 32px",
              maxWidth: 360,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 8px" }}>
              Sakte!
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 10px" }}>
              Zgjidhja ishte e saktë. Vazhdo kështu!
            </p>
            <span
              style={{
                display: "inline-block",
                background: "#fef3c7",
                color: "#92400e",
                padding: "4px 14px",
                borderRadius: 20,
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              +{XP_PER_EXERCISE} XP
            </span>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setShowSuccess(false)}
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  padding: "9px 16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Shiko
              </button>
              {next ? (
                <button
                  onClick={() => { setShowSuccess(false); handleNext(); }}
                  style={{
                    fontSize: 13,
                    background: "var(--accent-primary)",
                    color: "white",
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Ushtrim Tjetër →
                </button>
              ) : (
                <Link
                  href="/"
                  style={{
                    fontSize: 13,
                    background: "#059669",
                    color: "white",
                    padding: "9px 20px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Përfundo Kursin ✓
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
