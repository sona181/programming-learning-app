"use client";

import React from "react";

interface PathLessonShellProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function PathLessonShell({ children, maxWidth = 640 }: PathLessonShellProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 24px",
        background: "var(--bg-card)",
      }}
    >
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
