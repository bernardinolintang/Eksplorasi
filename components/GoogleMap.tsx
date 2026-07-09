"use client";

// @vis.gl/react-google-maps implementation. Same prop contract as LeafletMap
// so <ExplorationMap> can swap providers without touching the rest of the app.

import { useEffect } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import type { Place } from "@/data/places";
import type { Status } from "@/hooks/useUserState";
import { STATUS_COLOR } from "@/lib/ui";

const SG_CENTER = { lat: 1.3521, lng: 103.8198 };

const SG_BOUNDS_RESTRICTION = {
  latLngBounds: { north: 1.5, south: 1.1, east: 104.2, west: 103.5 },
  strictBounds: false,
};

// Legacy Marker (not AdvancedMarker) so no Google Maps "Map ID" is required.
// A plain SVG data URI avoids referencing the `google.maps` namespace at
// render time; that namespace only exists once APIProvider's script has
// loaded, but marker JSX is evaluated on the very first render.
function pinIcon(color: string, selected: boolean): string {
  const width = selected ? 42 : 34;
  const height = selected ? 52 : 42;
  const halo = selected
    ? '<path d="M24 2C12.8 2 4 10.5 4 21.6c0 15.2 20 32.4 20 32.4s20-17.2 20-32.4C44 10.5 35.2 2 24 2Z" fill="none" stroke="white" stroke-width="5" stroke-linejoin="round"/>'
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 48 56" fill="none">
    <ellipse cx="24" cy="51" rx="11" ry="4" fill="rgba(17,24,39,0.22)"/>
    ${halo}
    <path d="M24 3C13.7 3 5.5 11 5.5 21.5C5.5 36 24 52.5 24 52.5S42.5 36 42.5 21.5C42.5 11 34.3 3 24 3Z" fill="${color}" stroke="rgba(17,24,39,0.45)" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="24" cy="21.5" r="7.5" fill="rgba(255,255,255,0.88)"/>
    <circle cx="24" cy="21.5" r="3.8" fill="rgba(17,24,39,0.45)"/>
    <path d="M16 10.5C18.3 7.9 21 6.8 24.2 6.8" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Imperatively pans/zooms to a focused place when it changes.
function FocusController({ focus }: { focus: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus && map) {
      map.panTo({ lat: focus.lat, lng: focus.lng });
      map.setZoom(15);
    }
  }, [focus, map]);
  return null;
}

export default function GoogleMap({
  places,
  statusFor,
  onSelect,
  focus,
  selectedId,
}: {
  places: Place[];
  statusFor: (id: string) => Status;
  onSelect: (place: Place) => void;
  focus: Place | null;
  selectedId: string | null;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        className="h-full w-full"
        defaultCenter={SG_CENTER}
        defaultZoom={12}
        minZoom={11}
        maxZoom={18}
        restriction={SG_BOUNDS_RESTRICTION}
        mapId={mapId}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <FocusController focus={focus} />
        {places.map((p) => {
          const selected = selectedId === p.id;
          const status = statusFor(p.id);
          return (
            <Marker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              icon={pinIcon(STATUS_COLOR[status], selected)}
              zIndex={
                selected
                  ? 1000
                  : status === "want"
                    ? 20
                    : status === "visited"
                      ? 10
                      : 1
              }
              onClick={() => onSelect(p)}
            />
          );
        })}
      </Map>
    </APIProvider>
  );
}
