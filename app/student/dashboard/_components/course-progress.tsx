"use client";

import { BookMarked } from "lucide-react";
import { useRouter } from "next/navigation";

export type StudentCourse = {
  title: string;
  professor: string;
  chapter: string;
  progress: number;
  color: string;
  slug?: string;
};

export default function CourseProgress({ courses }: Readonly<{ courses: StudentCourse[] }>) {
  const router = useRouter();

  return (
    <section>
      <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 12px" }}>
        Continue Learning
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {courses.map((course) => (
          <div
            key={course.title}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "18px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "14px",
                background: `${course.color}15`,
                color: course.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookMarked size={26} />
            </div>

            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>{course.title}</h4>
              <p style={{ margin: "4px 0 10px", color: "#64748b", fontSize: "13px" }}>
                {course.professor} · {course.chapter}
              </p>

              <div
                aria-label={`${course.progress}% complete`}
                style={{
                  height: "8px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${course.progress}%`,
                    height: "100%",
                    background: course.color,
                  }}
                />
              </div>
            </div>

            <div style={{ fontWeight: 800, color: "#334155", minWidth: "44px" }}>
              {course.progress}%
            </div>

            <button
              onClick={() => router.push(course.slug ? `/course/${course.slug}` : "/courses")}
              style={{
                border: "none",
                background: "#eff6ff",
                color: "#2563eb",
                padding: "9px 14px",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
