"use client";

import { tierOf, tierText } from "@/lib/score";

interface Props {
  score: number; // 0-100
  size?: number;
  showText?: boolean;
}

export function ScoreArc({ score, size = 180, showText = true }: Props) {
  const tier = tierOf(score);
  const text = tierText(tier);
  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const total = 270; // 弧度
  const startAngle = 135;
  const endAngle = startAngle + total;
  const polar = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  const [x1, y1] = polar(startAngle);
  const [x2, y2] = polar(endAngle);
  const bgPath = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;

  const pct = Math.max(0, Math.min(1, score / 100));
  const filledEnd = startAngle + total * pct;
  const [fx, fy] = polar(filledEnd);
  const filledLarge = total * pct > 180 ? 1 : 0;
  const filledPath = `M ${x1} ${y1} A ${r} ${r} 0 ${filledLarge} 1 ${fx} ${fy}`;

  const color =
    tier === "wonderful" || tier === "nice"
      ? "#9CB89C"
      : tier === "okay"
      ? "#A998C0"
      : "#D7A653";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          className="text-ink-100 dark:text-ink-700"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={filledPath}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-ink-700 dark:fill-ink-50"
          style={{ fontSize: 36, fontWeight: 600 }}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          className="fill-ink-400 dark:fill-ink-300"
          style={{ fontSize: 12 }}
        >
          昨晚的睡眠分
        </text>
      </svg>
      {showText && (
        <div className="text-center mt-1">
          <div className="text-lg font-medium">{text.label}</div>
          <div className="text-sm text-ink-400 dark:text-ink-300 mt-1">
            {text.ribbon}
          </div>
        </div>
      )}
    </div>
  );
}
