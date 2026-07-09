"use client";

// Shares a single useUserState instance across all tabs so a status toggle in
// the List tab is instantly reflected by the Map tab (same in-memory state).

import { createContext, useContext, type ReactNode } from "react";
import { useUserState, type UseUserState } from "@/hooks/useUserState";

const UserStateContext = createContext<UseUserState | null>(null);

export function UserStateProvider({ children }: { children: ReactNode }) {
  const value = useUserState();
  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserStateContext(): UseUserState {
  const ctx = useContext(UserStateContext);
  if (!ctx) {
    throw new Error("useUserStateContext must be used within a UserStateProvider");
  }
  return ctx;
}
