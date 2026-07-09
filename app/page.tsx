import { AppShell } from "@/components/AppShell";

// Server component by default (rule 6); the interactive shell is a client island.
export default function Home() {
  return <AppShell />;
}
