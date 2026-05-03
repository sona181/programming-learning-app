"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent-primary)",
            borderRadius: 3,
            transition: "width 500ms ease-out",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          flexShrink: 0,
          minWidth: 40,
          textAlign: "right",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}
