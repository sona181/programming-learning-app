"use client";

import { ExecuteResult, MatchType } from "@/lib/types";

interface FeedbackPanelProps {
  result: ExecuteResult | null;
  isCorrect: boolean | null;
  isLoading: boolean;
  aiFeedback: string | null;
  aiFeedbackLoading: boolean;
  expectedOutput: string;
  matchType?: MatchType;
  matchPattern?: string;
}

export default function FeedbackPanel({
  result,
  isCorrect,
  isLoading,
  aiFeedback,
  aiFeedbackLoading,
  expectedOutput,
  matchType,
  matchPattern,
}: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          fontSize: 13,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(255,255,255,0.15)",
            borderTopColor: "var(--accent-primary)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        Duke ekzekutuar kodin…
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
        Shkruaj zgjidhjen dhe kliko{" "}
        <strong style={{ color: "rgba(255,255,255,0.5)" }}>Ekzekuto</strong> për ta testuar.
      </div>
    );
  }

  const hasCompileError =
    result.compileOutput && result.compileOutput.trim().length > 0;
  const hasRuntimeError =
    result.stderr && result.stderr.trim().length > 0 && !hasCompileError;
  const actualOutput = result.stdout?.trim() ?? "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "12px 16px",
        fontSize: 13,
      }}
    >
      {/* Status banner */}
      {isCorrect === true && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(5,122,85,0.15)",
            border: "1px solid rgba(5,122,85,0.4)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#6ee7b7",
            fontWeight: 700,
          }}
        >
          <span>✓</span> Sakte! Punë e mirë.
        </div>
      )}

      {isCorrect === false && !hasCompileError && !hasRuntimeError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(224,36,36,0.12)",
            border: "1px solid rgba(224,36,36,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#fca5a5",
            fontWeight: 700,
          }}
        >
          <span>✗</span> Jo sakte — kontrollo outputin.
        </div>
      )}

      {hasCompileError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(224,36,36,0.12)",
            border: "1px solid rgba(224,36,36,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#fca5a5",
            fontWeight: 700,
          }}
        >
          <span>⚠</span> Gabim kompilimi
        </div>
      )}

      {hasRuntimeError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#fde68a",
            fontWeight: 700,
          }}
        >
          <span>⚠</span> Gabim gjatë ekzekutimit
        </div>
      )}

      {/* AI feedback */}
      {(aiFeedback || aiFeedbackLoading) && (
        <div
          style={{
            background: "rgba(26,86,219,0.12)",
            border: "1px solid rgba(26,86,219,0.25)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#bfdbfe",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#93c5fd",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ✦ AI Tutor
          </div>
          {aiFeedbackLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(255,255,255,0.1)",
                  borderTopColor: "#93c5fd",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Duke analizuar kodin…
            </div>
          ) : (
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{aiFeedback}</p>
          )}
        </div>
      )}

      {/* Compile error output */}
      {hasCompileError && (
        <div>
          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 4px",
            }}
          >
            Compile output
          </p>
          <pre
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(224,36,36,0.2)",
              borderRadius: 6,
              padding: "10px 12px",
              color: "#fca5a5",
              fontSize: 12,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {result.compileOutput}
          </pre>
        </div>
      )}

      {/* Runtime error */}
      {hasRuntimeError && (
        <div>
          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 4px",
            }}
          >
            Error
          </p>
          <pre
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 6,
              padding: "10px 12px",
              color: "#fde68a",
              fontSize: 12,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {result.stderr}
          </pre>
        </div>
      )}

      {/* Output comparison */}
      {!hasCompileError && actualOutput.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 4px",
              }}
            >
              Outputi juaj
            </p>
            <pre
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${isCorrect ? "rgba(5,122,85,0.3)" : "rgba(224,36,36,0.2)"}`,
                borderRadius: 6,
                padding: "10px 12px",
                color: isCorrect ? "#6ee7b7" : "#fca5a5",
                fontSize: 12,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                margin: 0,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {actualOutput || "(bosh)"}
            </pre>
          </div>
          {matchType !== "runs" && (
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 4px",
                }}
              >
                {matchType === "contains" || matchType === "startsWith"
                  ? "Duhet të përmbajë"
                  : "Outputi i pritur"}
              </p>
              <pre
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 12,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {matchPattern ?? expectedOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
