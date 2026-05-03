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

export default function TrueFalseExercise({
  exercise,
  onCorrect,
  onNext,
  onBack,
  userName = "Student",
  xpPerQuestion = 10,
}: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showXpPop, setShowXpPop] = useState(false);

  const answered = selected !== null;
  const isCorrect = selected === exercise.correctAnswer;

  const handleSelect = (value: boolean) => {
    if (answered) return;
    setSelected(value);
    if (value === exercise.correctAnswer) {
      onCorrect();
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 2200);
    }
  };

  const btnStyle = (value: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      flex: 1,
      padding: "16px 0",
      borderRadius: "var(--radius-btn)",
      border: "1.5px solid var(--border)",
      background: "white",
      fontSize: 16,
      fontWeight: 700,
      cursor: answered ? "default" : "pointer",
      transition: "all 150ms",
      color: "var(--text-primary)",
    };
    if (!answered) return base;
    if (value === exercise.correctAnswer) {
      return { ...base, background: "#d1fae5", border: "1.5px solid #059669", color: "#065f46" };
    }
    if (value === selected) {
      return { ...base, background: "#fee2e2", border: "1.5px solid #ef4444", color: "#991b1b" };
    }
    return { ...base, opacity: 0.45 };
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

      {/* True / False buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button style={btnStyle(true)} onClick={() => handleSelect(true)}>
          ✓ E Vërtetë
          {answered && exercise.correctAnswer === true && (
            <span style={{ marginLeft: 8, color: "#059669" }}>●</span>
          )}
          {answered && selected === true && exercise.correctAnswer !== true && (
            <span style={{ marginLeft: 8, color: "#ef4444" }}>✗</span>
          )}
        </button>
        <button style={btnStyle(false)} onClick={() => handleSelect(false)}>
          ✗ E Gabuar
          {answered && exercise.correctAnswer === false && (
            <span style={{ marginLeft: 8, color: "#059669" }}>●</span>
          )}
          {answered && selected === false && exercise.correctAnswer !== false && (
            <span style={{ marginLeft: 8, color: "#ef4444" }}>✗</span>
          )}
        </button>
      </div>

      {/* Feedback */}
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
              margin: 0,
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

      {/* Navigation */}
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
              }}
            >
              Pyetja Tjetër →
            </button>
          )}
        </div>
      )}

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
