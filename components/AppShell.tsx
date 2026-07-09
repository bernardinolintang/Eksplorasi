"use client";

import { useState } from "react";
import type { Place } from "@/data/places";
import { MapTab } from "./MapTab";
import { ListTab } from "./ListTab";
import { StatsTab } from "./StatsTab";
import { PlaceDetail } from "./PlaceDetail";
import { cx } from "@/lib/ui";

type Tab = "map" | "list" | "stats";

const TABS: { id: Tab; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "list", label: "List" },
  { id: "stats", label: "Stats" },
];

function TabIcon({ tab }: { tab: Tab }) {
  if (tab === "map") {
    return (
      <span className="relative h-4 w-4 rounded-sm border border-current" aria-hidden>
        <span className="absolute inset-y-0 left-1/3 border-l border-current" />
        <span className="absolute inset-y-0 right-1/3 border-l border-current" />
      </span>
    );
  }
  if (tab === "list") {
    return (
      <span className="flex h-4 w-4 flex-col justify-center gap-1" aria-hidden>
        <span className="h-0.5 rounded-full bg-current" />
        <span className="h-0.5 rounded-full bg-current" />
        <span className="h-0.5 rounded-full bg-current" />
      </span>
    );
  }
  return (
    <span className="flex h-4 w-4 items-end justify-center gap-0.5" aria-hidden>
      <span className="h-1.5 w-1 rounded-full bg-current" />
      <span className="h-3 w-1 rounded-full bg-current" />
      <span className="h-2 w-1 rounded-full bg-current" />
    </span>
  );
}

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
    <div className="flex h-[100dvh] flex-col bg-stone-50 text-stone-950">
      <header className="flex items-center justify-between border-b border-stone-200/70 bg-white/85 px-4 py-2.5 backdrop-blur-2xl">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-stone-950">
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
          <MapTab
            focus={focus}
            selected={selected}
            onSelect={setSelected}
          />
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

      <nav className="grid grid-cols-3 border-t border-stone-200/70 bg-white/85 backdrop-blur-2xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
            className={cx(
              "flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
              tab === t.id
                ? "text-stone-950"
                : "text-stone-400 hover:text-stone-600",
            )}
          >
            <TabIcon tab={t.id} />
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
