"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { uid } from "@/lib/uid";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  REFRAME_TEMPLATES,
  type ReframeTemplate,
} from "@/lib/reframe-templates";
import { LoginRequired } from "@/components/LoginRequired";
import { canUseRelaxationPractice } from "@/lib/practice-access";

type Mode = "pick" | "compose" | "done";

export default function ReframePage() {
  const ready = useHydrated();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const reframes = useStore((s) => s.reframes);
  const addReframe = useStore((s) => s.addReframe);
  const deleteReframe = useStore((s) => s.deleteReframe);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);

  const [mode, setMode] = useState<Mode>("pick");
  const [template, setTemplate] = useState<ReframeTemplate | null>(null);
  const [customOriginal, setCustomOriginal] = useState("");
  const [balanced, setBalanced] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const history = useMemo(
    () =>
      [...reframes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reframes],
  );

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  if (!ready || !profile || !accountLoaded) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  if (!canUseRelaxationPractice("reframe", !!account)) {
    return (
      <div className="px-5 pt-10 pb-12 space-y-4">
        <LoginRequired body="认知重构需要登录后使用。登录后会自动回到这个练习。" />
        <Button block variant="ghost" onClick={() => router.replace("/practice")}>
          返回训练页
        </Button>
      </div>
    );
  }

  const pickTemplate = (t: ReframeTemplate) => {
    setTemplate(t);
    setCustomOriginal(t.original);
    setBalanced("");
    setMode("compose");
  };
  const pickCustom = () => {
    setTemplate(null);
    setCustomOriginal("");
    setBalanced("");
    setMode("compose");
  };

  const useSuggested = () => {
    if (template) setBalanced(template.suggested);
  };

  const save = () => {
    const original = customOriginal.trim();
    const b = balanced.trim();
    if (!original || !b) return;
    addReframe({
      reframeId: uid(),
      userId: profile.userId,
      date: format(new Date(), "yyyy-MM-dd"),
      originalThought: original,
      templateId: template?.id,
      balancedThought: b,
      createdAt: new Date().toISOString(),
    });
    setMode("done");
  };

  const reset = () => {
    setMode("pick");
    setTemplate(null);
    setCustomOriginal("");
    setBalanced("");
  };

  return (
    <div className="px-5 pt-10 pb-12 space-y-5">
      <header>
        <div className="text-sm text-ink-400 dark:text-ink-300">CBT-I · 认知重构</div>
        <h1 className="text-2xl font-medium mt-1">
          {mode === "compose"
            ? "试着换一个说法"
            : mode === "done"
              ? "做得很好"
              : "你脑子里有这样的声音吗？"}
        </h1>
        {mode === "pick" && (
          <p className="text-sm text-ink-500 dark:text-ink-300 mt-2 leading-relaxed">
            选一句最像你的想法。我们不会否定它，而是一起看看是否还有别的角度。
          </p>
        )}
      </header>

      {mode === "pick" && (
        <>
          <div className="space-y-3">
            {REFRAME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t)}
                className="w-full text-left"
              >
                <Card>
                  <div className="text-base text-ink-700 dark:text-ink-100 leading-relaxed">
                    “{t.original}”
                  </div>
                </Card>
              </button>
            ))}
            <Card>
              <div className="text-sm text-ink-500 dark:text-ink-300 mb-3">
                都不太像？写下你自己的想法。
              </div>
              <Button block variant="outline" onClick={pickCustom}>
                自己写一个
              </Button>
            </Card>
          </div>

          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full text-sm text-ink-400 dark:text-ink-300 py-2"
          >
            {showHistory ? "收起" : "查看"}历史练习（{history.length}）
          </button>

          {showHistory && history.length > 0 && (
            <section className="space-y-2">
              {history.slice(0, 20).map((r) => (
                <Card key={r.reframeId} className="space-y-2">
                  <div className="text-xs text-ink-400 dark:text-ink-300">
                    {format(parseISO(r.createdAt), "M 月 d 日")}
                  </div>
                  <div className="text-sm text-ink-500 dark:text-ink-300 italic">
                    “{r.originalThought}”
                  </div>
                  <div className="text-sm text-ink-700 dark:text-ink-100 leading-relaxed">
                    → {r.balancedThought}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteReframe(r.reframeId)}
                      className="text-xs text-ink-400 dark:text-ink-300"
                    >
                      删除
                    </button>
                  </div>
                </Card>
              ))}
            </section>
          )}
        </>
      )}

      {mode === "compose" && (
        <>
          <Card>
            <div className="text-xs text-ink-400 dark:text-ink-300 mb-2">
              原始想法
            </div>
            <textarea
              value={customOriginal}
              onChange={(e) => setCustomOriginal(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full px-3 py-2 rounded-soft bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700 text-sm italic resize-none"
            />
          </Card>

          {template && (
            <Card className="bg-moon-50 dark:bg-moon-700/30 border-moon-200 dark:border-moon-700 space-y-3">
              <div className="text-sm font-medium text-ink-700 dark:text-ink-100">
                温和地问问自己
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-ink-600 dark:text-ink-200">
                {template.prompts.map((p, i) => (
                  <li key={i}>· {p}</li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-2">
              换一个说法
            </div>
            <textarea
              value={balanced}
              onChange={(e) => setBalanced(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="用你自己的话写一句更平衡的想法……"
              className="w-full px-4 py-3 rounded-soft bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700 text-base resize-none focus:outline-none focus:border-moon-300"
            />
            {template && (
              <button
                onClick={useSuggested}
                className="mt-2 text-xs text-moon-600 dark:text-moon-200"
              >
                ✎ 用建议的写法填入（可再修改）
              </button>
            )}
          </Card>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={reset}>
              重新选
            </Button>
            <Button
              block
              disabled={!customOriginal.trim() || !balanced.trim()}
              onClick={save}
            >
              保存这次练习
            </Button>
          </div>
        </>
      )}

      {mode === "done" && (
        <>
          <Card className="text-center py-10 space-y-3">
            <div className="text-5xl">🌿</div>
            <div className="text-base">这一次的转换已经存下来了。</div>
            <div className="text-sm text-ink-500 dark:text-ink-300 leading-relaxed">
              下次同样的想法跳出来时，你可以回到这里看一眼自己写过的话。
              想法不会马上消失，但慢慢地，新的声音会变大。
            </div>
          </Card>
          <div className="space-y-2">
            <Button block onClick={reset}>
              再练习一次
            </Button>
            <Button block variant="ghost" onClick={() => router.back()}>
              返回
            </Button>
          </div>
        </>
      )}

      {mode === "pick" && (
        <div className="pt-2">
          <Button block variant="ghost" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      )}
    </div>
  );
}
