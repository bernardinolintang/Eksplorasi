"use client";

import type { ReactNode } from "react";
import { UserStateProvider } from "@/context/UserStateContext";
import { FilterProvider } from "@/context/FilterContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserStateProvider>
      <FilterProvider>{children}</FilterProvider>
    </UserStateProvider>
  );
}
