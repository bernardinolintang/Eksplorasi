"use client";

import { useState } from "react";
import type { Place } from "@/data/places";
import { MapTab } from "./MapTab";
import { ListTab } from "./ListTab";
import { StatsTab } from "./StatsTab";
import { PlaceDetail } from "./PlaceDetail";
import { cx } from "@/lib/ui";

type Tab = "map" | "list" | "stats";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "list", label: "List", icon: "📋" },
  { id: "stats", label: "Stats", icon: "📊" },
];

export function AppShell() {
  const [tab, setTab] = useState<Tab>("map");
  const [selected, setSelected] = useState<Place | null>(null);
  const [focus, setFocus] = useState<Place | null>(null);

  // From the list/stats tabs, jumping to a place focuses the map and opens it.
  const gotoOnMap = (place: Place) => {
    setFocus(place);
    setSelected(place);
    setTab("map");
  };

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-bold tracking-tight text-emerald-700">
            Eksplorasi
          </h1>
          <span className="hidden text-xs text-stone-400 sm:inline">
            Explore Singapore&apos;s outdoors
          </span>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        {/* Keep Map mounted always so its state/markers persist across tabs. */}
        <div className={cx("absolute inset-0", tab === "map" ? "block" : "hidden")}>
          <MapTab focus={focus} onSelect={setSelected} />
        </div>
        {tab === "list" && (
          <div className="absolute inset-0">
            <ListTab onSelect={gotoOnMap} />
          </div>
        )}
        {tab === "stats" && (
          <div className="absolute inset-0">
            <StatsTab onSuggest={gotoOnMap} />
          </div>
        )}
      </main>

      <nav className="grid grid-cols-3 border-t border-stone-200 bg-white">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
            className={cx(
              "flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
              tab === t.id
                ? "text-emerald-700"
                : "text-stone-400 hover:text-stone-600",
            )}
          >
            <span className="text-base" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {selected && (
        <PlaceDetail place={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
