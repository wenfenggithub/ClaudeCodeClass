"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { evaluateRules } from "@/lib/rules";
import { ScoreArc } from "@/components/ScoreArc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InsightCard } from "@/components/InsightCard";
import { RiskBanner } from "@/components/RiskBanner";
import { Suspense, useEffect } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { authHref } from "@/lib/auth-links";
import { canUseRelaxationPractice } from "@/lib/practice-access";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "夜深了";
  if (h < 11) return "早安";
  if (h < 14) return "午安";
  if (h < 18) return "下午好";
  return "晚安";
}

function HomeInner() {
  const ready = useHydrated();
  const searchParams = useSearchParams();
  const hasAuthFlow = searchParams.has("auth");
  const profile = useStore((s) => s.profile);
  const diaries = useStore((s) => s.diaries);
  const scores = useStore((s) => s.scores);
  const insights = useStore((s) => s.insights);
  const riskFlags = useStore((s) => s.riskFlags);
  const plans = useStore((s) => s.plans);
  const planTasks = useStore((s) => s.planTasks);
  const addInsights = useStore((s) => s.addInsights);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);

  const lastDiary = useMemo(() => {
    if (diaries.length === 0) return null;
    return [...diaries].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [diaries]);
  const lastScore = useMemo(
    () => scores.find((s) => s.diaryId === lastDiary?.diaryId) ?? null,
    [scores, lastDiary],
  );

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const breathingHref = canUseRelaxationPractice("breathing", !!account)
    ? "/practice/breathing"
    : authHref("login", "/practice/breathing");

  // 进入首页时计算当天的洞察（若今天还没生成）
  useEffect(() => {
    if (!ready || !profile) return;
    const todayInsights = insights.filter((i) => i.date === todayStr);
    if (todayInsights.length > 0) return;
    if (diaries.length === 0) return;
    const fresh = evaluateRules({
      profile,
      diaries,
      recentInsights: insights,
    });
    if (fresh.length > 0) addInsights(fresh);
  }, [ready, profile, diaries, insights, todayStr, addInsights]);

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  const todayInsights = insights.filter((i) => i.date === todayStr);
  const activeFlags = riskFlags.filter((f) => !f.acknowledged);
  const activePlan = plans.find((p) => p.status === "active");

  const todayPlanTasks = useMemo(() => {
    if (!activePlan) return [];
    const start = new Date(`${activePlan.startedAt}T00:00:00`);
    const day = Math.floor(
      (Date.now() - start.getTime()) / (24 * 60 * 60 * 1000),
    );
    const dayIdx = Math.max(1, Math.min(21, day + 1));
    return planTasks.filter(
      (t) => t.planId === activePlan.planId && t.dayIndex === dayIdx,
    );
  }, [activePlan, planTasks]);

  // 没有档案时也保持首页可见，避免 "/" 首屏空白；正式使用仍从引导开始。
  if (!profile || !profile.disclaimerAcceptedAt) {
    return (
      <div className="px-5 pt-10 space-y-5">
        <header>
          <div className="text-sm text-ink-400 dark:text-ink-300">
            安眠岛 · Hush
          </div>
          <h1 className="text-2xl font-medium mt-1">
            陪你慢慢睡着
          </h1>
        </header>

        <AuthPanel compact={!hasAuthFlow} defaultExpanded={hasAuthFlow} />

        <Card className="space-y-4">
          <div>
            <div className="text-base font-medium">先建立睡眠档案</div>
            <p className="text-sm text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">
              约 90 秒，完成后首页会显示睡眠评分、今日计划和适合你的建议。
            </p>
          </div>
          <Link href="/onboarding">
            <Button block size="lg">
              开始引导
            </Button>
          </Link>
        </Card>

        <section className="grid grid-cols-2 gap-3">
          <Card className="h-full">
            <div className="text-3xl">🫧</div>
            <div className="text-base font-medium mt-2">呼吸训练</div>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-1">
              登录后可用
            </div>
          </Card>
          <Card className="h-full">
            <div className="text-3xl">♪</div>
            <div className="text-base font-medium mt-2">助眠声音</div>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-1">
              环境声与轻音乐
            </div>
          </Card>
        </section>
      </div>
    );
  }

  // 有档案 → 正常首页
  return (
    <div className="px-5 pt-10 space-y-5">
      <header>
        <div className="text-sm text-ink-400 dark:text-ink-300">
          {greeting()}{profile.nickname ? `，${profile.nickname}` : ""}
        </div>
        <h1 className="text-2xl font-medium mt-1">
          今天对自己温柔一点
        </h1>
      </header>

      <AuthPanel compact defaultExpanded={false} />

      {activeFlags.map((f) => (
        <RiskBanner key={f.flagId} flag={f} />
      ))}

      {/* 昨晚卡片 */}
      <Card>
        {lastDiary && lastScore ? (
          <Link href="/reports" className="block">
            <ScoreArc score={lastScore.total} />
            <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-300 mt-3 px-2">
              {lastScore.insight}
            </p>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-3 text-right">
              {format(parseISO(lastDiary.date), "M 月 d 日")} 的睡眠 →
            </div>
          </Link>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="text-base">还没有睡眠记录</div>
            <p className="text-sm text-ink-500 dark:text-ink-300">
              第一份睡眠日记 60 秒可以填完，慢慢来。
            </p>
            <Link href="/diary">
              <Button>开始记录昨晚</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* 今日洞察 */}
      {todayInsights.length > 0 && (
        <section className="space-y-3">
          <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
            今天的小建议
          </div>
          {todayInsights.map((i) => (
            <InsightCard key={i.insightId} insight={i} />
          ))}
        </section>
      )}

      {/* 今日计划任务 */}
      {todayPlanTasks.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">今日计划</div>
            <Link
              href="/plan"
              className="text-xs text-moon-600 dark:text-moon-200"
            >
              查看全部 →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {todayPlanTasks.map((t) => (
              <li key={t.taskId} className="flex items-start gap-2 text-sm">
                <span
                  className={
                    t.done
                      ? "text-score-high"
                      : "text-ink-300 dark:text-ink-600"
                  }
                >
                  {t.done ? "●" : "○"}
                </span>
                <div>
                  <div className={t.done ? "line-through text-ink-400" : ""}>
                    {t.title}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 推荐 */}
      <section className="grid grid-cols-2 gap-3">
        <Link href={breathingHref}>
          <Card className="h-full">
            <div className="text-3xl">🫧</div>
            <div className="text-base font-medium mt-2">4-7-8 呼吸</div>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-1">
              {account ? "5 分钟·快速放松" : "登录后可用"}
            </div>
          </Card>
        </Link>
        <Link href="/sounds">
          <Card className="h-full">
            <div className="text-3xl">♪</div>
            <div className="text-base font-medium mt-2">助眠音频</div>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-1">
              低频陪伴
            </div>
          </Card>
        </Link>
      </section>

      <Link href="/diary" className="block">
        <Button block size="lg" variant="outline">
          {lastDiary?.date === todayStr ? "再补充一些细节" : "记录昨晚的睡眠"}
        </Button>
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <HomeInner />
    </Suspense>
  );
}
