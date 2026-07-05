import clsx from "clsx";
import type { Insight } from "@/lib/types";
import { Card } from "./ui/Card";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card
      className={clsx(
        "border-l-4",
        insight.severity === "warning"
          ? "border-l-amber-300"
          : insight.severity === "suggest"
          ? "border-l-moon-300"
          : "border-l-ink-300",
      )}
    >
      <div className="text-base text-ink-700 dark:text-ink-100 leading-relaxed">
        {insight.message}
      </div>
    </Card>
  );
}
