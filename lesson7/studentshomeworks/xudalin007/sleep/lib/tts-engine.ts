// 浏览器 TTS 封装 - 朗读睡前故事
// 按段落朗读。故事本身已写成短句口语体，标点间 TTS 自然停顿。
// 不做逐句拆分（会引入人工停顿让声音更机械）。
// pitch 保持自然 1.0，rate 略慢但不拖。

"use client";

import { findStory } from "./stories";
import { findMeditation } from "./meditations";
import {
  getFullStoryAudio,
  bufferToAudio,
  CloudTTSError,
  synthesizeParagraph,
} from "./cloud-tts";
import {
  BROWSER_TTS_PARAGRAPH_GAP_MS,
  estimatedDurationSec,
  isPauseMarker,
  parsePauseMs,
} from "./spoken";

/**
 * 统一解析「可朗读内容」：先查睡前故事，再查冥想脚本。
 * 二者结构兼容（都有 id + paragraphs[]），共用 TTS 引擎。
 * 冥想 id 以 "med-" 前缀，与故事 id 不会碰撞。
 */
export interface SpokenContent {
  id: string;
  paragraphs: string[];
}
export function resolveSpoken(
  id: string | null | undefined,
): SpokenContent | undefined {
  return findStory(id) ?? findMeditation(id);
}

export function preferredTTSEngine(
  opts: Pick<TTSOptions, "useCloud"> = {},
): "cloud" | "browser" {
  return opts.useCloud ? "cloud" : "browser";
}

export interface TTSStatus {
  storyId: string | null;
  paragraphIdx: number;
  totalParagraphs: number;
  progress: number;
  currentTimeSec: number;
  durationSec: number;
  paused: boolean;
  /** 使用的引擎：cloud=OpenAI TTS（mp3），browser=Web Speech API */
  engine: "cloud" | "browser" | null;
  /** 云端正在合成时短暂为 true；UI 可显示 loading */
  loading: boolean;
  /** 云端调用失败的简短信息 */
  error?: string;
}

export interface TTSOptions {
  /** 是否使用云端 AI 朗读 */
  useCloud?: boolean;
  /** 引擎：aliyun=阿里云 / edge=Microsoft */
  engine?: "edge" | "aliyun";
  /** 云端语音名 */
  voice?: string;
  /** 语速 0.5-2.0，默认 0.95 */
  speed?: number;
}

// 重要：rate=1.0（自然），不降速。
// 系统语音（macOS Tingting 等）按自然语速调校，强行降速会让插值算法失真，反而"听不清不柔和"。
const DEFAULT_RATE = 1.0;
const DEFAULT_PITCH = 1.0;
const DEFAULT_VOLUME = 1.0;
const PARA_GAP_MS = BROWSER_TTS_PARAGRAPH_GAP_MS;

type Listener = (status: TTSStatus) => void;

