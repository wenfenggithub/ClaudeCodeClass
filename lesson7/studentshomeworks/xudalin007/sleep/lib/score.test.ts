import { describe, expect, it } from "vitest";
import {
  awakeningScore,
  calcScore,
  computeTimes,
  durationScore,
  efficiencyScore,
  latencyScore,
  regularityScore,
  subjectiveScore,
  tierOf,
} from "./score";
import type { SleepDiary } from "./types";

const baseDiary = (over: Partial<SleepDiary> = {}): SleepDiary => ({
  diaryId: "d1",
  userId: "u1",
  date: "2026-05-19",
  bedtime: "2026-05-19T23:00:00.000Z",
  sleepLatencyMin: 22,
  wakeCount: 0,
  wakeDurationMin: 0,
  wakeTime: "2026-05-20T07:00:00.000Z",
  timeInBedMin: 480,
  totalSleepMin: 458,
  sleepEfficiency: 0.95,
  subjectiveQuality: 4,
  morningState: "ok",
  moodTags: [],
  source: "manual",
  createdAt: "2026-05-20T07:30:00.000Z",
  updatedAt: "2026-05-20T07:30:00.000Z",
  ...over,
});

describe("durationScore", () => {
  it("满分：偏差 ≤ 30 分钟", () => {
    expect(durationScore(450, 450)).toBe(100);
    expect(durationScore(420, 450)).toBe(100);
    expect(durationScore(480, 450)).toBe(100);
  });
  it("≤60 分钟偏差 → 90", () => {
    expect(durationScore(390, 450)).toBe(90);
    expect(durationScore(510, 450)).toBe(90);
  });
  it("严重偏差最低 30", () => {
    expect(durationScore(180, 450)).toBe(30);
    expect(durationScore(720, 450)).toBe(30);
  });
  it("阶梯单调递减", () => {
    const a = durationScore(450, 450);
    const b = durationScore(360, 450);
    const c = durationScore(300, 450);
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(c);
  });
});

describe("efficiencyScore", () => {
  it("满分：≥ 0.9", () => {
    expect(efficiencyScore(0.95)).toBe(100);
    expect(efficiencyScore(0.9)).toBe(100);
  });
  it("0.85 → 92", () => expect(efficiencyScore(0.85)).toBe(92));
  it("最低分边界", () => {
    expect(efficiencyScore(0.5)).toBe(30);
    expect(efficiencyScore(0)).toBe(30);
  });
});

describe("latencyScore", () => {
  it("< 15 分钟最优", () => {
    expect(latencyScore(0)).toBe(100);
    expect(latencyScore(14)).toBe(100);
  });
  it("15-20 → 92", () => expect(latencyScore(18)).toBe(92));
  it("60+ 最低", () => {
    expect(latencyScore(60)).toBe(35);
    expect(latencyScore(180)).toBe(35);
  });
});

describe("awakeningScore", () => {
  it("没夜醒 → 100", () => expect(awakeningScore(0, 0)).toBe(100));
  it("1 次 → 92", () => expect(awakeningScore(1, 0)).toBe(92));
  it("夜醒多 + 时长长 → 大幅扣分", () => {
    expect(awakeningScore(3, 90)).toBeLessThan(50);
  });
  it("不会低于 25", () => {
    expect(awakeningScore(10, 600)).toBeGreaterThanOrEqual(25);
  });
});

describe("subjectiveScore", () => {
  it("1 星 → 20，5 星 → 100", () => {
    expect(subjectiveScore(1)).toBe(20);
    expect(subjectiveScore(5)).toBe(100);
  });
});

describe("regularityScore", () => {
  it("不足 3 天 → 默认 80", () => {
    expect(regularityScore({ bedtimes: ["23:00"], wakeTimes: ["07:00"] })).toBe(80);
  });
  it("完全一致 → 100", () => {
    expect(
      regularityScore({
        bedtimes: ["23:00", "23:00", "23:00", "23:00"],
        wakeTimes: ["07:00", "07:00", "07:00", "07:00"],
      }),
    ).toBe(100);
  });
  it("差异大 → 低分", () => {
    expect(
      regularityScore({
        bedtimes: ["20:00", "01:00", "23:00", "03:00"],
        wakeTimes: ["06:00", "11:00", "07:00", "13:00"],
      }),
    ).toBeLessThanOrEqual(60);
  });
});

describe("tierOf 文案分级", () => {
  it("90+ wonderful", () => expect(tierOf(95)).toBe("wonderful"));
  it("70+ nice", () => expect(tierOf(75)).toBe("nice"));
  it("50+ okay", () => expect(tierOf(60)).toBe("okay"));
  it("30+ tough", () => expect(tierOf(35)).toBe("tough"));
  it("< 30 be_kind", () => expect(tierOf(20)).toBe("be_kind"));
});

describe("computeTimes", () => {
  it("基础计算正确", () => {
    const r = computeTimes({
      bedtime: new Date("2026-05-19T23:00:00.000Z"),
      wakeTime: new Date("2026-05-20T07:00:00.000Z"),
      sleepLatencyMin: 20,
      wakeDurationMin: 0,
    });
    expect(r.timeInBedMin).toBe(480);
    expect(r.totalSleepMin).toBe(460);
    expect(r.sleepEfficiency).toBeCloseTo(0.958, 2);
  });
  it("夜醒时长被扣除", () => {
    const r = computeTimes({
      bedtime: new Date("2026-05-19T23:00:00.000Z"),
      wakeTime: new Date("2026-05-20T07:00:00.000Z"),
      sleepLatencyMin: 30,
      wakeDurationMin: 60,
    });
    expect(r.totalSleepMin).toBe(390);
  });
  it("起床早于上床 → 0", () => {
    const r = computeTimes({
      bedtime: new Date("2026-05-20T07:00:00.000Z"),
      wakeTime: new Date("2026-05-19T23:00:00.000Z"),
      sleepLatencyMin: 0,
      wakeDurationMin: 0,
    });
    expect(r.timeInBedMin).toBe(0);
  });
});

describe("calcScore 集成", () => {
  it("理想一夜：综合分 ≥ 90", () => {
    const r = calcScore({
      diary: baseDiary({
        sleepLatencyMin: 8,
        wakeCount: 0,
        sleepEfficiency: 0.94,
        subjectiveQuality: 5,
        totalSleepMin: 450,
      }),
      targetSleepMin: 450,
      recentBedtimes: ["23:00", "23:05", "22:55"],
      recentWakeTimes: ["07:00", "07:05", "06:55"],
    });
    expect(r.total).toBeGreaterThanOrEqual(90);
    expect(r.tier).toBe("wonderful");
  });
  it("糟糕一夜：综合分 ≤ 50", () => {
    const r = calcScore({
      diary: baseDiary({
        sleepLatencyMin: 80,
        wakeCount: 3,
        wakeDurationMin: 90,
        sleepEfficiency: 0.55,
        subjectiveQuality: 1,
        totalSleepMin: 240,
      }),
      targetSleepMin: 450,
      recentBedtimes: [],
      recentWakeTimes: [],
    });
    expect(r.total).toBeLessThanOrEqual(50);
  });
  it("洞察文案非空", () => {
    const r = calcScore({
      diary: baseDiary(),
      targetSleepMin: 450,
      recentBedtimes: [],
      recentWakeTimes: [],
    });
    expect(r.insight.length).toBeGreaterThan(5);
  });
});
