"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DiaryListPage() {
  const ready = useHydrated();
  const diaries = useStore((s) => s.diaries);
  const scores = useStore((s) => s.scores);

  if (!ready) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const sorted = [...diaries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="px-5 pt-10 pb-10 space-y-4">
      <header>
        <h1 className="text-2xl font-medium">睡眠日记</h1>
        <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">
          每天 60 秒，慢慢看清自己的睡眠模式。
        </p>
      </header>

      <Link href="/diary/new" className="block">
        <Button block size="lg">
          记录一晚的睡眠
        </Button>
      </Link>

      {sorted.length === 0 ? (
        <Card className="text-center py-10 text-ink-400 dark:text-ink-300">
          还没有记录，从昨晚开始吧。
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => {
            const sc = scores.find((s) => s.diaryId === d.diaryId);
            return (
              <Card key={d.diaryId}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium">
                      {format(parseISO(d.date), "M 月 d 日 EEE")}
                    </div>
                    <div className="text-xs text-ink-400 dark:text-ink-300 mt-1">
                      {format(parseISO(d.bedtime), "HH:mm")} →{" "}
                      {format(parseISO(d.wakeTime), "HH:mm")}
                      {" · "}
                      {Math.floor(d.totalSleepMin / 60)}h{d.totalSleepMin % 60}m
                    </div>
                  </div>
                  {sc && (
                    <div className="text-2xl font-medium text-moon-600 dark:text-moon-200">
                      {sc.total}
                    </div>
                  )}
                </div>
                {d.note && (
                  <div className="text-sm text-ink-500 dark:text-ink-300 mt-2 line-clamp-2">
                    {d.note}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
