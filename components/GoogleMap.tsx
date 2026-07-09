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
// render time — that namespace only exists once APIProvider's script has
// loaded, but marker JSX is evaluated on the very first render.
function pinIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <circle cx="11" cy="11" r="8" fill="${color}" stroke="white" stroke-width="2" />
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
}: {
  places: Place[];
  statusFor: (id: string) => Status;
  onSelect: (place: Place) => void;
  focus: Place | null;
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
        {places.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            icon={pinIcon(STATUS_COLOR[statusFor(p.id)])}
            onClick={() => onSelect(p)}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
