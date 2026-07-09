"use client";

// Three-way status control (rule 3: one enum, never separate booleans).

import type { Status } from "@/hooks/useUserState";
import { useUserStateContext } from "@/context/UserStateContext";
import { STATUS_LABEL, cx } from "@/lib/ui";

const ORDER: Status[] = ["visited", "want", "none"];

const ACTIVE: Record<Status, string> = {
  visited: "bg-visited text-white border-visited",
  want: "bg-want text-white border-want",
  none: "bg-none text-white border-none",
};

export function StatusControl({ placeId }: { placeId: string }) {
  const { getPlaceState, setStatus } = useUserStateContext();
  const current = getPlaceState(placeId).status;

  return (
    <div
      role="group"
      aria-label="Exploration status"
      className="inline-flex rounded-full border border-stone-200 bg-white p-0.5 shadow-sm"
    >
      {ORDER.map((s) => {
        const isActive = current === s;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={isActive}
            onClick={() => setStatus(placeId, s)}
            className={cx(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors border border-transparent",
              isActive
                ? ACTIVE[s]
                : "text-stone-500 hover:bg-stone-100",
            )}
          >
            {STATUS_LABEL[s]}
          </button>
        );
      })}
    </div>
  );
}
