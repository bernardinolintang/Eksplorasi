"use client";

import { useFilters } from "@/context/FilterContext";

export function SearchBar({ placeholder = "Search places…" }: { placeholder?: string }) {
  const { filters, setSearch } = useFilters();
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
        ⌕
      </span>
      <input
        type="search"
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        aria-label="Search places"
        className="w-full rounded-full border border-stone-200 bg-white/95 py-2 pl-9 pr-4 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}