class TTSEngine {
  private listeners = new Set<Listener>();
  private currentStoryId: string | null = null;
  private paragraphIdx = 0;
  private paused = false;
  private gapTimer: number | null = null;
  private pauseTimer: number | null = null;
  private cachedVoice: SpeechSynthesisVoice | null = null;
  private voicesReady = false;
  private volume = DEFAULT_VOLUME;
  // 云端 TTS 状态
  private currentOpts: TTSOptions = {};
  private currentEngine: "cloud" | "browser" | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioRevoke: (() => void) | null = null;
  private loading = false;
  private error?: string;
  private playbackProgress = 0;
  private currentTimeSec = 0;
  private durationSec = 0;

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.isSupported()) return [];
    if (this.voicesReady) return speechSynthesis.getVoices();
    return new Promise((resolve) => {
      const tryGet = () => {
        const v = speechSynthesis.getVoices();
        if (v.length > 0) { this.voicesReady = true; resolve(v); }
      };
      tryGet();
      if (!this.voicesReady) {
        const h = () => { tryGet(); if (this.voicesReady) speechSynthesis.removeEventListener("voiceschanged", h); };
        speechSynthesis.addEventListener("voiceschanged", h);
        setTimeout(() => { this.voicesReady = true; resolve(speechSynthesis.getVoices()); }, 1500);
      }
    });
  }

  async hasChineseVoice(): Promise<boolean> {
    const voices = await this.waitForVoices();
    return voices.some((v) => /zh|cmn/i.test(v.lang));
  }

  private async pickVoice(): Promise<SpeechSynthesisVoice | null> {
    if (this.cachedVoice) return this.cachedVoice;
    const voices = await this.waitForVoices();
    const scored = voices
      .filter((v) => /zh|cmn/i.test(v.lang))
      .map((v) => {
        let s = 0;
        if (v.lang === "zh-CN") s += 100;
        else if (v.lang.startsWith("zh")) s += 50;
        else s += 10;
        if (/female|girl|woman/i.test(v.name)) s += 20;
        if (/tingting|mei-jia|sin-ji|yuna/i.test(v.name)) s += 30;
        s += Math.min(v.name.length, 15);
        return { voice: v, score: s };
      })
      .sort((a, b) => b.score - a.score);
    this.cachedVoice = scored[0]?.voice ?? null;
    return this.cachedVoice;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private buildStatus(): TTSStatus {
    const totalParagraphs = this.currentStoryId
      ? (resolveSpoken(this.currentStoryId)?.paragraphs.length ?? 0)
      : 0;
    const paragraphProgress = totalParagraphs > 0
      ? (this.paragraphIdx / totalParagraphs) * 100
      : 0;
    const progress = Math.max(0, Math.min(100, Math.max(this.playbackProgress, paragraphProgress)));
    const currentTimeSec = this.currentTimeSec > 0
      ? this.currentTimeSec
      : this.durationSec * (progress / 100);

    return {
      storyId: this.currentStoryId,
      paragraphIdx: this.paragraphIdx,
      totalParagraphs,
      progress,
      currentTimeSec,
      durationSec: this.durationSec,
      paused: this.paused,
      engine: this.currentEngine,
      loading: this.loading,
      error: this.error,
    };
  }

  private emit() {
    const status = this.buildStatus();
    this.listeners.forEach((fn) => fn(status));
  }

  getStatus(): TTSStatus {
    return this.buildStatus();
  }

  async start(storyId: string, opts: TTSOptions = {}) {
    if (!this.isSupported() && !opts.useCloud) return;
    this.stop();
    const story = resolveSpoken(storyId);
    if (!story) return;
    this.currentStoryId = storyId;
    this.paragraphIdx = 0;
    this.paused = false;
    this.currentOpts = opts;
    this.playbackProgress = 0;
    this.currentTimeSec = 0;
    this.durationSec = estimatedDurationSec(story.paragraphs);
    const hasTimedPauses = story.paragraphs.some(isPauseMarker);
    this.currentEngine = preferredTTSEngine(opts);
    this.error = undefined;
    this.emit();

    // 云端引擎：整篇故事合成/缓存为一个完整 mp3，一次播放
    if (this.currentEngine === "cloud") {
      if (hasTimedPauses) {
        await this.speakCloudSequence();
        return;
      }
      this.loading = true;
      this.emit();
      try {
        const engine = opts.engine ?? "aliyun";
        const voice = opts.voice ?? (engine === "aliyun" ? "default" : "zh-CN-XiaoxiaoNeural");
        const speed = opts.speed ?? 0.95;
        const fullBuf = await getFullStoryAudio({
          storyId,
          paragraphCount: story.paragraphs.length,
          paragraphs: story.paragraphs,
          voice,
          engine: engine as "edge" | "aliyun",
          speed,
        });
        if (this.paused || this.currentStoryId !== storyId) { this.loading = false; this.emit(); return; }
        this.loading = false;
        this.emit();
        const { audio, revoke } = bufferToAudio(fullBuf);
        audio.volume = this.volume;
        this.currentAudio = audio;
        this.currentAudioRevoke = revoke;
        const syncAudioProgress = () => {
          if (this.currentStoryId !== storyId) return;
          const duration = Number.isFinite(audio.duration) ? audio.duration : this.durationSec;
          const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
          this.durationSec = duration;
          this.currentTimeSec = currentTime;
          this.playbackProgress = duration > 0
            ? Math.min(100, (currentTime / duration) * 100)
            : 0;
          this.emit();
        };
        audio.onloadedmetadata = syncAudioProgress;
        audio.ontimeupdate = syncAudioProgress;
        audio.onplay = syncAudioProgress;
        audio.onended = () => {
          if (this.currentAudioRevoke) { this.currentAudioRevoke(); this.currentAudioRevoke = null; }
          if (this.paused || this.currentStoryId !== storyId) return;
          this.stop();
        };
        audio.onerror = () => this.stop();
        try { await audio.play(); } catch { this.stop(); }
      } catch (e) {
        this.loading = false;
        if (e instanceof CloudTTSError) {
          this.error = e.status === 503 ? "服务端未配置 TTS 凭证" :
                       e.status === 401 ? "TTS 鉴权失败" :
                       e.message;
        } else {
          this.error = "网络错误，请检查连接";
        }
        this.emit();
        return;
      }
      return;
    }

    // 浏览器引擎：段落式逐段朗读
    if (this.currentEngine === "browser") {
      await this.pickVoice();
    }
    await this.speakParagraph();
  }

  private async speakParagraph() {
    if (this.paused || !this.currentStoryId) return;
    const story = resolveSpoken(this.currentStoryId);
    if (!story) { this.stop(); return; }
    const text = story.paragraphs[this.paragraphIdx];
    if (text == null) { this.stop(); return; }

    const pauseMs = parsePauseMs(text);
    if (pauseMs != null) {
      this.pauseTimer = window.setTimeout(() => {
        this.pauseTimer = null;
        if (this.paused || !this.currentStoryId) return;
        this.paragraphIdx += 1;
        this.emit();
        if (this.paragraphIdx >= story.paragraphs.length) { this.stop(); return; }
        void this.speakParagraph();
      }, pauseMs);
      return;
    }

    // 浏览器路径
    this.speakBrowser(text, story.paragraphs.length);
  }

  private releaseAudio() {
    if (this.currentAudioRevoke) { this.currentAudioRevoke(); this.currentAudioRevoke = null; }
    this.currentAudio = null;
  }

  private async speakCloudSequence() {
    if (this.paused || !this.currentStoryId) return;
    const story = resolveSpoken(this.currentStoryId);
    if (!story) { this.stop(); return; }
    const text = story.paragraphs[this.paragraphIdx];
    if (text == null) { this.stop(); return; }

    const pauseMs = parsePauseMs(text);
    if (pauseMs != null) {
      this.pauseTimer = window.setTimeout(() => {
        this.pauseTimer = null;
        if (this.paused || !this.currentStoryId) return;
        this.paragraphIdx += 1;
        this.emit();
        if (this.paragraphIdx >= story.paragraphs.length) { this.stop(); return; }
        void this.speakCloudSequence();
      }, pauseMs);
      return;
    }

    this.loading = true;
    this.emit();
    try {
      const engine = this.currentOpts.engine ?? "aliyun";
      const voice = this.currentOpts.voice ?? (engine === "aliyun" ? "default" : "zh-CN-XiaoxiaoNeural");
      const speed = this.currentOpts.speed ?? 0.95;
      const buf = await synthesizeParagraph({
        storyId: story.id,
        paragraphIdx: this.paragraphIdx,
        text,
        voice,
        engine,
        speed,
      });
      if (this.paused || this.currentStoryId !== story.id) {
        this.loading = false;
        this.emit();
        return;
      }
      this.loading = false;
      this.emit();
      this.releaseAudio();
      const { audio, revoke } = bufferToAudio(buf);
      audio.volume = this.volume;
      this.currentAudio = audio;
      this.currentAudioRevoke = revoke;
      const syncAudioProgress = () => {
        if (this.currentStoryId !== story.id) return;
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
        const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        const fraction = duration > 0 ? Math.min(1, currentTime / duration) : 0;
        const total = story.paragraphs.length || 1;
        this.playbackProgress = Math.min(100, ((this.paragraphIdx + fraction) / total) * 100);
        this.currentTimeSec = this.durationSec * (this.playbackProgress / 100);
        this.emit();
      };
      audio.onloadedmetadata = syncAudioProgress;
      audio.ontimeupdate = syncAudioProgress;
      audio.onplay = syncAudioProgress;
      audio.onended = () => {
        this.releaseAudio();
        if (this.paused || this.currentStoryId !== story.id) return;
        this.paragraphIdx += 1;
        this.emit();
        if (this.paragraphIdx >= story.paragraphs.length) { this.stop(); return; }
        this.gapTimer = window.setTimeout(() => { if (!this.paused) void this.speakCloudSequence(); }, PARA_GAP_MS);
      };
      audio.onerror = () => this.stop();
      try { await audio.play(); } catch { this.stop(); }
    } catch (e) {
      this.loading = false;
      if (e instanceof CloudTTSError) {
        this.error = e.status === 503 ? "服务端未配置 TTS 凭证" :
                     e.status === 401 ? "TTS 鉴权失败" :
                     e.message;
      } else {
        this.error = "网络错误，请检查连接";
      }
      this.emit();
    }
  }


  /** 浏览器原生 TTS */
  private speakBrowser(text: string, totalParas: number) {
    if (!this.isSupported()) { this.stop(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    if (this.cachedVoice) u.voice = this.cachedVoice;
    u.rate = DEFAULT_RATE;
    u.pitch = DEFAULT_PITCH;
    u.volume = this.volume;
    u.onend = () => {
      if (this.paused || !this.currentStoryId) return;
      this.paragraphIdx += 1;
      this.emit();
      if (this.paragraphIdx >= totalParas) { this.stop(); return; }
      this.gapTimer = window.setTimeout(() => { if (!this.paused) void this.speakParagraph(); }, PARA_GAP_MS);
    };
    u.onerror = () => this.stop();
    try { speechSynthesis.speak(u); } catch { this.stop(); }
  }

  pause() {
    if (!this.currentStoryId) return;
    this.paused = true;
    if (this.currentEngine === "cloud") {
      try { this.currentAudio?.pause(); } catch {}
    } else {
      try { speechSynthesis.pause(); } catch {}
    }
    if (this.gapTimer) { clearTimeout(this.gapTimer); this.gapTimer = null; }
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null; }
    this.emit();
  }

  resume() {
    if (!this.currentStoryId) return;
    this.paused = false;
    if (this.currentEngine === "cloud" && this.currentAudio) {
      void this.currentAudio.play().catch(() => {});
    } else if (this.currentEngine === "cloud") {
      if (!this.loading) void this.speakCloudSequence();
    } else if (this.isSupported() && speechSynthesis.paused) {
      try { speechSynthesis.resume(); } catch {}
    } else {
      void this.speakParagraph();
    }
    this.emit();
  }

  stop() {
    if (this.gapTimer) { clearTimeout(this.gapTimer); this.gapTimer = null; }
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null; }
    if (this.isSupported()) { try { speechSynthesis.cancel(); } catch {} }
    if (this.currentAudio) {
      try { this.currentAudio.pause(); } catch {}
    }
    this.releaseAudio();
    this.currentStoryId = null;
    this.paragraphIdx = 0;
    this.paused = false;
    this.currentEngine = null;
    this.loading = false;
    this.error = undefined;
    this.playbackProgress = 0;
    this.currentTimeSec = 0;
    this.durationSec = 0;
    this.emit();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.currentAudio) this.currentAudio.volume = this.volume;
  }
  getVolume(): number { return this.volume; }
}

export const ttsEngine = new TTSEngine();
