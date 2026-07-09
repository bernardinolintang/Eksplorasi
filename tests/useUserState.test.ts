import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  parseUserState,
  useUserState,
  STORAGE_KEY,
} from "@/hooks/useUserState";

describe("parseUserState", () => {
  it("returns {} for missing data", () => {
    expect(parseUserState(null)).toEqual({});
  });

  it("returns {} for corrupt JSON", () => {
    expect(parseUserState("{not valid json")).toEqual({});
  });

  it("returns {} for non-object JSON (array / primitive)", () => {
    expect(parseUserState("[1,2,3]")).toEqual({});
    expect(parseUserState("42")).toEqual({});
  });

  it("coerces an invalid status to 'none'", () => {
    const raw = JSON.stringify({ a: { status: "bogus", notes: "hi" } });
    expect(parseUserState(raw)).toEqual({ a: { status: "none", notes: "hi" } });
  });

  it("coerces a non-string notes to empty string", () => {
    const raw = JSON.stringify({ a: { status: "visited", notes: 5 } });
    expect(parseUserState(raw)).toEqual({ a: { status: "visited", notes: "" } });
  });

  it("drops pure-default entries", () => {
    const raw = JSON.stringify({ a: { status: "none", notes: "" } });
    expect(parseUserState(raw)).toEqual({});
  });

  it("skips malformed entry values", () => {
    const raw = JSON.stringify({ a: null, b: "x", c: { status: "want", notes: "" } });
    expect(parseUserState(raw)).toEqual({ c: { status: "want", notes: "" } });
  });
});

describe("useUserState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults an unknown place to status 'none' with empty notes", () => {
    const { result } = renderHook(() => useUserState());
    expect(result.current.getPlaceState("nope")).toEqual({
      status: "none",
      notes: "",
    });
  });

  it("persists a status change to localStorage", () => {
    const { result } = renderHook(() => useUserState());
    act(() => result.current.setStatus("pulau-ubin", "visited"));
    expect(result.current.getPlaceState("pulau-ubin").status).toBe("visited");
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored["pulau-ubin"].status).toBe("visited");
  });

  it("persists notes independently of status", () => {
    const { result } = renderHook(() => useUserState());
    act(() => result.current.setNotes("coney-island", "saw a kite"));
    expect(result.current.getPlaceState("coney-island")).toEqual({
      status: "none",
      notes: "saw a kite",
    });
  });

  it("hydrates existing state on mount", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ macritchie: { status: "want", notes: "" } }),
    );
    const { result } = renderHook(() => useUserState());
    expect(result.current.getPlaceState("macritchie").status).toBe("want");
  });

  it("survives corrupt stored JSON without throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{{{corrupt");
    const { result } = renderHook(() => useUserState());
    expect(result.current.state).toEqual({});
  });

  it("replaceAll swaps the whole map (for import)", () => {
    const { result } = renderHook(() => useUserState());
    act(() => result.current.replaceAll({ x: { status: "visited", notes: "n" } }));
    expect(result.current.getPlaceState("x").status).toBe("visited");
  });
});
