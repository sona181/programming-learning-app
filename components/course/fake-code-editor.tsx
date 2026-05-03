"use client";

interface FakeCodeEditorProps {
  code: string;
  language?: string;
  maxHeight?: number;
}

export default function FakeCodeEditor({
  code,
  maxHeight = 280,
}: FakeCodeEditorProps) {
  const lines = code.split("\n");

  return (
    <div
      style={{
        background: "#1e1e2e",
        borderRadius: "var(--radius-card)",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        maxHeight,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: "#2a2a3e",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            marginLeft: 6,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Main.java
        </span>
      </div>

      {/* Code */}
      <div style={{ overflowY: "auto", maxHeight: maxHeight - 36 }}>
        <pre
          style={{
            margin: 0,
            padding: "16px 20px",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 1.65,
            color: "#e2e8f0",
            overflowX: "auto",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex" }}>
              <span
                style={{
                  color: "rgba(255,255,255,0.2)",
                  userSelect: "none",
                  width: 28,
                  textAlign: "right",
                  marginRight: 16,
                  flexShrink: 0,
                  fontSize: 12,
                }}
              >
                {i + 1}
              </span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
