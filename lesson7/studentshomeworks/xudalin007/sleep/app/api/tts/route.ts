/**
 * 助眠故事朗读 — TTS API 路由
 *
 * aliyun — 阿里云百炼 DashScope CosyVoice（默认）
 * edge   — Microsoft Edge TTS（免费·零凭证）
 */

import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { authErrorResponse, requireUser } from "@/lib/server/session";

export const runtime = "nodejs";

// ---- Edge TTS ----

const EDGE_VOICES = [
  "zh-CN-XiaoxiaoNeural", "zh-CN-XiaochenNeural", "zh-CN-XiaoyiNeural",
  "zh-CN-YunxiNeural", "zh-CN-YunjianNeural", "zh-CN-YunyangNeural",
  "zh-TW-HsiaoChenNeural", "zh-HK-HiuGaaiNeural",
];

function execEdgeTTS(text: string, voice: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = execFile("edge-tts",
      ["--voice", voice, "--text", text, "--write-media", outputPath],
      { timeout: 30000 },
      (err) => { if (err) reject(err); else resolve(); },
    );
    child.stderr?.on("data", () => {});
  });
}

// ---- 阿里云 DashScope CosyVoice ----

const ALIYUN_TTS_ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer";

const ALIYUN_VOICES = [
  "default",       // 映射为 longanyang（已跑通）
  "longanyang",    // 龙安洋（男声·阳光）
  "longanrou_v3",  // 龙安柔（女声·温柔）
  "longanling_v3", // 龙安灵（女声·灵动）
  "longanya_v3",   // 龙安雅（女声·高雅）
  "longanqin_v3",  // 龙安亲（女声·亲和）
  "longmiao_v3",   // 龙妙（女声·有声书）
  "longyuan_v3",   // 龙媛（女声·温暖治愈）
  "longyue_v3",    // 龙悦（女声·温暖磁性）
  "longwanjun_v3", // 龙婉君（女声·细腻柔声）
  "longshu_v3",    // 龙书（男声·沉稳）
  "longshuo_v3",   // 龙硕（男声·干练）
];

async function aliyunSynthesize(params: {
  apiKey: string;
  voice: string;
  text: string;
  speed: number;
}): Promise<Buffer> {
  const { apiKey, voice, text, speed } = params;

  const synthRes = await fetch(ALIYUN_TTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "cosyvoice-v3-flash",
      input: {
        text,
        voice,
        format: "mp3",
        sample_rate: 24000,
        rate: speed,
      },
    }),
    cache: "no-store",
  });

  if (!synthRes.ok) {
    let errMsg = `阿里云 HTTP ${synthRes.status}`;
    try { const j = await synthRes.json(); errMsg = `${j.code ?? j.message ?? JSON.stringify(j)}`; } catch {}
    throw new Error(errMsg);
  }

  const synthJson = await synthRes.json();
  const audioUrl = synthJson?.output?.audio?.url ?? synthJson?.output?.audio_url ?? synthJson?.audio_url ?? synthJson?.url;
  if (!audioUrl) {
    const b64 = synthJson?.output?.audio?.data ?? synthJson?.data;
    if (b64) return Buffer.from(b64, "base64");
    throw new Error(`阿里云未返回音频URL: ${JSON.stringify(synthJson).slice(0, 200)}`);
  }

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    throw new Error(`阿里云音频下载失败: HTTP ${audioRes.status}`);
  }

  return Buffer.from(await audioRes.arrayBuffer());
}

// ---- 路由 ----

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
  } catch (e) {
    return authErrorResponse(e);
  }

  let body: { text?: string; voice?: string; speed?: number; engine?: "edge" | "aliyun" };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "empty_text" }, { status: 400 });
  if (text.length > 3000) return NextResponse.json({ error: "text_too_long" }, { status: 400 });

  const engine = body.engine ?? "aliyun";

  // ---- Edge path ----
  if (engine === "edge") {
    const voice = EDGE_VOICES.includes(body.voice ?? "") ? body.voice! : EDGE_VOICES[0];
    const tmpFile = path.join(os.tmpdir(), `hush-edge-${randomUUID()}.mp3`);
    try {
      await execEdgeTTS(text, voice, tmpFile);
      const buf = await readFile(tmpFile);
      unlink(tmpFile).catch(() => {});
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Content-Length": String(buf.length), "Cache-Control": "private, max-age=86400" },
      });
    } catch (e: unknown) {
      await unlink(tmpFile).catch(() => {});
      const msg = (e as Error).message;
      if (msg.includes("ENOENT") || msg.includes("edge-tts"))
        return NextResponse.json({ error: "edge_not_installed", message: "pip3 install edge-tts" }, { status: 503 });
      return NextResponse.json({ error: "edge_failed", message: msg }, { status: 502 });
    }
  }

  // ---- 阿里云 DashScope CosyVoice path ----
  const aliyunKey = process.env.ALIYUN_DASHSCOPE_API_KEY?.trim();
  if (!aliyunKey) {
    return NextResponse.json(
      { error: "aliyun_no_api_key", message: "未配置 ALIYUN_DASHSCOPE_API_KEY" },
      { status: 503 },
    );
  }

  const rawVoice = ALIYUN_VOICES.includes(body.voice ?? "") ? body.voice! : ALIYUN_VOICES[1];
  // "default" 映射到实际音色 longanyang（ALIYUN_VOICES[1]）
  const voice = rawVoice === "default" ? "longanyang" : rawVoice;
  const spd = typeof body.speed === "number" ? body.speed : 0.95;

  try {
    const audioBuf = await aliyunSynthesize({ apiKey: aliyunKey, voice, text, speed: spd });
    return new NextResponse(new Uint8Array(audioBuf), {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Content-Length": String(audioBuf.length), "Cache-Control": "private, max-age=86400" },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: "aliyun_failed", message: (e as Error).message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireUser(req);
  } catch (e) {
    return authErrorResponse(e);
  }
  const aliyunReady = !!process.env.ALIYUN_DASHSCOPE_API_KEY?.trim();
  return NextResponse.json({
    engines: {
      aliyun: { ready: aliyunReady, default: true },
      edge: { ready: true, default: false },
    },
    voices: { aliyun: ALIYUN_VOICES, edge: EDGE_VOICES },
  });
}
