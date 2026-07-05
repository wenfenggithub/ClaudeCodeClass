"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse, subDays, subMinutes } from "date-fns";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { uid } from "@/lib/uid";
import { calcScore, computeTimes } from "@/lib/score";
import {
  buildSelfHarmFlag,
  containsSelfHarmRisk,
  newFlag,
} from "@/lib/risk";
import type {
  Alcohol,
  Caffeine,
  Exercise,
  MoodTag,
  MorningState,
  SleepDiary,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectGroup } from "@/components/ui/SelectGroup";
import { StarRating } from "@/components/ui/StarRating";
import { Slider } from "@/components/ui/Slider";

const LATENCY_BUCKETS = [
  { value: "lt15", label: "< 15 分钟", mid: 8 },
  { value: "15_30", label: "15–30 分钟", mid: 22 },
  { value: "30_60", label: "30–60 分钟", mid: 45 },
  { value: "gt60", label: "> 60 分钟", mid: 80 },
] as const;

const WAKE_DUR_BUCKETS = [
  { value: "0", label: "几乎没有", mid: 0 },
  { value: "lt5", label: "< 5 分钟", mid: 3 },
  { value: "5_20", label: "5–20 分钟", mid: 12 },
  { value: "20_60", label: "20–60 分钟", mid: 40 },
  { value: "gt60", label: "> 60 分钟", mid: 80 },
] as const;

// 屏幕使用桶（距离上床的分钟数中值），用于推断 lastScreenTime
const SCREEN_BUCKETS = [
  { value: "in_bed", label: "在床上一直看到睡前", mid: 0 },
  { value: "lt15", label: "上床前 0–15 分钟", mid: 8 },
  { value: "15_30", label: "上床前 15–30 分钟", mid: 22 },
  { value: "30_60", label: "上床前 30–60 分钟", mid: 45 },
  { value: "gt60", label: "上床前 1 小时以上", mid: 90 },
  { value: "none", label: "睡前没看屏幕", mid: 240 },
] as const;

const NAP_BUCKETS = [
  { value: "none", label: "没午睡", mid: 0 },
  { value: "short", label: "≤ 20 分钟", mid: 15 },
  { value: "standard", label: "20–45 分钟", mid: 30 },
  { value: "long", label: "> 45 分钟", mid: 60 },
] as const;

type LatencyKey = (typeof LATENCY_BUCKETS)[number]["value"];
type WakeDurKey = (typeof WAKE_DUR_BUCKETS)[number]["value"];
type ScreenKey = (typeof SCREEN_BUCKETS)[number]["value"];
type NapKey = (typeof NAP_BUCKETS)[number]["value"];

function nightDate(bedtime: Date): string {
  if (bedtime.getHours() < 12) {
    return format(subDays(bedtime, 1), "yyyy-MM-dd");
  }
  return format(bedtime, "yyyy-MM-dd");
}

