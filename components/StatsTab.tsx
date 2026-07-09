"use client";

import { useMemo, useState } from "react";
import { places as allPlaces, type Place } from "@/data/places";
import { useUserStateContext } from "@/context/UserStateContext";
import { computeStats, suggestNextPlace } from "@/lib/selectors";
import { CATEGORY_LABEL } from "@/lib/ui";
import type { Category, Region } from "@/data/places";

function Breakdown({
  title,
  rows,
  labelFor,
}: {
  title: string;
  rows: [string, { total: number; visited: number }][];
  labelFor: (key: string) => string;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-stone-900">{title}</h3>
      <ul className="space-y-2.5">
        {rows.map(([key, { total, visited }]) => {
          const pct = total === 0 ? 0 : Math.round((visited / total) * 100);
          return (
            <li key={key}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="font-medium text-stone-700">{labelFor(key)}</span>
                <span className="text-stone-400">
                  {visited}/{total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-visited transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function StatsTab({ onSuggest }: { onSuggest: (place: Place) => void }) {
  const { state } = useUserStateContext();
  const stats = useMemo(() => computeStats(allPlaces, state), [state]);
  const [message, setMessage] = useState<string | null>(null);

  const handleSuggest = () => {
    const next = suggestNextPlace(allPlaces, state);
    if (!next) {
      setMessage("You've explored everything - what a legend.");
      return;
    }
    setMessage(null);
    onSuggest(next);
  };

  const categoryRows = Object.entries(stats.byCategory) as [
    Category,
    { total: number; visited: number },
  ][];
  const regionRows = Object.entries(stats.byRegion) as [
    Region,
    { total: number; visited: number },
  ][];

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-4">
      <header className="mb-5">
        <h2 className="text-2xl font-semibold text-stone-900">Your journey</h2>
        <p className="mt-1 text-sm text-stone-500">
          You&apos;ve explored {stats.visited} of {stats.total} places
          {stats.want > 0 && <> - {stats.want} on your wishlist</>}.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Visited" value={stats.visited} />
        <Stat label="Want to go" value={stats.want} />
        <Stat label="Not yet" value={stats.none} />
        <Stat label="Complete" value={`${stats.percentage}%`} />
      </div>

      <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-900">
            Not sure where to wander next?
          </p>
          <button
            type="button"
            onClick={handleSuggest}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Suggest next place
          </button>
        </div>
        {message && <p className="mt-2 text-sm text-emerald-800">{message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Breakdown
          title="By category"
          rows={categoryRows}
          labelFor={(k) => CATEGORY_LABEL[k as Category]}
        />
        <Breakdown title="By region" rows={regionRows} labelFor={(k) => k} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-semibold text-stone-900">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-stone-400">
        {label}
      </p>
    </div>
  );
}
