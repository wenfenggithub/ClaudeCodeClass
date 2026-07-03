"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { MiniPlayer } from "./MiniPlayer";
import { TTSBridge } from "./TTSBridge";

const HIDE_NAV_PREFIXES = [
  "/onboarding",
  "/practice/breathing",
  "/practice/meditation",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideNav = HIDE_NAV_PREFIXES.some((p) => path.startsWith(p));
  return (
    <div className="min-h-dvh max-w-md mx-auto pb-24">
      <TTSBridge />
      <main>{children}</main>
      <MiniPlayer />
      {!hideNav && <BottomNav />}
    </div>
  );
}
