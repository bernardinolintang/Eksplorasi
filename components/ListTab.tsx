"use client";

import { useMemo } from "react";
import { CATEGORIES, REGIONS, places as allPlaces, type Place } from "@/data/places";
import { useFilters } from "@/context/FilterContext";
import { useUserStateContext } from "@/context/UserStateContext";
import { filterPlaces, statusOf } from "@/lib/selectors";
import { CATEGORY_LABEL, STATUS_COLOR, STATUS_LABEL, cx } from "@/lib/ui";
import type { Status } from "@/hooks/useUserState";
import { SearchBar } from "./SearchBar";
import { StatusControl } from "./StatusControl";

const STATUS_OPTIONS: Array<Status | "all"> = ["all", "visited", "want", "none"];

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  render: (v: T) => string;
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-stone-500">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm text-stone-700 shadow-sm outline-none focus:border-emerald-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {render(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ListTab({ onSelect }: { onSelect: (place: Place) => void }) {
  const { filters, setCategory, setRegion, setStatus } = useFilters();
  const { state } = useUserStateContext();

  const visible = useMemo(
    () => filterPlaces(allPlaces, state, filters),
    [state, filters],
  );

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-4">
      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-stone-50/95 px-4 pb-3 pt-1 backdrop-blur">
        <SearchBar placeholder="Search your list..." />
        <div className="flex flex-wrap gap-2">
          <Select
            label="Status"
            value={filters.status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            render={(o) => (o === "all" ? "All statuses" : STATUS_LABEL[o as Status])}
          />
          <Select
            label="Category"
            value={filters.category}
            onChange={setCategory}
            options={["all", ...CATEGORIES] as const}
            render={(o) => (o === "all" ? "All categories" : CATEGORY_LABEL[o as (typeof CATEGORIES)[number]])}
          />
          <Select
            label="Region"
            value={filters.region}
            onChange={setRegion}
            options={["all", ...REGIONS] as const}
            render={(o) => (o === "all" ? "All regions" : (o as string))}
          />
        </div>
      </div>

      <p className="mb-3 mt-1 text-sm text-stone-500">
        {visible.length} {visible.length === 1 ? "place" : "places"}
      </p>

      {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
          No places match these filters. Try loosening them.
        </p>
      ) : (
        <ul className="space-y-3 pb-8">
          {visible.map((p) => {
            const s = statusOf(state, p.id);
            return (
              <li
                key={p.id}
                className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    className="min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: STATUS_COLOR[s] }}
                        aria-hidden
                      />
                      <h3 className="font-semibold text-stone-900">{p.name}</h3>
                    </div>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-stone-500">
                      {CATEGORY_LABEL[p.category]} - {p.region}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                      {p.description}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition hover:bg-stone-50"
                  >
                    View map
                  </button>
                </div>
                <div className={cx("mt-3")}>
                  <StatusControl placeId={p.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
