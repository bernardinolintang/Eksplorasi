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
      className="flex w-full max-w-sm rounded-full border border-stone-200 bg-white/80 p-0.5 shadow-sm backdrop-blur"
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
              "flex-1 rounded-full border border-transparent px-3 py-1 text-xs font-medium transition-colors",
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
