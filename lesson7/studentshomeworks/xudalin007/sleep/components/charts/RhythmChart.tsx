"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  date: string;
  bedMin: number; // 上床时间（分钟，跨午夜归一化到 24-30）
  wakeMin: number; // 起床时间（分钟）
}

const minToHHmm = (m: number) => {
  const norm = ((m % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(norm / 60);
  const mm = Math.round(norm % 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export function RhythmChart({ data }: { data: Point[] }) {
  const bed = data.map((p) => ({ x: p.date.slice(5), y: p.bedMin }));
  const wake = data.map((p) => ({ x: p.date.slice(5), y: p.wakeMin }));
  return (
    <div className="w-full h-56">
      <ResponsiveContainer>
        <ScatterChart margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#D8D2C7" strokeDasharray="2 4" />
          <XAxis dataKey="x" type="category" stroke="#8C8478" fontSize={11} />
          <YAxis
            type="number"
            domain={[18 * 60, 12 * 60 + 24 * 60]}
            tickFormatter={minToHHmm}
            stroke="#8C8478"
            fontSize={11}
            width={48}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #D8D2C7",
              background: "var(--card)",
              color: "var(--fg)",
              fontSize: 12,
            }}
            formatter={(v) => minToHHmm(Number(v))}
          />
          <Scatter
            data={bed}
            fill="#65557A"
            name="上床"
            shape="circle"
          />
          <Scatter
            data={wake}
            fill="#D7A653"
            name="起床"
            shape="diamond"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
