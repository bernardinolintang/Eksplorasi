# Eksplorasi

Personal Singapore outdoor-exploration tracker: mark parks, trails, reservoirs,
wetlands, islands, quarries, farms, coastal routes, and outdoor heritage spots
as visited / want-to-go / not visited. Feels like Google Maps + travel
checklist + exploration journal, NOT a government directory.

## Stack
Next.js (App Router) + TypeScript + Tailwind CSS. Map: @vis.gl/react-google-maps
IF a GOOGLE_MAPS_API_KEY exists in .env.local; OTHERWISE fall back to Leaflet +
OneMap tiles (https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png,
attribution required). Abstract the map behind one <ExplorationMap> component so
the provider can be swapped without touching the rest of the app.
No backend for MVP.

## Architecture rules (reviewer enforces these)
1. Static place data lives ONLY in `data/places.ts`. User state NEVER lives there.
2. User state is `Record<placeId, { status: 'visited' | 'want' | 'none'; notes: string }>`
   stored in localStorage under the single key `eksplorasi-user-state-v1`, accessed
   ONLY through one `useUserState` hook. No direct localStorage calls anywhere else.
3. Status is ONE three-value enum. Never separate visited/wantToGo booleans.
4. Derived stats (counts, percentages, category/region breakdowns) are computed
   via memoised selectors, never stored.
5. Shared filter state (search text, category, region, status) lives in one
   React context so Map tab and List tab stay in sync.
6. Server components by default; "use client" only where interaction demands it.
7. Tailwind only for styling. Mobile-first. Selected place opens a bottom sheet
   on mobile and a side panel on ≥ md screens.

## Data conventions
- Place: { id, name, category, region, description, lat, lng } — nothing else.
- Categories: NaturePark, Reservoir, Coastal, Wetland, Island, Trail, Quarry,
  Farm, Heritage. Regions: North, South, East, West, Central.
- All coordinates must fall inside Singapore's bounding box:
  lat 1.15–1.48, lng 103.60–104.10.
- Marker colours: green = visited, grey = none, amber = want.

## Copy & tone
British English. Warm, personal, journal-like microcopy ("You've explored 39 of
60 places"), never bureaucratic.

## Testing
Vitest. Test targets: useUserState hook (persistence, migration safety),
filter/stat selectors, and data integrity (unique ids, valid category/region,
coords inside bounding box). Do NOT write rendering/snapshot tests for the map.
