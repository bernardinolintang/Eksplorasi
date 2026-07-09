"use client";

// Detail card for a selected place. Bottom sheet on mobile, side panel on >=md
// (rule 7). Rendered by AppShell so it overlays every tab.

import type { Place } from "@/data/places";
import { CATEGORY_LABEL, googleMapsUrl } from "@/lib/ui";
import { StatusControl } from "./StatusControl";

export function PlaceDetail({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[1000] bg-black/30 md:bg-transparent md:pointer-events-none"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label={place.name}
        className="
          fixed z-[1001] bg-white shadow-2xl
          inset-x-0 bottom-0 rounded-t-2xl max-h-[80vh] overflow-y-auto
          md:inset-y-0 md:right-0 md:left-auto md:w-96 md:max-h-none md:rounded-none
          animate-in
        "
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 bg-white/95 px-5 pt-5 pb-3 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              {CATEGORY_LABEL[place.category]} · {place.region}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">
              {place.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-5 pb-8">
          <p className="text-sm leading-relaxed text-stone-600">
            {place.description}
          </p>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
              Your status
            </p>
            <StatusControl placeId={place.id} />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </p>
            <a
              href={googleMapsUrl(place.lat, place.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View on Google Maps ↗
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
