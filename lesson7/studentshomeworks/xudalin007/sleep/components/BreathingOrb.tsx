"use client";

import { useEffect, useRef, useState } from "react";
import type { BreathMethod, BreathPhase } from "@/lib/breathing";

interface Props {
  method: BreathMethod;
  running: boolean;
  onCycle?: () => void;
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 1;

function scaleFor(phase: BreathPhase, progress: number): number {
  if (phase === "in") return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
  if (phase === "out") return MAX_SCALE - (MAX_SCALE - MIN_SCALE) * progress;
  if (phase === "hold-in") return MAX_SCALE;
  return MIN_SCALE; // hold-out
}

export function BreathingOrb({ method, running, onCycle }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    const tick = (now: number) => {
      if (lastTickRef.current == null) lastTickRef.current = now;
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsedMs((e) => e + dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, stepIdx]);

  useEffect(() => {
    const cur = method.steps[stepIdx];
    if (elapsedMs >= cur.ms) {
      setElapsedMs(0);
      const nextIdx = (stepIdx + 1) % method.steps.length;
      setStepIdx(nextIdx);
      if (nextIdx === 0) onCycle?.();
    }
  }, [elapsedMs, stepIdx, method, onCycle]);

  useEffect(() => {
    setStepIdx(0);
    setElapsedMs(0);
  }, [method.id]);

  const cur = method.steps[stepIdx];
  const progress = Math.min(1, elapsedMs / cur.ms);
  const scale = scaleFor(cur.phase, progress);
  const remainingSec = Math.max(0, Math.ceil((cur.ms - elapsedMs) / 1000));

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        className="rounded-full shadow-soft"
        style={{
          width: 240,
          height: 240,
          background:
            "radial-gradient(circle at 30% 30%, #CDBEE0, #65557A)",
          boxShadow: "0 0 80px rgba(168,152,192,0.3)",
          transform: `scale(${scale})`,
          transition: `transform ${cur.ms}ms linear`,
        }}
      />
      <div className="mt-8 text-center">
        <div className="text-2xl font-medium">{cur.label}</div>
        <div className="text-base text-ink-400 dark:text-ink-300 mt-1">
          {remainingSec} 秒
        </div>
      </div>
    </div>
  );
}
