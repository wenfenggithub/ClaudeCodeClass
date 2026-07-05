// 声音目录 - spec.md 4.4
// 原型阶段为端侧合成；待接入采购素材时只需把 `synth: true` 换成 `url: "..."`。

import type { SoundId } from "./audio-engine";

export type SoundCategory = "white-noise" | "nature" | "ambient" | "music";

export interface SoundItem {
  id: SoundId;
  title: string;
  icon: string;
  category: SoundCategory;
  desc: string;
  /** 推荐场景标签，用于"今晚推荐"匹配 */
  tags: ("focus" | "anxiety" | "wake" | "rain" | "outdoor" | "cozy")[];
  /** 录制版本的相对 URL；存在时优先使用，否则回退到端侧合成。
   *  约定文件放在 /sounds/{id}.mp3 — 由调用方拼接 */
  recordedFile?: string;
}

export const SOUND_CATEGORIES: { id: SoundCategory; label: string }[] = [
  { id: "nature", label: "自然" },
  { id: "white-noise", label: "白噪音" },
  { id: "ambient", label: "环境" },
  { id: "music", label: "🎵 轻音乐" },
];

export const SOUNDS: SoundItem[] = [
  {
    id: "rain",
    title: "夜雨",
    icon: "🌧️",
    category: "nature",
    desc: "细密均匀的雨声，最普适的入睡背景。",
    tags: ["rain", "anxiety", "focus"],
    recordedFile: "/sounds/rain.mp3",
  },
  {
    id: "ocean",
    title: "海浪",
    icon: "🌊",
    category: "nature",
    desc: "慢节奏的浪起浪落，跟着呼吸一起松下来。",
    tags: ["anxiety", "outdoor"],
    recordedFile: "/sounds/ocean.mp3",
  },
  {
    id: "forest",
    title: "森林夜虫",
    icon: "🌲",
    category: "nature",
    desc: "高频空气感 + 偶尔虫鸣，像在野外帐篷里。",
    tags: ["outdoor", "anxiety"],
    recordedFile: "/sounds/forest.mp3",
  },
  {
    id: "fire",
    title: "篝火",
    icon: "🔥",
    category: "nature",
    desc: "低频燃烧声 + 偶尔噼啪爆破，温暖陪伴。",
    tags: ["cozy", "anxiety"],
    recordedFile: "/sounds/fire.mp3",
  },
  {
    id: "fan",
    title: "风扇低鸣",
    icon: "💨",
    category: "white-noise",
    desc: "中频带通噪音，掩盖环境噪声的经典选择。",
    tags: ["focus", "wake"],
    recordedFile: "/sounds/fan.mp3",
  },
  {
    id: "birds",
    title: "林间鸟鸣",
    icon: "🐦",
    category: "nature",
    desc: "清晨森林里的鸟鸣声，生机勃勃。",
    tags: ["outdoor", "focus"],
    recordedFile: "/sounds/birds.mp3",
  },
  {
    id: "cafe",
    title: "咖啡馆",
    icon: "☕",
    category: "ambient",
    desc: "咖啡馆里的背景声：低语、杯碟轻响，温暖嘈杂。",
    tags: ["focus", "cozy"],
    recordedFile: "/sounds/cafe.mp3",
  },
  {
    id: "thunder",
    title: "雷雨",
    icon: "⛈️",
    category: "nature",
    desc: "远处隆隆的雷声，低频包裹感。",
    tags: ["anxiety", "rain", "cozy"],
    recordedFile: "/sounds/thunder.mp3",
  },
  {
    id: "stream",
    title: "溪流",
    icon: "💧",
    category: "nature",
    desc: "山间小溪，轻柔流淌。比海浪更细腻，适合安静夜晚。",
    tags: ["outdoor", "anxiety"],
    recordedFile: "/sounds/stream.mp3",
  },
  {
    id: "cat-purr",
    title: "猫呼噜",
    icon: "🐱",
    category: "ambient",
    desc: "猫咪的咕噜声，低频振动有安抚感。",
    tags: ["cozy", "anxiety"],
    recordedFile: "/sounds/cat-purr.mp3",
  },
  {
    id: "heartbeat",
    title: "心跳",
    icon: "❤️",
    category: "ambient",
    desc: "稳定的低频节拍，像在妈妈怀里。",
    tags: ["anxiety", "cozy"],
    recordedFile: "/sounds/heartbeat.mp3",
  },
  {
    id: "train",
    title: "远去的火车",
    icon: "🚂",
    category: "ambient",
    desc: "远处火车有节奏的隆隆声，催眠经典。",
    tags: ["focus", "cozy"],
    recordedFile: "/sounds/train.mp3",
  },
  {
    id: "wind-snow",
    title: "窗外风雪",
    icon: "🌨️",
    category: "nature",
    desc: "窗外寒风呼啸，被窝里更暖。",
    tags: ["cozy", "anxiety"],
    recordedFile: "/sounds/wind-snow.mp3",
  },
  // 轻音乐（无法合成，必须下载 mp3）
  {
    id: "music-piano-1",
    title: "月光钢琴",
    icon: "🎹",
    category: "music",
    desc: "缓慢的钢琴独奏，像月光洒在床前。",
    tags: ["anxiety", "cozy"],
    recordedFile: "/sounds/music-piano-1.mp3",
  },
  {
    id: "music-piano-2",
    title: "安静的旋律",
    icon: "🎹",
    category: "music",
    desc: "简约的钢琴小品，不抢思绪。",
    tags: ["focus", "cozy"],
    recordedFile: "/sounds/music-piano-2.mp3",
  },
  {
    id: "music-strings",
    title: "暖弦乐",
    icon: "🎻",
    category: "music",
    desc: "温暖的弦乐长音，像被裹在绒毯里。",
    tags: ["anxiety", "cozy"],
    recordedFile: "/sounds/music-strings.mp3",
  },
  {
    id: "music-ambient",
    title: "深空环境",
    icon: "🌌",
    category: "music",
    desc: "缓慢铺开的电子环境音，适合放空。",
    tags: ["anxiety", "focus"],
    recordedFile: "/sounds/music-ambient.mp3",
  },
  {
    id: "music-guitar",
    title: "吉他独白",
    icon: "🎸",
    category: "music",
    desc: "指弹吉他，温暖而私密。",
    tags: ["cozy", "focus"],
    recordedFile: "/sounds/music-guitar.mp3",
  },
  {
    id: "music-cello",
    title: "大提琴夜曲",
    icon: "🎻",
    category: "music",
    desc: "低沉的大提琴，深沉而宁静。",
    tags: ["anxiety", "cozy"],
    recordedFile: "/sounds/music-cello.mp3",
  },
  {
    id: "music-piano-3",
    title: "雨夜琴声",
    icon: "🎹",
    category: "music",
    desc: "略带回响的钢琴，像雨天的窗边。",
    tags: ["rain", "cozy"],
    recordedFile: "/sounds/music-piano-3.mp3",
  },
  {
    id: "music-strings-2",
    title: "远方的弦",
    icon: "🎻",
    category: "music",
    desc: "极简弦乐铺底，几乎感觉不到存在。",
    tags: ["focus", "anxiety"],
    recordedFile: "/sounds/music-strings-2.mp3",
  },
  // 第二批扩充音乐
  {
    id: "music-piano-4",
    title: "Lo-Fi 钢琴",
    icon: "🎹",
    category: "music",
    desc: "Lo-Fi 风钢琴混入环境采样，长篇陪伴。",
    tags: ["cozy", "focus"],
    recordedFile: "/sounds/music-piano-4.mp3",
  },
  {
    id: "music-piano-5",
    title: "钢琴时刻",
    icon: "🎹",
    category: "music",
    desc: "一段安静的钢琴时光，留白很多。",
    tags: ["anxiety", "focus"],
    recordedFile: "/sounds/music-piano-5.mp3",
  },
  {
    id: "music-piano-6",
    title: "轻步钢琴",
    icon: "🎹",
    category: "music",
    desc: "轻盈跳跃的钢琴小品，像踮脚走过。",
    tags: ["focus", "cozy"],
    recordedFile: "/sounds/music-piano-6.mp3",
  },
  {
    id: "music-piano-strings",
    title: "钢琴与弦",
    icon: "🎼",
    category: "music",
    desc: "钢琴与弦乐交织铺开，温暖立体。",
    tags: ["anxiety", "cozy"],
    recordedFile: "/sounds/music-piano-strings.mp3",
  },
  {
    id: "music-ambient-2",
    title: "寂静片段",
    icon: "🌌",
    category: "music",
    desc: "极慢节奏的环境片段，几乎是安静本身。",
    tags: ["anxiety", "focus"],
    recordedFile: "/sounds/music-ambient-2.mp3",
  },
  {
    id: "music-ambient-3",
    title: "简单的梦",
    icon: "💭",
    category: "music",
    desc: "温柔的合成器铺底，像浅浅的梦境。",
    tags: ["cozy", "anxiety"],
    recordedFile: "/sounds/music-ambient-3.mp3",
  },
  {
    id: "music-forest-lullaby",
    title: "森林摇篮曲",
    icon: "🌲",
    category: "music",
    desc: "森林氛围里的轻柔摇篮曲，自然 + 音乐。",
    tags: ["outdoor", "cozy"],
    recordedFile: "/sounds/music-forest-lullaby.mp3",
  },
  // 纯色噪音不用录音 —— 合成版本与录音差距极小，省下载流量
  {
    id: "white",
    title: "白噪音",
    icon: "▩",
    category: "white-noise",
    desc: "全频段平均能量，强遮蔽，适合嘈杂环境。",
    tags: ["focus"],
  },
  {
    id: "pink",
    title: "粉噪音",
    icon: "◌",
    category: "white-noise",
    desc: "比白噪音更柔和，被研究认为对深睡眠更友好。",
    tags: ["focus", "anxiety"],
  },
  {
    id: "brown",
    title: "棕噪音",
    icon: "●",
    category: "white-noise",
    desc: "低频为主，像远处的瀑布，最沉的一种。",
    tags: ["anxiety", "cozy"],
  },
];

export const TIMER_OPTIONS = [
  { value: 5, label: "5 分钟" },
  { value: 10, label: "10 分钟" },
  { value: 15, label: "15 分钟" },
  { value: 30, label: "30 分钟" },
  { value: 45, label: "45 分钟" },
] as const;

export function findSound(id: SoundId | undefined | null): SoundItem | undefined {
  if (!id) return undefined;
  return SOUNDS.find((s) => s.id === id);
}
