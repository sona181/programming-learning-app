"use client";

import CodeEditor from "@/components/CodeEditor";
import ExercisePanel from "@/components/ExercisePanel";
import FeedbackPanel from "@/components/FeedbackPanel";
import { Exercise, ExecuteResult, MatchType } from "@/lib/types";

interface CodeExerciseFlowProps {
  exercise: Exercise;
  unitTitle: string;
  lessonTitle: string;
  exerciseIndex: number;
  totalExercises: number;
  code: string;
  onCodeChange: (val: string) => void;
  isRunning: boolean;
  result: ExecuteResult | null;
  isCorrect: boolean | null;
  aiFeedback: string | null;
  aiFeedbackLoading: boolean;
  onRun: () => void;
  onNext: () => void;
  onShowSolution?: () => void;
  hasNext: boolean;
  xpGained?: number;
}

export default function CodeExerciseFlow({
  exercise,
  unitTitle,
  lessonTitle,
  exerciseIndex,
  totalExercises,
  code,
  onCodeChange,
  isRunning,
  result,
  isCorrect,
  aiFeedback,
  aiFeedbackLoading,
  onRun,
  onNext,
  onShowSolution,
  hasNext,
  xpGained = 10,
}: CodeExerciseFlowProps) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        background: "#0f1117",
      }}
    >
      {/* Left: exercise instructions */}
      <div
        style={{
          width: 380,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <ExercisePanel
          exercise={exercise}
          unitTitle={unitTitle}
          lessonTitle={lessonTitle}
          exerciseIndex={exerciseIndex}
          totalExercises={totalExercises}
          onShowSolution={onShowSolution}
        />
      </div>

      {/* Right: editor + run bar + feedback */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Editor */}
        <div style={{ flex: 1, overflow: "hidden", padding: 12 }}>
          <CodeEditor value={code} onChange={onCodeChange} language="java" />
        </div>

        {/* Run bar */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <button
            onClick={onRun}
            disabled={isRunning}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: isRunning ? "rgba(26,86,219,0.5)" : "var(--accent-primary)",
              color: "white",
              border: "none",
              padding: "8px 20px",
              borderRadius: "var(--radius-btn)",
              fontWeight: 700,
              fontSize: 14,
              cursor: isRunning ? "not-allowed" : "pointer",
              transition: "background 150ms",
            }}
          >
            {isRunning ? (
              <>
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Duke ekzekutuar…
              </>
            ) : (
              <>
                <svg width="11" height="13" viewBox="0 0 12 14" fill="currentColor">
                  <path d="M1 1l10 6-10 6V1z" />
                </svg>
                Ekzekuto
              </>
            )}
          </button>

          {isCorrect === true && (
            <>
              {xpGained > 0 && (
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  +{xpGained} XP
                </span>
              )}
              <button
                onClick={onNext}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--accent-success)",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "var(--radius-btn)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {hasNext ? "Tjetër →" : "Përfundo Kursin ✓"}
              </button>
            </>
          )}

          {result && isCorrect !== true && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>
              {result.status}
            </span>
          )}
        </div>

        {/* Feedback */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            maxHeight: 240,
            overflowY: "auto",
            background: "#0a0a10",
          }}
        >
          <FeedbackPanel
            result={result}
            isCorrect={isCorrect}
            isLoading={isRunning}
            aiFeedback={aiFeedback}
            aiFeedbackLoading={aiFeedbackLoading}
            expectedOutput={exercise.expectedOutput ?? ""}
            matchType={exercise.matchType as MatchType | undefined}
            matchPattern={exercise.matchPattern}
          />
        </div>
      </div>
    </div>
  );
}
