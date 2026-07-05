"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/uid";
import { BreathingOrb } from "@/components/BreathingOrb";
import { Button } from "@/components/ui/Button";
import { findMethod } from "@/lib/breathing";
import { LoginRequired } from "@/components/LoginRequired";
import { canUseRelaxationPractice } from "@/lib/practice-access";

function BreathingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useStore((s) => s.profile);
  const addPractice = useStore((s) => s.addPractice);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);

  const method = useMemo(
    () => findMethod(params.get("m")),
    [params],
  );

  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 秒
  const startedAtRef = useRef<number | null>(null);
  const targetSec = method.defaultMin * 60;

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [running]);

  useEffect(() => {
    if (running && elapsed >= targetSec && !completed) {
      setCompleted(true);
      setRunning(false);
      if (profile && startedAtRef.current) {
        addPractice({
          sessionId: uid(),
          userId: profile.userId,
          type: "breathing",
          contentId: method.id,
          startedAt: new Date(startedAtRef.current).toISOString(),
          durationSec: elapsed,
          completed: true,
        });
      }
    }
  }, [running, elapsed, completed, profile, addPractice, method, targetSec]);

  // 切方法时重置
  useEffect(() => {
    setRunning(false);
    setCompleted(false);
    setElapsed(0);
    startedAtRef.current = null;
  }, [method.id]);

  const start = () => {
    setRunning(true);
    setCompleted(false);
    setElapsed(0);
    startedAtRef.current = Date.now();
  };

  const stop = () => {
    setRunning(false);
    if (profile && startedAtRef.current && elapsed > 30) {
      addPractice({
        sessionId: uid(),
        userId: profile.userId,
        type: "breathing",
        contentId: method.id,
        startedAt: new Date(startedAtRef.current).toISOString(),
        durationSec: elapsed,
        completed: false,
      });
    }
    router.back();
  };

  if (!accountLoaded) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  if (!canUseRelaxationPractice("breathing", !!account)) {
    return (
      <div className="min-h-dvh px-6 flex flex-col justify-center gap-4">
        <LoginRequired body="呼吸训练需要登录后使用。登录后会自动回到这个练习。" />
        <Button block variant="ghost" onClick={() => router.replace("/practice")}>
          返回训练页
        </Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-5xl">🌙</div>
        <h1 className="text-2xl font-medium">今晚也辛苦了</h1>
        <p className="text-base text-ink-500 dark:text-ink-200 leading-relaxed max-w-xs">
          身体已经慢下来了。如果还有点清醒，可以再做几轮，或者直接闭上眼睛。
        </p>
        <div className="space-y-2 w-full max-w-xs">
          <Button block onClick={start}>
            再做 {method.defaultMin} 分钟
          </Button>
          <Button block variant="ghost" onClick={() => router.replace("/")}>
            回首页
          </Button>
        </div>
      </div>
    );
  }

  if (!running) {
    return (
      <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-sm text-ink-400">{method.title}</div>
        <h1 className="text-2xl font-medium">找一个舒服的姿势</h1>
        <p className="text-base text-ink-500 dark:text-ink-200 leading-relaxed max-w-xs">
          {method.desc}
        </p>
        <div className="space-y-2 w-full max-w-xs">
          <Button block size="lg" onClick={start}>
            开始 {method.defaultMin} 分钟
          </Button>
          <Button block variant="ghost" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, targetSec - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="min-h-dvh px-6 flex flex-col items-center justify-between py-12">
      <div className="text-sm text-ink-400 dark:text-ink-300">
        {method.title} · 剩余 {mm}:{ss}
      </div>
      <BreathingOrb method={method} running={running} />
      <Button variant="ghost" onClick={stop}>
        结束
      </Button>
    </div>
  );
}

export default function BreathingPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-12 text-ink-400">载入中…</div>}>
      <BreathingInner />
    </Suspense>
  );
}
