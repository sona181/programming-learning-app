"use client";

import { useEffect, useState } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      const dismissTimer = setTimeout(onDismiss, 350);
      return () => clearTimeout(dismissTimer);
    }, 4000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card-hover)",
        padding: "16px 20px",
        maxWidth: 320,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        transform: visible ? "translateX(0)" : "translateX(80px)",
        opacity: visible ? 1 : 0,
        transition: "transform 350ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease",
        animation: visible ? "slideInRight 350ms cubic-bezier(0.22,1,0.36,1)" : undefined,
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>🏆</span>
      <div>
        <p
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: "var(--badge-color)",
            margin: "0 0 3px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Arritje e re!
        </p>
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            margin: "0 0 3px",
          }}
        >
          {achievement.title}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {achievement.description}
        </p>
      </div>
    </div>
  );
}
