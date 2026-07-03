"use client";

import { create } from "zustand";
import {
  EMPTY_STATE,
  loadState,
  saveState,
  clearState as clearStorage,
} from "./storage";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type AppState,
  type Insight,
  type PlanTask,
  type PracticeSession,
  type ReframeRecord,
  type RiskFlag,
  type SleepDiary,
  type SleepPlan,
  type SleepScore,
  type UserProfile,
  type WorryEntry,
} from "./types";
import { apiMe, apiLogout, type Account } from "./auth-client";

interface StoreActions {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** 服务端账户（可选登录）。非持久化：每次启动从 /api/auth/me 拉取。 */
  account: Account | null;
  accountLoaded: boolean;
  loadAccount: () => Promise<void>;
  setAccount: (account: Account | null) => void;
  signOut: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  patchProfile: (patch: Partial<UserProfile>) => Promise<void>;
  addDiary: (diary: SleepDiary, score: SleepScore) => Promise<void>;
  updateDiary: (diary: SleepDiary, score: SleepScore) => Promise<void>;
  addPlan: (plan: SleepPlan, tasks: PlanTask[]) => Promise<void>;
  togglePlanTask: (taskId: string) => Promise<void>;
  addInsights: (items: Insight[]) => Promise<void>;
  addRiskFlag: (flag: RiskFlag) => Promise<void>;
  acknowledgeRiskFlag: (flagId: string) => Promise<void>;
  addPractice: (s: PracticeSession) => Promise<void>;
  addWorry: (w: WorryEntry) => Promise<void>;
  archiveWorry: (worryId: string) => Promise<void>;
  deleteWorry: (worryId: string) => Promise<void>;
  addReframe: (r: ReframeRecord) => Promise<void>;
  deleteReframe: (reframeId: string) => Promise<void>;
  toggleFavoriteSound: (id: string) => Promise<void>;
  trackRecentSound: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetAll: () => Promise<void>;
}

type Store = AppState & StoreActions;

async function persist(get: () => Store) {
  const s = get();
  const snap: AppState = {
    profile: s.profile,
    diaries: s.diaries,
    scores: s.scores,
    plans: s.plans,
    planTasks: s.planTasks,
    practices: s.practices,
    insights: s.insights,
    riskFlags: s.riskFlags,
    worries: s.worries,
    reframes: s.reframes,
    favoriteSounds: s.favoriteSounds,
    recentSounds: s.recentSounds,
    settings: s.settings,
  };
  await saveState(snap);
}

// hydrated 初始为 true，不再阻塞页面渲染。
// IndexedDB 加载走异步，页面可见后再静默替换数据。
export const useStore = create<Store>((set, get) => ({
  ...EMPTY_STATE,
  hydrated: true,
  account: null,
  accountLoaded: false,

  hydrate: async () => {
    const loaded = await loadState();
    set({ ...loaded, hydrated: true });
  },

  loadAccount: async () => {
    const account = await apiMe();
    set({ account, accountLoaded: true });
  },

  setAccount: (account) => {
    set({ account, accountLoaded: true });
  },

  signOut: async () => {
    await apiLogout();
    set({ account: null });
  },

  setProfile: async (profile) => {
    set({ profile });
    await persist(get);
  },

  patchProfile: async (patch) => {
    const cur = get().profile;
    if (!cur) return;
    set({ profile: { ...cur, ...patch } });
    await persist(get);
  },

  addDiary: async (diary, score) => {
    set((s) => ({
      diaries: [...s.diaries, diary],
      scores: [...s.scores, score],
    }));
    await persist(get);
  },

  updateDiary: async (diary, score) => {
    set((s) => ({
      diaries: s.diaries.map((d) => (d.diaryId === diary.diaryId ? diary : d)),
      scores: s.scores.map((sc) =>
        sc.diaryId === diary.diaryId ? score : sc,
      ),
    }));
    await persist(get);
  },

  addPlan: async (plan, tasks) => {
    set((s) => ({
      plans: [...s.plans, plan],
      planTasks: [...s.planTasks, ...tasks],
    }));
    await persist(get);
  },

  togglePlanTask: async (taskId) => {
    set((s) => ({
      planTasks: s.planTasks.map((t) =>
        t.taskId === taskId
          ? {
              ...t,
              done: !t.done,
              doneAt: !t.done ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    }));
    await persist(get);
  },

  addInsights: async (items) => {
    set((s) => ({ insights: [...s.insights, ...items] }));
    await persist(get);
  },

  addRiskFlag: async (flag) => {
    set((s) => {
      // 同一规则 7 天内不重复
      const within7d = s.riskFlags.find(
        (f) =>
          f.ruleId === flag.ruleId &&
          Date.now() - new Date(f.triggeredAt).getTime() <
            7 * 24 * 60 * 60 * 1000,
      );
      if (within7d) return s;
      return { riskFlags: [...s.riskFlags, flag] };
    });
    await persist(get);
  },

  acknowledgeRiskFlag: async (flagId) => {
    set((s) => ({
      riskFlags: s.riskFlags.map((f) =>
        f.flagId === flagId ? { ...f, acknowledged: true } : f,
      ),
    }));
    await persist(get);
  },

  addPractice: async (s2) => {
    set((s) => ({ practices: [...s.practices, s2] }));
    await persist(get);
  },

  addWorry: async (w) => {
    set((s) => ({ worries: [...s.worries, w] }));
    await persist(get);
  },

  archiveWorry: async (worryId) => {
    set((s) => ({
      worries: s.worries.map((w) =>
        w.worryId === worryId
          ? { ...w, archived: true, archivedAt: new Date().toISOString() }
          : w,
      ),
    }));
    await persist(get);
  },

  deleteWorry: async (worryId) => {
    set((s) => ({ worries: s.worries.filter((w) => w.worryId !== worryId) }));
    await persist(get);
  },

  addReframe: async (r) => {
    set((s) => ({ reframes: [...s.reframes, r] }));
    await persist(get);
  },

  deleteReframe: async (reframeId) => {
    set((s) => ({
      reframes: s.reframes.filter((r) => r.reframeId !== reframeId),
    }));
    await persist(get);
  },

  toggleFavoriteSound: async (id) => {
    set((s) => ({
      favoriteSounds: s.favoriteSounds.includes(id)
        ? s.favoriteSounds.filter((x) => x !== id)
        : [id, ...s.favoriteSounds],
    }));
    await persist(get);
  },

  trackRecentSound: async (id) => {
    set((s) => {
      const next = [id, ...s.recentSounds.filter((x) => x !== id)].slice(0, 8);
      return { recentSounds: next };
    });
    await persist(get);
  },

  updateSettings: async (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    await persist(get);
  },

  resetAll: async () => {
    await clearStorage();
    set({
      ...EMPTY_STATE,
      settings: DEFAULT_SETTINGS,
      hydrated: true,
    });
  },
}));
