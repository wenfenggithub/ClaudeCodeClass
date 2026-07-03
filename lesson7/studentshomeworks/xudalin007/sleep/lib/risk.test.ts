import { describe, expect, it } from "vitest";
import {
  checkInitialRisk,
  checkOngoingRisk,
  containsSelfHarmRisk,
} from "./risk";
import type { SleepDiary, UserProfile } from "./types";

const baseProfile: UserProfile = {
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

describe("checkInitialRisk", () => {
  it("默认档案 → 无 flag", () => {
    const { flags } = checkInitialRisk(baseProfile);
    expect(flags).toHaveLength(0);
  });

  it("持续 6-12 个月 + 严重度 4 → 命中 INITIAL_LONG_SEVERE", () => {
    const { flags } = checkInitialRisk({
      ...baseProfile,
      troubleDuration: "6_12m",
      severity: 4,
    });
    expect(flags.some((f) => f.ruleId === "INITIAL_LONG_SEVERE")).toBe(true);
  });

  it("持续超过 1 年 + 严重度 5 → 命中", () => {
    const { flags } = checkInitialRisk({
      ...baseProfile,
      troubleDuration: "gt_1y",
      severity: 5,
    });
    expect(flags.some((f) => f.ruleId === "INITIAL_LONG_SEVERE")).toBe(true);
  });

  it("持续 6-12 个月但严重度只有 3 → 不触发", () => {
    const { flags } = checkInitialRisk({
      ...baseProfile,
      troubleDuration: "6_12m",
      severity: 3,
    });
    expect(flags.some((f) => f.ruleId === "INITIAL_LONG_SEVERE")).toBe(false);
  });

  it("打鼾 → 命中 INITIAL_SNORING", () => {
    const { flags } = checkInitialRisk({
      ...baseProfile,
      troubleTypes: ["snoring"],
    });
    expect(flags.some((f) => f.ruleId === "INITIAL_SNORING")).toBe(true);
  });

  it("打鼾 + 长病程严重 → 两条都命中", () => {
    const { flags } = checkInitialRisk({
      ...baseProfile,
      troubleTypes: ["snoring", "hard_to_fall_asleep"],
      troubleDuration: "gt_1y",
      severity: 5,
    });
    expect(flags).toHaveLength(2);
  });
});

const day = (i: number): string => {
  const d = new Date("2026-05-20T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - (14 - i));
  return d.toISOString().slice(0, 10);
};

const mkDiary = (
  i: number,
  over: Partial<SleepDiary> = {},
): SleepDiary => ({
  diaryId: `d-${i}`,
  userId: "u1",
  date: day(i),
  bedtime: `${day(i)}T23:00:00.000Z`,
  sleepLatencyMin: 15,
  wakeCount: 0,
  wakeDurationMin: 0,
  wakeTime: `${day(i)}T07:00:00.000Z`,
  timeInBedMin: 480,
  totalSleepMin: 460,
  sleepEfficiency: 0.95,
  subjectiveQuality: 4,
  morningState: "ok",
  moodTags: [],
  source: "manual",
  createdAt: "",
  updatedAt: "",
  ...over,
});

describe("checkOngoingRisk", () => {
  it("效率持续偏低 → 命中 ONGOING_LOW_EFFICIENCY_14", () => {
    const diaries = Array.from({ length: 14 }, (_, i) =>
      mkDiary(i, { sleepEfficiency: 0.55 }),
    );
    const { flags } = checkOngoingRisk({ profile: baseProfile, diaries });
    expect(
      flags.some((f) => f.ruleId === "ONGOING_LOW_EFFICIENCY_14"),
    ).toBe(true);
  });

  it("数据不足 14 天 → 不触发", () => {
    const diaries = Array.from({ length: 8 }, (_, i) =>
      mkDiary(i, { sleepEfficiency: 0.5 }),
    );
    const { flags } = checkOngoingRisk({ profile: baseProfile, diaries });
    expect(
      flags.some((f) => f.ruleId === "ONGOING_LOW_EFFICIENCY_14"),
    ).toBe(false);
  });

  it("持续低主观质量 → 触发 LOW_QUALITY_14", () => {
    const diaries = Array.from({ length: 14 }, (_, i) =>
      mkDiary(i, { subjectiveQuality: 1 }),
    );
    const { flags } = checkOngoingRisk({ profile: baseProfile, diaries });
    expect(flags.some((f) => f.ruleId === "ONGOING_LOW_QUALITY_14")).toBe(true);
  });

  it("月度情绪低落 ≥ 20 次 → 触发", () => {
    const diaries = Array.from({ length: 30 }, (_, i) => {
      const dt = new Date("2026-05-20T00:00:00.000Z");
      dt.setUTCDate(dt.getUTCDate() - (29 - i));
      const d = dt.toISOString().slice(0, 10);
      return mkDiary(i, {
        date: d,
        moodTags: i < 22 ? ["low"] : [],
      });
    });
    const { flags } = checkOngoingRisk({ profile: baseProfile, diaries });
    expect(flags.some((f) => f.ruleId === "ONGOING_LOW_MOOD_30")).toBe(true);
  });

  it("一切正常 → 无 flag", () => {
    const diaries = Array.from({ length: 14 }, (_, i) => mkDiary(i));
    const { flags } = checkOngoingRisk({ profile: baseProfile, diaries });
    expect(flags).toHaveLength(0);
  });
});

describe("containsSelfHarmRisk", () => {
  it("中文关键词命中", () => {
    expect(containsSelfHarmRisk("最近真的不想活了")).toBe(true);
    expect(containsSelfHarmRisk("感觉撑不下去")).toBe(true);
    expect(containsSelfHarmRisk("我想结束自己")).toBe(true);
  });
  it("英文关键词命中", () => {
    expect(containsSelfHarmRisk("I want to die today")).toBe(true);
    expect(containsSelfHarmRisk("Kill myself")).toBe(true);
  });
  it("普通失眠备注不命中", () => {
    expect(containsSelfHarmRisk("今天有点担心明天的会议")).toBe(false);
    expect(containsSelfHarmRisk("失眠让我很烦")).toBe(false);
  });
  it("空输入安全返回 false", () => {
    expect(containsSelfHarmRisk(undefined)).toBe(false);
    expect(containsSelfHarmRisk("")).toBe(false);
  });
});
