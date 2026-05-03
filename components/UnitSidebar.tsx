"use client";

import Link from "next/link";
import { Course, CourseProgress } from "@/lib/types";

interface UnitSidebarProps {
  course: Course;
  activeUnitIndex: number;
  activeLessonIndex: number;
  activeExerciseIndex: number;
  progress: CourseProgress;
}

export default function UnitSidebar({
  course,
  activeUnitIndex,
  activeLessonIndex,
  activeExerciseIndex,
  progress,
}: UnitSidebarProps) {
  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "12px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      {course.units.map((unit, ui) => (
        <div key={unit.id} style={{ marginBottom: 8 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              padding: "4px 8px",
              marginBottom: 4,
              color: ui === activeUnitIndex ? "white" : "rgba(255,255,255,0.35)",
            }}
          >
            {unit.title}
          </p>

          {unit.lessons.map((lesson, li) => (
            <div key={lesson.id} style={{ marginLeft: 4, marginBottom: 4 }}>
              <p
                style={{
                  fontSize: 11,
                  padding: "2px 8px 4px",
                  color:
                    ui === activeUnitIndex && li === activeLessonIndex
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.35)",
                }}
              >
                {lesson.title}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                  padding: "0 8px 4px",
                }}
              >
                {lesson.exercises.map((ex, ei) => {
                  const isActive =
                    ui === activeUnitIndex &&
                    li === activeLessonIndex &&
                    ei === activeExerciseIndex;
                  const isDone = progress[ex.id]?.completed;

                  return (
                    <Link
                      key={ex.id}
                      href={`/course/${course.id}/${ui}/${li}/${ei}`}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "all 150ms",
                        background: isActive
                          ? "var(--accent-primary)"
                          : isDone
                          ? "rgba(5,122,85,0.25)"
                          : "rgba(255,255,255,0.07)",
                        color: isActive
                          ? "white"
                          : isDone
                          ? "#6ee7b7"
                          : "rgba(255,255,255,0.4)",
                        border: isActive
                          ? "2px solid rgba(26,86,219,0.6)"
                          : isDone
                          ? "1px solid rgba(5,122,85,0.35)"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {isDone && !isActive ? "✓" : ei + 1}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
