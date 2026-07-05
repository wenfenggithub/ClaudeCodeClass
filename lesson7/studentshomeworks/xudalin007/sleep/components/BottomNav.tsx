"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "首页", icon: "🌙" },
  { href: "/sounds", label: "助眠", icon: "♪" },
  { href: "/practice", label: "训练", icon: "✿" },
  { href: "/plan", label: "计划", icon: "▦" },
  { href: "/me", label: "我的", icon: "◐" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[var(--card)] border-t border-[var(--line)] backdrop-blur">
      <ul className="max-w-md mx-auto grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TABS.map((t) => {
          const active =
            t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex justify-center px-1">
              <Link
                href={t.href}
                className={clsx(
                  "flex h-[52px] min-h-[52px] w-full flex-col items-center justify-center rounded-lg py-1.5 transition duration-200",
                  active
                    ? "scale-[1.06] bg-moon-100 text-moon-700 shadow-soft ring-1 ring-moon-200 dark:bg-moon-300/20 dark:text-moon-50 dark:shadow-soft-dark dark:ring-moon-300/35"
                    : "text-ink-400 dark:text-ink-300 hover:bg-moon-50/70 hover:text-moon-600 dark:hover:bg-moon-300/10 dark:hover:text-moon-100",
                )}
              >
                <span
                  className={clsx(
                    "text-xl leading-none transition duration-200",
                    active && "scale-110",
                  )}
                >
                  {t.icon}
                </span>
                <span
                  className={clsx(
                    "mt-0.5 text-[11px]",
                    active && "font-medium",
                  )}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
