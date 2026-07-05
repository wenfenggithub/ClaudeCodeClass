// 本地持久化层。
// 原型阶段使用 idb-keyval（IndexedDB 简单 KV），把整个 AppState 序列化保存。
// 真实产品中应迁移到 SQLite + SQLCipher，本文件的接口保持不变以便平滑替换。

"use client";

import { get, set, del } from "idb-keyval";
import { DEFAULT_SETTINGS, type AppState } from "./types";

const STORAGE_KEY = "hush.app.v1";

export const EMPTY_STATE: AppState = {
  profile: null,
  diaries: [],
  scores: [],
  plans: [],
  planTasks: [],
  practices: [],
  insights: [],
  riskFlags: [],
  worries: [],
  reframes: [],
  favoriteSounds: [],
  recentSounds: [],
  settings: DEFAULT_SETTINGS,
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await get<string>(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...EMPTY_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return EMPTY_STATE;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await set(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(): Promise<void> {
  await del(STORAGE_KEY);
}

export function exportStateAsJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}
