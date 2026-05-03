"use client";

interface XpProgressBarProps {
  streak: number;
  totalXp: number;
}

interface LevelInfo {
  level: number;
  name: string;
  progress: number;
  xpInLevel: number;
  xpNeeded: number;
}

const LEVELS = [
  { threshold: 0, name: "Fillestar", next: 100 },
  { threshold: 100, name: "Nxënës", next: 250 },
  { threshold: 250, name: "Praktikant", next: 500 },
  { threshold: 500, name: "Avancuar", next: 1000 },
  { threshold: 1000, name: "Ekspert", next: Infinity },
];

function getLevelInfo(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const lvl = LEVELS[i];
    if (xp >= lvl.threshold) {
      const xpInLevel = xp - lvl.threshold;
      const xpNeeded = lvl.next === Infinity ? xpInLevel : lvl.next - lvl.threshold;
      const progress = lvl.next === Infinity ? 1 : xpInLevel / xpNeeded;
      return {
        level: i + 1,
        name: lvl.name,
        progress: Math.min(progress, 1),
        xpInLevel,
        xpNeeded,
      };
    }
  }
  return { level: 1, name: "Fillestar", progress: 0, xpInLevel: 0, xpNeeded: 100 };
}

export default function XpProgressBar({ streak, totalXp }: XpProgressBarProps) {
  const { level, name, progress, xpInLevel, xpNeeded } = getLevelInfo(totalXp);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <span
        style={{
          color: "var(--streak-color)",
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        🔥 {streak} ditë streak
      </span>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
            Level {level} · {name}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {xpInLevel}/{xpNeeded} XP
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "var(--border)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "var(--accent-primary)",
              borderRadius: 3,
              transition: "width 500ms ease-out",
            }}
          />
        </div>
      </div>

      <span
        style={{
          color: "var(--xp-color)",
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        ⭐ {totalXp} XP · Level {level}
      </span>
    </div>
  );
}
