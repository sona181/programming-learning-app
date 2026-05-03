"use client";

import { useState, useRef } from "react";
import { Exercise } from "@/lib/types";

interface Props {
  exercise: Exercise;
  onCorrect: () => void;
  xpPerQuestion?: number;
}

export default function FillBlankExercise({ exercise, onCorrect, xpPerQuestion = 10 }: Props) {
  const blanks = exercise.blanks ?? [];
  const [values, setValues] = useState<string[]>(blanks.map(() => ""));
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showXpPop, setShowXpPop] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const template = exercise.codeTemplate ?? "";
  const parts = template.split("___");

  const handleChange = (i: number, val: string) => {
    if (submitted && correct) return;
    const next = [...values];
    next[i] = val;
    setValues(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Enter") {
      if (i < blanks.length - 1) {
        inputRefs.current[i + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const allCorrect = blanks.every((b, i) =>
      values[i].trim().toLowerCase() === b.answer.trim().toLowerCase()
    );
    setSubmitted(true);
    setCorrect(allCorrect);
    if (allCorrect) {
      onCorrect();
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 2200);
    }
  };

  const handleRetry = () => {
    setValues(blanks.map(() => ""));
    setSubmitted(false);
    setCorrect(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const blankState = (i: number) => {
    if (!submitted) return "idle";
    return values[i].trim().toLowerCase() === blanks[i].answer.trim().toLowerCase()
      ? "correct"
      : "wrong";
  };

  const inputStyle = (i: number): React.CSSProperties => {
    const state = blankState(i);
    const base: React.CSSProperties = {
      display: "inline-block",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      padding: "2px 8px",
      borderRadius: 6,
      border: "1.5px solid",
      outline: "none",
      minWidth: 80,
      textAlign: "center",
      background: state === "correct" ? "#d1fae5" : state === "wrong" ? "#fee2e2" : "white",
      borderColor: state === "correct" ? "#059669" : state === "wrong" ? "#ef4444" : "var(--border)",
      color: state === "correct" ? "#065f46" : state === "wrong" ? "#991b1b" : "var(--text-primary)",
      transition: "all 150ms",
    };
    return base;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Description */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "20px 24px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          {exercise.description}
        </p>
      </div>

      {/* Code block with inline inputs */}
      <div
        style={{
          background: "#1e1e2e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-card)",
          padding: "20px 24px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          color: "#e2e8f0",
          lineHeight: 2,
          whiteSpace: "pre-wrap",
        }}
      >
        {parts.map((part, i) => (
          <span key={`part-${i}`}>
            {part}
            {i < blanks.length && (
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                value={values[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                style={{
                  ...inputStyle(i),
                  width: `${Math.max(80, (blanks[i].answer.length + 4) * 9)}px`,
                }}
                disabled={submitted && correct}
                placeholder="___"
                spellCheck={false}
                autoComplete="off"
              />
            )}
          </span>
        ))}
      </div>

      {/* Wrong feedback */}
      {submitted && !correct && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "var(--radius-card)",
            padding: "14px 18px",
            fontSize: 13,
            color: "#991b1b",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700 }}>❌ Jo sakte. Përgjigjet e sakta:</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {blanks.map((b) => (
              <code
                key={b.id}
                style={{
                  background: "rgba(0,0,0,0.1)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#065f46",
                  fontSize: 13,
                }}
              >
                {b.answer}
              </code>
            ))}
          </div>
          <button
            onClick={handleRetry}
            style={{
              marginTop: 10,
              padding: "6px 16px",
              borderRadius: "var(--radius-btn)",
              border: "1.5px solid #ef4444",
              background: "transparent",
              color: "#991b1b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Provo Përsëri
          </button>
        </div>
      )}

      {/* Correct feedback */}
      {submitted && correct && (
        <div
          style={{
            background: "#d1fae5",
            border: "1px solid #059669",
            borderRadius: "var(--radius-card)",
            padding: "14px 18px",
            fontWeight: 700,
            color: "#065f46",
            fontSize: 14,
          }}
        >
          ✅ Sakte! Bravo!
        </div>
      )}

      {/* Submit button */}
      {!correct && (
        <button
          onClick={handleSubmit}
          disabled={values.some((v) => v.trim() === "")}
          style={{
            alignSelf: "flex-start",
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "var(--radius-btn)",
            fontWeight: 700,
            fontSize: 14,
            cursor: values.some((v) => v.trim() === "") ? "not-allowed" : "pointer",
            opacity: values.some((v) => v.trim() === "") ? 0.45 : 1,
            transition: "opacity 150ms",
          }}
        >
          Kontrollo
        </button>
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
