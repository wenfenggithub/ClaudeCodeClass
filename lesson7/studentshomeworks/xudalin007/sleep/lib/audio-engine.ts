// 端侧合成助眠音频引擎
//
// 设计原则（柔和优先）：
// 1. 所有声音末端经过一个"柔化"低通（≤2.5kHz）去除任何刺耳高频
// 2. 不使用纯正弦波在可听频段（除了 fan 的 sub-bass 隆鸣）
// 3. 事件类爆破（雨滴、噼啪、虫鸣）大幅柔化：低音量、慢上升、慢衰减
// 4. 左右声道微差（轻微立体声）制造空间感
// 5. 缓冲增加到 10 秒，避免明显循环感
//
// Web Audio API 零版权 零网络。

"use client";

export type SoundId =
  | "rain" | "ocean" | "fan" | "forest" | "fire"
  | "birds" | "cafe" | "thunder"
  | "stream" | "cat-purr" | "heartbeat" | "train" | "wind-snow"
  | "music-piano-1" | "music-piano-2" | "music-strings" | "music-ambient"
  | "music-guitar" | "music-cello" | "music-piano-3" | "music-strings-2"
  | "music-piano-4" | "music-piano-5" | "music-piano-6"
  | "music-piano-strings" | "music-ambient-2" | "music-ambient-3"
  | "music-forest-lullaby"
  | "white" | "pink" | "brown";

export const MAX_VOICES = 3;

// 约定：录制版本放在 /sounds/{id}.mp3，由 engine 内部直接拼接
const RECORDED_URL = (id: SoundId) => `/sounds/${id}.mp3`;
// 纯色噪音永远使用合成（合成质量接近真录音，省下载流量）
// 扩展声音如果没有 mp3 文件也回退合成
const SYNTH_ONLY: SoundId[] = ["white", "pink", "brown"];

// 录制文件可用性缓存：避免每次播放都重新探测
const _recordedAvail = new Map<SoundId, boolean>();

async function probeRecorded(id: SoundId): Promise<boolean> {
  if (SYNTH_ONLY.includes(id)) { _recordedAvail.set(id, false); return false; }
  if (_recordedAvail.has(id)) return _recordedAvail.get(id)!;
  try {
    const res = await fetch(RECORDED_URL(id), { method: "HEAD", cache: "force-cache" });
    const ok = res.ok;
    _recordedAvail.set(id, ok);
    return ok;
  } catch {
    _recordedAvail.set(id, false);
    return false;
  }
}

/** 预探测：UI 显示前调用，标记可用录制版本，让用户看到"高保真"角标 */
export async function prefetchRecordedAvailability(ids: SoundId[]): Promise<void> {
  await Promise.all(ids.map((id) => probeRecorded(id)));
}

export function hasRecorded(id: SoundId): boolean | undefined {
  return _recordedAvail.get(id);
}

const NOISE_DURATION_SEC = 10;
const FADE_MS = 800;
const TIMER_FADE_MS = 5000;

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
const _noiseBuffers: Partial<Record<"white"|"pink"|"brown", AudioBuffer>> = {};

