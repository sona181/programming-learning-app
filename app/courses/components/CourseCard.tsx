"use client";

import React from "react";
import Link from "next/link";
import { Course } from "../types";

interface Theme {
  from: string;
  to: string;
  icon: string;
}

function getCourseTheme(course: Course): Theme {
  const text = `
    ${course.title}
    ${course.category}
    ${course.slug}
  `.toLowerCase();

  if (text.includes("java") || text.includes("spring")) {
    return { from: "#1a1a2e", to: "#0f0f1a", icon: "☕" };
  }


  if (text.includes("python") || text.includes("django") || text.includes("flask")) {
    return { from: "#10B981", to: "#059669", icon: "🐍" };
  }


  if (text.includes("c++") || text.includes(" c ") || text.includes("cpp") || text.includes("programim me c")) {
    return { from: "#64748B", to: "#1E293B", icon: "⚙️" };
  }

  if (
    text.includes("javascript") ||
    text.includes("react") ||
    text.includes("next") ||
    text.includes("web") ||
    text.includes("frontend") ||
    text.includes("html") ||
    text.includes("css")
  ) {
    return { from: "#10b981", to: "#064e3b", icon: "🌐" };
  }

  if (
    text.includes("sql") ||
    text.includes("database") ||
    text.includes("mysql") ||
    text.includes("postgres")
  ) {
    return { from: "#0891B2", to: "#0E7490", icon: "🗄️" };
  }

  if (text.includes("ai") || text.includes("machine learning") || text.includes("data")) {
    return { from: "#DB2777", to: "#BE185D", icon: "🧠" };
  }


  if (text.includes("security") || text.includes("cyber")) {
    return { from: "#DC2626", to: "#B91C1C", icon: "🔒" };
  }


  if (text.includes("matematik")) {
    return { from: "#3b82f6", to: "#1e3a8a", icon: "📐" };
  }


  if (text.includes("drejt") || text.includes("civil") || text.includes("juridik")) {
    return { from: "#f59e0b", to: "#78350f", icon: "⚖️" };
  }

  return { from: "#334155", to: "#1E293B", icon: "📘" };
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Fillestar",
  intermediate: "Mesatar",
  advanced: "Avancuar",
};

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-orange-100 text-orange-700",
  advanced: "bg-red-100 text-red-700",
};

const LANG_LABEL: Record<string, string> = {
  sq: "Shqip",
  en: "Anglisht",
  it: "Italisht",
};

export default function CourseCard({
  course,
  userId,
}: {
  course: Course;
  userId: string | null;
}) {
  const theme = getCourseTheme(course);

  const instructorLine =
    course.coAuthorCount > 0
      ? `Prof. ${course.instructor} + ${course.coAuthorCount} tjetër`
      : `Prof. ${course.instructor}`;

  const href = userId
    ? `/courses/${course.slug}?userId=${userId}`
    : `/courses/${course.slug}`;

  return (
    <Link href={href} className="block">
      <div
        className="
          bg-white
          rounded-[18px]
          border
          border-[#E5E7EB]
          overflow-hidden
          flex
          flex-col
          hover:shadow-md
          transition-all
          duration-200
          cursor-pointer
          h-[255px]
        "
      >

        <div
          className="relative h-[118px] flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
          }}
        >
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl opacity-90">{theme.icon}</span>
          )}

          {course.isPremium ? (
            <span className="absolute top-3 left-3 text-[10px] font-semibold px-3 py-[4px] rounded-full bg-white text-[#6D28D9]">
              Premium
            </span>
          ) : (
            <span className="absolute top-3 left-3 text-[10px] font-semibold px-3 py-[4px] rounded-full bg-white text-green-700">
              Falas
            </span>
          )}


          <span className="absolute top-3 right-3 text-[10px] font-medium bg-white/20 backdrop-blur-md text-white px-3 py-[4px] rounded-full">
            {LANG_LABEL[course.language] ?? course.language}
          </span>
        </div>

   
        <div className="px-4 py-3 flex flex-col flex-1">


          <h3 className="font-semibold text-[14px] leading-[1.3] text-[#111827] line-clamp-2">
            {course.title}
          </h3>

          <p className="text-[12px] text-[#9CA3AF] mt-1">
            {instructorLine} · {course.lessonCount} mësime
          </p>

          <div className="flex items-center justify-between mt-3">
            <span
              className={`text-[10px] px-3 py-[4px] rounded-full font-semibold ${
                LEVEL_COLOR[course.level] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>

            {course.rating != null && (
              <span className="text-[12px] text-[#F59E0B] font-semibold">
                ★ {course.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">

            <span
              className={`font-semibold text-[14px] ${
                course.isPremium ? "text-[#111827]" : "text-[#10B981]"
              }`}
            >
              {course.isPremium ? `€${course.price}/muaj` : "Falas"}
            </span>

            <span
              className={`
                h-[32px] px-4 rounded-[10px] flex items-center justify-center
                text-[12px] font-semibold transition-all
                ${
                  course.isEnrolled
                    ? "bg-[#E5E7EB] text-[#6B7280]"
                    : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                }
              `}
            >
              {course.isEnrolled ? "I regjistruar" : "Regjistrohu"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}