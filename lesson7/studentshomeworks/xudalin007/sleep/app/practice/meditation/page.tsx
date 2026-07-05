"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAudioStore } from "@/lib/audio-store";
import { uid } from "@/lib/uid";
import { Button } from "@/components/ui/Button";
import { findMeditation } from "@/lib/meditations";
import { ttsEngine } from "@/lib/tts-engine";
import { LoginRequired } from "@/components/LoginRequired";
import { canUseRelaxationPractice } from "@/lib/practice-access";

function MeditationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useStore((s) => s.profile);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);
  const addPractice = useStore((s) => s.addPractice);
  const settings = useStore((s) => s.settings);

  const med = useMemo(() => findMeditation(params.get("m")), [params]);

  const tts = useAudioStore((s) => s.tts);
  const toggleStory = useAudioStore((s) => s.toggleStory);
  const pauseStory = useAudioStore((s) => s.pauseStory);
  const resumeStory = useAudioStore((s) => s.resumeStory);
  const stopStory = useAudioStore((s) => s.stopStory);

  const [phase, setPhase] = useState<"prep" | "playing" | "done">("prep");
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const recordedRef = useRef(false);

  const isCurrent = !!med && tts.storyId === med.id;

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  // 计时
  useEffect(() => {
    if (phase !== "playing") return;
    const i = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [phase]);

  const record = (completed: boolean) => {
    if (recordedRef.current) return;
    if (!med || !profile || !startedAtRef.current || elapsed < 20) return;
    recordedRef.current = true;
    addPractice({
      sessionId: uid(),
      userId: profile.userId,
      type: med.kind === "pmr" ? "pmr" : "meditation",
      contentId: med.id,
      startedAt: new Date(startedAtRef.current).toISOString(),
      durationSec: elapsed,
      completed,
    });
  };

  // 播放自然结束：引擎播完后会把 storyId 置空
  useEffect(() => {
    if (phase === "playing" && !isCurrent && !tts.loading && elapsed > 2) {
      record(true);
      setPhase("done");
    }
  }, [phase, isCurrent, tts.loading, elapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  // 离开页面时停掉朗读
  useEffect(() => {
    return () => {
      ttsEngine.stop();
    };
  }, []);

  if (!med) {
    return (
      <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-ink-400">没有找到这个练习。</p>
        <Button variant="ghost" onClick={() => router.replace("/practice")}>
          返回
        </Button>
      </div>
    );
  }

  if (!accountLoaded) {
    return <div className="px-5 pt-12 text-ink-400">检查账户状态…</div>;
  }

  if (!canUseRelaxationPractice("meditation", !!account)) {
    return (
      <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-5xl">{med.icon}</div>
        <div>
          <div className="text-sm text-ink-400">{med.subtitle}</div>
          <h1 className="text-2xl font-medium mt-1">{med.title}</h1>
        </div>
        <LoginRequired body="冥想练习需要登录后使用。登录后会自动回到这个练习。" />
        <Button variant="ghost" onClick={() => router.replace("/practice")}>
          返回训练
        </Button>
      </div>
    );
  }

  const start = async () => {
    recordedRef.current = false;
    setElapsed(0);
    startedAtRef.current = Date.now();
    setPhase("playing");
    await toggleStory(med.id, {
      useCloud: settings.cloudTTSEnabled,
      engine: settings.ttsCloudEngine ?? "aliyun",
      voice: settings.ttsCloudVoice ?? "default",
      speed: 0.95,
    });
  };

  const finish = () => {
    record(false);
    stopStory();
    router.back();
  };

  // 完成页
  if (phase === "done") {
    return (
      <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-5xl">🌙</div>
        <h1 className="text-2xl font-medium">今晚也辛苦了</h1>
        <p className="text-base text-ink-500 dark:text-ink-200 leading-relaxed max-w-xs">
          身体已经慢下来了。如果还醒着，可以闭上眼睛，继续跟着呼吸。
        </p>
        <div className="space-y-2 w-full max-w-xs">
          <Button block onClick={start}>
            再听一次
          </Button>
          <Button block variant="ghost" onClick={() => router.replace("/")}>
            回首页
          </Button>
        </div>
      </div>
    );
  }

  // 准备页
  if (phase === "prep") {
    return (
      <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-5xl">{med.icon}</div>
        <div>
          <div className="text-sm text-ink-400">{med.subtitle}</div>
          <h1 className="text-2xl font-medium mt-1">{med.title}</h1>
        </div>
        <p className="text-base text-ink-500 dark:text-ink-200 leading-relaxed max-w-xs">
          找一个舒服的姿势，把手机放在够得到的地方。约 {med.estMinutes} 分钟。
        </p>
        <div className="space-y-2 w-full max-w-xs">
          <Button block size="lg" onClick={start}>
            开始
          </Button>
          <Button block variant="ghost" onClick={() => router.back()}>
            返回
          </Button>
        </div>
        {!settings.cloudTTSEnabled && (
          <p className="text-xs text-ink-400 max-w-xs">
            当前使用浏览器语音朗读。可在「设置 · AI 朗读」开启更自然的云端语音。
          </p>
        )}
      </div>
    );
  }

  // 播放页
  const total = tts.totalParagraphs || med.paragraphs.length;
  const progress = total > 0 ? Math.min(1, (tts.paragraphIdx + 1) / total) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="min-h-dvh px-6 flex flex-col items-center justify-between py-12">
      <div className="text-sm text-ink-400 dark:text-ink-300 text-center">
        {med.title}
        <div className="text-xs mt-1">已进行 {mm}:{ss}</div>
      </div>

      {/* 呼吸式光球 */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-moon-300/40 to-moon-500/30 dark:from-moon-400/30 dark:to-moon-700/40 animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-moon-200/50 to-moon-400/40 dark:from-moon-300/20 dark:to-moon-600/30" />
          <div className="relative text-4xl">{med.icon}</div>
        </div>

        {tts.loading ? (
          <div className="text-sm text-ink-400">正在准备语音…</div>
        ) : tts.error ? (
          <div className="text-sm text-amber-500 text-center max-w-xs">
            {tts.error}
            <div className="text-xs text-ink-400 mt-1">
              可在设置里关闭 AI 朗读，改用浏览器语音。
            </div>
          </div>
        ) : (
          <div className="w-48">
            <div className="h-1 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
              <div
                className="h-full bg-moon-400 transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="text-xs text-ink-400 text-center mt-2">
              第 {Math.min(tts.paragraphIdx + 1, total)} / {total} 段
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        {!tts.loading && !tts.error && (
          <Button
            block
            variant="outline"
            onClick={() => (tts.paused ? resumeStory() : pauseStory())}
          >
            {tts.paused ? "继续" : "暂停"}
          </Button>
        )}
        <Button block variant="ghost" onClick={finish}>
          结束
        </Button>
      </div>
    </div>
  );
}

export default function MeditationPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-12 text-ink-400">载入中…</div>}>
      <MeditationInner />
    </Suspense>
  );
}