export default function NewDiaryPage() {
  const ready = useHydrated();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const diaries = useStore((s) => s.diaries);
  const addDiary = useStore((s) => s.addDiary);
  const addRiskFlag = useStore((s) => s.addRiskFlag);

  const [step, setStep] = useState(0);

  const yesterday = subDays(new Date(), 1);
  const [bedtimeStr, setBedtimeStr] = useState(
    format(yesterday, "yyyy-MM-dd") + "T" + (profile?.targetBedtime ?? "23:30"),
  );
  const [wakeStr, setWakeStr] = useState(
    format(new Date(), "yyyy-MM-dd") + "T" + (profile?.targetWakeTime ?? "07:00"),
  );
  const [latency, setLatency] = useState<LatencyKey>("15_30");
  const [wakeCount, setWakeCount] = useState<0 | 1 | 2 | 3>(0);
  const [wakeDur, setWakeDur] = useState<WakeDurKey>("0");
  const [quality, setQuality] = useState(3);
  const [morningState, setMorningState] = useState<MorningState>("ok");
  const [moods, setMoods] = useState<MoodTag[]>([]);
  const [stress, setStress] = useState(3);
  // 昨天的行为
  const [caffeine, setCaffeine] = useState<Caffeine>("none");
  const [alcohol, setAlcohol] = useState<Alcohol>("none");
  const [exercise, setExercise] = useState<Exercise>("none");
  const [screen, setScreen] = useState<ScreenKey>("lt15");
  const [nap, setNap] = useState<NapKey>("none");
  const [note, setNote] = useState("");

  const bedtime = useMemo(
    () => parse(bedtimeStr, "yyyy-MM-dd'T'HH:mm", new Date()),
    [bedtimeStr],
  );
  const wakeTime = useMemo(
    () => parse(wakeStr, "yyyy-MM-dd'T'HH:mm", new Date()),
    [wakeStr],
  );
  const latencyMid = LATENCY_BUCKETS.find((b) => b.value === latency)?.mid ?? 0;
  const wakeDurMid =
    WAKE_DUR_BUCKETS.find((b) => b.value === wakeDur)?.mid ?? 0;
  const screenMid = SCREEN_BUCKETS.find((b) => b.value === screen)?.mid ?? 0;
  const napMid = NAP_BUCKETS.find((b) => b.value === nap)?.mid ?? 0;

  const computed = useMemo(() => {
    return computeTimes({
      bedtime,
      wakeTime,
      sleepLatencyMin: latencyMid,
      wakeDurationMin: wakeDurMid,
    });
  }, [bedtime, wakeTime, latencyMid, wakeDurMid]);

  if (!ready || !profile) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const totalSteps = 6;
  const next = () => setStep((s) => Math.min(totalSteps - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    const dateStr = nightDate(bedtime);
    // 屏幕时间反推：bedtime - screenMid 分钟（不上传，仅本地）
    const lastScreenTime =
      screen === "none"
        ? undefined
        : subMinutes(bedtime, screenMid).toISOString();

    const diary: SleepDiary = {
      diaryId: uid(),
      userId: profile.userId,
      date: dateStr,
      bedtime: bedtime.toISOString(),
      sleepLatencyMin: latencyMid,
      wakeCount,
      wakeDurationMin: wakeDurMid,
      wakeTime: wakeTime.toISOString(),
      timeInBedMin: computed.timeInBedMin,
      totalSleepMin: computed.totalSleepMin,
      sleepEfficiency: computed.sleepEfficiency,
      subjectiveQuality: quality as SleepDiary["subjectiveQuality"],
      morningState,
      moodTags: moods,
      stressLevel: stress as SleepDiary["stressLevel"],
      caffeine,
      alcohol,
      exercise,
      lastScreenTime,
      napMin: napMid,
      note: note || undefined,
      source: "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const recent = [...diaries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
    const recentBed = recent.map((d) => format(new Date(d.bedtime), "HH:mm"));
    const recentWake = recent.map((d) => format(new Date(d.wakeTime), "HH:mm"));

    const score = calcScore({
      diary,
      targetSleepMin: profile.targetSleepMin,
      recentBedtimes: recentBed,
      recentWakeTimes: recentWake,
    });

    await addDiary(diary, score);

    if (containsSelfHarmRisk(note)) {
      const partial = buildSelfHarmFlag(profile.userId);
      await addRiskFlag(newFlag(profile.userId, partial));
    }

    router.replace("/reports");
  };

  const valid = (() => {
    if (step === 0) return bedtime < wakeTime;
    return true;
  })();

  return (
    <div className="px-5 pt-10 pb-12 space-y-6">
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={
              "h-1 flex-1 rounded-full " +
              (i <= step
                ? "bg-moon-400 dark:bg-moon-300"
                : "bg-ink-100 dark:bg-ink-700")
            }
          />
        ))}
      </div>

      {step === 0 && (
        <section className="space-y-5">
          <h1 className="text-xl font-medium">昨晚的卧床时间</h1>
          <Card>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-1">
              上床时间
            </div>
            <input
              type="datetime-local"
              value={bedtimeStr}
              onChange={(e) => setBedtimeStr(e.target.value)}
              className="w-full text-lg bg-transparent outline-none"
            />
          </Card>
          <Card>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-1">
              起床时间
            </div>
            <input
              type="datetime-local"
              value={wakeStr}
              onChange={(e) => setWakeStr(e.target.value)}
              className="w-full text-lg bg-transparent outline-none"
            />
          </Card>
          <div className="text-xs text-ink-400 dark:text-ink-300">
            预计卧床：{Math.floor(computed.timeInBedMin / 60)}h
            {computed.timeInBedMin % 60}m
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-5">
          <h1 className="text-xl font-medium">大约多久睡着？</h1>
          <SelectGroup
            options={LATENCY_BUCKETS.map((b) => ({
              value: b.value,
              label: b.label,
            }))}
            value={latency}
            onChange={(v) => setLatency(v as LatencyKey)}
            columns={2}
          />

          <h2 className="text-xl font-medium pt-4">夜里醒来几次？</h2>
          <SelectGroup
            options={[
              { value: "0", label: "0 次" },
              { value: "1", label: "1 次" },
              { value: "2", label: "2 次" },
              { value: "3", label: "3 次或以上" },
            ]}
            value={String(wakeCount)}
            onChange={(v) =>
              setWakeCount(Number(v) as 0 | 1 | 2 | 3)
            }
            columns={4}
          />

          {wakeCount > 0 && (
            <>
              <h2 className="text-base font-medium pt-2">
                夜醒累计大约多长时间？
              </h2>
              <SelectGroup
                options={WAKE_DUR_BUCKETS.map((b) => ({
                  value: b.value,
                  label: b.label,
                }))}
                value={wakeDur}
                onChange={(v) => setWakeDur(v as WakeDurKey)}
                columns={2}
              />
            </>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h1 className="text-xl font-medium">主观感受</h1>
          <Card>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-3">
              昨晚的睡眠质量
            </div>
            <StarRating value={quality} onChange={setQuality} size="lg" />
          </Card>
          <div className="space-y-2">
            <div className="text-sm text-ink-500 dark:text-ink-300">
              起床后的状态
            </div>
            <SelectGroup
              options={[
                { value: "fresh", label: "精神" },
                { value: "ok", label: "一般" },
                { value: "tired", label: "疲惫" },
                { value: "exhausted", label: "极度疲惫" },
              ]}
              value={morningState}
              onChange={(v) => setMorningState(v as MorningState)}
              columns={4}
            />
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <h1 className="text-xl font-medium">今天的状态</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            可以多选，也可以全都不选。
          </p>
          <SelectGroup
            multiple
            options={[
              { value: "happy", label: "开心" },
              { value: "calm", label: "平静" },
              { value: "anxious", label: "焦虑" },
              { value: "low", label: "低落" },
              { value: "irritable", label: "烦躁" },
              { value: "stressed", label: "压力大" },
            ]}
            value={moods}
            onChange={(v) => setMoods(v as MoodTag[])}
            columns={3}
          />

          <Card>
            <Slider
              label="昨天的压力水平"
              min={1}
              max={5}
              value={stress}
              onChange={setStress}
              formatValue={(v) => `${v} / 5`}
            />
          </Card>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-5">
          <h1 className="text-xl font-medium">回顾昨天</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            这些行为常常影响夜里的睡眠。可以快速勾选，跳过也行。
          </p>

          <div className="space-y-2">
            <div className="text-sm text-ink-500 dark:text-ink-300">咖啡因</div>
            <SelectGroup<Caffeine>
              options={[
                { value: "none", label: "无" },
                { value: "morning", label: "仅上午" },
                { value: "afternoon", label: "下午有" },
                { value: "evening", label: "傍晚后" },
              ]}
              value={caffeine}
              onChange={setCaffeine}
              columns={4}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-ink-500 dark:text-ink-300">饮酒</div>
            <SelectGroup<Alcohol>
              options={[
                { value: "none", label: "无" },
                { value: "mild", label: "少量" },
                { value: "heavy", label: "较多" },
              ]}
              value={alcohol}
              onChange={setAlcohol}
              columns={3}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-ink-500 dark:text-ink-300">运动</div>
            <SelectGroup<Exercise>
              options={[
                { value: "none", label: "无" },
                { value: "light", label: "轻" },
                { value: "moderate", label: "中" },
                { value: "intense", label: "强" },
              ]}
              value={exercise}
              onChange={setExercise}
              columns={4}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-ink-500 dark:text-ink-300">
              睡前最后看屏幕
            </div>
            <SelectGroup<ScreenKey>
              options={SCREEN_BUCKETS.map((b) => ({
                value: b.value,
                label: b.label,
              }))}
              value={screen}
              onChange={setScreen}
              columns={1}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-ink-500 dark:text-ink-300">
              昨天午睡
            </div>
            <SelectGroup<NapKey>
              options={NAP_BUCKETS.map((b) => ({
                value: b.value,
                label: b.label,
              }))}
              value={nap}
              onChange={setNap}
              columns={4}
            />
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-4">
          <h1 className="text-xl font-medium">想多说一些吗？</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            备注会本地加密存储，不会上传。
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="比如：今天有点担心明天的会议……"
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 rounded-soft bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-base resize-none"
          />
        </section>
      )}

      <div className="flex gap-3 pt-4">
        {step > 0 && (
          <Button variant="ghost" onClick={prev}>
            上一步
          </Button>
        )}
        {step < totalSteps - 1 && (
          <Button block disabled={!valid} onClick={next}>
            继续
          </Button>
        )}
        {step === totalSteps - 1 && (
          <Button block onClick={submit}>
            完成今天的记录
          </Button>
        )}
      </div>
    </div>
  );
}
