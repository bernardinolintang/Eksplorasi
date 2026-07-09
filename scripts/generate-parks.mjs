// Regenerates data/places.ts from the official data.gov.sg NParks "Parks"
// dataset, merged with a small hand-curated set of non-NParks places
// (reservoirs, islands, trails, quarries, farms, heritage sites, coastal
// routes) that the point dataset doesn't cover.
//
// Run: npm run generate:parks
//
// Source of truth: https://data.gov.sg/datasets/d_0542d48f0991541706b58059381a6eca/view
// GeoJSON coordinates are [lng, lat], not [lat, lng] — handled below.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "data", "places.ts");

const DATASET_ID = "d_0542d48f0991541706b58059381a6eca";
const POLL_URL = `https://api-open.data.gov.sg/v1/public/api/datasets/${DATASET_ID}/poll-download`;

const SG_BOUNDS = { minLat: 1.15, maxLat: 1.48, minLng: 103.6, maxLng: 104.1 };

// Hand-curated places outside the NParks "Parks" point layer — reservoirs,
// islands, trails, quarries, farms, heritage sites and coastal routes.
// Kept here (rather than in data/places.ts) so this script remains the
// single generator for the whole file.
const CURATED_PLACES = [
  {
    id: "pulau-ubin",
    name: "Pulau Ubin",
    category: "Island",
    region: "East",
    description:
      "A rustic offshore island frozen in Singapore's 1960s kampong days — cycle red dirt tracks past Chek Jawa's tidal wetlands.",
    lat: 1.4043,
    lng: 103.9603,
  },
  {
    id: "macritchie-reservoir",
    name: "MacRitchie Reservoir",
    category: "Reservoir",
    region: "Central",
    description:
      "Singapore's oldest reservoir, ringed by rainforest boardwalks and the vertigo-inducing TreeTop Walk suspension bridge.",
    lat: 1.3417,
    lng: 103.8331,
  },
  {
    id: "sungei-buloh",
    name: "Sungei Buloh Wetland Reserve",
    category: "Wetland",
    region: "North",
    description:
      "Mangrove-fringed mudflats where migratory shorebirds, mudskippers and the occasional estuarine crocodile hold court.",
    lat: 1.4463,
    lng: 103.729,
  },
  {
    id: "coney-island",
    name: "Coney Island",
    category: "Island",
    region: "North",
    description:
      "A deliberately wild little island of casuarina groves and hidden beaches, home to a resident (if elusive) Brahminy kite.",
    lat: 1.411,
    lng: 103.92,
  },
  {
    id: "bukit-timah-nature-reserve",
    name: "Bukit Timah Nature Reserve",
    category: "NaturePark",
    region: "Central",
    description:
      "Singapore's highest hill wrapped in primary rainforest — a sweaty scramble to the 164m summit past long-tailed macaques.",
    lat: 1.354,
    lng: 103.7767,
  },
  {
    id: "labrador-nature-reserve",
    name: "Labrador Nature Reserve",
    category: "Coastal",
    region: "South",
    description:
      "The only rocky sea-cliff on the mainland, dotted with WWII gun emplacements and secret tunnels above a coastal boardwalk.",
    lat: 1.2668,
    lng: 103.802,
  },
  {
    id: "marina-barrage",
    name: "Marina Barrage",
    category: "Reservoir",
    region: "South",
    description:
      "A dam-turned-reservoir with a breezy rooftop lawn — the city skyline's favourite kite-flying and picnic perch.",
    lat: 1.2807,
    lng: 103.8713,
  },
  {
    id: "tampines-eco-green",
    name: "Tampines Eco Green",
    category: "NaturePark",
    region: "East",
    description:
      "A no-frills open grassland and freshwater pond park, quietly rewilded for birds, butterflies and dragonflies.",
    lat: 1.3596,
    lng: 103.944,
  },
  {
    id: "chestnut-nature-park",
    name: "Chestnut Nature Park",
    category: "Trail",
    region: "West",
    description:
      "Singapore's largest nature park, with dedicated mountain-biking and hiking trails threading secondary forest.",
    lat: 1.376,
    lng: 103.786,
  },
  {
    id: "bollywood-farms",
    name: "Bollywood Farms",
    category: "Farm",
    region: "West",
    description:
      "A working organic farm and kampong-style kitchen in the Kranji countryside — farm-to-table with muddy boots.",
    lat: 1.4295,
    lng: 103.724,
  },
  {
    id: "little-guilin",
    name: "Little Guilin",
    category: "Quarry",
    region: "West",
    description:
      "A former granite quarry reborn as a serene lake beneath a sheer rock face, nicknamed after China's Guilin scenery.",
    lat: 1.3672,
    lng: 103.771,
  },
  {
    id: "rail-corridor",
    name: "Green Corridor / Rail Corridor",
    category: "Trail",
    region: "Central",
    description:
      "A 24km linear green artery along the old Malayan railway line — walk from truss bridges to the conserved Bukit Timah station.",
    lat: 1.325,
    lng: 103.782,
  },
  {
    id: "east-coast-park",
    name: "East Coast Park",
    category: "Coastal",
    region: "East",
    description:
      "Singapore's beloved 15km reclaimed beachfront — cycle, skate, barbecue and watch cargo ships drift past at dusk.",
    lat: 1.301,
    lng: 103.912,
  },
  {
    id: "fort-canning",
    name: "Fort Canning Park",
    category: "Heritage",
    region: "Central",
    description:
      "A hilltop steeped in 700 years of history — royal palaces, spice gardens and the Instagram-famous tree tunnel.",
    lat: 1.2939,
    lng: 103.846,
  },
  {
    id: "lower-peirce-reservoir",
    name: "Lower Peirce Reservoir",
    category: "Reservoir",
    region: "Central",
    description:
      "A tranquil reservoir edged by one of Singapore's oldest mature secondary forests and a cool boardwalk trail.",
    lat: 1.372,
    lng: 103.819,
  },
];

