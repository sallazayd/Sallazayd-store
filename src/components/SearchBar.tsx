"use client";

import { Search } from "lucide-react";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (term: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        size={18}
        strokeWidth={1.75}
        className="absolute top-1/2 -translate-y-1/2 right-4 text-muted pointer-events-none"
      />
      <input
        type="text"
        placeholder="ابحث عن منتج..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full h-11 rounded-full border border-line bg-surface pr-11 pl-4 text-sm focus-ring focus:border-ink focus:bg-paper transition-colors"
      />
    </div>
  );
}
