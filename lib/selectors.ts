// Pure, memoisable selectors. Derived stats are computed here, never stored
// (architecture rule 4).

import {
  CATEGORIES,
  REGIONS,
  type Category,
  type Place,
  type Region,
} from "@/data/places";
import {
  DEFAULT_PLACE_STATE,
  type Status,
  type UserState,
} from "@/hooks/useUserState";
import type { Filters } from "@/context/FilterContext";

export function statusOf(userState: UserState, id: string): Status {
  return (userState[id] ?? DEFAULT_PLACE_STATE).status;
}

/** Apply the shared filters to the place list. Pure — safe to memoise. */
export function filterPlaces(
  allPlaces: Place[],
  userState: UserState,
  filters: Filters,
): Place[] {
  const q = filters.search.trim().toLowerCase();
  return allPlaces.filter((p) => {
    if (filters.category !== "all" && p.category !== filters.category) return false;
    if (filters.region !== "all" && p.region !== filters.region) return false;
    if (filters.status !== "all" && statusOf(userState, p.id) !== filters.status) {
      return false;
    }
    if (q) {
      const haystack = `${p.name} ${p.description} ${p.category} ${p.region}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export interface Stats {
  total: number;
  visited: number;
  want: number;
  none: number;
  percentage: number; // 0–100, rounded
  byCategory: Record<Category, { total: number; visited: number }>;
  byRegion: Record<Region, { total: number; visited: number }>;
}

/** Compute all derived stats over the full place list. Pure. */
export function computeStats(allPlaces: Place[], userState: UserState): Stats {
  const byCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c, { total: 0, visited: 0 }]),
  ) as Record<Category, { total: number; visited: number }>;
  const byRegion = Object.fromEntries(
    REGIONS.map((r) => [r, { total: 0, visited: 0 }]),
  ) as Record<Region, { total: number; visited: number }>;

  let visited = 0;
  let want = 0;
  let none = 0;

  for (const p of allPlaces) {
    const s = statusOf(userState, p.id);
    if (s === "visited") visited++;
    else if (s === "want") want++;
    else none++;

    byCategory[p.category].total++;
    byRegion[p.region].total++;
    if (s === "visited") {
      byCategory[p.category].visited++;
      byRegion[p.region].visited++;
    }
  }

  const total = allPlaces.length;
  const percentage = total === 0 ? 0 : Math.round((visited / total) * 100);

  return { total, visited, want, none, percentage, byCategory, byRegion };
}

/** Pick a random place whose status is not "visited". Returns null if none. */
export function suggestNextPlace(
  allPlaces: Place[],
  userState: UserState,
  rng: () => number = Math.random,
): Place | null {
  const candidates = allPlaces.filter((p) => statusOf(userState, p.id) !== "visited");
  if (candidates.length === 0) return null;
  return candidates[Math.floor(rng() * candidates.length)];
}
