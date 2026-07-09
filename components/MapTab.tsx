"use client";

import { useMemo } from "react";
import { places as allPlaces, type Place } from "@/data/places";
import { useFilters } from "@/context/FilterContext";
import { useUserStateContext } from "@/context/UserStateContext";
import { filterPlaces, computeStats, statusOf } from "@/lib/selectors";
import type { Status } from "@/hooks/useUserState";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/ui";
import { ExplorationMap } from "./ExplorationMap";
import { SearchBar } from "./SearchBar";
import { FilterChips } from "./FilterChips";

const LEGEND_STATUSES: Status[] = ["visited", "want", "none"];

function MapLegend() {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-xs text-stone-600 shadow-[0_12px_40px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
      <p className="mb-2 font-medium text-stone-900">Pins</p>
      <div className="flex flex-col gap-1.5">
        {LEGEND_STATUSES.map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span
              className="relative h-4 w-4 rotate-45 rounded-full rounded-br-sm shadow-sm"
              style={{ backgroundColor: STATUS_COLOR[status] }}
              aria-hidden
            >
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
            </span>
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MapTab({
  focus,
  selected,
  onSelect,
}: {
  focus: Place | null;
  selected: Place | null;
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
        selectedId={selected?.id ?? null}
      />

      {/* Floating controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3">
        <div className="pointer-events-auto mx-auto max-w-2xl space-y-2 rounded-3xl border border-white/70 bg-white/70 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
          <SearchBar />
          <FilterChips />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-3 z-[500] hidden sm:block">
        <MapLegend />
      </div>

      {/* Progress pill */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2">
        <div className="pointer-events-auto whitespace-nowrap rounded-full bg-stone-950/85 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          {visible.length} shown - explored {stats.visited} / {stats.total}
        </div>
      </div>
    </div>
  );
}
