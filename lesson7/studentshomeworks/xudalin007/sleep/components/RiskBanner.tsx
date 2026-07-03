"use client";

import { useState } from "react";
import type { RiskFlag } from "@/lib/types";
import { useStore } from "@/lib/store";
import { HotlineDialog } from "./HotlineDialog";

export function RiskBanner({ flag }: { flag: RiskFlag }) {
  const ack = useStore((s) => s.acknowledgeRiskFlag);
  const [showHotline, setShowHotline] = useState(false);
  const isUrgent = flag.level === "urgent";

  return (
    <>
      <div
        className={
          isUrgent
            ? "bg-amber-100 dark:bg-amber-500/20 border border-amber-300 rounded-soft p-4"
            : "bg-moon-50 dark:bg-moon-700/30 border border-moon-200 dark:border-moon-700 rounded-soft p-4"
        }
        role="alert"
      >
        <div className="text-sm font-medium mb-1.5">
          {isUrgent ? "我们想多陪你一会儿" : "一点温和的提醒"}
        </div>
        <div className="text-sm leading-relaxed text-ink-700 dark:text-ink-100">
          {flag.message}
        </div>
        <div className="flex gap-2 mt-3">
          {isUrgent && (
            <button
              onClick={() => setShowHotline(true)}
              className="px-4 py-1.5 rounded-pill text-sm bg-amber-300 text-ink-900 font-medium"
            >
              立即拨打热线
            </button>
          )}
          {!isUrgent && (
            <button
              onClick={() => setShowHotline(true)}
              className="px-4 py-1.5 rounded-pill text-sm bg-moon-500 text-white font-medium dark:bg-moon-300 dark:text-ink-900"
            >
              查看资源
            </button>
          )}
          <button
            onClick={() => ack(flag.flagId)}
            className="px-4 py-1.5 rounded-pill text-sm text-ink-500 dark:text-ink-300"
          >
            我知道了
          </button>
        </div>
      </div>
      {showHotline && (
        <HotlineDialog onClose={() => setShowHotline(false)} />
      )}
    </>
  );
}
