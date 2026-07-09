import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  REGIONS,
  SG_BOUNDS,
  places,
} from "@/data/places";

describe("data/places integrity", () => {
  it("has at least the 15 curated places plus NParks-generated ones", () => {
    expect(places.length).toBeGreaterThanOrEqual(15);
  });

  it("has unique ids", () => {
    const ids = places.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only valid categories", () => {
    for (const p of places) {
      expect(CATEGORIES).toContain(p.category);
    }
  });

  it("uses only valid regions", () => {
    for (const p of places) {
      expect(REGIONS).toContain(p.region);
    }
  });

  it("keeps every coordinate inside the Singapore bounding box", () => {
    for (const p of places) {
      expect(p.lat, `${p.name} lat`).toBeGreaterThanOrEqual(SG_BOUNDS.minLat);
      expect(p.lat, `${p.name} lat`).toBeLessThanOrEqual(SG_BOUNDS.maxLat);
      expect(p.lng, `${p.name} lng`).toBeGreaterThanOrEqual(SG_BOUNDS.minLng);
      expect(p.lng, `${p.name} lng`).toBeLessThanOrEqual(SG_BOUNDS.maxLng);
    }
  });

  it("covers all 9 categories at least once", () => {
    const used = new Set(places.map((p) => p.category));
    for (const c of CATEGORIES) expect(used, `missing ${c}`).toContain(c);
  });

  it("covers all 5 regions at least once", () => {
    const used = new Set(places.map((p) => p.region));
    for (const r of REGIONS) expect(used, `missing ${r}`).toContain(r);
  });

  it("has non-empty name and description for every place", () => {
    for (const p of places) {
      expect(p.name.trim().length).toBeGreaterThan(0);
      expect(p.description.trim().length).toBeGreaterThan(0);
    }
  });
});
