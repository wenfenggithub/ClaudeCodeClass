"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { createDefaultPlan } from "@/lib/plan";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const WEEKS = [
  {
    label: "第 1 周",
    title: "固定起床时间",
    desc: "包括周末。建立节律最稳的第一块基石。",
  },
  {
    label: "第 2 周",
    title: "刺激控制：床 = 只睡觉",
    desc: "让大脑重新把床和睡眠联系起来。",
  },
  {
    label: "第 3 周",
    title: "睡眠卫生 + 睡前放松",
    desc: "调整咖啡因、屏幕、卧室环境，加上放松练习。",
  },
];

export default function OnboardingPlanPage() {
  const ready = useHydrated();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const plans = useStore((s) => s.plans);
  const addPlan = useStore((s) => s.addPlan);

  if (!ready || !profile) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const join = async () => {
    if (!plans.some((p) => p.status === "active")) {
      const { plan, tasks } = createDefaultPlan(profile.userId, new Date());
      await addPlan(plan, tasks);
    }
    router.replace("/");
  };

  const skip = () => router.replace("/");

  return (
    <div className="min-h-dvh px-6 pt-12 pb-10 flex flex-col">
      <header className="space-y-2">
        <div className="text-sm text-ink-400 dark:text-ink-300">
          为你准备好了一份
        </div>
        <h1 className="text-3xl font-medium leading-snug">21 天睡眠改善计划</h1>
        <p className="text-base text-ink-500 dark:text-ink-200 leading-relaxed mt-4">
          每天 1–3 个微任务，每个都能在 2 分钟内完成。
          一次只调整一件事，循序渐进。
        </p>
      </header>

      <div className="space-y-3 mt-8 flex-1">
        {WEEKS.map((w, i) => (
          <Card key={w.label}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-moon-100 dark:bg-moon-700/40 text-moon-700 dark:text-moon-100 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-xs text-ink-400 dark:text-ink-300">
                  {w.label}
                </div>
                <div className="text-base font-medium mt-0.5">{w.title}</div>
                <div className="text-sm text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">
                  {w.desc}
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Card className="bg-moon-50 dark:bg-moon-700/30 border-moon-200 dark:border-moon-700">
          <div className="text-sm leading-relaxed text-ink-700 dark:text-ink-100">
            没有连击、没有惩罚。
            <strong> 漏掉一两天完全没关系</strong>，捡起来继续就好。
          </div>
        </Card>
      </div>

      <div className="space-y-2 mt-6">
        <Button block size="lg" onClick={join}>
          加入这个计划
        </Button>
        <Button block variant="ghost" onClick={skip}>
          先看看，稍后再加入
        </Button>
      </div>
    </div>
  );
}
