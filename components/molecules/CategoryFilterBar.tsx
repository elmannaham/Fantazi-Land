"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
  countMap?: Record<string, number>;
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  onSelect,
  countMap,
}: CategoryFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const count = countMap?.[category];

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              isSelected
                ? "text-white"
                : "text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-slate-100/80 border border-slate-200/80"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-md shadow-purple-500/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {category === "Tous" && <Sparkles className="h-3.5 w-3.5 opacity-80" />}
              {category}
              {typeof count === "number" && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
