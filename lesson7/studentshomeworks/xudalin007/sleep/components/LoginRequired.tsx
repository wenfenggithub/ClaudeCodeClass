"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authHref } from "@/lib/auth-links";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LoginRequired({
  title = "登录后可用",
  body = "这个功能需要账户登录后使用。匿名模式仍可使用睡眠日记、报告、计划、助眠声音试听和本地数据功能。",
}: {
  title?: string;
  body?: string;
}) {
  const pathname = usePathname();
  const [next, setNext] = useState(pathname);

  useEffect(() => {
    setNext(`${window.location.pathname}${window.location.search}`);
  }, [pathname]);

  return (
    <Card className="bg-ink-50 dark:bg-ink-800/70 border-dashed border-ink-200 dark:border-ink-700 text-center space-y-3">
      <div>
        <div className="text-sm font-medium text-ink-600 dark:text-ink-100">
          {title}
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-300 mt-1 leading-relaxed">
          {body}
        </p>
      </div>
      <Link href={authHref("login", next)}>
        <Button size="sm" variant="outline">
          去登录
        </Button>
      </Link>
    </Card>
  );
}
