"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAudioStore, timerRemaining } from "@/lib/audio-store";
import { findSound } from "@/lib/sound-catalog";
import { TIMER_OPTIONS } from "@/lib/sound-catalog";
import { findStory } from "@/lib/stories";

/**
 * 固定在 BottomNav 上方的精简播放条。
 * 当有声音在播放时显示；否则隐藏。
 */
export function MiniPlayer() {
  const path = usePathname();
  const active = useAudioStore((s) => s.active);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const timerEndsAt = useAudioStore((s) => s.timerEndsAt);
  const setTimer = useAudioStore((s) => s.setTimer);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);
  const stopAll = useAudioStore((s) => s.stopAll);
  const tts = useAudioStore((s) => s.tts);
  const ttsVolume = useAudioStore((s) => s.ttsVolume);
  const pauseStory = useAudioStore((s) => s.pauseStory);
  const resumeStory = useAudioStore((s) => s.resumeStory);
  const stopStory = useAudioStore((s) => s.stopStory);
  const setStoryVolume = useAudioStore((s) => s.setStoryVolume);

  const [showTimer, setShowTimer] = useState(false);
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timerEndsAt) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [timerEndsAt]);

  const story = findStory(tts.storyId);
  if (active.length === 0 && !story) return null;
  if (path.startsWith("/onboarding") || path.startsWith("/practice/breathing"))
    return null;

  const titles = [
    ...active.map((v) => findSound(v.id)?.title ?? v.id),
    ...(story ? [`📖 ${story.title}`] : []),
  ].join(" + ");
  const progress = Math.max(0, Math.min(100, tts.progress));

  return (
    <div className="fixed bottom-[72px] inset-x-0 z-30 px-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-soft shadow-soft p-3 space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-xl">♪</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{titles}</div>
              <div className="text-xs text-ink-400 dark:text-ink-300">
                {active.length > 0 && `${active.length} 轨`}
                {story &&
                  `${active.length > 0 ? " · " : ""}故事 ${tts.paragraphIdx + 1}/${tts.totalParagraphs}${tts.paused ? "（已暂停）" : ""}`}
                {timerEndsAt && ` · 定时 ${timerRemaining(timerEndsAt)}`}
              </div>
            </div>
            {story && (
              <button
                onClick={() => (tts.paused ? resumeStory() : pauseStory())}
                className="px-3 py-1 rounded-pill text-xs bg-moon-500 text-white dark:bg-moon-300 dark:text-ink-900"
              >
                {tts.paused ? "继续" : "暂停"}
              </button>
            )}
            <button
              onClick={() => setShowTimer((v) => !v)}
              className={clsx(
                "px-3 py-1.5 rounded-pill text-xs font-medium inline-flex items-center gap-1 ring-1 transition-colors",
                timerEndsAt
                  ? "bg-amber-100 text-amber-500 ring-amber-200 dark:bg-amber-500/25 dark:text-amber-100 dark:ring-amber-400/40"
                  : "bg-moon-50 text-moon-600 ring-moon-100 hover:bg-moon-100 dark:bg-moon-700/30 dark:text-moon-100 dark:ring-moon-500/40",
              )}
              aria-label={timerEndsAt ? `定时剩余 ${timerRemaining(timerEndsAt)}` : "设置定时"}
            >
              <span aria-hidden>⏱</span>
              <span>{timerEndsAt ? timerRemaining(timerEndsAt) : "定时"}</span>
            </button>
            <button
              onClick={() => {
                if (active.length > 0) stopAll();
                if (story) stopStory();
              }}
              className="px-3 py-1 rounded-pill text-xs bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-200"
            >
              停止
            </button>
          </div>

          {story && (
            <div className="space-y-1">
              <div className="h-1 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-moon-400 dark:bg-moon-300 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-ink-400 dark:text-ink-300">
                <span>{formatTime(tts.currentTimeSec)}</span>
                <span>{formatTime(tts.durationSec)}</span>
              </div>
            </div>
          )}

          {story && (
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-ink-400">故事音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={ttsVolume}
                onChange={(e) => setStoryVolume(Number(e.target.value))}
                className="flex-1 accent-moon-500 dark:accent-moon-300"
              />
            </div>
          )}

          {active.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-ink-400">环境音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="flex-1 accent-moon-500 dark:accent-moon-300"
              />
            </div>
          )}

          {showTimer && (
            <div className="pt-1 border-t border-ink-100 dark:border-ink-700 space-y-2">
              <div className="text-xs text-ink-500 dark:text-ink-300">
                定时关闭（最后 5 秒淡出）
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTimer(opt.value);
                      setShowTimer(false);
                    }}
                    className="px-2 py-1.5 rounded-md text-xs bg-ink-50 dark:bg-ink-700 hover:bg-moon-50 dark:hover:bg-moon-700/40"
                  >
                    {opt.value} 分
                  </button>
                ))}
              </div>
              {timerEndsAt && (
                <button
                  onClick={() => {
                    setTimer(null);
                    setShowTimer(false);
                  }}
                  className="w-full text-sm font-medium text-amber-500 dark:text-amber-100 py-2 rounded-md bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 ring-1 ring-amber-200 dark:ring-amber-400/40 transition-colors"
                >
                  ✕ 取消定时（剩余 {timerRemaining(timerEndsAt)}）
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number): string {
  const safe = Math.max(0, Math.round(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
