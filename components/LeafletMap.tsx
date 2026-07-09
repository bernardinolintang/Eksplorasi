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

function coloredIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "eksplorasi-marker",
    html: `<span style="
      display:block;width:18px;height:18px;border-radius:9999px;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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
}: {
  places: Place[];
  statusFor: (id: string) => Status;
  onSelect: (place: Place) => void;
  focus: Place | null;
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
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={coloredIcon(STATUS_COLOR[statusFor(p.id)])}
          eventHandlers={{ click: () => onSelect(p) }}
        />
      ))}
    </MapContainer>
  );
}
