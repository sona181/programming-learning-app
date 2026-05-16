"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import FilterPanel from "./components/FilterPanel";
import CourseCard from "./components/CourseCard";
import { Course, Category } from "./types";

type SortOption = "popular" | "rating" | "price-asc" | "price-desc";

export default function CourseBrowsePage({
  courses = [],
  categories,
  userId,
  userName,
}: {
  courses: Course[];
  categories: Category[];
  userId: string | null;
  userName: string | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState("Të Gjitha");
  const [selectedLevels, setSelectedLevels] = useState(["beginner", "intermediate", "advanced"]);
  const [showFree, setShowFree] = useState(true);
  const [showPremium, setShowPremium] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState(["sq", "en", "it"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const filtered = useMemo(() => {
    let result = [...courses];

    if (selectedCategory !== "Të Gjitha") {
      result = result.filter((c) => c.category?.trim() === selectedCategory.trim());
    }

    result = result.filter((c) => selectedLevels.includes(c.level));
    result = result.filter((c) => selectedLanguages.includes(c.language));
    result = result.filter((c) => {
      if (!showFree && !c.isPremium) return false;
      if (!showPremium && c.isPremium) return false;
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.instructor?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
        case "price-asc": return (a.price ?? 0) - (b.price ?? 0);
        case "price-desc": return (b.price ?? 0) - (a.price ?? 0);
        default: return (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0);
      }
    });

    return result;
  }, [courses, selectedCategory, selectedLevels, showFree, showPremium, selectedLanguages, searchQuery, sortBy]);

  const greeting = userName
    ? `Mirë se vjen, ${userName.split(" ")[0]}!`
    : "Shfleto Kurset";

  return (
    <div className="flex min-h-screen bg-[#F3F6FB]">
      <Sidebar userId={userId} userName={userName} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[18px] font-semibold text-[#111827] leading-none">
              {greeting}
            </h1>
            {userName && (
              <p className="text-[12px] text-[#9CA3AF] mt-1">
                {filtered.length} kurse të disponueshme
              </p>
            )}
          </div>

          <input
            type="text"
            placeholder="Kërko kurse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[240px] h-[38px] px-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
          />
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Filter sidebar */}
          <aside className="w-[240px] bg-white border-r border-[#E5E7EB] px-5 py-6 shrink-0 overflow-y-auto">
            <FilterPanel
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedLevels={selectedLevels}
              onLevelToggle={(l: string) =>
                setSelectedLevels((prev) =>
                  prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
                )
              }
              showFree={showFree}
              onShowFreeToggle={() => setShowFree((v) => !v)}
              showPremium={showPremium}
              onShowPremiumToggle={() => setShowPremium((v) => !v)}
              selectedLanguages={selectedLanguages}
              onLanguageToggle={(l: string) =>
                setSelectedLanguages((prev) =>
                  prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
                )
              }
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] text-[#6B7280]">
                Duke shfaqur{" "}
                <span className="font-semibold text-[#111827]">
                  {filtered.length} kurse
                </span>
              </p>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-[38px] px-3 rounded-xl border border-[#E5E7EB] bg-white text-[13px] font-medium text-[#4B5563] focus:outline-none cursor-pointer"
              >
                <option value="popular">Më të Populluarit</option>
                <option value="rating">Vlerësimi</option>
                <option value="price-asc">Çmimi: ulët → lartë</option>
                <option value="price-desc">Çmimi: lartë → ulët</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[360px] gap-3 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-[15px] font-medium text-[#374151]">Nuk u gjetën kurse</p>
                <p className="text-[13px] text-[#9CA3AF]">Provo të ndryshosh filtrat ose fjalën e kërkimit</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} userId={userId} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
