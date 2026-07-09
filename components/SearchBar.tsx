"use client";

import { useFilters } from "@/context/FilterContext";

export function SearchBar({ placeholder = "Search places..." }: { placeholder?: string }) {
  const { filters, setSearch } = useFilters();
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-stone-400">
        <span className="absolute -bottom-1 -right-1 h-1.5 w-0.5 rotate-[-45deg] rounded-full bg-stone-400" />
      </span>
      <input
        type="search"
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        aria-label="Search places"
        className="w-full rounded-full border border-white/70 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-stone-900 shadow-sm outline-none backdrop-blur placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/10"
      />
    </div>
  );
}
