"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, Circle, Lock, ChevronDown, ChevronRight, LayoutDashboard, BookOpen, Compass, Play } from "lucide-react";

interface LessonItem {
  id: string;
  title: string;
  durationSeconds: number | null;
  isCompleted: boolean;
  isFreePreview: boolean;
}

interface ChapterItem {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonItem[];
}

interface Props {
  readonly courseSlug: string;
  readonly courseTitle: string;
  readonly chapters: ChapterItem[];
  readonly currentLessonId: string;
  readonly totalLessons: number;
  readonly completedLessons: number;
  readonly progressPercent: number;
  readonly userName: string;
  readonly dashboardHref: string;
  readonly isEnrolled: boolean;
}

function fmtDuration(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}min`;
}

function pad2(n: number) { return String(n + 1).padStart(2, "0"); }

export default function LessonSidebar({
  courseSlug, courseTitle, chapters, currentLessonId,
  totalLessons, completedLessons, progressPercent, userName, dashboardHref, isEnrolled,
}: Props) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const ch of chapters) {
      if (ch.lessons.some((l) => l.id === currentLessonId)) set.add(ch.id);
    }
    return set;
  });

  function toggleChapter(id: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const initials = userName.slice(0, 2).toUpperCase();
  const pct = Math.round(progressPercent);

  return (
    <aside style={{
      width: 300,
      background: "#080D1A",
      height: "100vh",
      position: "fixed", left: 0, top: 0,
      display: "flex", flexDirection: "column",
      zIndex: 40,
      borderRight: "1px solid rgba(255,255,255,0.05)",
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>U</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>UniLearn</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Learning Platform
            </div>
          </div>
        </div>

        {/* User pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12, padding: "8px 12px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userName}
          </span>
        </div>
      </div>

      {/* ── Nav links ── */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        {[
          { href: dashboardHref, icon: <LayoutDashboard size={14} />, label: "Dashboard" },
          { href: "/courses", icon: <Compass size={14} />, label: "Shfleto Kurset" },
          { href: "/my-courses", icon: <BookOpen size={14} />, label: "Kurset e mia" },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 10,
            color: "rgba(255,255,255,0.4)", textDecoration: "none",
            fontSize: 12, fontWeight: 500,
          }}>
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {/* ── Course + progress ── */}
      <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <Link href={`/course/${courseSlug}`} style={{
          fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)",
          lineHeight: 1.35, display: "block", marginBottom: 10,
          textDecoration: "none",
        }}>
          {courseTitle}
        </Link>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: pct === 100
                ? "linear-gradient(90deg, #10B981, #34D399)"
                : "linear-gradient(90deg, #6366F1, #8B5CF6)",
              borderRadius: 3, transition: "width 0.5s ease",
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
            {pct}%
          </span>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", margin: 0 }}>
          {completedLessons} / {totalLessons} mësime
        </p>
      </div>

      {/* ── Chapter + lesson list ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {chapters.map((ch, ci) => {
          const isOpen = openChapters.has(ch.id);
          const chDone = ch.lessons.filter((l) => l.isCompleted).length;
          const allDone = chDone === ch.lessons.length && ch.lessons.length > 0;
          const hasCurrent = ch.lessons.some((l) => l.id === currentLessonId);

          let chBadgeBg: string;
          if (allDone) chBadgeBg = "rgba(16,185,129,0.15)";
          else if (hasCurrent) chBadgeBg = "rgba(99,102,241,0.2)";
          else chBadgeBg = "rgba(255,255,255,0.06)";

          let chBadgeColor: string;
          if (allDone) chBadgeColor = "#34D399";
          else if (hasCurrent) chBadgeColor = "#818CF8";
          else chBadgeColor = "rgba(255,255,255,0.3)";

          let chTitleColor: string;
          if (allDone) chTitleColor = "#34D399";
          else if (hasCurrent) chTitleColor = "#C7D2FE";
          else chTitleColor = "rgba(255,255,255,0.45)";

          return (
            <div key={ch.id}>
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(ch.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  padding: "10px 22px", gap: 10,
                  background: hasCurrent ? "rgba(99,102,241,0.08)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  borderLeft: hasCurrent ? "3px solid #6366F1" : "3px solid transparent",
                }}
              >
                {/* Chapter number badge */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: chBadgeBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: chBadgeColor,
                }}>
                  {pad2(ci)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: chTitleColor, fontSize: 12, fontWeight: hasCurrent ? 700 : 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                    {ch.title}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: "2px 0 0", fontWeight: 500 }}>
                    {chDone}/{ch.lessons.length} mësime
                  </p>
                </div>

                {isOpen
                  ? <ChevronDown size={12} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                  : <ChevronRight size={12} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                }
              </button>

              {/* Lessons */}
              {isOpen && (
                <div style={{ background: "rgba(0,0,0,0.15)", paddingBottom: 4 }}>
                  {ch.lessons.map((lesson, li) => {
                    const isCurrent = lesson.id === currentLessonId;

                    let statusIcon: React.ReactNode;
                    if (lesson.isCompleted) {
                      statusIcon = <CheckCircle size={14} color="#10B981" />;
                    } else if (isCurrent) {
                      statusIcon = <Play size={12} color="#818CF8" fill="#818CF8" />;
                    } else if (isEnrolled) {
                      statusIcon = <Circle size={13} color="rgba(255,255,255,0.18)" />;
                    } else {
                      statusIcon = <Lock size={11} color="rgba(255,255,255,0.15)" />;
                    }

                    let lessonTitleColor: string;
                    if (isCurrent) lessonTitleColor = "#E0E7FF";
                    else if (lesson.isCompleted) lessonTitleColor = "rgba(255,255,255,0.45)";
                    else lessonTitleColor = "rgba(255,255,255,0.3)";

                    return (
                      <Link
                        key={lesson.id}
                        href={`/course/${courseSlug}/learn/${lesson.id}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 22px 8px 36px",
                          background: isCurrent ? "rgba(99,102,241,0.12)" : "transparent",
                          borderLeft: isCurrent ? "3px solid #6366F1" : "3px solid transparent",
                          textDecoration: "none",
                          marginLeft: 0,
                        }}
                      >
                        {/* Status icon */}
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 18 }}>
                          {statusIcon}
                        </div>

                        {/* Lesson number + title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>
                            {pad2(ci)}.{String(li + 1).padStart(2, "0")}
                          </span>
                          <p style={{
                            margin: 0, fontSize: 12, lineHeight: 1.35,
                            color: lessonTitleColor,
                            fontWeight: isCurrent ? 600 : 400,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {lesson.title}
                          </p>
                        </div>

                        {lesson.durationSeconds ? (
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", flexShrink: 0, fontWeight: 500 }}>
                            {fmtDuration(lesson.durationSeconds)}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
