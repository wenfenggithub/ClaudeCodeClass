// 个性化建议规则引擎 v1 - spec.md 4.10 + 第 8 节
// 纯规则、可解释、可审核。

import { addDays, format, parseISO, subDays } from "date-fns";
import type { Insight, SleepDiary, UserProfile } from "./types";
import { uid } from "./uid";

interface RuleContext {
  profile: UserProfile;
  diaries: SleepDiary[]; // 含今日及历史，按 date 升序
  today: string; // YYYY-MM-DD
}

interface RuleHit {
  ruleId: string;
  message: string;
  severity: Insight["severity"];
  priority: number; // 数字越大优先级越高
}

interface Rule {
  id: string;
  priority: number;
  check: (ctx: RuleContext) => Omit<RuleHit, "ruleId" | "priority"> | null;
}

const RULES: Rule[] = [
  {
    id: "SHORT_SLEEP_3",
    priority: 90,
    check: ({ diaries, profile }) => {
      const last3 = diaries.slice(-3);
      if (last3.length < 3) return null;
      const allShort = last3.every(
        (d) => d.totalSleepMin < Math.min(profile.targetSleepMin - 60, 360),
      );
      if (!allShort) return null;
      return {
        message:
          "你已经连续 3 天睡得偏少，今天可以提前 30 分钟准备睡觉，给身体一点缓冲。",
        severity: "suggest",
      };
    },
  },
  {
    id: "LONG_LATENCY_3",
    priority: 88,
    check: ({ diaries }) => {
      const last3 = diaries.slice(-3);
      if (last3.length < 3) return null;
      if (!last3.every((d) => d.sleepLatencyMin >= 30)) return null;
      return {
        message:
          "最近入睡都偏长，要不要试试 4-7-8 呼吸？通常 5 分钟就能让你松下来。",
        severity: "suggest",
      };
    },
  },
  {
    id: "FREQUENT_AWAKENING_7",
    priority: 80,
    check: ({ diaries }) => {
      const last7 = diaries.slice(-7);
      if (last7.length < 5) return null;
      const avgWake = last7.reduce((s, d) => s + d.wakeCount, 0) / last7.length;
      if (avgWake < 2) return null;
      return {
        message:
          "最近夜里醒得比较多，留意一下傍晚后是否摄入了咖啡因或酒精。",
        severity: "suggest",
      };
    },
  },
  {
    id: "HIGH_STRESS_5",
    priority: 85,
    check: ({ diaries }) => {
      const last5 = diaries.slice(-5).filter((d) => d.stressLevel != null);
      if (last5.length < 3) return null;
      const high = last5.filter((d) => (d.stressLevel ?? 0) >= 4);
      if (high.length < 3) return null;
      return {
        message:
          "最近压力指数偏高，睡前 10 分钟的「担忧时间」可能会帮你卸下一点。",
        severity: "suggest",
      };
    },
  },
  {
    id: "LATE_SCREEN_5",
    priority: 70,
    check: ({ diaries }) => {
      const last5 = diaries
        .slice(-5)
        .filter((d) => d.lastScreenTime && d.bedtime);
      if (last5.length < 3) return null;
      const late = last5.filter((d) => {
        const diff =
          (parseISO(d.bedtime).getTime() -
            parseISO(d.lastScreenTime!).getTime()) /
          60000;
        return diff < 30; // 屏幕到上床不到 30 分钟
      });
      if (late.length < 3) return null;
      return {
        message: "在睡前 30 分钟收起手机，可能会让入睡快很多。",
        severity: "suggest",
      };
    },
  },
  {
    id: "LATE_CAFFEINE_7",
    priority: 65,
    check: ({ diaries }) => {
      const last7 = diaries.slice(-7);
      const evening = last7.filter(
        (d) => d.caffeine === "afternoon" || d.caffeine === "evening",
      );
      if (evening.length < 3) return null;
      return {
        message: "下午 3 点后的咖啡因，可能正在偷走你的深睡眠。",
        severity: "suggest",
      };
    },
  },
  {
    id: "ALCOHOL_HIGH_7",
    priority: 60,
    check: ({ diaries }) => {
      const last7 = diaries.slice(-7);
      const heavy = last7.filter((d) => d.alcohol === "heavy");
      if (heavy.length < 3) return null;
      return {
        message:
          "酒精虽然让人更快睡着，但会显著降低后半夜的睡眠质量。",
        severity: "suggest",
      };
    },
  },
  {
    id: "WEEKEND_SHIFT",
    priority: 50,
    check: ({ diaries }) => {
      const last14 = diaries.slice(-14);
      if (last14.length < 8) return null;
      const minOf = (iso: string) => {
        const d = parseISO(iso);
        return d.getHours() * 60 + d.getMinutes();
      };
      const wk = last14.filter((d) => {
        const day = parseISO(d.bedtime).getDay();
        return day === 0 || day === 6;
      });
      const wd = last14.filter((d) => {
        const day = parseISO(d.bedtime).getDay();
        return day >= 1 && day <= 5;
      });
      if (wk.length < 2 || wd.length < 3) return null;
      const avg = (xs: SleepDiary[]) =>
        xs.reduce((s, d) => s + minOf(d.bedtime), 0) / xs.length;
      const diff = avg(wk) - avg(wd);
      if (diff < 90) return null;
      return {
        message:
          "周末熬夜会打乱生物钟，试着把上床时差缩小到 1 小时以内。",
        severity: "info",
      };
    },
  },
  {
    id: "LOW_EFFICIENCY_14",
    priority: 95,
    check: ({ diaries }) => {
      const last14 = diaries.slice(-14);
      if (last14.length < 10) return null;
      const avg =
        last14.reduce((s, d) => s + d.sleepEfficiency, 0) / last14.length;
      if (avg >= 0.65) return null;
      return {
        message:
          "你近两周的睡眠效率持续偏低，如果同时有日间疲劳，建议考虑预约睡眠科。",
        severity: "warning",
      };
    },
  },
  {
    id: "MOOD_LOW_30",
    priority: 92,
    check: ({ diaries }) => {
      const last30 = diaries.slice(-30);
      if (last30.length < 14) return null;
      const lowCount = last30.reduce(
        (s, d) =>
          s + (d.moodTags.includes("low") || d.moodTags.includes("anxious") ? 1 : 0),
        0,
      );
      if (lowCount < 14) return null;
      return {
        message:
          "近一段时间情绪偏低落，必要时心理科或心理咨询能给你一些支持。",
        severity: "warning",
      };
    },
  },
  {
    id: "LATE_BEDTIME_3",
    priority: 55,
    check: ({ diaries, profile }) => {
      const last3 = diaries.slice(-3);
      if (last3.length < 3) return null;
      const [h, m] = profile.targetBedtime.split(":").map(Number);
      const targetMin = h * 60 + m;
      const allLate = last3.every((d) => {
        const t = parseISO(d.bedtime);
        const cur = t.getHours() * 60 + t.getMinutes();
        // 处理跨午夜：把 0-6 点折回 24-30
        const norm = cur < 360 ? cur + 24 * 60 : cur;
        const tgt = targetMin < 360 ? targetMin + 24 * 60 : targetMin;
        return norm - tgt >= 60;
      });
      if (!allLate) return null;
      return {
        message: `最近上床都比目标晚了一个多小时，明晚可以试试 ${profile.targetBedtime} 前关灯。`,
        severity: "suggest",
      };
    },
  },
];

