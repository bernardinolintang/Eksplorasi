"use client";

// Leaflet + OneMap tiles implementation. Loaded only on the client (no SSR).

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/data/places";
import type { Status } from "@/hooks/useUserState";
import { STATUS_COLOR } from "@/lib/ui";

const SG_CENTER: [number, number] = [1.3521, 103.8198];

// OneMap requires attribution.
const ONEMAP_URL =
  "https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png";
const ONEMAP_ATTRIBUTION =
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:16px;width:16px;display:inline"/> ' +
  'New OneMap | Map data &copy; contributors, ' +
  '<a href="https://www.sla.gov.sg">Singapore Land Authority</a>';

function coloredIcon(color: string, selected: boolean): L.DivIcon {
  const width = selected ? 42 : 34;
  const height = selected ? 52 : 42;
  const halo = selected
    ? '<path d="M24 2C12.8 2 4 10.5 4 21.6c0 15.2 20 32.4 20 32.4s20-17.2 20-32.4C44 10.5 35.2 2 24 2Z" fill="none" stroke="white" stroke-width="5" stroke-linejoin="round"/>'
    : "";
  return L.divIcon({
    className: "eksplorasi-marker",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 48 56" fill="none">
      <ellipse cx="24" cy="51" rx="11" ry="4" fill="rgba(17,24,39,0.22)"/>
      ${halo}
      <path d="M24 3C13.7 3 5.5 11 5.5 21.5C5.5 36 24 52.5 24 52.5S42.5 36 42.5 21.5C42.5 11 34.3 3 24 3Z" fill="${color}" stroke="rgba(17,24,39,0.45)" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="24" cy="21.5" r="7.5" fill="rgba(255,255,255,0.88)"/>
      <circle cx="24" cy="21.5" r="3.8" fill="rgba(17,24,39,0.45)"/>
      <path d="M16 10.5C18.3 7.9 21 6.8 24.2 6.8" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
    </svg>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
}

// Imperatively pans/zooms to a focused place when it changes.
function FocusController({ focus }: { focus: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView([focus.lat, focus.lng], 15, { animate: true });
    }
  }, [focus, map]);
  return null;
}

export default function LeafletMap({
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
  return (
    <MapContainer
      center={SG_CENTER}
      zoom={12}
      minZoom={11}
      maxZoom={18}
      className="h-full w-full"
      // OneMap's recommended bounds for Singapore.
      maxBounds={[
        [1.1, 103.5],
        [1.5, 104.2],
      ]}
      scrollWheelZoom
    >
      <TileLayer url={ONEMAP_URL} attribution={ONEMAP_ATTRIBUTION} />
      <FocusController focus={focus} />
      {places.map((p) => {
        const selected = selectedId === p.id;
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={coloredIcon(STATUS_COLOR[statusFor(p.id)], selected)}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(p) }}
          />
        );
      })}
    </MapContainer>
  );
}