function getCtx(): AudioContext {
  if (!_ctx) {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
    _ctx = new (window.AudioContext || W.webkitAudioContext!)();
  }
  if (_ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

function getMaster(): GainNode {
  const ctx = getCtx();
  if (!_master) { _master = ctx.createGain(); _master.gain.value = 0.75; _master.connect(ctx.destination); }
  return _master;
}

function makeNoiseBuffer(type: "white"|"pink"|"brown"): AudioBuffer {
  const cached = _noiseBuffers[type]; if (cached) return cached;
  const ctx = getCtx(); const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(2, sr * NOISE_DURATION_SEC, sr);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    if (type === "white") {
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.969*b2+w*0.153852; b3=0.8665*b3+w*0.3104856;
        b4=0.55*b4+w*0.5329522; b5=-0.7616*b5-w*0.016898;
        data[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
      }
    } else {
      let last=0;
      for (let i = 0; i < data.length; i++) {
        const w=Math.random()*2-1; last=(last+0.02*w)/1.02; data[i]=last*3.5;
      }
    }
  }
  _noiseBuffers[type] = buf;
  return buf;
}

function noiseSource(type: "white"|"pink"|"brown"): AudioBufferSourceNode {
  const ctx = getCtx(); const s = ctx.createBufferSource();
  s.buffer = makeNoiseBuffer(type); s.loop = true; s.start(); return s;
}

function fadeTo(g: GainNode, target: number, ms: number) {
  const ctx = getCtx(); const t = ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(target, t + ms/1000);
}

// ---- Voice 类型 ----

interface Voice { id: SoundId; gain: GainNode; stopAll(): void; }

/** 录制版本：HTMLAudio + MediaElementSource 路径，无淡入循环（mp3 末尾应做好头尾过渡） */
function buildRecorded(id: SoundId): Voice {
  const ctx = getCtx();
  const out = ctx.createGain(); out.gain.value = 0;
  const audio = new Audio(RECORDED_URL(id));
  audio.crossOrigin = "anonymous";
  audio.loop = true;
  audio.preload = "auto";
  // 容错：加载失败 → 平稳静音（外层会保留这个 voice 直到用户主动停止）
  audio.addEventListener("error", () => { try { audio.pause(); } catch {} });
  const src = ctx.createMediaElementSource(audio);
  src.connect(out);
  void audio.play().catch(() => {});
  return {
    id, gain: out,
    stopAll() {
      try { audio.pause(); audio.src = ""; src.disconnect(); } catch {}
    }
  };
}

/** 雨：柔和持续噪音 + 极慢 LFO 模拟雨势微变；无突兀嘀嗒声 */
function buildRain(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;

  // 主体：粉红噪音 → 低通 1.2kHz → 像稳定的雨水声
  const src1 = noiseSource("pink");
  const lp1 = ctx.createBiquadFilter(); lp1.type="lowpass"; lp1.frequency.value=1200; lp1.Q.value=0.5;
  const g1 = ctx.createGain(); g1.gain.value = 0.55;
  // 左声道
  const panL = ctx.createStereoPanner(); panL.pan.value = -0.15;
  src1.connect(lp1).connect(g1).connect(panL).connect(inner);

  // 副层：另一份粉噪 → 不同滤波 → 立体感
  const src2 = noiseSource("pink");
  const lp2 = ctx.createBiquadFilter(); lp2.type="lowpass"; lp2.frequency.value=900; lp2.Q.value=0.4;
  const g2 = ctx.createGain(); g2.gain.value = 0.4;
  const panR = ctx.createStereoPanner(); panR.pan.value = 0.15;
  src2.connect(lp2).connect(g2).connect(panR).connect(inner);

  // 极慢 LFO 调主层音量（0.05Hz ≈ 20s 一次"雨势"微变）
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.08; // 仅 ±8% 变化
  lfo.connect(lfoG).connect(g1.gain);
  lfo.start();

  // 柔化末端：再过一道 LP 2kHz
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=2000; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value = 0;
  inner.connect(softLP).connect(out);

  return {
    id: "rain", gain: out,
    stopAll() { try{lfo.stop();src1.stop();src2.stop();
      [g1,g2,panL,panR,lp1,lp2,lfoG,softLP,inner].forEach(n=>n.disconnect());
    }catch{} }
  };
}

/** 海浪：极柔棕噪 + 缓慢呼吸式 LFO；无突兀拍岸 */
function buildOcean(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;

  // 主层：棕噪 → 低通 500Hz → 深沉海声
  const src1 = noiseSource("brown");
  const lp1 = ctx.createBiquadFilter(); lp1.type="lowpass"; lp1.frequency.value=500; lp1.Q.value=0.4;
  const gMain = ctx.createGain(); gMain.gain.value = 0.6;
  const panL = ctx.createStereoPanner(); panL.pan.value = -0.1;
  src1.connect(lp1).connect(gMain).connect(panL).connect(inner);

  // 副层：粉噪 → 低通 1.2kHz → 浪体内的细沫声
  const src2 = noiseSource("pink");
  const lp2 = ctx.createBiquadFilter(); lp2.type="lowpass"; lp2.frequency.value=1200; lp2.Q.value=0.4;
  const gFoam = ctx.createGain(); gFoam.gain.value = 0.0;
  const panR = ctx.createStereoPanner(); panR.pan.value = 0.1;
  src2.connect(lp2).connect(gFoam).connect(panR).connect(inner);

  // LFO 1：主呼吸（0.06Hz ≈ 16s）调主层音量
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
  const lfoG1 = ctx.createGain(); lfoG1.gain.value = 0.25;
  lfo.connect(lfoG1).connect(gMain.gain);

  // LFO 同源：调浪沫（浪峰时浪沫淡入）
  const lfoG2 = ctx.createGain(); lfoG2.gain.value = 0.18;
  lfo.connect(lfoG2).connect(gFoam.gain);
  lfo.start();

  // 柔化末端
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=1800; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value = 0;
  inner.connect(softLP).connect(out);

  return {
    id: "ocean", gain: out,
    stopAll() { try{lfo.stop();src1.stop();src2.stop();
      [gMain,gFoam,panL,panR,lp1,lp2,lfoG1,lfoG2,softLP,inner].forEach(n=>n.disconnect());
    }catch{} }
  };
}

/** 风扇：纯噪音合成（不用正弦）+ 柔和的呼呼声 */
function buildFan(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;

  // Sub bass: 棕噪 → 低通 90Hz → 模拟电机隆鸣
  const src1 = noiseSource("brown");
  const lp1 = ctx.createBiquadFilter(); lp1.type="lowpass"; lp1.frequency.value=90; lp1.Q.value=0.6;
  const gSub = ctx.createGain(); gSub.gain.value = 0.7;
  src1.connect(lp1).connect(gSub).connect(inner);

  // Body: 粉噪 → 低通 700Hz → 风扇的"呼呼"主体
  const src2 = noiseSource("pink");
  const lp2 = ctx.createBiquadFilter(); lp2.type="lowpass"; lp2.frequency.value=700; lp2.Q.value=0.5;
  const gBody = ctx.createGain(); gBody.gain.value = 0.5;
  src2.connect(lp2).connect(gBody).connect(inner);

  // 微颤（叶片）：极柔和 3Hz 调制 body 振幅 ±5%
  const lfo = ctx.createOscillator(); lfo.frequency.value = 3;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.025;
  lfo.connect(lfoG).connect(gBody.gain);
  lfo.start();

  // 柔化末端
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=1500; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value = 0;
  inner.connect(softLP).connect(out);

  return {
    id: "fan", gain: out,
    stopAll() { try{lfo.stop();src1.stop();src2.stop();
      [gSub,gBody,lp1,lp2,lfoG,softLP,inner].forEach(n=>n.disconnect());
    }catch{} }
  };
}

/** 森林：极轻的高频空气感 + 偶尔柔和的远处虫鸣 */
function buildForest(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;

  // 风过树叶：粉噪 → 带通 1.5kHz → 柔和的"嘶嘶"
  const src1 = noiseSource("pink");
  const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=1500; bp.Q.value=0.5;
  const gWind = ctx.createGain(); gWind.gain.value = 0.45;
  const panL = ctx.createStereoPanner(); panL.pan.value = -0.2;
  src1.connect(bp).connect(gWind).connect(panL).connect(inner);

  // 另一层风：略低带通，右声道
  const src2 = noiseSource("pink");
  const bp2 = ctx.createBiquadFilter(); bp2.type="bandpass"; bp2.frequency.value=1100; bp2.Q.value=0.5;
  const gWind2 = ctx.createGain(); gWind2.gain.value = 0.3;
  const panR = ctx.createStereoPanner(); panR.pan.value = 0.2;
  src2.connect(bp2).connect(gWind2).connect(panR).connect(inner);

  // 远处虫鸣：极柔和的窄带高频，节奏感的颤振（不再是尖叫式的 5kHz）
  // 用 2.2kHz 的 Q=20 带通滤白噪 → 模拟蝉鸣，远距离感
  const src3 = noiseSource("white");
  const bpC = ctx.createBiquadFilter(); bpC.type="bandpass"; bpC.frequency.value=2200; bpC.Q.value=18;
  const gC = ctx.createGain(); gC.gain.value = 0.12;
  src3.connect(bpC).connect(gC).connect(inner);
  // 12Hz 颤振振幅
  const lfoC = ctx.createOscillator(); lfoC.frequency.value = 12;
  const lfoCG = ctx.createGain(); lfoCG.gain.value = 0.07;
  lfoC.connect(lfoCG).connect(gC.gain);
  lfoC.start();

  // 柔化末端：LP 2.5kHz，去掉刺耳成分
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=2500; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value = 0;
  inner.connect(softLP).connect(out);

  return {
    id: "forest", gain: out,
    stopAll() { try{lfoC.stop();src1.stop();src2.stop();src3.stop();
      [gWind,gWind2,gC,panL,panR,bp,bp2,bpC,lfoCG,softLP,inner].forEach(n=>n.disconnect());
    }catch{} }
  };
}

/** 篝火：温暖低频隆鸣 + 偶尔柔和的中低频噼啪（不再是高频尖锐） */
function buildFire(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;

  // 低频燃烧：棕噪 → 低通 250Hz
  const src1 = noiseSource("brown");
  const lp1 = ctx.createBiquadFilter(); lp1.type="lowpass"; lp1.frequency.value=250; lp1.Q.value=0.4;
  const gLow = ctx.createGain(); gLow.gain.value = 0.7;
  src1.connect(lp1).connect(gLow).connect(inner);

  // 火焰呼吸：粉噪 → 低通 800Hz → 温暖中频
  const src2 = noiseSource("pink");
  const lp2 = ctx.createBiquadFilter(); lp2.type="lowpass"; lp2.frequency.value=800; lp2.Q.value=0.4;
  const gMid = ctx.createGain(); gMid.gain.value = 0.35;
  src2.connect(lp2).connect(gMid).connect(inner);

  // 火焰摇曳：极慢的低频调制（0.4Hz ≈ 2.5s 一次火苗起伏）
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.4;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.12;
  lfo.connect(lfoG).connect(gMid.gain);
  lfo.start();

  // 噼啪（柔化版）：白噪 → 带通 1000Hz + 衰减 → 温暖的"噗"声，不再是高频尖锐
  const timers: number[] = [];
  const crackle = () => {
    const t = ctx.currentTime;
    const burst = noiseSource("white");
    const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=600+Math.random()*600; bp.Q.value=3;
    const bg = ctx.createGain();
    const vol = 0.04 + Math.random() * 0.05; // 大幅降低音量（之前 0.08-0.28）
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(vol, t + 0.04); // 慢上升
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); // 慢衰减
    burst.connect(bp).connect(bg).connect(inner);
    burst.stop(t + 0.3);
    timers.push(window.setTimeout(crackle, 800 + Math.random() * 2500));
  };
  crackle();

  // 柔化末端
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=1500; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value = 0;
  inner.connect(softLP).connect(out);

  return {
    id: "fire", gain: out,
    stopAll() {
      timers.forEach(clearTimeout);
      try{lfo.stop();src1.stop();src2.stop();
        [gLow,gMid,lp1,lp2,lfoG,softLP,inner].forEach(n=>n.disconnect());
      }catch{}
    }
  };
}

