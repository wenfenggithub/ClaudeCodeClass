import { describe, expect, it } from "vitest";
import { evaluateRules } from "./rules";
import type { SleepDiary, UserProfile } from "./types";

const profile: UserProfile = {
  userId: "u1",
  createdAt: "2026-05-01T00:00:00.000Z",
  targetBedtime: "23:00",
  targetWakeTime: "07:00",
  targetSleepMin: 480,
  troubleTypes: ["hard_to_fall_asleep"],
  troubleDuration: "1_3m",
  severity: 3,
  timezone: "Asia/Shanghai",
  locale: "zh-CN",
};

const makeDiary = (
  date: string,
  over: Partial<SleepDiary> = {},
): SleepDiary => ({
  diaryId: `d-${date}`,
  userId: "u1",
  date,
  bedtime: `${date}T23:00:00.000Z`,
  sleepLatencyMin: 15,
  wakeCount: 0,
  wakeDurationMin: 0,
  wakeTime: `${nextDay(date)}T07:00:00.000Z`,
  timeInBedMin: 480,
  totalSleepMin: 460,
  sleepEfficiency: 0.95,
  subjectiveQuality: 4,
  morningState: "ok",
  moodTags: [],
  source: "manual",
  createdAt: `${date}T07:30:00.000Z`,
  updatedAt: `${date}T07:30:00.000Z`,
  ...over,
});

function nextDay(d: string): string {
  const dt = new Date(d + "T00:00:00.000Z");
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

const dateRange = (n: number, base = "2026-05-15") => {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base + "T00:00:00.000Z");
    d.setUTCDate(d.getUTCDate() - (n - 1 - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

const today = new Date("2026-05-20T08:00:00.000Z");

describe("evaluateRules", () => {
  it("无日记 → 无洞察", () => {
    expect(evaluateRules({ profile, diaries: [], recentInsights: [], today }))
      .toHaveLength(0);
  });

  it("SHORT_SLEEP_3：连续 3 天 < 目标 -60 → 触发", () => {
    const days = dateRange(3);
    const diaries = days.map((d) =>
      makeDiary(d, { totalSleepMin: 300 }), // 5 小时
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "SHORT_SLEEP_3")).toBe(true);
  });

  it("SHORT_SLEEP_3：只有 2 天不触发", () => {
    const days = dateRange(2);
    const diaries = days.map((d) =>
      makeDiary(d, { totalSleepMin: 300 }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "SHORT_SLEEP_3")).toBe(false);
  });

  it("LONG_LATENCY_3：连续 3 天入睡 ≥ 30 → 触发", () => {
    const days = dateRange(3);
    const diaries = days.map((d) =>
      makeDiary(d, { sleepLatencyMin: 45 }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "LONG_LATENCY_3")).toBe(true);
  });

  it("FREQUENT_AWAKENING_7：近 7 天平均夜醒 ≥ 2", () => {
    const days = dateRange(7);
    const diaries = days.map((d) =>
      makeDiary(d, { wakeCount: 2, wakeDurationMin: 15 }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "FREQUENT_AWAKENING_7")).toBe(true);
  });

  it("HIGH_STRESS_5：近 5 天 3 天压力 ≥ 4 → 触发", () => {
    const days = dateRange(5);
    const diaries = days.map((d, i) =>
      makeDiary(d, { stressLevel: i < 3 ? 5 : 2 }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "HIGH_STRESS_5")).toBe(true);
  });

  it("LATE_CAFFEINE_7：3+ 天午后/傍晚咖啡因", () => {
    const days = dateRange(7);
    const diaries = days.map((d, i) =>
      makeDiary(d, { caffeine: i < 4 ? "afternoon" : "none" }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "LATE_CAFFEINE_7")).toBe(true);
  });

  it("ALCOHOL_HIGH_7：3+ 天大量饮酒", () => {
    const days = dateRange(7);
    const diaries = days.map((d, i) =>
      makeDiary(d, { alcohol: i < 4 ? "heavy" : "none" }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "ALCOHOL_HIGH_7")).toBe(true);
  });

  it("LATE_SCREEN_5：屏幕到上床差距 < 30min", () => {
    const days = dateRange(5);
    const diaries = days.map((d) => {
      const bed = `${d}T23:00:00.000Z`;
      const screen = `${d}T22:50:00.000Z`; // 10 分钟前
      return makeDiary(d, { bedtime: bed, lastScreenTime: screen });
    });
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "LATE_SCREEN_5")).toBe(true);
  });

  it("LOW_EFFICIENCY_14：近 14 天平均效率 < 0.65 → warning", () => {
    const days = dateRange(14);
    const diaries = days.map((d) =>
      makeDiary(d, { sleepEfficiency: 0.55 }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    const hit = out.find((i) => i.ruleId === "LOW_EFFICIENCY_14");
    expect(hit).toBeDefined();
    expect(hit?.severity).toBe("warning");
  });

  it("MOOD_LOW_30：近 30 天情绪低落 ≥ 14 次 → warning", () => {
    const days = dateRange(30);
    const diaries = days.map((d, i) =>
      makeDiary(d, { moodTags: i < 20 ? ["low"] : [] }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.some((i) => i.ruleId === "MOOD_LOW_30")).toBe(true);
  });

  it("单日最多 3 条洞察", () => {
    const days = dateRange(14);
    const diaries = days.map((d) =>
      makeDiary(d, {
        sleepLatencyMin: 50,
        wakeCount: 2,
        wakeDurationMin: 30,
        sleepEfficiency: 0.55,
        totalSleepMin: 300,
        stressLevel: 5,
        caffeine: "evening",
        alcohol: "heavy",
        moodTags: ["low"],
      }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    expect(out.length).toBeLessThanOrEqual(3);
  });

  it("7 天内同规则去重", () => {
    const days = dateRange(3);
    const diaries = days.map((d) =>
      makeDiary(d, { sleepLatencyMin: 45 }),
    );
    const recentInsights = [
      {
        insightId: "i-prev",
        userId: "u1",
        date: "2026-05-18",
        ruleId: "LONG_LATENCY_3",
        message: "...",
        severity: "suggest" as const,
      },
    ];
    const out = evaluateRules({ profile, diaries, recentInsights, today });
    expect(out.some((i) => i.ruleId === "LONG_LATENCY_3")).toBe(false);
  });

  it("文案以鼓励/行动结尾（不含「失败」「错」）", () => {
    const days = dateRange(14);
    const diaries = days.map((d) =>
      makeDiary(d, {
        sleepLatencyMin: 50,
        sleepEfficiency: 0.55,
        totalSleepMin: 300,
      }),
    );
    const out = evaluateRules({ profile, diaries, recentInsights: [], today });
    out.forEach((i) => {
      expect(i.message).not.toMatch(/失败|做错|糟糕|完蛋/);
    });
  });
});
