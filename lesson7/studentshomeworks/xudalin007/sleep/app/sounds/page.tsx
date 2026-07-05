"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { useAudioStore } from "@/lib/audio-store";
import { authHref } from "@/lib/auth-links";
import { audioEngine, hasRecorded, prefetchRecordedAvailability, type SoundId } from "@/lib/audio-engine";
import { canUseSound } from "@/lib/sound-access";
import {
  SOUND_CATEGORIES,
  SOUNDS,
  findSound,
  type SoundCategory,
} from "@/lib/sound-catalog";
import { STORIES, findStory } from "@/lib/stories";
import { ttsEngine } from "@/lib/tts-engine";
import { Card } from "@/components/ui/Card";
import { LoginRequired } from "@/components/LoginRequired";

type Tab = "all" | SoundCategory | "stories" | "favorites";

function formatTime(sec: number): string {
  const safe = Math.max(0, Math.round(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 基于最近一份日记推荐一条声音 */
function pickRecommended(lastDiary: { moodTags?: string[]; wakeCount: number; subjectiveQuality: number } | null): SoundId {
  if (!lastDiary) return "rain";
  const moods = lastDiary.moodTags ?? [];
  if (moods.includes("anxious") || moods.includes("stressed")) return "rain";
  if (lastDiary.wakeCount >= 2) return "brown";
  if (moods.includes("low")) return "fire";
  if (lastDiary.subjectiveQuality <= 2) return "ocean";
  return "pink";
}

export default function SoundsPage() {
  useHydrated(); // 确保 hydration 完成
  const diaries = useStore((s) => s.diaries);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);
  const favorites = useStore((s) => s.favoriteSounds);
  const recents = useStore((s) => s.recentSounds);
  const settings = useStore((s) => s.settings);
  const toggleFav = useStore((s) => s.toggleFavoriteSound);
  const trackRecent = useStore((s) => s.trackRecentSound);

  const active = useAudioStore((s) => s.active);
  const toggle = useAudioStore((s) => s.toggle);
  const setVoiceVolume = useAudioStore((s) => s.setVoiceVolume);
  const tts = useAudioStore((s) => s.tts);
  const ttsVolume = useAudioStore((s) => s.ttsVolume);
  const toggleStory = useAudioStore((s) => s.toggleStory);
  const pauseStory = useAudioStore((s) => s.pauseStory);
  const resumeStory = useAudioStore((s) => s.resumeStory);
  const setStoryVolume = useAudioStore((s) => s.setStoryVolume);

  const [tab, setTab] = useState<Tab>("all");
  const [supported] = useState(() =>
    typeof window === "undefined" ? true : audioEngine.isSupported(),
  );
  const [, forceRerender] = useState(0);
  const [probeReady, setProbeReady] = useState(false);
  useEffect(() => {
    void prefetchRecordedAvailability(SOUNDS.map((s) => s.id)).then(() => {
      setProbeReady(true);
      forceRerender((n) => n + 1);
    });
  }, []);

  // 自然声列表（不含纯色噪音 white/pink/brown）—— 这 5 条才期望有真实录音
  const naturalSounds = ["rain", "ocean", "forest", "fire", "fan"] as const;
  const recordedNaturalCount = naturalSounds.filter((id) => hasRecorded(id) === true).length;
  const showFetchBanner = probeReady && recordedNaturalCount < naturalSounds.length;
  const [ttsSupported, setTtsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  useEffect(() => {
    if (!account) {
      setTtsSupported(null);
      return;
    }
    if (!ttsEngine.isSupported()) { setTtsSupported(false); return; }
    ttsEngine.hasChineseVoice().then(setTtsSupported);
  }, [account]);

  const lastDiary = useMemo(() => {
    if (diaries.length === 0) return null;
    return [...diaries].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [diaries]);

  const recommended = useMemo(() => pickRecommended(lastDiary), [lastDiary]);

  const visible = (() => {
    if (tab === "all") return SOUNDS;
    if (tab === "favorites")
      return SOUNDS.filter((s) => favorites.includes(s.id));
    return SOUNDS.filter((s) => s.category === tab);
  })();

  const isPlaying = (id: SoundId) => active.some((v) => v.id === id);
  const volumeOf = (id: SoundId) =>
    active.find((v) => v.id === id)?.volume ?? 0;

  const onToggle = async (id: SoundId) => {
    const sound = findSound(id);
    if (sound && !canUseSound(sound, !!account)) {
      window.location.href = authHref("login", "/sounds");
      return;
    }
    await toggle(id);
    if (!isPlaying(id)) {
      // 之前没在播 → 现在开始播，记录最近播放
      await trackRecent(id);
    }
  };

  if (!supported) {
    return (
      <div className="px-5 pt-10 pb-12 space-y-3">
        <h1 className="text-2xl font-medium">助眠声音</h1>
        <Card className="text-ink-500 dark:text-ink-300">
          你的浏览器不支持 Web Audio API，无法在此设备上合成声音。请用最新版
          Chrome / Safari / Edge 试试。
        </Card>
      </div>
    );
  }

  const recSound = findSound(recommended);
  const recommendedLocked = !!recSound && !canUseSound(recSound, !!account);

  return (
    <div className="px-5 pt-10 pb-32 space-y-5">
      <header>
        <h1 className="text-2xl font-medium">助眠声音</h1>
        <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">
          5 条自然声使用真实环境录音；3 条纯色噪音端侧合成。最多可同时混 3 轨。
        </p>
      </header>

      {/* 录音未就位提示 */}
      {showFetchBanner && (
        <div className="rounded-soft p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-sm leading-relaxed text-ink-700 dark:text-ink-100">
          <div className="font-medium mb-1">⚡ 自然声当前使用合成版本</div>
          <div className="text-ink-500 dark:text-ink-300">
            还有 {naturalSounds.length - recordedNaturalCount} 条声音未下载真实录音。在项目根目录运行：
            <code className="block mt-2 px-2 py-1 rounded bg-ink-100 dark:bg-ink-700 font-mono text-xs">
              npm run fetch-sounds
            </code>
            <div className="mt-2">下载约 30 MB CC0 录音，下载后刷新页面即可生效（雨/海浪/森林/篝火/风扇 5 条）。</div>
          </div>
        </div>
      )}

      {/* 今晚推荐 */}
      {recSound && (
        <section className="space-y-2">
          <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
            今晚的推荐
          </div>
          <button
            onClick={() => onToggle(recSound.id)}
            className="w-full text-left"
          >
            <Card
              className={clsx(
                "transition border-l-4",
                recommendedLocked && "opacity-60",
                isPlaying(recSound.id)
                  ? "border-l-score-high bg-moon-50 dark:bg-moon-700/30"
                  : "border-l-moon-300",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{recSound.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{recSound.title}</div>
                  <div className="text-sm text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">
                    {recSound.desc}
                  </div>
                  <div className="text-xs text-moon-600 dark:text-moon-200 mt-2">
                    {recommendedLocked
                      ? "登录后可播放"
                      : lastDiary
                      ? "基于你昨晚的记录推荐"
                      : "新用户的默认推荐"}
                  </div>
                </div>
                <div className="text-xl">
                  {recommendedLocked ? "🔒" : isPlaying(recSound.id) ? "▮▮" : "▶"}
                </div>
              </div>
            </Card>
          </button>
        </section>
      )}

      {/* 最近播放 */}
      {recents.length > 0 && (
        <section className="space-y-2">
          <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
            最近播放
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {recents
              .map((id) => findSound(id as SoundId))
              .filter((s): s is NonNullable<typeof s> => !!s)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => onToggle(s.id)}
                  className={clsx(
                    "flex-shrink-0 px-3 py-2 rounded-soft border text-sm",
                    !canUseSound(s, !!account) && "opacity-60",
                    isPlaying(s.id)
                      ? "bg-moon-50 border-moon-300 text-moon-700 dark:bg-moon-700/40 dark:text-moon-100"
                      : "bg-white border-ink-200 dark:bg-ink-800 dark:border-ink-700",
                  )}
                >
                  <span className="mr-1">{s.icon}</span>
                  {s.title}
                </button>
              ))}
          </div>
        </section>
      )}

      {/* 分类 Tab */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        {(
          [
            { id: "all", label: "全部" },
            ...SOUND_CATEGORIES,
            { id: "stories", label: "📖 故事" },
            { id: "favorites", label: "★ 收藏" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "px-4 py-1.5 rounded-pill text-sm whitespace-nowrap",
              tab === t.id
                ? "bg-moon-500 text-white dark:bg-moon-300 dark:text-ink-900"
                : "bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 故事列表 */}
      {tab === "stories" && (
        <div className="space-y-3">
          {!account && (
            <>
              <LoginRequired body="睡前故事需要登录后使用。匿名模式可继续使用环境声、噪音和轻音乐。" />
              {STORIES.map((s) => (
                <Card key={s.id} className="opacity-50">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{s.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300">
                          登录后可用
                        </span>
                      </div>
                      <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                        {s.subtitle} · 约 {s.estMinutes} 分钟
                      </div>
                      <div className="text-sm text-ink-500 dark:text-ink-300 mt-1.5 leading-relaxed">
                        {s.paragraphs[0]?.slice(0, 70)}…
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
          {account && ttsSupported === false && (
            <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 text-sm leading-relaxed text-amber-500 dark:text-amber-100">
              你的设备未安装中文语音库，浏览器朗读暂不可用。
              你仍然可以下面静默阅读这些故事；真人录制版本会在 V2 上线。
            </Card>
          )}
          {account && ttsSupported && (
            <Card className="bg-moon-50 dark:bg-moon-700/30 border-moon-200 dark:border-moon-700 text-sm leading-relaxed text-ink-700 dark:text-ink-100">
              {settings.cloudTTSEnabled
                ? (settings.ttsCloudEngine ?? "aliyun") === "aliyun"
                  ? "使用阿里云 CosyVoice 高保真语音朗读。首次合成需联网，结果会缓存到本地，之后可离线播放。故事可以和上面的环境声叠加（雨声 + 故事）。"
                  : "使用 Edge TTS 免费语音朗读。首次合成需联网，结果会缓存到本地，之后可离线播放。故事可以和上面的环境声叠加（雨声 + 故事）。"
                : "使用浏览器系统语音朗读，慢速 + 低音调更助眠。故事可以和上面的环境声叠加（雨声 + 故事）。"}
            </Card>
          )}
          {account && STORIES.map((s) => {
            const isCurrent = tts.storyId === s.id;
            const progress = isCurrent ? tts.progress : 0;
            return (
              <Card
                key={s.id}
                className={clsx(
                  "transition",
                  isCurrent && "bg-moon-50 dark:bg-moon-700/30",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                      {s.subtitle} · 约 {s.estMinutes} 分钟
                    </div>
                    {isCurrent ? (
                      <div className="mt-3 space-y-2">
                        <div className="text-sm text-ink-700 dark:text-ink-100 leading-relaxed italic">
                          &ldquo;{s.paragraphs[Math.min(tts.paragraphIdx, s.paragraphs.length - 1)]?.slice(0, 80)}…&rdquo;
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-400 dark:text-ink-300">
                          <span>第 {tts.paragraphIdx + 1} / {tts.totalParagraphs} 段</span>
                          {tts.engine === "cloud" && <span className="text-score-high">· AI 朗读</span>}
                          {tts.loading && <span className="text-moon-600 dark:text-moon-200">· 合成中…</span>}
                        </div>
                        {tts.error && (
                          <div className="text-xs text-amber-500 dark:text-amber-100">
                            ⚠ {tts.error}，已切换到浏览器朗读
                          </div>
                        )}
                        <div className="h-1 bg-ink-100 dark:bg-ink-700 rounded-full">
                          <div
                            className="h-1 bg-moon-400 dark:bg-moon-300 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-ink-400 dark:text-ink-300">
                          <span>{formatTime(tts.currentTimeSec)}</span>
                          <span>{formatTime(tts.durationSec)}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() =>
                              tts.paused ? resumeStory() : pauseStory()
                            }
                            className="px-3 py-1.5 rounded-pill text-xs bg-moon-500 text-white dark:bg-moon-300 dark:text-ink-900"
                          >
                            {tts.paused ? "继续" : "暂停"}
                          </button>
                          <button
                            onClick={() => toggleStory(s.id)}
                            className="px-3 py-1.5 rounded-pill text-xs bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-200"
                          >
                            停止
                          </button>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-ink-400">音量</span>
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
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-ink-500 dark:text-ink-300 mt-1.5 leading-relaxed">
                          {s.paragraphs[0]?.slice(0, 70)}…
                        </div>
                        <div className="mt-3 flex gap-2 items-center">
                          <button
                            onClick={() => toggleStory(s.id, { useCloud: true, engine: settings.ttsCloudEngine ?? "aliyun", voice: settings.ttsCloudVoice ?? "default", speed: 0.95 })}
                            disabled={ttsSupported === false && !settings.cloudTTSEnabled}
                            className="px-4 py-1.5 rounded-pill text-sm bg-moon-500 text-white dark:bg-moon-300 dark:text-ink-900 disabled:opacity-50"
                          >
                            朗读
                          </button>
                          {settings.cloudTTSEnabled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-score-high/20 text-score-high">
                              AI 朗读
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 声音列表 */}
      {tab !== "stories" && (
      <div className="space-y-3">
        {visible.length === 0 && (
          <Card className="text-center py-8 text-ink-400 dark:text-ink-300">
            {tab === "favorites" ? "还没有收藏的声音" : "没有声音"}
          </Card>
        )}
        {visible.map((s) => {
          const playing = isPlaying(s.id);
          const vol = volumeOf(s.id);
          const isFav = favorites.includes(s.id);
          const locked = !canUseSound(s, !!account);
          return (
            <Card
              key={s.id}
              className={clsx(
                "transition",
                locked && "opacity-60",
                playing && "bg-moon-50 dark:bg-moon-700/30",
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggle(s.id)}
                  className="text-3xl flex-shrink-0"
                  aria-label={locked ? "登录后可播放" : playing ? "停止" : "播放"}
                >
                  {locked ? "🔒" : playing ? "■" : s.icon}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{s.title}</span>
                    {locked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300">
                        登录后可用
                      </span>
                    )}
                    {hasRecorded(s.id) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-score-high/20 text-score-high">
                        真实录音
                      </span>
                    )}
                    {/* 仅对自然声显示"合成"灰标；纯色噪音本就该合成，不标 */}
                    {hasRecorded(s.id) === false && s.category !== "white-noise" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-100">
                        合成兜底
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (locked) {
                          window.location.href = authHref("login", "/sounds");
                          return;
                        }
                        void toggleFav(s.id);
                      }}
                      className={clsx(
                        "text-sm transition",
                        isFav
                          ? "text-amber-300"
                          : "text-ink-300 dark:text-ink-600",
                      )}
                      aria-label="收藏"
                    >
                      ★
                    </button>
                  </div>
                  <div className="text-sm text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">
                    {s.desc}
                  </div>
                  {locked && (
                    <div className="mt-2 text-xs text-ink-400 dark:text-ink-300">
                      匿名模式每类可试听 1 个声音，登录后解锁全部。
                    </div>
                  )}
                  {playing && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-ink-400">音量</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={vol}
                        onChange={(e) =>
                          setVoiceVolume(s.id, Number(e.target.value))
                        }
                        className="flex-1 accent-moon-500 dark:accent-moon-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}

      <p className="text-xs text-ink-400 dark:text-ink-300 leading-relaxed">
        点击图标开始播放；再次点击停止。同时最多 3
        轨，超过会自动移除最早的一轨。底部播放条可调主音量与定时关闭。
      </p>
    </div>
  );
}
