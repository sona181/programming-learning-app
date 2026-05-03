"use client";

import { useState } from "react";
import { Exercise } from "@/lib/types";

interface ExercisePanelProps {
  exercise: Exercise;
  unitTitle: string;
  lessonTitle: string;
  exerciseIndex: number;
  totalExercises: number;
  onShowSolution?: () => void;
}

const TYPE_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  write:           { bg: "#dbeafe", color: "#1e40af", label: "Code" },
  fix:             { bg: "#fef3c7", color: "#92400e", label: "Fix" },
  fill:            { bg: "#ede9fe", color: "#5b21b6", label: "Fill in" },
  mcq:             { bg: "#d1fae5", color: "#065f46", label: "Quiz" },
  code_exercise:   { bg: "#dbeafe", color: "#1e40af", label: "Code" },
  multiple_choice: { bg: "#d1fae5", color: "#065f46", label: "Quiz" },
  true_false:      { bg: "#ede9fe", color: "#5b21b6", label: "True / False" },
  fill_blank:      { bg: "#ede9fe", color: "#5b21b6", label: "Fill in" },
  predict_output:  { bg: "#fef3c7", color: "#92400e", label: "Predict" },
};

function renderDescription(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            background: "#f3f4f6",
            color: "var(--accent-primary)",
            padding: "1px 6px",
            borderRadius: 4,
            fontSize: "0.9em",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part === "\n") return <br key={i} />;
    return <span key={i}>{part}</span>;
  });
}

export default function ExercisePanel({
  exercise,
  unitTitle,
  lessonTitle,
  exerciseIndex,
  totalExercises,
  onShowSolution,
}: ExercisePanelProps) {
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showingSolution, setShowingSolution] = useState(false);

  const badge = TYPE_BADGE[exercise.type] ?? TYPE_BADGE.write;
  const canShowSolution = !!onShowSolution && !!exercise.solutionCode;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        padding: "20px",
        gap: 16,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap",
        }}
      >
        <span>{unitTitle}</span>
        <span>›</span>
        <span>{lessonTitle}</span>
        <span>›</span>
        <span style={{ color: "rgba(255,255,255,0.55)" }}>
          Ushtrim {exerciseIndex + 1} / {totalExercises}
        </span>
      </div>

      {/* Title + badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <h2
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: 700,
            color: "white",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {exercise.title}
        </h2>
        <span
          style={{
            background: badge.bg,
            color: badge.color,
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.75,
          whiteSpace: "pre-line",
        }}
      >
        {renderDescription(exercise.description)}
      </div>

      {/* Hints section */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {hintsRevealed > 0 && exercise.hints && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "#fde68a",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ flexShrink: 0 }}>💡</span>
                <span>{hint}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {exercise.hints && hintsRevealed < exercise.hints.length && (
            <button
              onClick={() => setHintsRevealed((n) => n + 1)}
              style={{
                fontSize: 12,
                color: "#fbbf24",
                background: "transparent",
                border: "1px solid rgba(245,158,11,0.35)",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              {hintsRevealed === 0 ? "Shfaq ndihmën" : "Ndihma tjetër"}
            </button>
          )}
          {!showingSolution && canShowSolution && (
            <button
              onClick={() => { setShowingSolution(true); onShowSolution?.(); }}
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              Shfaq zgjidhjen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
