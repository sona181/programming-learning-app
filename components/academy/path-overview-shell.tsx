"use client";

import { useState } from "react";
import Link from "next/link";
import { Course } from "@/lib/types";

interface PathOverviewShellProps {
  course: Course;
  activeUnitIndex?: number;
  activeLessonIndex?: number;
}

function StatusBadge({ status }: { status: "done" | "active" | "locked" }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    done: { bg: "#d1fae5", color: "#065f46", label: "✓ Kryer" },
    active: { bg: "#dbeafe", color: "#1e40af", label: "Aktual" },
    locked: { bg: "#f3f4f6", color: "#6b7280", label: "🔒 I bllokuar" },
  };
  const s = styles[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {s.label}
    </span>
  );
}

const TAGS = ["Informatikë", "Fillestar", "Shqip"];
const PROF_NAME = "Prof. Arben Krasniqi";
const PROF_TITLE = "Inxhinier Software · 12 vjet eksperiencë";
const PROF_BIO =
  "Specialist i Java dhe sistemeve enterprise. Ka trajnuar mbi 3 000 studentë dhe kontribuon në projekte open-source.";

export default function PathOverviewShell({
  course,
  activeUnitIndex = 0,
  activeLessonIndex = 0,
}: PathOverviewShellProps) {
  const [expandedUnit, setExpandedUnit] = useState<number>(activeUnitIndex);

  const totalLessons = course.units.reduce((s, u) => s + u.lessons.length, 0);
  const totalExercises = course.units.reduce(
    (s, u) => s + u.lessons.reduce((ls, l) => ls + l.exercises.length, 0),
    0
  );

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          background: "var(--bg-hero)",
          padding: "48px 40px 56px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40 }}>
          {/* Left 60% */}
          <div style={{ flex: "0 0 60%" }}>
            {/* Tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "white",
                margin: "0 0 12px",
                lineHeight: 1.25,
              }}
            >
              {course.title}
            </h1>

            <p
              style={{
                fontSize: 16,
                color: "var(--text-on-dark-muted)",
                margin: "0 0 24px",
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              {course.description}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
              {[
                { icon: "⭐", value: "4.9" },
                { icon: "👥", value: "1.2K studentë" },
                { icon: "📚", value: `${totalLessons} mësime` },
                { icon: "⏱", value: `${Math.ceil(totalExercises / 5)}h` },
              ].map(({ icon, value }) => (
                <span
                  key={value}
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.85)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {icon} {value}
                </span>
              ))}
            </div>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                AK
              </div>
              <div>
                <p
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                    margin: "0 0 1px",
                  }}
                >
                  {PROF_NAME}
                </p>
                <p style={{ color: "var(--text-on-dark-muted)", fontSize: 11, margin: 0 }}>
                  {PROF_TITLE}
                </p>
              </div>
            </div>
          </div>

          {/* Right 40% — pricing card */}
          <div style={{ flex: "0 0 40%" }}>
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-card)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                padding: "28px 24px",
                position: "sticky",
                top: 24,
              }}
            >
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "0 0 4px",
                }}
              >
                €25{" "}
                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-secondary)" }}>
                  / muaj
                </span>
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  margin: "0 0 20px",
                }}
              >
                ose blen sesion individual nga €18
              </p>

              <Link
                href={`/course/${course.id}/0/0/0`}
                style={{
                  display: "block",
                  width: "100%",
                  background: "var(--accent-primary)",
                  color: "white",
                  padding: "13px 0",
                  borderRadius: "var(--radius-btn)",
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: "center",
                  textDecoration: "none",
                  marginBottom: 10,
                  transition: "background 150ms",
                }}
              >
                Regjistrohu Tani →
              </Link>

              <Link
                href={`/course/${course.id}/0/0/0`}
                style={{
                  display: "block",
                  width: "100%",
                  background: "transparent",
                  color: "var(--accent-primary)",
                  padding: "11px 0",
                  borderRadius: "var(--radius-btn)",
                  fontWeight: 600,
                  fontSize: 14,
                  textAlign: "center",
                  textDecoration: "none",
                  border: "1.5px solid var(--accent-primary)",
                  marginBottom: 12,
                }}
              >
                Provo Preview Falas
              </Link>

              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  margin: "0 0 20px",
                }}
              >
                7 ditë provë falas · Anulo kudo
              </p>

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  `${totalLessons} mësime video`,
                  `${course.units.length} kapituj me kuize`,
                  "Ushtrime interaktive",
                  "Certifikatë e verifikuar",
                  "Akses i plotë gjithë jetën",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ color: "var(--accent-success)", fontWeight: 700 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course content accordion */}
      <section style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px" }}>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 20px",
          }}
        >
          Përmbajtja e Kursit
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {course.units.map((unit, ui) => {
            const isExpanded = expandedUnit === ui;
            const isActive = ui === activeUnitIndex;
            const isDone = ui < activeUnitIndex;

            return (
              <div
                key={unit.id}
                style={{
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                  overflow: "hidden",
                }}
              >
                {/* Chapter header */}
                <button
                  onClick={() => setExpandedUnit(isExpanded ? -1 : ui)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--text-primary)",
                        margin: "0 0 3px",
                      }}
                    >
                      Kapitulli {ui + 1} · {unit.title}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                      {unit.lessons.length} mësime
                    </p>
                  </div>
                  <StatusBadge
                    status={isDone ? "done" : isActive ? "active" : "locked"}
                  />
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms",
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* Lessons list */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg-card)",
                    }}
                  >
                    {unit.lessons.map((lesson, li) => {
                      const isCurrentLesson =
                        ui === activeUnitIndex && li === activeLessonIndex;
                      const isDoneLesson =
                        ui < activeUnitIndex ||
                        (ui === activeUnitIndex && li < activeLessonIndex);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/course/${course.id}/${ui}/${li}/0`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "11px 20px",
                            borderBottom: "1px solid var(--border)",
                            textDecoration: "none",
                            background: isCurrentLesson
                              ? "#eff6ff"
                              : "transparent",
                          }}
                        >
                          <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>
                            {isDoneLesson ? "✓" : isCurrentLesson ? "►" : "○"}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontSize: 13,
                              color: isCurrentLesson
                                ? "var(--accent-primary)"
                                : "var(--text-primary)",
                              fontWeight: isCurrentLesson ? 600 : 400,
                            }}
                          >
                            {lesson.title}
                          </span>
                          {isCurrentLesson && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--accent-primary)",
                                fontWeight: 600,
                              }}
                            >
                              ► Aktual
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {lesson.exercises.length} ushtrime
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Professor section */}
        <div style={{ marginTop: 48 }}>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 20px",
            }}
          >
            Profesori
          </h2>
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              AK
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--text-primary)",
                  margin: "0 0 3px",
                }}
              >
                {PROF_NAME}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px" }}>
                {PROF_TITLE}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.6 }}>
                {PROF_BIO}
              </p>
              <button
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--accent-primary)",
                  color: "var(--accent-primary)",
                  padding: "8px 18px",
                  borderRadius: "var(--radius-btn)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Rezervo Sesion 1-on-1
              </button>
            </div>
          </div>
        </div>

        {/* Ratings section */}
        <div style={{ marginTop: 48 }}>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 20px",
            }}
          >
            Vlerësimet e Studentëve
          </h2>
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              gap: 32,
            }}
          >
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "0 0 4px",
                  lineHeight: 1,
                }}
              >
                4.9
              </p>
              <p style={{ fontSize: 18, margin: "0 0 4px" }}>⭐⭐⭐⭐⭐</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                (128 vlerësime)
              </p>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { stars: 5, pct: 85 },
                { stars: 4, pct: 12 },
                { stars: 3, pct: 3 },
                { stars: 2, pct: 0 },
                { stars: 1, pct: 0 },
              ].map(({ stars, pct }) => (
                <div
                  key={stars}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      width: 28,
                      flexShrink: 0,
                    }}
                  >
                    {stars}★
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: "var(--border)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "var(--accent-primary)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      width: 30,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
