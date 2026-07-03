// 睡眠评分引擎 - spec.md 4.3
// 纯函数，便于单测。

import type { SleepDiary, SleepScore } from "./types";
import { uid } from "./uid";

interface RegularityInput {
  /** 最近 7 天上床时间（HH:mm） */
  bedtimes: string[];
  /** 最近 7 天起床时间（HH:mm） */
  wakeTimes: string[];
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/** 时长得分（25%）：目标 ±60 分钟内满分，偏差越大越低 */
export function durationScore(totalSleepMin: number, targetMin: number): number {
  const diff = Math.abs(totalSleepMin - targetMin);
  if (diff <= 30) return 100;
  if (diff <= 60) return 90;
  if (diff <= 90) return 75;
  if (diff <= 120) return 60;
  if (diff <= 150) return 45;
  return 30;
}

/** 效率得分（30%）：实际睡眠 / 卧床 */
export function efficiencyScore(efficiency: number): number {
  // 0.85+ 优秀；0.75-0.85 良好；0.65-0.75 一般；< 0.65 不足
  if (efficiency >= 0.9) return 100;
  if (efficiency >= 0.85) return 92;
  if (efficiency >= 0.8) return 82;
  if (efficiency >= 0.75) return 72;
  if (efficiency >= 0.7) return 62;
  if (efficiency >= 0.65) return 52;
  if (efficiency >= 0.55) return 40;
  return 30;
}

/** 入睡潜伏期得分（15%）：< 20 min 最佳 */
export function latencyScore(latencyMin: number): number {
  if (latencyMin < 15) return 100;
  if (latencyMin < 20) return 92;
  if (latencyMin < 30) return 80;
  if (latencyMin < 45) return 65;
  if (latencyMin < 60) return 50;
  return 35;
}

/** 夜醒得分（15%）：次数 + 总时长综合 */
export function awakeningScore(
  wakeCount: number,
  wakeDurationMin: number,
): number {
  let s = 100;
  if (wakeCount === 1) s -= 8;
  else if (wakeCount === 2) s -= 20;
  else if (wakeCount >= 3) s -= 35;
  if (wakeDurationMin > 5) s -= 5;
  if (wakeDurationMin > 20) s -= 10;
  if (wakeDurationMin > 60) s -= 20;
  return clamp(s, 25, 100);
}

/** 主观得分（10%）：1-5 星映射 */
export function subjectiveScore(stars: number): number {
  return clamp(20 + (stars - 1) * 20, 0, 100);
}

/** 规律性得分（5%）：上床/起床时间标准差越小越好 */
export function regularityScore({
  bedtimes,
  wakeTimes,
}: RegularityInput): number {
  if (bedtimes.length < 3) return 80; // 数据不足时给一个温和的默认值
  const std = (arr: string[]) => {
    const minutes = arr.map((t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    });
    const mean = minutes.reduce((a, b) => a + b, 0) / minutes.length;
    const variance =
      minutes.reduce((acc, x) => acc + (x - mean) ** 2, 0) / minutes.length;
    return Math.sqrt(variance);
  };
  const stdAvg = (std(bedtimes) + std(wakeTimes)) / 2;
  // 标准差 < 20 分钟优秀，> 90 分钟差
  if (stdAvg < 20) return 100;
  if (stdAvg < 35) return 88;
  if (stdAvg < 50) return 75;
  if (stdAvg < 70) return 60;
  if (stdAvg < 90) return 45;
  return 30;
}

export interface ScoreInput {
  diary: SleepDiary;
  targetSleepMin: number;
  recentBedtimes: string[]; // HH:mm
  recentWakeTimes: string[]; // HH:mm
}

const TIER_TEXT: Record<
  SleepScore["tier"],
  { label: string; ribbon: string }
> = {
  wonderful: { label: "美妙的一夜", ribbon: "继续保持这样的节奏" },
  nice: { label: "不错", ribbon: "今天的你值得这份轻盈" },
  okay: { label: "还可以", ribbon: "稳住，慢慢往前走" },
  tough: { label: "有点辛苦", ribbon: "今天对自己温柔一点" },
  be_kind: {
    label: "今天对自己温柔一点",
    ribbon: "辛苦你了，今晚试着提早 20 分钟休息",
  },
};

export function tierOf(total: number): SleepScore["tier"] {
  if (total >= 90) return "wonderful";
  if (total >= 70) return "nice";
  if (total >= 50) return "okay";
  if (total >= 30) return "tough";
  return "be_kind";
}

export function tierText(tier: SleepScore["tier"]) {
  return TIER_TEXT[tier];
}

export function pickInsight(
  diary: SleepDiary,
  tier: SleepScore["tier"],
): string {
  if (diary.sleepLatencyMin >= 45)
    return "今晚入睡花了不少时间，睡前 5 分钟的呼吸训练或许会有帮助。";
  if (diary.wakeCount >= 2)
    return "你昨晚醒了几次，留意一下傍晚后的咖啡因或屏幕时间。";
  if (diary.totalSleepMin < 6 * 60)
    return "睡眠时长偏短，今天可以稍微提早 20 分钟准备休息。";
  if (diary.subjectiveQuality <= 2)
    return "今天的感受似乎不太好，给自己一些喘息的空间。";
  if (tier === "wonderful")
    return "状态很棒，你的身体在慢慢记住「能睡好」的感觉。";
  if (tier === "nice") return "睡得还不错，节奏正在稳定下来。";
  return "我们一起一步一步来，今晚比昨晚好一点就够了。";
}

export function calcScore(input: ScoreInput): SleepScore {
  const { diary, targetSleepMin, recentBedtimes, recentWakeTimes } = input;
  const sd = durationScore(diary.totalSleepMin, targetSleepMin);
  const se = efficiencyScore(diary.sleepEfficiency);
  const sl = latencyScore(diary.sleepLatencyMin);
  const sa = awakeningScore(diary.wakeCount, diary.wakeDurationMin);
  const ss = subjectiveScore(diary.subjectiveQuality);
  const sr = regularityScore({
    bedtimes: recentBedtimes,
    wakeTimes: recentWakeTimes,
  });
  const total = Math.round(
    sd * 0.25 + se * 0.3 + sl * 0.15 + sa * 0.15 + ss * 0.1 + sr * 0.05,
  );
  const tier = tierOf(total);
  return {
    scoreId: uid(),
    diaryId: diary.diaryId,
    total,
    durationScore: Math.round(sd),
    efficiencyScore: Math.round(se),
    latencyScore: Math.round(sl),
    awakeningScore: Math.round(sa),
    subjectiveScore: Math.round(ss),
    regularityScore: Math.round(sr),
    tier,
    insight: pickInsight(diary, tier),
  };
}

/** 卧床时长 + 睡眠效率工具 */
export function computeTimes(opts: {
  bedtime: Date;
  wakeTime: Date;
  sleepLatencyMin: number;
  wakeDurationMin: number;
}) {
  const timeInBedMin = Math.max(
    0,
    Math.round((opts.wakeTime.getTime() - opts.bedtime.getTime()) / 60000),
  );
  const totalSleepMin = Math.max(
    0,
    timeInBedMin - opts.sleepLatencyMin - opts.wakeDurationMin,
  );
  const sleepEfficiency =
    timeInBedMin > 0 ? totalSleepMin / timeInBedMin : 0;
  return {
    timeInBedMin,
    totalSleepMin,
    sleepEfficiency: Number(sleepEfficiency.toFixed(3)),
  };
}
