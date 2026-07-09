"use client";

// The ONLY place localStorage is touched (architecture rule 2).
// User state: Record<placeId, { status; notes }> under a single key.

import { useCallback, useEffect, useState } from "react";

export type Status = "visited" | "want" | "none";

export interface PlaceState {
  status: Status;
  notes: string;
}

export type UserState = Record<string, PlaceState>;

export const STORAGE_KEY = "eksplorasi-user-state-v1";

const VALID_STATUS: readonly Status[] = ["visited", "want", "none"];

export const DEFAULT_PLACE_STATE: PlaceState = { status: "none", notes: "" };

/**
 * Parse and sanitise whatever is in localStorage. Never throws.
 * Drops malformed entries, coerces bad statuses to "none", and ensures
 * notes is always a string. Returns {} for missing/corrupt data.
 */
export function parseUserState(raw: string | null): UserState {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  const result: UserState = {};
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      continue;
    }
    const v = value as Record<string, unknown>;
    const status = VALID_STATUS.includes(v.status as Status)
      ? (v.status as Status)
      : "none";
    const notes = typeof v.notes === "string" ? v.notes : "";
    // Skip pure-default entries to keep storage tidy.
    if (status === "none" && notes === "") continue;
    result[id] = { status, notes };
  }
  return result;
}

export interface UseUserState {
  state: UserState;
  getPlaceState: (id: string) => PlaceState;
  setStatus: (id: string, status: Status) => void;
  setNotes: (id: string, notes: string) => void;
  replaceAll: (next: UserState) => void;
}

export function useUserState(): UseUserState {
  const [state, setState] = useState<UserState>({});

  // Hydrate on mount (client only), so SSR markup stays stable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setState(parseUserState(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full / unavailable — fail silently, state stays in memory.
    }
  }, [state]);

  const getPlaceState = useCallback(
    (id: string): PlaceState => state[id] ?? DEFAULT_PLACE_STATE,
    [state],
  );

  const setStatus = useCallback((id: string, status: Status) => {
    setState((prev) => {
      const current = prev[id] ?? DEFAULT_PLACE_STATE;
      return { ...prev, [id]: { ...current, status } };
    });
  }, []);

  const setNotes = useCallback((id: string, notes: string) => {
    setState((prev) => {
      const current = prev[id] ?? DEFAULT_PLACE_STATE;
      return { ...prev, [id]: { ...current, notes } };
    });
  }, []);

  const replaceAll = useCallback((next: UserState) => {
    setState(next);
  }, []);

  return { state, getPlaceState, setStatus, setNotes, replaceAll };
}
