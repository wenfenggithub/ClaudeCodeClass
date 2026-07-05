"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface StoryMeta {
  id: string;
  title: string;
  subtitle: string;
  estMinutes: number;
  paragraphs: number;
}
interface MeditationMeta extends StoryMeta {
  kind: string;
}

const KIND_LABEL: Record<string, string> = {
  pmr: "肌肉放松",
  bodyscan: "身体扫描",
  mindfulness: "正念",
  worry: "担忧卸载",
};

export default function AdminContentPage() {
  const [stories, setStories] = useState<StoryMeta[]>([]);
  const [meditations, setMeditations] = useState<MeditationMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/content", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("加载失败");
        return r.json();
      })
      .then((j) => {
        setStories(j.stories);
        setMeditations(j.meditations);
        setLoaded(true);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) return <div className="text-sm text-amber-500">{error}</div>;
  if (!loaded) return <div className="text-ink-400 text-sm">载入中…</div>;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="text-sm font-medium text-ink-500 dark:text-ink-300">
          冥想脚本（{meditations.length}）
        </div>
        {meditations.map((m) => (
          <Card key={m.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{m.title}</div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                {KIND_LABEL[m.kind] ?? m.kind} · {m.estMinutes} 分钟 ·{" "}
                {m.paragraphs} 段
              </div>
            </div>
            <span className="text-xs text-ink-300">{m.id}</span>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium text-ink-500 dark:text-ink-300">
          睡前故事（{stories.length}）
        </div>
        {stories.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{s.title}</div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                {s.subtitle} · {s.estMinutes} 分钟 · {s.paragraphs} 段
              </div>
            </div>
            <span className="text-xs text-ink-300">{s.id}</span>
          </Card>
        ))}
      </section>

      <Card>
        <div className="text-xs text-ink-400 dark:text-ink-300">
          原型阶段内容为只读展示。新增/编辑脚本请修改 lib/stories.ts 与
          lib/meditations.ts。
        </div>
      </Card>
    </div>
  );
}