/** 7 天内是否已展示过同一规则 */
function recentlyShown(
  ruleId: string,
  recent: Insight[],
  todayISO: string,
): boolean {
  const cutoff = subDays(parseISO(todayISO), 7);
  return recent.some(
    (i) => i.ruleId === ruleId && parseISO(i.date) > cutoff,
  );
}

export function evaluateRules(opts: {
  profile: UserProfile;
  diaries: SleepDiary[];
  recentInsights: Insight[];
  today?: Date;
}): Insight[] {
  const today = opts.today ?? new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const ctx: RuleContext = {
    profile: opts.profile,
    diaries: [...opts.diaries].sort((a, b) => a.date.localeCompare(b.date)),
    today: todayStr,
  };
  const hits: RuleHit[] = [];
  for (const rule of RULES) {
    if (recentlyShown(rule.id, opts.recentInsights, todayStr)) continue;
    const r = rule.check(ctx);
    if (r) {
      hits.push({ ruleId: rule.id, priority: rule.priority, ...r });
    }
  }
  // 按优先级降序，最多 3 条
  hits.sort((a, b) => b.priority - a.priority);
  return hits.slice(0, 3).map<Insight>((h) => ({
    insightId: uid(),
    userId: opts.profile.userId,
    date: todayStr,
    ruleId: h.ruleId,
    message: h.message,
    severity: h.severity,
  }));
}

export const __ALL_RULES__ = RULES;

// 工具：把 ISO 串转 HH:mm
export function isoToHHmm(iso: string): string {
  const d = parseISO(iso);
  return format(d, "HH:mm");
}

export { addDays };
