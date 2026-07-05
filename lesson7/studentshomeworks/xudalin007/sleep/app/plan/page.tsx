"use client";

import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { createDefaultPlan, planDayIndex } from "@/lib/plan";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PlanPage() {
  const ready = useHydrated();
  const profile = useStore((s) => s.profile);
  const plans = useStore((s) => s.plans);
  const planTasks = useStore((s) => s.planTasks);
  const addPlan = useStore((s) => s.addPlan);
  const togglePlanTask = useStore((s) => s.togglePlanTask);

  if (!ready || !profile) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const active = plans.find((p) => p.status === "active");

  if (!active) {
    return (
      <div className="px-5 pt-10 pb-12 space-y-5">
        <header>
          <h1 className="text-2xl font-medium">21 天计划</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">
            一次只调整一件小事，循序渐进。
          </p>
        </header>
        <Card className="space-y-3">
          <div className="text-base font-medium">基础睡眠改善计划（21 天）</div>
          <div className="text-sm text-ink-500 dark:text-ink-300 leading-relaxed">
            第 1 周：建立固定起床时间。
            <br />
            第 2 周：刺激控制 — 让大脑重新把床和睡眠联系起来。
            <br />
            第 3 周：睡眠卫生与睡前放松。
          </div>
          <Button
            block
            onClick={async () => {
              const { plan, tasks } = createDefaultPlan(
                profile.userId,
                new Date(),
              );
              await addPlan(plan, tasks);
            }}
          >
            加入这个计划
          </Button>
        </Card>
      </div>
    );
  }

  const dayIndex = planDayIndex(active);
  const tasksByDay = new Map<number, typeof planTasks>();
  for (const t of planTasks.filter((t) => t.planId === active.planId)) {
    const arr = tasksByDay.get(t.dayIndex) ?? [];
    arr.push(t);
    tasksByDay.set(t.dayIndex, arr);
  }
  const todayTasks = tasksByDay.get(dayIndex) ?? [];
  const weekFocusIdx = Math.min(2, Math.floor((dayIndex - 1) / 7));
  const weekFocus = active.weeklyFocus[weekFocusIdx];

  return (
    <div className="px-5 pt-10 pb-12 space-y-5">
      <header>
        <h1 className="text-2xl font-medium">21 天计划</h1>
        <div className="text-sm text-ink-500 dark:text-ink-300 mt-1">
          第 {dayIndex} 天 · 本周主题：{weekFocus}
        </div>
      </header>

      {/* 进度环 */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-400">已完成</div>
            <div className="text-2xl font-medium mt-1">
              {planTasks.filter((t) => t.planId === active.planId && t.done).length}
              <span className="text-sm text-ink-400"> / 21</span>
            </div>
          </div>
          <div className="text-sm text-ink-500 dark:text-ink-300">
            一次专注一件小事即可
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full">
          <div
            className="h-1.5 bg-moon-400 dark:bg-moon-300 rounded-full"
            style={{
              width: `${
                (planTasks.filter(
                  (t) => t.planId === active.planId && t.done,
                ).length /
                  21) *
                100
              }%`,
            }}
          />
        </div>
      </Card>

      {/* 今日任务 */}
      <section className="space-y-3">
        <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
          今天的微任务
        </div>
        {todayTasks.length === 0 ? (
          <Card className="text-ink-400 text-center py-8">
            今天没有特别安排，给自己一些喘息的空间也很好。
          </Card>
        ) : (
          todayTasks.map((t) => (
            <button
              key={t.taskId}
              onClick={() => togglePlanTask(t.taskId)}
              className="w-full text-left"
            >
              <Card
                className={clsx(
                  "transition",
                  t.done && "bg-moon-50 dark:bg-moon-700/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                      t.done
                        ? "bg-score-high border-score-high text-white"
                        : "border-ink-300 dark:border-ink-600",
                    )}
                  >
                    {t.done && <span className="text-xs">✓</span>}
                  </div>
                  <div>
                    <div
                      className={clsx(
                        "font-medium",
                        t.done && "text-ink-400 line-through",
                      )}
                    >
                      {t.title}
                    </div>
                    <div className="text-sm text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">
                      {t.description}
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))
        )}
      </section>

      {/* 21 天日历 */}
      <Card>
        <div className="text-sm font-medium mb-3">21 天概览</div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => {
            const dayTasks = tasksByDay.get(d) ?? [];
            const done = dayTasks.length > 0 && dayTasks.every((t) => t.done);
            const isToday = d === dayIndex;
            return (
              <div
                key={d}
                className={clsx(
                  "aspect-square rounded-md flex items-center justify-center text-xs",
                  isToday && "ring-2 ring-moon-400",
                  done
                    ? "bg-score-high text-white"
                    : d <= dayIndex
                    ? "bg-moon-50 text-moon-700 dark:bg-moon-700/30 dark:text-moon-100"
                    : "bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300",
                )}
              >
                {d}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
