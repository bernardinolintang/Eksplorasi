"use client";

// Floating filter chips for the Map tab. Reads/writes the shared FilterContext.

import { CATEGORIES, REGIONS } from "@/data/places";
import { useFilters } from "@/context/FilterContext";
import { CATEGORY_LABEL, STATUS_LABEL, cx } from "@/lib/ui";
import type { Status } from "@/hooks/useUserState";

const STATUSES: Status[] = ["visited", "want", "none"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-stone-950 bg-stone-950 text-white shadow-sm"
          : "border-white/70 bg-white/65 text-stone-600 hover:bg-white/95",
      )}
    >
      {children}
    </button>
  );
}

export function FilterChips() {
  const { filters, setCategory, setRegion, setStatus, reset } = useFilters();
  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.region !== "all";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip active={!hasActiveFilters} onClick={reset}>
        All
      </Chip>
      {hasActiveFilters && (
        <Chip active={false} onClick={reset}>
          Clear filters
        </Chip>
      )}
      {STATUSES.map((s) => (
        <Chip
          key={s}
          active={filters.status === s}
          onClick={() => setStatus(filters.status === s ? "all" : s)}
        >
          {STATUS_LABEL[s]}
        </Chip>
      ))}
      {REGIONS.map((r) => (
        <Chip
          key={r}
          active={filters.region === r}
          onClick={() => setRegion(filters.region === r ? "all" : r)}
        >
          {r}
        </Chip>
      ))}
      {CATEGORIES.map((c) => (
        <Chip
          key={c}
          active={filters.category === c}
          onClick={() => setCategory(filters.category === c ? "all" : c)}
        >
          {CATEGORY_LABEL[c]}
        </Chip>
      ))}
    </div>
  );
}
