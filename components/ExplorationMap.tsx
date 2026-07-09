"use client";

// Single map abstraction (CLAUDE.md stack rule). The rest of the app talks only
// to <ExplorationMap>, so the provider can be swapped without wider changes.
//
// Provider selection: @vis.gl/react-google-maps when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
// is present in .env.local; otherwise falls back to Leaflet + OneMap tiles.

import dynamic from "next/dynamic";
import type { Place } from "@/data/places";
import type { Status } from "@/hooks/useUserState";

export interface ExplorationMapProps {
  places: Place[];
  statusFor: (id: string) => Status;
  onSelect: (place: Place) => void;
  focus: Place | null;
  selectedId: string | null;
}

const LOADING = (
  <div className="flex h-full w-full items-center justify-center bg-stone-100 text-sm text-stone-400">
    Loading map...
  </div>
);

// Both providers touch window/document (Leaflet directly; Google Maps via its
// loader script), so neither may render on the server.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => LOADING,
});

const GoogleMap = dynamic(() => import("./GoogleMap"), {
  ssr: false,
  loading: () => LOADING,
});

const hasGoogleKey =
  typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string" &&
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.length > 0;

export function ExplorationMap(props: ExplorationMapProps) {
  return hasGoogleKey ? <GoogleMap {...props} /> : <LeafletMap {...props} />;
}
