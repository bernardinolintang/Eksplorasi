"use client";

import { useMemo } from "react";
import { places as allPlaces, type Place } from "@/data/places";
import { useFilters } from "@/context/FilterContext";
import { useUserStateContext } from "@/context/UserStateContext";
import { filterPlaces, computeStats, statusOf } from "@/lib/selectors";
import { ExplorationMap } from "./ExplorationMap";
import { SearchBar } from "./SearchBar";
import { FilterChips } from "./FilterChips";

export function MapTab({
  focus,
  onSelect,
}: {
  focus: Place | null;
  onSelect: (place: Place) => void;
}) {
  const { filters } = useFilters();
  const { state } = useUserStateContext();

  const visible = useMemo(
    () => filterPlaces(allPlaces, state, filters),
    [state, filters],
  );
  const stats = useMemo(() => computeStats(allPlaces, state), [state]);

  return (
    <div className="relative h-full w-full">
      <ExplorationMap
        places={visible}
        statusFor={(id) => statusOf(state, id)}
        onSelect={onSelect}
        focus={focus}
      />

      {/* Floating controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2 p-3">
        <div className="pointer-events-auto mx-auto max-w-2xl">
          <SearchBar />
        </div>
        <div className="pointer-events-auto mx-auto max-w-2xl">
          <FilterChips />
        </div>
      </div>

      {/* Progress pill */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2">
        <div className="pointer-events-auto rounded-full bg-stone-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Explored {stats.visited} / {stats.total}
        </div>
      </div>
    </div>
  );
}
