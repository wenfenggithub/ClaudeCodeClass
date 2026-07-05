"use client";

import clsx from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger-soft";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", block, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "rounded-pill font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-2.5 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        block && "w-full",
        variant === "primary" &&
          "bg-moon-500 text-ink-50 hover:bg-moon-600 dark:bg-moon-300 dark:text-ink-900 dark:hover:bg-moon-200",
        variant === "ghost" &&
          "text-moon-600 hover:bg-moon-50 dark:text-moon-200 dark:hover:bg-moon-700/40",
        variant === "outline" &&
          "border border-ink-200 text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800",
        variant === "danger-soft" &&
          "bg-amber-100 text-amber-500 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-100",
        className,
      )}
      {...rest}
    />
  );
});
