import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-ink-800 rounded-soft shadow-soft dark:shadow-soft-dark p-5 border border-ink-100/60 dark:border-ink-700/60",
        className,
      )}
      {...rest}
    />
  );
}
