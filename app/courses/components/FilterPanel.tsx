"use client";

import React from "react";
import { Category } from "../types";

interface FilterPanelProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedLevels: string[];
  onLevelToggle: (level: string) => void;
  showFree: boolean;
  onShowFreeToggle: () => void;
  showPremium: boolean;
  onShowPremiumToggle: () => void;
  selectedLanguages: string[];
  onLanguageToggle: (lang: string) => void;
}

const CAT_ICON: Record<string, string> = {
  Matematikë: "📐",
  Informatikë: "💻",
  Drejtësi: "⚖️",
  Shkenca: "🔬",
  Letërsi: "📖",
  Ekonomi: "💰",
};

const LEVELS = [
  { value: "beginner", label: "Fillestar" },
  { value: "intermediate", label: "Mesatar" },
  { value: "advanced", label: "I Avancuar" },
];

const LANGUAGES = [
  { value: "sq", label: "Shqip" },
  { value: "en", label: "Anglisht" },
  { value: "it", label: "Italisht" },
];

export default function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedLevels,
  onLevelToggle,
  showFree,
  onShowFreeToggle,
  showPremium,
  onShowPremiumToggle,
  selectedLanguages,
  onLanguageToggle,
}: FilterPanelProps) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-4 w-52"> 

  
      <div>
        <h3 className="text-xs font-bold text-black mb-2">
          Kategoritë
        </h3>

        <button
          onClick={() => onCategoryChange("Të Gjitha")}
          className={`
            mb-2 px-2 py-1 rounded-full text-xs font-medium
            ${
              selectedCategory === "Të Gjitha"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          Të Gjitha
        </button>

        <div className="space-y-0.5">
          {categories.map((cat) => {
            const active = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => onCategoryChange(cat.name)}
                className={`
                  w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{CAT_ICON[cat.name] ?? "📁"}</span>
                  <span>{cat.name}</span>
                </span>

                <span
                  className={`
                    text-[10px] px-1.5 py-[1px] rounded-full
                    ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

   
      <div>
        <h3 className="text-xs font-bold text-black mb-2">
          Niveli
        </h3>

        <div className="space-y-1">
          {[
            { value: "beginner", label: "Fillestar" },
            { value: "intermediate", label: "Mesatar" },
            { value: "advanced", label: "I Avancuar" },
          ].map((l) => (
            <label key={l.value} className="flex justify-between items-center">
              <span className="text-xs text-gray-700">{l.label}</span>
              <input
                type="checkbox"
                checked={selectedLevels.includes(l.value)}
                onChange={() => onLevelToggle(l.value)}
                className="accent-blue-600 scale-90"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-black mb-2">
          Çmimi
        </h3>

        <label className="flex justify-between items-center">
          <span className="text-xs text-gray-700">Falas</span>
          <input
            type="checkbox"
            checked={showFree}
            onChange={onShowFreeToggle}
            className="accent-blue-600 scale-90"
          />
        </label>

        <label className="flex justify-between items-center">
          <span className="text-xs text-gray-700">Premium</span>
          <input
            type="checkbox"
            checked={showPremium}
            onChange={onShowPremiumToggle}
            className="accent-blue-600 scale-90"
          />
        </label>
      </div>
      <div>
        <h3 className="text-xs font-bold text-black mb-2">
          Gjuha
        </h3>

        <div className="space-y-1">
          {[
            { value: "sq", label: "Shqip" },
            { value: "en", label: "Anglisht" },
            { value: "it", label: "Italisht" },
          ].map((l) => (
            <label key={l.value} className="flex justify-between items-center">
              <span className="text-xs text-gray-700">{l.label}</span>
              <input
                type="checkbox"
                checked={selectedLanguages.includes(l.value)}
                onChange={() => onLanguageToggle(l.value)}
                className="accent-blue-600 scale-90"
              />
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}