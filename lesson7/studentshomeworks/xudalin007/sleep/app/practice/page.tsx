"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { BREATH_METHODS } from "@/lib/breathing";
import { MEDITATIONS } from "@/lib/meditations";
import { useStore } from "@/lib/store";
import { LoginRequired } from "@/components/LoginRequired";
import { canUseRelaxationPractice } from "@/lib/practice-access";

const CBT_PRACTICES = [
  {
    id: "worry",
    href: "/practice/worry",
    title: "担忧时间",
    duration: "10–15 分钟",
    desc: "把烦心事写下来归档：「这件事已经处理过了，明天再想」。",
    icon: "✎",
  },
  {
    id: "reframe",
    href: "/practice/reframe",
    title: "认知重构",
    duration: "5 分钟",
    desc: "识别一个睡眠相关的负面想法，换一个更平衡的说法。",
    icon: "🪞",
  },
];

export default function PracticePage() {
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);
  const checkingAccount = !accountLoaded;
  const locked =
    checkingAccount || !canUseRelaxationPractice("breathing", !!account);

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  return (
    <div className="px-5 pt-10 pb-12 space-y-6">
      <header>
        <h1 className="text-2xl font-medium">放松训练</h1>
        <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">
          找一个舒服的姿势，从一次呼吸开始。
        </p>
      </header>

      <section className="space-y-3">
        {checkingAccount && (
          <Card className="bg-ink-50 dark:bg-ink-800/70 border-dashed border-ink-200 dark:border-ink-700 text-center">
            <div className="text-sm text-ink-400 dark:text-ink-300">
              正在检查登录状态…
            </div>
          </Card>
        )}
        {!checkingAccount && locked && (
          <LoginRequired body="放松训练需要登录后使用。匿名模式仍可使用睡眠日记、报告、计划、助眠声音试听和本地数据功能。" />
        )}
        <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
          呼吸训练
        </div>
        {BREATH_METHODS.map((m) => (
          <Link
            key={m.id}
            href={locked ? "#" : `/practice/breathing?m=${m.id}`}
            aria-disabled={locked}
            tabIndex={locked ? -1 : undefined}
            className={clsx("block", locked && "pointer-events-none")}
          >
            <Card className={clsx(locked && "opacity-50")}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{m.title}</span>
                    {locked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300">
                        登录后可用
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                    {m.subtitle} · {m.defaultMin} 分钟
                  </div>
                  <div className="text-sm text-ink-500 dark:text-ink-300 mt-1.5 leading-relaxed">
                    {m.desc}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
          CBT-I 工具
        </div>
        {CBT_PRACTICES.map((p) => (
          <Link
            key={p.id}
            href={locked ? "#" : p.href}
            aria-disabled={locked}
            tabIndex={locked ? -1 : undefined}
            className={clsx("block", locked && "pointer-events-none")}
          >
            <Card className={clsx(locked && "opacity-50")}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{p.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{p.title}</span>
                    {locked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300">
                        登录后可用
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                    {p.duration}
                  </div>
                  <div className="text-sm text-ink-500 dark:text-ink-300 mt-1.5 leading-relaxed">
                    {p.desc}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium text-ink-500 dark:text-ink-300 px-1">
          冥想 · 放松
        </div>
        {MEDITATIONS.map((m) => (
          <Link
            key={m.id}
            href={locked ? "#" : `/practice/meditation?m=${m.id}`}
            aria-disabled={locked}
            tabIndex={locked ? -1 : undefined}
            className={clsx("block", locked && "pointer-events-none")}
          >
            <Card className={clsx(locked && "opacity-50")}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{m.title}</span>
                    {locked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300">
                        登录后可用
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                    {m.subtitle} · {m.estMinutes} 分钟
                  </div>
                  <div className="text-sm text-ink-500 dark:text-ink-300 mt-1.5 leading-relaxed">
                    {m.paragraphs[0]}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
