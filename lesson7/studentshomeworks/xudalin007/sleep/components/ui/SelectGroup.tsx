"use client";

import clsx from "clsx";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  multiple?: false;
  columns?: 1 | 2 | 3 | 4;
}

interface MultiProps<T extends string> {
  options: Option<T>[];
  value: T[];
  onChange: (v: T[]) => void;
  multiple: true;
  columns?: 1 | 2 | 3 | 4;
}

export function SelectGroup<T extends string>(
  props: Props<T> | MultiProps<T>,
) {
  const colsClass =
    props.columns === 1 ? "grid-cols-1" :
    props.columns === 3 ? "grid-cols-3" :
    props.columns === 4 ? "grid-cols-4" : "grid-cols-2";

  const isActive = (v: T) =>
    props.multiple ? props.value.includes(v) : props.value === v;

  const toggle = (v: T) => {
    if (props.multiple) {
      const cur = props.value;
      if (cur.includes(v)) props.onChange(cur.filter((x) => x !== v));
      else props.onChange([...cur, v]);
    } else {
      props.onChange(v);
    }
  };

  return (
    <div className={clsx("grid gap-2", colsClass)}>
      {props.options.map((o) => {
        const active = isActive(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={clsx(
              "px-4 py-3 rounded-soft text-left transition border",
              active
                ? "bg-moon-50 border-moon-300 text-moon-700 dark:bg-moon-700/40 dark:border-moon-300 dark:text-moon-100"
                : "bg-white border-ink-200 text-ink-700 hover:bg-ink-50 dark:bg-ink-800 dark:border-ink-700 dark:text-ink-100",
            )}
          >
            <div className="text-sm font-medium">{o.label}</div>
            {o.hint && (
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                {o.hint}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
