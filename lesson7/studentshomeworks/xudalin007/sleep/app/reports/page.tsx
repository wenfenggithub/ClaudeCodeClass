"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { ScoreArc } from "@/components/ScoreArc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SleepTrendChart } from "@/components/charts/SleepTrendChart";
import { RhythmChart } from "@/components/charts/RhythmChart";

type Range = "day" | "week";

export default function ReportsPage() {
  const ready = useHydrated();
  const diaries = useStore((s) => s.diaries);
  const scores = useStore((s) => s.scores);
  const insights = useStore((s) => s.insights);
  const [range, setRange] = useState<Range>("week");

  const sorted = useMemo(
    () => [...diaries].sort((a, b) => a.date.localeCompare(b.date)),
    [diaries],
  );

  if (!ready) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const last = sorted[sorted.length - 1] ?? null;
  const lastScore = last
    ? scores.find((s) => s.diaryId === last.diaryId)
    : null;

  // 周报数据：最近 7 天
  const since = subDays(new Date(), 6);
  const last7 = sorted.filter((d) => parseISO(d.date) >= since);
  const trend = last7.map((d) => {
    const sc = scores.find((s) => s.diaryId === d.diaryId);
    return {
      date: d.date,
      durationH: Number((d.totalSleepMin / 60).toFixed(2)),
      efficiency: Math.round(d.sleepEfficiency * 100),
      score: sc?.total ?? 0,
    };
  });
  const rhythm = last7.map((d) => {
    const bedDate = parseISO(d.bedtime);
    const wakeDate = parseISO(d.wakeTime);
    const minOf = (date: Date) => date.getHours() * 60 + date.getMinutes();
    let bedMin = minOf(bedDate);
    let wakeMin = minOf(wakeDate);
    // 让 18:00-23:59 落在 18*60 ~ 24*60，0:00-6:00 折回 24*60 ~ 30*60
    if (bedMin < 12 * 60) bedMin += 24 * 60;
    if (wakeMin < 12 * 60) wakeMin += 24 * 60;
    return { date: d.date, bedMin, wakeMin };
  });

  const avgDuration =
    last7.length > 0
      ? last7.reduce((s, d) => s + d.totalSleepMin, 0) / last7.length / 60
      : 0;
  const avgEfficiency =
    last7.length > 0
      ? last7.reduce((s, d) => s + d.sleepEfficiency, 0) / last7.length
      : 0;
  const avgScore = (() => {
    const ids = new Set(last7.map((d) => d.diaryId));
    const arr = scores.filter((s) => ids.has(s.diaryId));
    return arr.length === 0
      ? 0
      : Math.round(arr.reduce((s, x) => s + x.total, 0) / arr.length);
  })();

  return (
    <div className="px-5 pt-10 pb-12 space-y-5">
      <header>
        <h1 className="text-2xl font-medium">睡眠报告</h1>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setRange("day")}
            className={
              "px-4 py-1.5 rounded-pill text-sm " +
              (range === "day"
                ? "bg-moon-500 text-white dark:bg-moon-300 dark:text-ink-900"
                : "bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-200")
            }
          >
            日报
          </button>
          <button
            onClick={() => setRange("week")}
            className={
              "px-4 py-1.5 rounded-pill text-sm " +
              (range === "week"
                ? "bg-moon-500 text-white dark:bg-moon-300 dark:text-ink-900"
                : "bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-200")
            }
          >
            周报
          </button>
        </div>
      </header>

      {!last && (
        <Card className="text-center py-8 space-y-3">
          <div>还没有睡眠记录</div>
          <Link href="/diary/new">
            <Button>记录第一晚</Button>
          </Link>
        </Card>
      )}

      {range === "day" && last && lastScore && (
        <>
          <Card className="space-y-4">
            <div className="text-xs text-ink-400 dark:text-ink-300">
              {format(parseISO(last.date), "yyyy 年 M 月 d 日")}
            </div>
            <ScoreArc score={lastScore.total} />
            <p className="text-sm text-ink-500 dark:text-ink-300 leading-relaxed">
              {lastScore.insight}
            </p>
          </Card>

          <Card>
            <div className="text-sm font-medium mb-3">六维度细分</div>
            <ul className="space-y-3">
              {[
                ["时长", lastScore.durationScore],
                ["效率", lastScore.efficiencyScore],
                ["入睡潜伏", lastScore.latencyScore],
                ["夜醒", lastScore.awakeningScore],
                ["主观", lastScore.subjectiveScore],
                ["规律性", lastScore.regularityScore],
              ].map(([label, val]) => (
                <li key={label as string}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500 dark:text-ink-300">
                      {label}
                    </span>
                    <span className="font-medium">{val}</span>
                  </div>
                  <div className="h-1.5 mt-1 bg-ink-100 dark:bg-ink-700 rounded-full">
                    <div
                      className="h-1.5 bg-moon-400 dark:bg-moon-300 rounded-full"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="text-sm font-medium mb-2">细节</div>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-300">上床</dt>
                <dd>{format(parseISO(last.bedtime), "HH:mm")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-300">起床</dt>
                <dd>{format(parseISO(last.wakeTime), "HH:mm")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-300">入睡耗时</dt>
                <dd>{last.sleepLatencyMin} 分钟</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-300">夜醒</dt>
                <dd>
                  {last.wakeCount} 次 · {last.wakeDurationMin} 分钟
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-300">睡眠效率</dt>
                <dd>{Math.round(last.sleepEfficiency * 100)}%</dd>
              </div>
            </dl>
          </Card>
        </>
      )}

      {range === "week" && last && (
        <>
          <Card>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-ink-400">平均时长</div>
                <div className="text-xl font-medium mt-1">
                  {avgDuration.toFixed(1)}h
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-400">平均效率</div>
                <div className="text-xl font-medium mt-1">
                  {Math.round(avgEfficiency * 100)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-400">平均分</div>
                <div className="text-xl font-medium mt-1">{avgScore}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-medium mb-2">睡眠时长 / 评分</div>
            <SleepTrendChart data={trend} />
          </Card>

          <Card>
            <div className="text-sm font-medium mb-2">作息节律</div>
            <RhythmChart data={rhythm} />
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-2">
              ● 上床 ◆ 起床 — 散点越聚拢，节律越稳定。
            </div>
          </Card>

          {insights.length > 0 && (
            <Card>
              <div className="text-sm font-medium mb-3">本周洞察</div>
              <ul className="space-y-2">
                {insights.slice(-5).map((i) => (
                  <li
                    key={i.insightId}
                    className="text-sm text-ink-700 dark:text-ink-100 leading-relaxed"
                  >
                    · {i.message}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
