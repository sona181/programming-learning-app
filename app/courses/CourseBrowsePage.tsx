"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import FilterPanel from "./components/FilterPanel";
import CourseCard from "./components/CourseCard";
import { Course, Category } from "./types";

type SortOption =
  | "popular"
  | "rating"
  | "price-asc"
  | "price-desc";

export default function CourseBrowsePage({
  courses = [],
  categories,
  userId,
}: {
  courses: Course[];
  categories: Category[];
  userId: string | null;
}) {
  const [selectedCategory, setSelectedCategory] =
    useState("Të Gjitha");

  const [selectedLevels, setSelectedLevels] =
    useState([
      "beginner",
      "intermediate",
      "advanced",
    ]);

  const [showFree, setShowFree] = useState(true);

  const [showPremium, setShowPremium] =
    useState(true);

  const [selectedLanguages, setSelectedLanguages] =
    useState(["sq", "en", "it"]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("popular");

  const filtered = useMemo(() => {
    let result = [...courses];

    if (selectedCategory !== "Të Gjitha") {
      result = result.filter(
        (c) =>
          c.category?.trim() ===
          selectedCategory.trim()
      );
    }

    result = result.filter((c) =>
      selectedLevels.includes(c.level)
    );

    result = result.filter((c) =>
      selectedLanguages.includes(c.language)
    );

    result = result.filter((c) => {
      if (!showFree && !c.isPremium) {
        return false;
      }

      if (!showPremium && c.isPremium) {
        return false;
      }

      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter(
        (c) =>
          c.title
            ?.toLowerCase()
            .includes(q) ||
          c.instructor
            ?.toLowerCase()
            .includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (
            (b.rating ?? 0) -
            (a.rating ?? 0)
          );

        case "price-asc":
          return (
            (a.price ?? 0) -
            (b.price ?? 0)
          );

        case "price-desc":
          return (
            (b.price ?? 0) -
            (a.price ?? 0)
          );

        default:
          return (
            (b.enrollmentCount ?? 0) -
            (a.enrollmentCount ?? 0)
          );
      }
    });

    return result;
  }, [
    courses,
    selectedCategory,
    selectedLevels,
    showFree,
    showPremium,
    selectedLanguages,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="flex min-h-screen bg-[#F3F6FB]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <header className="h-[76px] bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between">

          <h1 className="text-[20px] font-semibold text-[#111827]">
            Shfleto Kurset
          </h1>

          <input
            type="text"
            placeholder="Kërko kurse..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="
            w-[250px]
            h-[40px]
            px-4
            rounded-[12px]
            border
            border-[#E5E7EB]
            bg-white
            text-[13px]
            text-[#374151]
            placeholder:text-[#9CA3AF]
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500/10
            "
          />
        </header>

        <div className="flex flex-1">

          <aside className="w-[260px] bg-white border-r border-[#E5E7EB] px-5 py-6">

            <FilterPanel
              categories={categories}
              selectedCategory={
                selectedCategory
              }
              onCategoryChange={
                setSelectedCategory
              }
              selectedLevels={
                selectedLevels
              }
              onLevelToggle={(l: string) =>
                setSelectedLevels((prev) =>
                  prev.includes(l)
                    ? prev.filter(
                        (x) => x !== l
                      )
                    : [...prev, l]
                )
              }
              showFree={showFree}
              onShowFreeToggle={() =>
                setShowFree((v) => !v)
              }
              showPremium={showPremium}
              onShowPremiumToggle={() =>
                setShowPremium((v) => !v)
              }
              selectedLanguages={
                selectedLanguages
              }
              onLanguageToggle={(
                l: string
              ) =>
                setSelectedLanguages(
                  (prev) =>
                    prev.includes(l)
                      ? prev.filter(
                          (x) => x !== l
                        )
                      : [...prev, l]
                )
              }
            />
          </aside>
          <main className="flex-1 p-6">

            <div className="flex items-center justify-between mb-6">

              <p className="text-[14px] text-[#6B7280]">
                Duke shfaqur{" "}
                <span className="font-semibold text-[#111827]">
                  {filtered.length} kurse
                </span>
              </p>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as SortOption
                  )
                }
                className="
                h-[40px]
                px-4
                rounded-[12px]
                border
                border-[#E5E7EB]
                bg-white
                text-[13px]
                font-medium
                text-[#4B5563]
                focus:outline-none
                "
              >
                <option value="popular">
                  Më të Populluarit
                </option>

                <option value="rating">
                  Vlerësimi
                </option>

                <option value="price-asc">
                  Çmimi: ulët-lartë
                </option>

                <option value="price-desc">
                  Çmimi: lartë-ulët
                </option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-[#9CA3AF]">
                Nuk u gjetën kurse
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filtered.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    userId={userId}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}