"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course } from "../types";

interface Theme {
  from: string;
  to: string;
  icon: string;
}

function getCourseTheme(course: Course): Theme {
  const text = `${course.title} ${course.category} ${course.slug}`.toLowerCase();

  if (text.includes("java") || text.includes("spring"))
    return { from: "#1a1a2e", to: "#0f0f1a", icon: "☕" };
  if (text.includes("python") || text.includes("django") || text.includes("flask"))
    return { from: "#065F46", to: "#047857", icon: "🐍" };
  if (text.includes("c++") || text.includes("cpp") || text.includes("programim me c"))
    return { from: "#1E293B", to: "#334155", icon: "⚙️" };
  if (text.includes("javascript") || text.includes("react") || text.includes("next") || text.includes("web") || text.includes("frontend") || text.includes("html") || text.includes("css"))
    return { from: "#064E3B", to: "#065F46", icon: "🌐" };
  if (text.includes("sql") || text.includes("database") || text.includes("mysql") || text.includes("postgres"))
    return { from: "#0C4A6E", to: "#075985", icon: "🗄️" };
  if (text.includes("ai") || text.includes("machine learning") || text.includes("data"))
    return { from: "#831843", to: "#9D174D", icon: "🧠" };
  if (text.includes("security") || text.includes("cyber"))
    return { from: "#7F1D1D", to: "#991B1B", icon: "🔒" };
  if (text.includes("matematik"))
    return { from: "#1E3A8A", to: "#1D4ED8", icon: "📐" };
  if (text.includes("drejt") || text.includes("civil") || text.includes("juridik"))
    return { from: "#78350F", to: "#92400E", icon: "⚖️" };

  return { from: "#1E293B", to: "#334155", icon: "📘" };
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Fillestar",
  intermediate: "Mesatar",
  advanced: "Avancuar",
};

const LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: "#DCFCE7", text: "#15803D" },
  intermediate: { bg: "#FEF3C7", text: "#92400E" },
  advanced:     { bg: "#FEE2E2", text: "#991B1B" },
};

const LANG_LABEL: Record<string, string> = {
  sq: "Shqip",
  en: "English",
  it: "Italiano",
};

export default function CourseCard({
  course,
  userId,
}: {
  readonly course: Course;
  readonly userId: string | null;
}) {
  const router = useRouter();
  const theme = getCourseTheme(course);
  const levelStyle = LEVEL_COLOR[course.level] ?? { bg: "#F3F4F6", text: "#374151" };

  const href = userId ? `/course/${course.slug}?userId=${userId}` : `/course/${course.slug}`;

  return (
    <Link href={href} className="block group">
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.18s, transform 0.18s",
        }}
        className="hover:shadow-lg group-hover:-translate-y-0.5"
      >
        {/* Thumbnail */}
        <div
          style={{
            height: 128,
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 38, lineHeight: 1 }}>{theme.icon}</span>
          )}

          {/* Free / Premium badge */}
          <span
            style={{
              position: "absolute", top: 10, left: 10,
              fontSize: 10, fontWeight: 700,
              padding: "3px 9px", borderRadius: 20,
              background: course.isPremium ? "#EDE9FE" : "#D1FAE5",
              color: course.isPremium ? "#6D28D9" : "#065F46",
            }}
          >
            {course.isPremium ? "Premium" : "Falas"}
          </span>

          {/* Language badge */}
          <span
            style={{
              position: "absolute", top: 10, right: 10,
              fontSize: 10, fontWeight: 500,
              padding: "3px 9px", borderRadius: 20,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(6px)",
              color: "#fff",
            }}
          >
            {LANG_LABEL[course.language] ?? course.language}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {/* Category */}
          <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {course.category}
          </span>

          {/* Title */}
          <h3
            style={{
              fontSize: 14, fontWeight: 700, color: "#111827",
              lineHeight: 1.35, margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </h3>

          {/* Instructor + lessons */}
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, marginTop: 2 }}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/instructors/${course.authorId}`); }}
              style={{ color: "#6366F1", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit", fontSize: 12 }}
            >
              {course.coAuthorCount > 0 ? `${course.instructor} +${course.coAuthorCount}` : course.instructor}
            </button>
            <span style={{ margin: "0 5px", opacity: 0.4 }}>·</span>
            {course.lessonCount} mësime
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "#F3F4F6", margin: "10px 0 8px" }} />

          {/* Level + enrollment count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                background: levelStyle.bg, color: levelStyle.text,
              }}
            >
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>

            {course.enrollmentCount > 0 && (
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                👤 {course.enrollmentCount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <span
              style={{
                fontSize: 15, fontWeight: 700,
                color: course.isPremium ? "#111827" : "#059669",
              }}
            >
              {course.isPremium
                ? `€${course.price ?? "—"}/muaj`
                : "Falas"}
            </span>

            <span
              style={{
                height: 32, padding: "0 16px",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600,
                background: course.isEnrolled ? "#F3F4F6" : "#2563EB",
                color: course.isEnrolled ? "#6B7280" : "#fff",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
            >
              {course.isEnrolled ? "✓ Regjistruar" : "Regjistrohu"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
