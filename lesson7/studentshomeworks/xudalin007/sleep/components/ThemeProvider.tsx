"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** 根据 settings.themeMode + 当前时间，给 html 元素加 dark class */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useStore((s) => s.settings);
  const hydrate = useStore((s) => s.hydrate);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);

  // 首次挂载时加载 IndexedDB 数据到 store（静默，不阻塞渲染）
  useEffect(() => { void hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  useEffect(() => {
    const apply = () => {
      const html = document.documentElement;
      const mode = settings.themeMode;
      let dark = false;
      if (mode === "dark") dark = true;
      else if (mode === "system") {
        dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else if (mode === "auto-night") {
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = settings.autoNightStart.split(":").map(Number);
        const [eh, em] = settings.autoNightEnd.split(":").map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        if (start < end) {
          dark = cur >= start && cur < end;
        } else {
          // 跨午夜
          dark = cur >= start || cur < end;
        }
      }
      html.classList.toggle("dark", dark);
    };
    apply();
    const i = setInterval(apply, 60_000);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      clearInterval(i);
      mq.removeEventListener("change", apply);
    };
  }, [settings.themeMode, settings.autoNightStart, settings.autoNightEnd]);

  return <>{children}</>;
}