/** 鸟类：高频带通粉噪 + 间歇柔和啁啾 */
function buildBirds(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("pink");
  const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2800; bp.Q.value=0.6;
  const g = ctx.createGain(); g.gain.value = 0.35;
  src.connect(bp).connect(g).connect(inner);
  const timers: number[] = [];
  const chirp = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type="sine"; osc.frequency.value=1800+Math.random()*2000;
    const og = ctx.createGain(); og.gain.setValueAtTime(0,t); og.gain.linearRampToValueAtTime(0.04,t+0.02); og.gain.linearRampToValueAtTime(0,t+0.18);
    osc.connect(og).connect(inner); osc.start(t); osc.stop(t+0.2);
    timers.push(window.setTimeout(chirp, 400+Math.random()*3000));
  };
  chirp();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=3500; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"birds", gain:out, stopAll(){ timers.forEach(clearTimeout); try{src.stop();[g,bp,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 咖啡馆：中低频粉噪 + 远处人声 murmur + 杯碟轻响 */
function buildCafe(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;
  const src1 = noiseSource("pink");
  const lp1 = ctx.createBiquadFilter(); lp1.type="lowpass"; lp1.frequency.value=700; lp1.Q.value=0.4;
  const g1 = ctx.createGain(); g1.gain.value=0.45; src1.connect(lp1).connect(g1).connect(inner);
  const timers: number[] = [];
  const clink = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type="sine"; osc.frequency.value=800+Math.random()*1200;
    const og = ctx.createGain(); og.gain.setValueAtTime(0,t); og.gain.linearRampToValueAtTime(0.03,t+0.005); og.gain.exponentialRampToValueAtTime(0.0001,t+0.3);
    osc.connect(og).connect(inner); osc.start(t); osc.stop(t+0.32);
    timers.push(window.setTimeout(clink, 2000+Math.random()*8000));
  };
  clink();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=2000; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"cafe", gain:out, stopAll(){ timers.forEach(clearTimeout); try{src1.stop();[g1,lp1,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 溪流：中高频粉噪 + 不规则轻柔水花溅射 */
function buildStream(): Voice {
  const ctx = getCtx(); const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("pink");
  const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2500; bp.Q.value=0.5;
  const g = ctx.createGain(); g.gain.value = 0.5;
  src.connect(bp).connect(g).connect(inner);
  const timers: number[] = [];
  const splash = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type="sine"; osc.frequency.value = 1800+Math.random()*2000;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0,t); og.gain.linearRampToValueAtTime(0.06,t+0.02); og.gain.exponentialRampToValueAtTime(0.0001,t+0.3);
    osc.connect(og).connect(inner); osc.start(t); osc.stop(t+0.32);
    timers.push(window.setTimeout(splash, 800+Math.random()*3000));
  };
  splash();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=3000; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"stream", gain:out, stopAll(){ timers.forEach(clearTimeout); try{src.stop();[g,bp,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 猫呼噜：极低频棕噪 + 微弱的脉冲感（模拟呼吸节奏） */
function buildCatPurr(): Voice {
  const ctx = getCtx(); const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("brown");
  const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=120; lp.Q.value=0.6;
  const g = ctx.createGain(); g.gain.value = 0.7;
  src.connect(lp).connect(g).connect(inner);
  // 模拟呼噜节奏：微弱的音量起伏（~25Hz 的 pulse，非正弦但通过噪声 amplitude 实现）
  const lfo = ctx.createOscillator(); lfo.frequency.value = 25;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.1;
  lfo.connect(lfoG).connect(g.gain); lfo.start();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=200; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"cat-purr", gain:out, stopAll(){ try{lfo.stop();src.stop();[g,lp,lfoG,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 心跳：稳定低频脉冲（~60BPM）棕噪低通 + 节律gain调制 */
function buildHeartbeat(): Voice {
  const ctx = getCtx(); const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("brown");
  const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=80; lp.Q.value=0.7;
  const g = ctx.createGain(); g.gain.value = 0.6;
  src.connect(lp).connect(g).connect(inner);
  // 60 BPM = 1Hz 心跳
  const lfo = ctx.createOscillator(); lfo.frequency.value = 1;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.4;
  lfo.connect(lfoG).connect(g.gain); lfo.start();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=150; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"heartbeat", gain:out, stopAll(){ try{lfo.stop();src.stop();[g,lp,lfoG,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 火车：远处低频隆隆 + 有节奏的轮轨撞击 */
function buildTrain(): Voice {
  const ctx = getCtx(); const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("brown");
  const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=150; lp.Q.value=0.5;
  const g = ctx.createGain(); g.gain.value = 0.6;
  src.connect(lp).connect(g).connect(inner);
  // 1.5Hz 轮轨节奏
  const timers: number[] = [];
  const clack = () => {
    const t = ctx.currentTime;
    const b = noiseSource("white");
    const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=400; bp.Q.value=2;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0,t); bg.gain.linearRampToValueAtTime(0.15,t+0.03); bg.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
    b.connect(bp).connect(bg).connect(inner); b.stop(t+0.55);
    timers.push(window.setTimeout(clack, 1200+Math.random()*600));
  };
  clack();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=600; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"train", gain:out, stopAll(){ timers.forEach(clearTimeout); try{src.stop();[g,lp,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 风雪：中频粉噪 + 缓慢随机振幅波动模拟窗外风雪 */
function buildWindSnow(): Voice {
  const ctx = getCtx(); const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("pink");
  const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=800; bp.Q.value=0.4;
  const g = ctx.createGain(); g.gain.value = 0.5;
  src.connect(bp).connect(g).connect(inner);
  // 慢 LFO 模拟阵风
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.15;
  lfo.connect(lfoG).connect(g.gain); lfo.start();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=1500; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"wind-snow", gain:out, stopAll(){ try{lfo.stop();src.stop();[g,bp,lfoG,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 雷声：极低频棕噪隆隆 + 偶尔中频白噪爆破模拟雷击 */
function buildThunder(): Voice {
  const ctx = getCtx();
  const inner = ctx.createGain(); inner.gain.value = 1;
  const src = noiseSource("brown");
  const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=200; lp.Q.value=0.4;
  const g = ctx.createGain(); g.gain.value=0.6; src.connect(lp).connect(g).connect(inner);
  const timers: number[] = [];
  const boom = () => {
    const t = ctx.currentTime;
    const burst = noiseSource("brown");
    const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=150; bp.Q.value=1;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0,t); bg.gain.linearRampToValueAtTime(0.4,t+0.15); bg.gain.exponentialRampToValueAtTime(0.0001,t+2.5);
    burst.connect(bp).connect(bg).connect(inner); burst.stop(t+2.7);
    timers.push(window.setTimeout(boom, 5000+Math.random()*20000));
  };
  boom();
  const softLP = ctx.createBiquadFilter(); softLP.type="lowpass"; softLP.frequency.value=800; softLP.Q.value=0.3;
  const out = ctx.createGain(); out.gain.value=0; inner.connect(softLP).connect(out);
  return { id:"thunder", gain:out, stopAll(){ timers.forEach(clearTimeout); try{src.stop();[g,lp,softLP,inner].forEach(n=>n.disconnect());}catch{} } };
}

/** 轻音乐：无法合成，需要真实 mp3。沉默 fallback。 */
function buildMusic(id: SoundId): Voice {
  const ctx = getCtx(); const out = ctx.createGain(); out.gain.value = 0;
  return { id, gain: out, stopAll() {} };
}

/** 纯噪音：原始采样 + 柔化 LP */
function buildNoise(type: "white"|"pink"|"brown"): Voice {
  const ctx = getCtx();
  const out = ctx.createGain(); out.gain.value = 0;
  const src = noiseSource(type);
  // 即使是"纯噪音"，也加一道柔化 LP（白噪过 6kHz LP，粉/棕本来低频多影响不大）
  const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.Q.value=0.3;
  lp.frequency.value = type === "white" ? 6000 : type === "pink" ? 5000 : 2000;
  const inner = ctx.createGain(); inner.gain.value = type === "brown" ? 1.0 : 0.7;
  src.connect(inner).connect(lp).connect(out);
  return {
    id: type, gain: out,
    stopAll() { try{src.stop();[inner,lp].forEach(n=>n.disconnect());}catch{} }
  };
}

// ---- 公开接口 ----

const _voices = new Map<SoundId, Voice>();

function buildVoice(id: SoundId): Voice {
  switch (id) {
    case "rain": return buildRain();
    case "ocean": return buildOcean();
    case "fan": return buildFan();
    case "forest": return buildForest();
    case "fire": return buildFire();
    case "birds": return buildBirds();
    case "cafe": return buildCafe();
    case "thunder": return buildThunder();
    case "stream": return buildStream();
    case "cat-purr": return buildCatPurr();
    case "heartbeat": return buildHeartbeat();
    case "train": return buildTrain();
    case "wind-snow": return buildWindSnow();
    default: {
      if (id.startsWith("music-")) return buildMusic(id);
      return buildNoise(id as "white"|"pink"|"brown");
    }
  }
}

export interface PublicEngine {
  isSupported(): boolean;
  ensureStarted(): Promise<void>;
  play(id: SoundId, volume: number): Promise<void>;
  stop(id: SoundId): void;
  stopAll(fadeMs?: number): void;
  setVoiceVolume(id: SoundId, v: number): void;
  setMasterVolume(v: number): void;
  getMasterVolume(): number;
  isPlaying(id: SoundId): boolean;
}

export const audioEngine: PublicEngine = {
  isSupported() {
    return typeof window !== "undefined" && !!(
      window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext
    );
  },
  async ensureStarted() { const c = getCtx(); if (c.state==="suspended") await c.resume(); getMaster(); },
  async play(id, volume) {
    if (_voices.has(id)) { this.setVoiceVolume(id, volume); return; }
    // 优先尝试录制版本
    const useRecorded = await probeRecorded(id);
    const v = useRecorded ? buildRecorded(id) : buildVoice(id);
    v.gain.connect(getMaster());
    fadeTo(v.gain, volume, FADE_MS);
    _voices.set(id, v);
  },
  stop(id) {
    const v = _voices.get(id); if (!v) return;
    _voices.delete(id);
    fadeTo(v.gain, 0, FADE_MS);
    setTimeout(() => { try { v.stopAll(); v.gain.disconnect(); } catch {} }, FADE_MS+50);
  },
  stopAll(fadeMs=TIMER_FADE_MS) {
    const ids = Array.from(_voices.keys());
    for (const id of ids) { const v = _voices.get(id); if (!v) continue; _voices.delete(id); fadeTo(v.gain, 0, fadeMs); setTimeout(() => { try{v.stopAll();v.gain.disconnect();}catch{} }, fadeMs+50); }
  },
  setVoiceVolume(id, v) { const x = _voices.get(id); if (x) fadeTo(x.gain, v, 200); },
  setMasterVolume(v) { fadeTo(getMaster(), v, 200); },
  getMasterVolume() { return _master?.gain.value ?? 0.75; },
  isPlaying(id) { return _voices.has(id); },
};