// Whole-word abbreviation expansions seen in NParks naming (e.g. "PK" -> "Park").
const WORD_EXPANSIONS = {
  PK: "Park",
  PKS: "Parks",
  RES: "Reserve",
  GDN: "Garden",
  GDNS: "Gardens",
  CTR: "Centre",
  CTRL: "Central",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCaseName(raw) {
  return raw
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const upper = word.toUpperCase();
      if (WORD_EXPANSIONS[upper]) return WORD_EXPANSIONS[upper];
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

// Coarse geographic split of Singapore into the app's 5 regions.
// Heuristic thresholds, not an official planning-area boundary.
function classifyRegion(lat, lng) {
  if (lat >= 1.38) return "North";
  if (lat <= 1.29) return "South";
  if (lng >= 103.9) return "East";
  if (lng <= 103.75) return "West";
  return "Central";
}

function withinBounds(lat, lng) {
  return (
    lat >= SG_BOUNDS.minLat &&
    lat <= SG_BOUNDS.maxLat &&
    lng >= SG_BOUNDS.minLng &&
    lng <= SG_BOUNDS.maxLng
  );
}

function dedupeId(baseId, usedIds) {
  if (!usedIds.has(baseId)) return baseId;
  let n = 2;
  while (usedIds.has(`${baseId}-${n}`)) n++;
  return `${baseId}-${n}`;
}

async function fetchParksGeoJson() {
  const pollRes = await fetch(POLL_URL);
  const pollJson = await pollRes.json();
  if (pollJson.code !== 0) {
    throw new Error(pollJson.errMsg || "Failed to get dataset download URL");
  }
  const geoRes = await fetch(pollJson.data.url);
  return geoRes.json();
}

function transformFeature(feature, usedIds) {
  if (feature?.geometry?.type !== "Point") return null;
  const coords = feature.geometry.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const rawName = feature.properties?.NAME;
  if (!rawName) return null;

  const [lng, lat] = coords; // GeoJSON order is [lng, lat].
  if (!withinBounds(lat, lng)) return null;

  const name = titleCaseName(rawName);
  const id = dedupeId(slugify(rawName), usedIds);
  usedIds.add(id);

  return {
    id,
    name,
    category: "NaturePark",
    region: classifyRegion(lat, lng),
    description: `${name} is an NParks-managed park in Singapore.`,
    lat,
    lng,
  };
}

function formatPlace(p) {
  return `  {
    id: ${JSON.stringify(p.id)},
    name: ${JSON.stringify(p.name)},
    category: ${JSON.stringify(p.category)},
    region: ${JSON.stringify(p.region)},
    description: ${JSON.stringify(p.description)},
    lat: ${p.lat},
    lng: ${p.lng},
  }`;
}

async function main() {
  console.log("Fetching NParks parks dataset...");
  const geoJson = await fetchParksGeoJson();

  const usedIds = new Set(CURATED_PLACES.map((p) => p.id));
  const generated = geoJson.features
    .map((f) => transformFeature(f, usedIds))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const allPlaces = [...CURATED_PLACES, ...generated];

  const fileContent = `// AUTO-GENERATED by scripts/generate-parks.mjs — do not hand-edit the
// generated section below. Re-run \`npm run generate:parks\` to refresh.
//
// Static place data ONLY. User state (visited/want/notes) NEVER lives here.
// See CLAUDE.md — architecture rule 1.

export const CATEGORIES = [
  "NaturePark",
  "Reservoir",
  "Coastal",
  "Wetland",
  "Island",
  "Trail",
  "Quarry",
  "Farm",
  "Heritage",
] as const;

export const REGIONS = ["North", "South", "East", "West", "Central"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Region = (typeof REGIONS)[number];

export interface Place {
  id: string;
  name: string;
  category: Category;
  region: Region;
  description: string;
  lat: number;
  lng: number;
}

// Singapore bounding box — every coord below sits inside this.
export const SG_BOUNDS = {
  minLat: 1.15,
  maxLat: 1.48,
  minLng: 103.6,
  maxLng: 104.1,
} as const;

// Hand-curated places (reservoirs, islands, trails, quarries, farms,
// heritage sites, coastal routes) plus every NParks-managed park from the
// official data.gov.sg dataset (${DATASET_ID}).
export const places: Place[] = [
${allPlaces.map(formatPlace).join(",\n")},
];
`;

  await fs.writeFile(OUTPUT_PATH, fileContent, "utf8");
  console.log(
    `Wrote ${allPlaces.length} places to data/places.ts (${CURATED_PLACES.length} curated + ${generated.length} from NParks).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
