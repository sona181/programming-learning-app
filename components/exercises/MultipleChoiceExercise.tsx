"use client";

import { useState } from "react";
import { Exercise } from "@/lib/types";

interface Props {
  exercise: Exercise;
  onCorrect: () => void;
  onNext?: () => void;
  onBack?: () => void;
  userName?: string;
  xpPerQuestion?: number;
}

const LABELS = ["A", "B", "C", "D", "E"];

export default function MultipleChoiceExercise({
  exercise,
  onCorrect,
  onNext,
  onBack,
  userName = "Student",
  xpPerQuestion = 10,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showXpPop, setShowXpPop] = useState(false);

  const answered = selected !== null;
  const isCorrect = selected === exercise.correctOption;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === exercise.correctOption) {
      onCorrect();
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 2200);
    }
  };

  const getOptionStyle = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderRadius: "var(--radius-btn)",
      border: "1.5px solid var(--border)",
      background: "white",
      cursor: answered ? "default" : "pointer",
      width: "100%",
      textAlign: "left",
      transition: "all 150ms",
      fontSize: 14,
      color: "var(--text-primary)",
    };
    if (!answered) return base;
    if (i === exercise.correctOption) {
      return { ...base, background: "#d1fae5", border: "1.5px solid #059669", color: "#065f46" };
    }
    if (i === selected) {
      return { ...base, background: "#fee2e2", border: "1.5px solid #ef4444", color: "#991b1b" };
    }
    return { ...base, opacity: 0.45 };
  };

  const getBadgeStyle = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 36,
      height: 36,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 14,
      flexShrink: 0,
      background: "var(--bg-card)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    };
    if (!answered) return base;
    if (i === exercise.correctOption)
      return { ...base, background: "#059669", color: "white", border: "1px solid #059669" };
    if (i === selected)
      return { ...base, background: "#ef4444", color: "white", border: "1px solid #ef4444" };
    return base;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Question card */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "24px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.65,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {exercise.question ?? exercise.description}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(exercise.options ?? []).map((opt, i) => (
          <button key={i} style={getOptionStyle(i)} onClick={() => handleSelect(i)}>
            <span style={getBadgeStyle(i)}>{LABELS[i]}</span>
            <span
              style={{
                flex: 1,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {opt}
            </span>
            {answered && i === exercise.correctOption && (
              <span style={{ color: "#059669", fontSize: 20 }}>●</span>
            )}
            {answered && i === selected && i !== exercise.correctOption && (
              <span style={{ color: "#ef4444", fontSize: 16, fontWeight: 900 }}>✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback box */}
      {answered && (
        <div
          style={{
            background: isCorrect ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${isCorrect ? "#059669" : "#ef4444"}`,
            borderRadius: "var(--radius-card)",
            padding: "16px 20px",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              color: isCorrect ? "#065f46" : "#991b1b",
              margin: "0 0 (exercise.explanation ? 6 : 0)px",
              fontSize: 15,
            }}
          >
            {isCorrect ? `✅ Sakte! Bravo ${userName}!` : "❌ Jo sakte!"}
          </p>
          {exercise.explanation && (
            <p
              style={{
                color: isCorrect ? "#047857" : "#b91c1c",
                fontSize: 13,
                margin: "6px 0 0",
                lineHeight: 1.6,
              }}
            >
              {exercise.explanation}
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      {answered && (
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: "10px 20px",
                borderRadius: "var(--radius-btn)",
                border: "1.5px solid var(--border)",
                background: "white",
                color: "var(--text-primary)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 150ms",
              }}
            >
              ← Mbrapa
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              style={{
                marginLeft: "auto",
                padding: "10px 24px",
                borderRadius: "var(--radius-btn)",
                background: "var(--accent-primary)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                transition: "background 150ms",
              }}
            >
              Pyetja Tjetër →
            </button>
          )}
        </div>
      )}

      {/* XP pop toast */}
      {showXpPop && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 28,
            background: "#fef3c7",
            border: "1.5px solid var(--xp-color)",
            borderRadius: "var(--radius-btn)",
            padding: "10px 20px",
            fontWeight: 800,
            fontSize: 17,
            color: "#92400e",
            zIndex: 150,
            animation: "fadeInUp 300ms ease-out",
            boxShadow: "0 4px 16px rgba(245,158,11,0.25)",
          }}
        >
          +{xpPerQuestion} XP
        </div>
      )}
    </div>
  );
}
