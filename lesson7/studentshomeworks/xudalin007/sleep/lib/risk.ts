// 风险识别 - spec.md 4.11 + 9.2
// 关键词识别全程在端侧完成，不上传任何内容。

import { parseISO, subDays } from "date-fns";
import type { RiskFlag, SleepDiary, UserProfile } from "./types";
import { uid } from "./uid";

// 自杀/自伤关键词（中文 + 英文常见）。仅在本地匹配。
const SUICIDE_KEYWORDS = [
  "想死",
  "不想活",
  "活不下去",
  "自杀",
  "结束自己",
  "结束生命",
  "了结",
  "撑不下去",
  "活着没意思",
  "没意义",
  "自残",
  "自伤",
  "kill myself",
  "suicide",
  "end my life",
  "want to die",
];

export interface RiskCheckInput {
  profile: UserProfile;
  diaries: SleepDiary[];
}

export interface RiskCheckResult {
  flags: Omit<RiskFlag, "flagId" | "userId" | "acknowledged">[];
}

export function checkInitialRisk(profile: UserProfile): RiskCheckResult {
  const flags: RiskCheckResult["flags"] = [];
  const longDuration =
    profile.troubleDuration === "6_12m" || profile.troubleDuration === "gt_1y";
  if (longDuration && profile.severity >= 4) {
    flags.push({
      ruleId: "INITIAL_LONG_SEVERE",
      level: "moderate",
      triggeredAt: new Date().toISOString(),
      message:
        "你的睡眠困扰已经持续了较长时间，建议预约一次睡眠科或精神心理科的咨询。这不是失败，只是身体在请求专业的支持。",
    });
  }
  if (profile.troubleTypes.includes("snoring")) {
    flags.push({
      ruleId: "INITIAL_SNORING",
      level: "moderate",
      triggeredAt: new Date().toISOString(),
      message:
        "如果你打鼾且常感到白天困倦，建议筛查一次睡眠呼吸暂停（OSA）。耳鼻喉或睡眠科都可以做。",
    });
  }
  return { flags };
}

export function checkOngoingRisk(input: RiskCheckInput): RiskCheckResult {
  const flags: RiskCheckResult["flags"] = [];
  const last14 = input.diaries.slice(-14);
  const last30 = input.diaries.slice(-30);

  // 连续 14 天效率 < 65%
  if (last14.length >= 10) {
    const avg =
      last14.reduce((s, d) => s + d.sleepEfficiency, 0) / last14.length;
    if (avg < 0.65) {
      flags.push({
        ruleId: "ONGOING_LOW_EFFICIENCY_14",
        level: "moderate",
        triggeredAt: new Date().toISOString(),
        message:
          "近两周你的睡眠效率持续偏低。如果伴随白天明显疲劳，建议尽快找睡眠科看看。",
      });
    }
  }

  // 连续 14 天主观质量 ≤ 2
  if (last14.length >= 10) {
    const lowQuality = last14.filter((d) => d.subjectiveQuality <= 2).length;
    if (lowQuality >= 12) {
      flags.push({
        ruleId: "ONGOING_LOW_QUALITY_14",
        level: "moderate",
        triggeredAt: new Date().toISOString(),
        message:
          "你已经持续两周对睡眠不满意，专业医生可以帮你找到原因，记得不是一个人扛。",
      });
    }
  }

  // 连续 30 天情绪低落 ≥ 20 次
  if (last30.length >= 20) {
    const lowMoodCount = last30.filter(
      (d) =>
        d.moodTags.includes("low") ||
        d.moodTags.includes("anxious") ||
        d.eveningMoodTags?.includes("low"),
    ).length;
    if (lowMoodCount >= 20) {
      flags.push({
        ruleId: "ONGOING_LOW_MOOD_30",
        level: "moderate",
        triggeredAt: new Date().toISOString(),
        message:
          "最近一个月你的情绪状态偏低，必要时建议联系心理科或心理咨询师。",
      });
    }
  }

  return { flags };
}

/** 端侧自杀/自伤关键词识别，仅返回布尔（不返回匹配的关键词以避免误用） */
export function containsSelfHarmRisk(text: string | undefined): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SUICIDE_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
}

export function buildSelfHarmFlag(userId: string): Omit<RiskFlag, "flagId"> {
  return {
    userId,
    ruleId: "SELFHARM_KEYWORD",
    level: "urgent",
    triggeredAt: new Date().toISOString(),
    acknowledged: false,
    message:
      "看见你写下的话有点担心你。如果情绪很糟糕，请考虑立刻拨打心理援助热线，他们 24 小时都在。",
  };
}

export function newFlag(
  userId: string,
  partial: Omit<RiskFlag, "flagId" | "userId" | "acknowledged">,
): RiskFlag {
  return {
    flagId: uid(),
    userId,
    acknowledged: false,
    ...partial,
  };
}

export const HOTLINES = [
  {
    name: "全国心理援助热线",
    phone: "400-161-9995",
    note: "24 小时·全国通用",
  },
  {
    name: "北京心理危机研究与干预中心",
    phone: "010-82951332",
    note: "24 小时",
  },
  {
    name: "希望 24（青少年）",
    phone: "400-161-9995",
    note: "24 小时",
  },
];
