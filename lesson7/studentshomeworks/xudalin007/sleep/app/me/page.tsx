"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authHref } from "@/lib/auth-links";

const TROUBLE_LABEL: Record<string, string> = {
  hard_to_fall_asleep: "入睡困难",
  easy_to_wake: "半夜易醒",
  early_wake: "早醒",
  many_dreams: "多梦",
  snoring: "打鼾",
  unknown: "未确定",
};

export default function MePage() {
  const ready = useHydrated();
  const profile = useStore((s) => s.profile);
  const diaries = useStore((s) => s.diaries);
  const practices = useStore((s) => s.practices);
  const plans = useStore((s) => s.plans);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);
  const signOut = useStore((s) => s.signOut);

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  if (!ready || !profile) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const activePlan = plans.find((p) => p.status === "active");

  return (
    <div className="px-5 pt-10 pb-12 space-y-5">
      <header className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-moon-200 dark:bg-moon-700 flex items-center justify-center text-2xl">
          ◐
        </div>
        <div>
          <div className="text-lg font-medium">
            {profile.nickname || "匿名用户"}
          </div>
          <div className="text-xs text-ink-400 dark:text-ink-300">
            目标睡眠 {Math.floor(profile.targetSleepMin / 60)}h
            {profile.targetSleepMin % 60 ? ` ${profile.targetSleepMin % 60}m` : ""}
            {" · "}
            {profile.targetBedtime}–{profile.targetWakeTime}
          </div>
        </div>
      </header>

      {/* 概览 */}
      <Card>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-ink-400">日记总数</div>
            <div className="text-xl font-medium mt-1">{diaries.length}</div>
          </div>
          <div>
            <div className="text-xs text-ink-400">完成训练</div>
            <div className="text-xl font-medium mt-1">
              {practices.filter((p) => p.completed).length}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-400">计划进度</div>
            <div className="text-xl font-medium mt-1">
              {activePlan ? `Day ${activePlan.currentDay}` : "—"}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-medium mb-2">我的睡眠困扰</div>
        <div className="flex flex-wrap gap-2">
          {profile.troubleTypes.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-pill text-xs bg-moon-50 text-moon-600 dark:bg-moon-700/40 dark:text-moon-100"
            >
              {TROUBLE_LABEL[t] ?? t}
            </span>
          ))}
        </div>
      </Card>

      {/* 账户 */}
      <Card>
        {account ? (
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">{account.email}</div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                {account.role === "admin" ? "管理员" : "已登录账户"}
                {" · 睡眠数据仍存于本机"}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              退出登录
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">未登录</div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                {accountLoaded
                  ? "匿名可使用基础功能；故事、放松训练与 AI 朗读登录后可用。"
                  : "正在检查登录状态…"}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={authHref("login", "/me")} className="flex-1">
                <Button block size="sm">
                  登录
                </Button>
              </Link>
              <Link href={authHref("register", "/me")} className="flex-1">
                <Button block size="sm" variant="outline">
                  注册
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* 入口列表 */}
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-ink-100 dark:divide-ink-700">
          <Row href="/diary" label="历史日记" />
          <Row href="/reports" label="睡眠报告" />
          <Row href="/plan" label="我的计划" />
          <Row href="/settings" label="设置" />
          {account?.role === "admin" && (
            <Row href="/admin" label="管理控制台" />
          )}
          <Row href="/legal/disclaimer" label="医疗免责声明" />
          <Row href="/legal/privacy" label="隐私政策" />
          <Row href="/legal/terms" label="服务协议" />
        </ul>
      </Card>

      <div className="text-center text-xs text-ink-400 dark:text-ink-300">
        安眠岛 · Hush v0.1 原型
        <br />
        本应用是生活方式工具，不能用于诊断或治疗。
      </div>
    </div>
  );
}

function Row({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between p-4 hover:bg-ink-50 dark:hover:bg-ink-700/40"
      >
        <span>{label}</span>
        <span className="text-ink-300">›</span>
      </Link>
    </li>
  );
}
