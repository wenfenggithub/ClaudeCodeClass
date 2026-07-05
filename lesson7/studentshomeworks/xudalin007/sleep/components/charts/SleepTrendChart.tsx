"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  date: string;
  durationH: number;
  efficiency: number;
  score: number;
}

export function SleepTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(d) => d.slice(5)}
            stroke="#8C8478"
            fontSize={11}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 12]}
            stroke="#8C8478"
            fontSize={11}
            width={28}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            stroke="#8C8478"
            fontSize={11}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #D8D2C7",
              background: "var(--card)",
              color: "var(--fg)",
              fontSize: 12,
            }}
            labelFormatter={(d) => `日期：${d}`}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="durationH"
            name="时长(小时)"
            stroke="#65557A"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="score"
            name="评分"
            stroke="#9CB89C"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
