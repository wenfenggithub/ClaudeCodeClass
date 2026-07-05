// 音频播放状态 - 独立 store，避免污染主 store 的持久化层
// 播放状态不持久化（关闭页面就停），仅"收藏 / 最近播放"写入主 store

"use client";

import { create } from "zustand";
import { audioEngine, MAX_VOICES, type SoundId } from "./audio-engine";
import { ttsEngine, type TTSStatus } from "./tts-engine";

export interface ActiveVoice {
  id: SoundId;
  volume: number; // 0–1
}

interface State {
  active: ActiveVoice[];
  masterVolume: number;
  /** 定时停止剩余秒数；null = 未设置 */
  timerEndsAt: number | null;
  timerTotalMin: number | null;
  tts: TTSStatus;
  ttsVolume: number;
}

interface Actions {
  toggle: (id: SoundId) => Promise<void>;
  setVoiceVolume: (id: SoundId, v: number) => void;
  setMasterVolume: (v: number) => void;
  stopAll: () => void;
  setTimer: (min: number | null) => void;
  tick: () => void;
  /** 故事 */
  toggleStory: (id: string, opts?: { useCloud?: boolean; engine?: "edge" | "aliyun"; voice?: string; speed?: number }) => Promise<void>;
  pauseStory: () => void;
  resumeStory: () => void;
  stopStory: () => void;
  setStoryVolume: (v: number) => void;
  _setTtsStatus: (s: TTSStatus) => void;
}

type Store = State & Actions;

let _tickInterval: number | null = null;

export const useAudioStore = create<Store>((set, get) => ({
  active: [],
  masterVolume: 0.7,
  timerEndsAt: null,
  timerTotalMin: null,
  tts: {
    storyId: null,
    paragraphIdx: 0,
    totalParagraphs: 0,
    progress: 0,
    currentTimeSec: 0,
    durationSec: 0,
    paused: false,
    engine: null,
    loading: false,
  },
  ttsVolume: 1.0,

  toggle: async (id) => {
    await audioEngine.ensureStarted();
    const { active } = get();
    const idx = active.findIndex((v) => v.id === id);
    if (idx >= 0) {
      audioEngine.stop(id);
      set({ active: active.filter((v) => v.id !== id) });
      if (active.length === 1) {
        // 最后一个被关掉，顺便取消定时
        get().setTimer(null);
      }
      return;
    }

    let next = active;
    if (next.length >= MAX_VOICES) {
      const oldest = next[0];
      audioEngine.stop(oldest.id);
      next = next.slice(1);
    }
    const vol = 0.7;
    await audioEngine.play(id, vol);
    set({ active: [...next, { id, volume: vol }] });

    if (!_tickInterval) {
      _tickInterval = window.setInterval(() => get().tick(), 1000);
    }
  },

  setVoiceVolume: (id, v) => {
    audioEngine.setVoiceVolume(id, v);
    set((s) => ({
      active: s.active.map((a) => (a.id === id ? { ...a, volume: v } : a)),
    }));
  },

  setMasterVolume: (v) => {
    audioEngine.setMasterVolume(v);
    set({ masterVolume: v });
  },

  stopAll: () => {
    audioEngine.stopAll();
    ttsEngine.stop();
    set({ active: [], timerEndsAt: null, timerTotalMin: null });
    if (_tickInterval) {
      clearInterval(_tickInterval);
      _tickInterval = null;
    }
  },

  toggleStory: async (id, opts) => {
    const { tts } = get();
    if (tts.storyId === id) {
      ttsEngine.stop();
      return;
    }
    await ttsEngine.start(id, opts);
  },

  pauseStory: () => ttsEngine.pause(),
  resumeStory: () => ttsEngine.resume(),
  stopStory: () => ttsEngine.stop(),
  setStoryVolume: (v) => {
    ttsEngine.setVolume(v);
    set({ ttsVolume: v });
  },
  _setTtsStatus: (s) => set({ tts: s }),

  setTimer: (min) => {
    if (min == null) {
      set({ timerEndsAt: null, timerTotalMin: null });
      return;
    }
    set({
      timerEndsAt: Date.now() + min * 60 * 1000,
      timerTotalMin: min,
    });
  },

  tick: () => {
    const { timerEndsAt, active } = get();
    if (timerEndsAt && Date.now() >= timerEndsAt) {
      get().stopAll();
      return;
    }
    if (active.length === 0 && _tickInterval) {
      clearInterval(_tickInterval);
      _tickInterval = null;
    }
  },
}));

/** 工具：获取定时剩余分:秒 */
export function timerRemaining(endsAt: number): string {
  const sec = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
