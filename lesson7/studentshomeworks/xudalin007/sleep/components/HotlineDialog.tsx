"use client";

import { HOTLINES } from "@/lib/risk";

export function HotlineDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] rounded-soft p-6 w-full max-w-sm space-y-4 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-lg font-semibold">心理援助热线</div>
          <div className="text-sm text-ink-500 dark:text-ink-300 mt-1">
            如果情绪很糟糕，请尝试拨打。这些热线 24 小时都在。
          </div>
        </div>
        <ul className="space-y-2">
          {HOTLINES.map((h) => (
            <li
              key={h.phone + h.name}
              className="flex items-center justify-between p-3 rounded-soft border border-ink-100 dark:border-ink-700"
            >
              <div>
                <div className="font-medium">{h.name}</div>
                <div className="text-xs text-ink-400 dark:text-ink-300">
                  {h.note}
                </div>
              </div>
              <a
                href={`tel:${h.phone.replace(/-/g, "")}`}
                className="text-moon-600 dark:text-moon-200 font-medium"
              >
                {h.phone}
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-pill bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-100"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
