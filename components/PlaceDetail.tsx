"use client";

// Detail card for a selected place. Bottom sheet on mobile, side panel on >=md
// (rule 7). Rendered by AppShell so it overlays every tab.

import type { Place } from "@/data/places";
import {
  CATEGORY_LABEL,
  googleMapsDirectionsUrl,
  googleMapsUrl,
} from "@/lib/ui";
import { useUserStateContext } from "@/context/UserStateContext";
import { StatusControl } from "./StatusControl";

export function PlaceDetail({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const { getPlaceState, setNotes } = useUserStateContext();
  const notes = getPlaceState(place.id).notes;

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
          fixed z-[1001] bg-white/95 shadow-2xl backdrop-blur-2xl
          inset-x-0 bottom-0 rounded-t-3xl max-h-[80vh] overflow-y-auto
          md:inset-y-0 md:right-0 md:left-auto md:w-[26rem] md:max-h-none md:rounded-none
          animate-in
        "
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 bg-white/95 px-5 pt-5 pb-3 backdrop-blur">
          <div className="min-w-0">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-stone-200 md:hidden" />
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {CATEGORY_LABEL[place.category]} - {place.region}
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
            X
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

          <div>
            <label
              htmlFor={`notes-${place.id}`}
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-stone-400"
            >
              Field notes
            </label>
            <textarea
              id={`notes-${place.id}`}
              value={notes}
              onChange={(event) => setNotes(place.id, event.target.value)}
              rows={4}
              placeholder="A small memory, route tip, or reason to go..."
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="space-y-2">
            <a
              href={googleMapsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
            >
              Open in Google Maps
            </a>
            <a
              href={googleMapsDirectionsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full border border-stone-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-white"
            >
              Get walking directions
            </a>
            <p className="pt-1 text-center text-xs text-stone-400">
              Coordinates: {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
