// Small shared UI helpers and label maps.

import type { Status } from "@/hooks/useUserState";
import type { Category } from "@/data/places";

export const STATUS_LABEL: Record<Status, string> = {
  visited: "Visited",
  want: "Want to go",
  none: "Not visited",
};

// Marker/dot colours — green=visited, amber=want, grey=none (data convention).
export const STATUS_COLOR: Record<Status, string> = {
  visited: "#16a34a",
  want: "#f59e0b",
  none: "#9ca3af",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  NaturePark: "Nature Park",
  Reservoir: "Reservoir",
  Coastal: "Coastal",
  Wetland: "Wetland",
  Island: "Island",
  Trail: "Trail",
  Quarry: "Quarry",
  Farm: "Farm",
  Heritage: "Heritage",
};

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Opens a pin at these exact coordinates on Google Maps — independent of
// which map provider (Leaflet/Google) is rendering the app itself.
export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
