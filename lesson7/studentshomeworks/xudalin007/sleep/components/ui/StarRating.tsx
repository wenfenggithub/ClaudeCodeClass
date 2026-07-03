"use client";

import clsx from "clsx";

interface Props {
  value: number; // 1-5
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ value, onChange, readOnly, size = "md" }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1.5" role="radiogroup">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          aria-label={`${s} 星`}
          disabled={readOnly}
          onClick={() => onChange?.(s)}
          className={clsx(
            "transition active:scale-95 disabled:cursor-default",
            size === "sm" && "text-xl",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl",
            s <= value
              ? "text-amber-300"
              : "text-ink-200 dark:text-ink-700 hover:text-amber-200",
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}
