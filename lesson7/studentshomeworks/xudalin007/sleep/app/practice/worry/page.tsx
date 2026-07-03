"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { uid } from "@/lib/uid";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoginRequired } from "@/components/LoginRequired";
import { canUseRelaxationPractice } from "@/lib/practice-access";

const PROMPT_HINTS = [
  "工作上还没解决的事？",
  "明天 / 这周让你紧张的安排？",
  "今天和谁的对话让你不舒服？",
  "身体上让你担心的感觉？",
  "钱、关系、未来 — 任何在脑子里转的话题。",
];

export default function WorryPage() {
  const ready = useHydrated();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const worries = useStore((s) => s.worries);
  const addWorry = useStore((s) => s.addWorry);
  const archiveWorry = useStore((s) => s.archiveWorry);
  const deleteWorry = useStore((s) => s.deleteWorry);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);

  const [draft, setDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  const todayActive = useMemo(
    () =>
      worries
        .filter((w) => w.date === today && !w.archived)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [worries, today],
  );
  const recentArchived = useMemo(
    () =>
      worries
        .filter((w) => w.archived)
        .sort((a, b) =>
          (b.archivedAt ?? b.createdAt).localeCompare(
            a.archivedAt ?? a.createdAt,
          ),
        )
        .slice(0, 20),
    [worries],
  );

  if (!ready || !profile || !accountLoaded) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  if (!canUseRelaxationPractice("worry", !!account)) {
    return (
      <div className="px-5 pt-10 pb-12 space-y-4">
        <LoginRequired body="担忧时间需要登录后使用。登录后会自动回到这个练习。" />
        <Button block variant="ghost" onClick={() => router.replace("/practice")}>
          返回训练页
        </Button>
      </div>
    );
  }

  const add = () => {
    const content = draft.trim();
    if (!content) return;
    addWorry({
      worryId: uid(),
      userId: profile.userId,
      date: today,
      content,
      archived: false,
      createdAt: new Date().toISOString(),
    });
    setDraft("");
  };

  const archiveAll = async () => {
    for (const w of todayActive) await archiveWorry(w.worryId);
  };

  return (
    <div className="px-5 pt-10 pb-12 space-y-5">
      <header>
        <div className="text-sm text-ink-400 dark:text-ink-300">CBT-I · 担忧时间</div>
        <h1 className="text-2xl font-medium mt-1">把烦心事先放在这里</h1>
        <p className="text-sm text-ink-500 dark:text-ink-300 mt-2 leading-relaxed">
          每天给自己 10–15 分钟，把脑子里转的事一条一条写下来。
          写完归档，告诉自己「这件事已经处理过了，今晚不用再想」。
        </p>
      </header>

      <Card>
        <div className="text-sm text-ink-500 dark:text-ink-300 mb-2">
          现在让你担心的是什么？
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder={
            PROMPT_HINTS[Math.floor(Math.random() * PROMPT_HINTS.length)]
          }
          className="w-full px-4 py-3 rounded-soft bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700 text-base resize-none focus:outline-none focus:border-moon-300"
        />
        <div className="flex justify-end mt-3">
          <Button disabled={!draft.trim()} onClick={add}>
            写下来
          </Button>
        </div>
      </Card>

      {todayActive.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-sm font-medium text-ink-500 dark:text-ink-300">
              今天的清单（{todayActive.length}）
            </div>
            <button
              onClick={archiveAll}
              className="text-xs text-moon-600 dark:text-moon-200"
            >
              全部归档 →
            </button>
          </div>
          {todayActive.map((w) => (
            <Card key={w.worryId} className="space-y-3">
              <div className="text-base leading-relaxed text-ink-700 dark:text-ink-100 whitespace-pre-wrap">
                {w.content}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => deleteWorry(w.worryId)}
                  className="text-xs text-ink-400 dark:text-ink-300 px-3 py-1.5"
                >
                  删除
                </button>
                <button
                  onClick={() => archiveWorry(w.worryId)}
                  className="text-xs text-moon-600 dark:text-moon-200 bg-moon-50 dark:bg-moon-700/40 px-3 py-1.5 rounded-pill"
                >
                  归档（明天再想）
                </button>
              </div>
            </Card>
          ))}

          <Card className="bg-moon-50 dark:bg-moon-700/30 border-moon-200 dark:border-moon-700">
            <div className="text-sm leading-relaxed text-ink-700 dark:text-ink-100">
              💡 写完之后：如果今晚再想到这些事，可以告诉自己
              <strong>「这件事已经在担忧时间处理过了，明天再想」</strong>。
            </div>
          </Card>
        </section>
      )}

      <button
        onClick={() => setShowHistory((v) => !v)}
        className="w-full text-sm text-ink-400 dark:text-ink-300 py-2"
      >
        {showHistory ? "收起" : "查看"}历史归档（{recentArchived.length}）
      </button>

      {showHistory && recentArchived.length > 0 && (
        <section className="space-y-2">
          {recentArchived.map((w) => (
            <Card key={w.worryId} className="opacity-70">
              <div className="text-xs text-ink-400 dark:text-ink-300 mb-1">
                {w.archivedAt
                  ? format(parseISO(w.archivedAt), "M 月 d 日")
                  : w.date}
              </div>
              <div className="text-sm text-ink-600 dark:text-ink-200 whitespace-pre-wrap line-clamp-3">
                {w.content}
              </div>
            </Card>
          ))}
        </section>
      )}

      <div className="pt-4">
        <Button block variant="ghost" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    </div>
  );
}
