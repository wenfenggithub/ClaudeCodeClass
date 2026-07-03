"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";

interface Overview {
  total: number;
  admins: number;
  disabled: number;
  new7d: number;
  new30d: number;
  active7d: number;
  linked: number;
  daily: { date: string; count: number }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("加载失败");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) return <div className="text-sm text-amber-500">{error}</div>;
  if (!data) return <div className="text-ink-400 text-sm">载入中…</div>;

  const stats = [
    { label: "总用户", value: data.total },
    { label: "管理员", value: data.admins },
    { label: "已停用", value: data.disabled },
    { label: "近 7 天活跃", value: data.active7d },
    { label: "近 7 天新增", value: data.new7d },
    { label: "近 30 天新增", value: data.new30d },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-xs text-ink-400">{s.label}</div>
            <div className="text-2xl font-medium mt-1">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="text-sm font-medium mb-3">近 14 天注册</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.daily}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={1}
                stroke="currentColor"
                className="text-ink-300"
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar
                dataKey="count"
                fill="#8b7fd6"
                radius={[4, 4, 0, 0]}
                name="注册数"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="text-xs text-ink-400 dark:text-ink-300 leading-relaxed">
          隐私说明：服务端不存储任何睡眠日记、备注等健康数据，本概览仅基于账户元数据聚合。
          其中 {data.linked} 个账户已关联本地匿名数据。
        </div>
      </Card>
    </div>
  );
}
