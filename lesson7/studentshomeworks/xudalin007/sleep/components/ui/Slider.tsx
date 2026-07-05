"use client";

import clsx from "clsx";
import type { ChangeEvent } from "react";

interface Props {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
  formatValue?: (v: number) => string;
  className?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  formatValue,
  className,
}: Props) {
  const handle = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(Number(e.target.value));
  return (
    <div className={clsx("space-y-2", className)}>
      {label && (
        <div className="flex justify-between text-sm text-ink-500 dark:text-ink-300">
          <span>{label}</span>
          <span className="font-medium text-moon-600 dark:text-moon-200">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handle}
        className="w-full accent-moon-500 dark:accent-moon-300"
      />
    </div>
  );
}
