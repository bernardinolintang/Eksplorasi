import { describe, expect, it } from "vitest";
import type { Place } from "@/data/places";
import type { UserState } from "@/hooks/useUserState";
import type { Filters } from "@/context/FilterContext";
import {
  computeStats,
  filterPlaces,
  statusOf,
  suggestNextPlace,
} from "@/lib/selectors";

const SAMPLE: Place[] = [
  { id: "a", name: "Alpha Park", category: "NaturePark", region: "North", description: "green", lat: 1.4, lng: 103.8 },
  { id: "b", name: "Beta Reservoir", category: "Reservoir", region: "Central", description: "water", lat: 1.35, lng: 103.83 },
  { id: "c", name: "Gamma Island", category: "Island", region: "East", description: "sandy", lat: 1.41, lng: 103.96 },
];

const NO_FILTERS: Filters = { search: "", category: "all", region: "all", status: "all" };

describe("statusOf", () => {
  it("defaults to 'none' for unknown ids", () => {
    expect(statusOf({}, "x")).toBe("none");
  });
});

describe("filterPlaces", () => {
  it("returns everything with no filters", () => {
    expect(filterPlaces(SAMPLE, {}, NO_FILTERS)).toHaveLength(3);
  });

  it("filters by category", () => {
    const out = filterPlaces(SAMPLE, {}, { ...NO_FILTERS, category: "Island" });
    expect(out.map((p) => p.id)).toEqual(["c"]);
  });

  it("filters by region", () => {
    const out = filterPlaces(SAMPLE, {}, { ...NO_FILTERS, region: "Central" });
    expect(out.map((p) => p.id)).toEqual(["b"]);
  });

  it("filters by status using user state", () => {
    const state: UserState = { a: { status: "visited", notes: "" } };
    const out = filterPlaces(SAMPLE, state, { ...NO_FILTERS, status: "visited" });
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });

  it("searches name and description case-insensitively", () => {
    expect(filterPlaces(SAMPLE, {}, { ...NO_FILTERS, search: "BETA" }).map((p) => p.id)).toEqual(["b"]);
    expect(filterPlaces(SAMPLE, {}, { ...NO_FILTERS, search: "sandy" }).map((p) => p.id)).toEqual(["c"]);
  });

  it("combines filters (AND semantics)", () => {
    const state: UserState = { a: { status: "want", notes: "" } };
    const out = filterPlaces(SAMPLE, state, { ...NO_FILTERS, region: "North", status: "want" });
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });
});

describe("computeStats", () => {
  it("counts statuses and percentage", () => {
    const state: UserState = {
      a: { status: "visited", notes: "" },
      b: { status: "want", notes: "" },
    };
    const s = computeStats(SAMPLE, state);
    expect(s.total).toBe(3);
    expect(s.visited).toBe(1);
    expect(s.want).toBe(1);
    expect(s.none).toBe(1);
    expect(s.percentage).toBe(33);
  });

  it("breaks down by category and region", () => {
    const state: UserState = { c: { status: "visited", notes: "" } };
    const s = computeStats(SAMPLE, state);
    expect(s.byCategory.Island).toEqual({ total: 1, visited: 1 });
    expect(s.byRegion.East).toEqual({ total: 1, visited: 1 });
    expect(s.byRegion.North).toEqual({ total: 1, visited: 0 });
  });

  it("is 0% for an empty list", () => {
    expect(computeStats([], {}).percentage).toBe(0);
  });
});

describe("suggestNextPlace", () => {
  it("never returns a visited place", () => {
    const state: UserState = {
      a: { status: "visited", notes: "" },
      b: { status: "visited", notes: "" },
    };
    // rng forced to 0 -> first candidate
    expect(suggestNextPlace(SAMPLE, state, () => 0)?.id).toBe("c");
  });

  it("prefers wishlist places before other unvisited places", () => {
    const state: UserState = {
      b: { status: "want", notes: "" },
    };
    expect(suggestNextPlace(SAMPLE, state, () => 0)?.id).toBe("b");
  });

  it("returns null when everything is visited", () => {
    const state: UserState = {
      a: { status: "visited", notes: "" },
      b: { status: "visited", notes: "" },
      c: { status: "visited", notes: "" },
    };
    expect(suggestNextPlace(SAMPLE, state)).toBeNull();
  });
});
