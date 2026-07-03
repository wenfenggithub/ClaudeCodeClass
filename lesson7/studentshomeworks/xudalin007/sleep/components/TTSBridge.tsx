"use client";

import { useEffect } from "react";
import { useAudioStore } from "@/lib/audio-store";
import { ttsEngine } from "@/lib/tts-engine";

/** 把 TTS 引擎的状态同步到 audio-store。挂在 AppShell 里一次即可。 */
export function TTSBridge() {
  const setStatus = useAudioStore((s) => s._setTtsStatus);
  useEffect(() => {
    setStatus(ttsEngine.getStatus());
    return ttsEngine.subscribe((s) => setStatus(s));
  }, [setStatus]);
  return null;
}
