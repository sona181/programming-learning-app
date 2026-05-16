"use client";

import Link from "next/link";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Fillestar",
  intermediate: "Mesëm",
  advanced: "Avancuar",
};

const levelColor: Record<string, string> = {
  beginner: "#15803D",
  intermediate: "#92400E",
  advanced: "#991B1B",
};

interface MiniCourseCardProps {
  readonly slug: string;
  readonly title: string;
  readonly thumbnailUrl: string | null;
  readonly isPremium: boolean;
  readonly price: number | null;
  readonly enrollmentCount: number;
  readonly level: string;
}

export default function MiniCourseCard({
  slug,
  title,
  thumbnailUrl,
  isPremium,
  price,
  enrollmentCount,
  level,
}: MiniCourseCardProps) {
  return (
    <Link href={`/course/${slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          transition: "box-shadow 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 6px 24px rgba(0,0,0,0.10)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <div
          style={{
            height: 90,
            background: thumbnailUrl
              ? `url(${thumbnailUrl}) center/cover`
              : "linear-gradient(135deg, #1E293B, #334155)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!thumbnailUrl && <span style={{ fontSize: 24 }}>📘</span>}
        </div>
        <div style={{ padding: "10px 12px" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 6px",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: levelColor[level] ?? "#374151",
              }}
            >
              {LEVEL_LABEL[level] ?? level}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isPremium ? "#111827" : "#059669",
              }}
            >
              {isPremium ? `€${(price ?? 0).toFixed(0)}` : "Falas"}
            </span>
          </div>
          {enrollmentCount > 0 && (
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>
              {enrollmentCount.toLocaleString()} studentë
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
