"use client";

// Shared filter state (rule 5): search text, category, region, status.
// Both Map and List tabs read/write the same filters so they stay in sync.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Category, Region } from "@/data/places";
import type { Status } from "@/hooks/useUserState";

export interface Filters {
  search: string;
  category: Category | "all";
  region: Region | "all";
  status: Status | "all";
}

export interface FilterContextValue {
  filters: Filters;
  setSearch: (v: string) => void;
  setCategory: (v: Category | "all") => void;
  setRegion: (v: Region | "all") => void;
  setStatus: (v: Status | "all") => void;
  reset: () => void;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "all",
  region: "all",
  status: "all",
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setSearch: (search) => setFilters((f) => ({ ...f, search })),
      setCategory: (category) => setFilters((f) => ({ ...f, category })),
      setRegion: (region) => setFilters((f) => ({ ...f, region })),
      setStatus: (status) => setFilters((f) => ({ ...f, status })),
      reset: () => setFilters(DEFAULT_FILTERS),
    }),
    [filters],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return ctx;
}
