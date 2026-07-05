// 云端 TTS 客户端
//
// 使用 Microsoft Edge TTS（免费 · 零凭证 · 中文质量极高）
// 通过本应用的 /api/tts 路由调用（路由内部调用 edge-tts Python 库）
//
// 按段调用 → 拿到 mp3 → 缓存到 IndexedDB
// 缓存后完全离线复用。

"use client";

import { get as idbGet, set as idbSet } from "idb-keyval";

const TTS_ENDPOINT = "/api/tts";

export function ttsTextFingerprint(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function paragraphCacheKey(opts: {
  storyId: string;
  paragraphIdx: number;
  text: string;
  voice: string;
  engine: string;
  speed: number;
}): string {
  return [
    "tts",
    "p",
    opts.engine,
    opts.voice,
    `s${opts.speed.toFixed(2)}`,
    opts.storyId,
    String(opts.paragraphIdx),
    ttsTextFingerprint(opts.text),
  ].join(":");
}

export function fullAudioCacheKey(opts: {
  storyId: string;
  paragraphs: string[];
  voice: string;
  engine: string;
  speed: number;
}): string {
  return [
    "tts",
    "full",
    opts.engine,
    opts.voice,
    `s${opts.speed.toFixed(2)}`,
    opts.storyId,
    ttsTextFingerprint(opts.paragraphs.join("\n\n")),
  ].join(":");
}

export class CloudTTSError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function synthesizeParagraph(opts: {
  text: string;
  storyId: string;
  paragraphIdx: number;
  voice?: string;
  engine?: "edge" | "aliyun";
  speed?: number;
}): Promise<ArrayBuffer> {
  const engine = opts.engine ?? "edge";
  // 临时调试：aliyun 固定使用 "default"（待恢复为 "longanyang" 或动态选择）
  const voice = opts.voice ?? (engine === "edge" ? "zh-CN-XiaoxiaoNeural" : "default");
  const speed = opts.speed ?? 0.95;
  const key = paragraphCacheKey({
    storyId: opts.storyId,
    paragraphIdx: opts.paragraphIdx,
    text: opts.text,
    voice,
    engine,
    speed,
  });

  const cached = await idbGet<ArrayBuffer>(key);
  if (cached) return cached;

  const res = await fetch(TTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: opts.text, voice, engine, speed }),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      msg = errJson.message ?? msg;
    } catch {}
    throw new CloudTTSError(res.status, msg);
  }

  const buf = await res.arrayBuffer();
  await idbSet(key, buf);
  return buf;
}

/**
 * 取整篇故事的完整 mp3（所有段落拼成一个文件）。
 * 优先读"整篇缓存"，没有则逐段合成/读缓存 → 合并 → 写入整篇缓存 → 返回。
 */
export async function getFullStoryAudio(opts: {
  storyId: string;
  paragraphCount: number;
  paragraphs: string[];
  voice: string;
  engine: "edge" | "aliyun";
  speed: number;
}): Promise<ArrayBuffer> {
  const full = fullAudioCacheKey({
    storyId: opts.storyId,
    paragraphs: opts.paragraphs,
    voice: opts.voice,
    engine: opts.engine,
    speed: opts.speed,
  });
  const cachedFull = await idbGet<ArrayBuffer>(full);
  if (cachedFull) return cachedFull;

  // 逐段合成（每段各自有独立段落缓存）
  const chunks: ArrayBuffer[] = [];
  for (let i = 0; i < opts.paragraphCount; i++) {
    const buf = await synthesizeParagraph({
      text: opts.paragraphs[i],
      storyId: opts.storyId,
      paragraphIdx: i,
      voice: opts.voice,
      engine: opts.engine,
      speed: opts.speed,
    });
    chunks.push(buf);
  }

  // CBR mp3 直接字节拼接即可无间隙播放
  const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
  const merged = new Uint8Array(totalLen);
  let off = 0;
  for (const c of chunks) {
    merged.set(new Uint8Array(c), off);
    off += c.byteLength;
  }

  const mergedBuf = merged.buffer as ArrayBuffer;
  await idbSet(full, mergedBuf);
  return mergedBuf;
}

export function bufferToAudio(buf: ArrayBuffer): { audio: HTMLAudioElement; revoke: () => void } {
  const blob = new Blob([buf], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return { audio, revoke: () => URL.revokeObjectURL(url) };
}

export async function probeCloudTTS(): Promise<{
  engines?: { edge?: { ready: boolean }; aliyun?: { ready: boolean } };
}> {
  try {
    const res = await fetch(TTS_ENDPOINT, { method: "GET", cache: "no-store" });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export const EDGE_VOICES = [
  { id: "zh-CN-XiaoxiaoNeural", label: "晓晓（女声·温柔）" },
  { id: "zh-CN-XiaochenNeural", label: "晓辰（女声·沉静）" },
  { id: "zh-CN-XiaoyiNeural", label: "晓伊（女声·活泼）" },
  { id: "zh-CN-YunxiNeural", label: "云希（男声·温暖）" },
  { id: "zh-CN-YunjianNeural", label: "云健（男声·故事感）" },
  { id: "zh-CN-YunyangNeural", label: "云扬（男声·播报）" },
  { id: "zh-TW-HsiaoChenNeural", label: "晓臻（台湾女声）" },
  { id: "zh-HK-HiuGaaiNeural", label: "曉佳（粤语女声）" },
] as const;

export const ALIYUN_VOICES = [
  { id: "default",       label: "默认音色（龙安洋，已验证）" },
  { id: "longanyang",    label: "龙安洋（男声·阳光）" },
  { id: "longanrou_v3",  label: "龙安柔（女声·温柔）" },
  { id: "longanling_v3", label: "龙安灵（女声·灵动）" },
  { id: "longanya_v3",   label: "龙安雅（女声·高雅）" },
  { id: "longanqin_v3",  label: "龙安亲（女声·亲和）" },
  { id: "longmiao_v3",   label: "龙妙（女声·有声书）" },
  { id: "longyuan_v3",   label: "龙媛（女声·温暖治愈）" },
  { id: "longyue_v3",    label: "龙悦（女声·温暖磁性）" },
  { id: "longwanjun_v3", label: "龙婉君（女声·细腻柔声）" },
  { id: "longshu_v3",    label: "龙书（男声·沉稳）" },
  { id: "longshuo_v3",   label: "龙硕（男声·干练）" },
] as const;
