"use client";

import { useEffect, useState } from "react";
import { useStore } from "./store";

/**
 * 不再阻塞渲染的 hydration 检查。
 * 直接返回 true（store hydrated 初始 = true），
 * 后台异步加载 IndexedDB 数据。
 */
export function useHydrated(): boolean {
  const hydrated = useStore((s) => s.hydrated);

  // 内部标记：确保 hydrate 至少被触发一次
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    if (triggered) return;
    setTriggered(true);
  }, [triggered]);

  // 直接返回 true；initial state 已 ready
  return true;
}
