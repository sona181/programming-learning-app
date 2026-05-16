"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/courses/components/Sidebar";

interface EnrolledCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced";
  language: "sq" | "en" | "it";
  isPremium: boolean;
  price: number | null;
  thumbnailUrl: string | null;
  category: string;
  instructor: string;
  authorId: string;
  coAuthorCount: number;
  lessonCount: number;
  enrollmentCount: number;
  rating: number | null;
  enrolledAt: string;
  progressPercent: number;
  completedAt: string | null;
}

function getCourseTheme(title: string, category: string, slug: string) {
  const text = `${title} ${category} ${slug}`.toLowerCase();
  if (text.includes("java") || text.includes("spring"))
    return { from: "#1a1a2e", to: "#0f0f1a", icon: "☕" };
  if (text.includes("python") || text.includes("django") || text.includes("flask"))
    return { from: "#10B981", to: "#059669", icon: "🐍" };
  if (text.includes("c++") || text.includes(" c ") || text.includes("cpp") || text.includes("programim me c"))
    return { from: "#64748B", to: "#1E293B", icon: "⚙️" };
  if (text.includes("javascript") || text.includes("react") || text.includes("next") || text.includes("web") || text.includes("frontend") || text.includes("html") || text.includes("css"))
    return { from: "#10b981", to: "#064e3b", icon: "🌐" };
  if (text.includes("sql") || text.includes("database") || text.includes("mysql") || text.includes("postgres"))
    return { from: "#0891B2", to: "#0E7490", icon: "🗄️" };
  if (text.includes("ai") || text.includes("machine learning") || text.includes("data"))
    return { from: "#DB2777", to: "#BE185D", icon: "🧠" };
  if (text.includes("security") || text.includes("cyber"))
    return { from: "#DC2626", to: "#B91C1C", icon: "🔒" };
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

function EnrolledCourseCard({ course }: { course: EnrolledCourse }) {
  const router = useRouter();
  const theme = getCourseTheme(course.title, course.category, course.slug);

  const progress = Math.min(100, Math.round(course.progressPercent));
  const isCompleted = progress >= 100 || !!course.completedAt;
  const actionLabel = isCompleted ? "Rishiko" : progress > 0 ? "Vazhdo →" : "Fillo →";

  return (
    <Link href={`/course/${course.slug}`} className="block">
      <div
        className="bg-white rounded-[18px] border border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer"
        style={{ height: 290 }}
      >
        {/* Thumbnail */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{ height: 118, background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
        >
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
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

          {isCompleted && (
            <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-3 py-[4px] rounded-full bg-green-500 text-white">
              ✓ Përfunduar
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex flex-col flex-1">
          <h3 className="font-semibold text-[14px] leading-[1.3] text-[#111827] line-clamp-2">
            {course.title}
          </h3>

          <p className="text-[12px] text-[#9CA3AF] mt-1">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/instructors/${course.authorId}`); }}
              style={{ color: "#6366F1", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit", fontSize: 12 }}
            >
              {course.coAuthorCount > 0
                ? `Prof. ${course.instructor} + ${course.coAuthorCount} tjetër`
                : `Prof. ${course.instructor}`}
            </button>
            {" · "}{course.lessonCount} mësime
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className={`text-[10px] px-3 py-[4px] rounded-full font-semibold ${LEVEL_COLOR[course.level] ?? "bg-gray-100 text-gray-600"}`}>
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>

            {course.rating != null && (
              <span className="text-[12px] text-[#F59E0B] font-semibold">
                ★ {course.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[#6B7280]">Progresi</span>
              <span className="text-[11px] font-semibold text-[#374151]">{progress}%</span>
            </div>
            <div className="w-full rounded-full bg-[#E5E7EB]" style={{ height: 5 }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: isCompleted ? "#10B981" : "#2563EB" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className={`font-semibold text-[14px] ${course.isPremium ? "text-[#111827]" : "text-[#10B981]"}`}>
              {course.isPremium ? `€${course.price}` : "Falas"}
            </span>

            <span className="h-[32px] px-4 rounded-[10px] flex items-center justify-center text-[12px] font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all">
              {actionLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MyCoursesPage({ enrolledCourses }: { enrolledCourses: EnrolledCourse[] }) {
  return (
    <div className="flex min-h-screen bg-[#F3F6FB]">
      <Sidebar userId={null} userName={null} />

      <div className="flex flex-col flex-1">
        <header className="h-[76px] bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-[#111827]">Kurset e Mia</h1>
          <Link
            href="/courses"
            className="h-[36px] px-5 rounded-[12px] bg-[#2563EB] text-white text-[13px] font-semibold flex items-center hover:bg-[#1D4ED8] transition-all"
          >
            + Gjej kurse të reja
          </Link>
        </header>

        <main className="flex-1 p-6">
          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center gap-4">
              <div className="text-5xl">📚</div>
              <p className="text-[#6B7280] text-[14px] max-w-[300px]">
                Nuk jeni regjistruar në asnjë kurs. Shfletoni kurset dhe filloni të mësoni!
              </p>
              <Link
                href="/courses"
                className="h-[38px] px-6 rounded-[12px] bg-[#2563EB] text-white text-[13px] font-semibold flex items-center hover:bg-[#1D4ED8] transition-all"
              >
                Shfleto Kurset
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-[#6B7280] mb-5">
                {enrolledCourses.length} kurs{enrolledCourses.length !== 1 ? "e" : ""} i regjistruar
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {enrolledCourses.map((course) => (
                  <EnrolledCourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
