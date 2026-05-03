"use client";

import { useState } from "react";
import { Exercise } from "@/lib/types";
import FakeCodeEditor from "@/components/course/fake-code-editor";

interface Props {
  exercise: Exercise;
  onCorrect: () => void;
  xpPerQuestion?: number;
}

export default function PredictOutputExercise({ exercise, onCorrect, xpPerQuestion = 10 }: Props) {
  const [prediction, setPrediction] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showXpPop, setShowXpPop] = useState(false);

  const expected = (exercise.expectedOutput ?? "").trim();

  const handleSubmit = () => {
    const isCorrect = prediction.trim() === expected;
    setSubmitted(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      onCorrect();
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 2200);
    }
  };

  const handleRetry = () => {
    setPrediction("");
    setSubmitted(false);
    setCorrect(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Description card */}
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

      {/* Code display */}
      <FakeCodeEditor
        code={exercise.code ?? exercise.starterCode ?? ""}
        language="java"
        maxHeight={240}
      />

      {/* Prediction textarea */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Çfarë do të printojë ky kod?
        </label>
        <textarea
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          disabled={submitted && correct}
          rows={3}
          style={{
            background: "white",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-card)",
            padding: "12px 16px",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            color: "var(--text-primary)",
            resize: "none",
            outline: "none",
            transition: "border-color 150ms",
          }}
          placeholder="Shkruaj outputin e pritur këtu…"
          spellCheck={false}
        />
      </div>

      {/* Correct */}
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

      {/* Wrong */}
      {submitted && !correct && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              fontSize: 13,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 4px",
                }}
              >
                Përgjigja jote
              </p>
              <pre
                style={{
                  background: "#fee2e2",
                  border: "1px solid #ef4444",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#991b1b",
                  fontSize: 12,
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {prediction || "(bosh)"}
              </pre>
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 4px",
                }}
              >
                Outputi i saktë
              </p>
              <pre
                style={{
                  background: "#d1fae5",
                  border: "1px solid #059669",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#065f46",
                  fontSize: 12,
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {expected}
              </pre>
            </div>
          </div>
          <button
            onClick={handleRetry}
            style={{
              alignSelf: "flex-start",
              padding: "6px 16px",
              borderRadius: "var(--radius-btn)",
              border: "1.5px solid var(--border)",
              background: "white",
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Provo Përsëri
          </button>
        </div>
      )}

      {!correct && (
        <button
          onClick={handleSubmit}
          disabled={prediction.trim() === ""}
          style={{
            alignSelf: "flex-start",
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "var(--radius-btn)",
            fontWeight: 700,
            fontSize: 14,
            cursor: prediction.trim() === "" ? "not-allowed" : "pointer",
            opacity: prediction.trim() === "" ? 0.45 : 1,
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
