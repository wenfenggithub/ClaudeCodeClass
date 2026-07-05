"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiMe, type Account } from "@/lib/auth-client";

const TABS = [
  { href: "/admin", label: "数据概览" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/content", label: "内容管理" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let alive = true;
    void apiMe().then((acc) => {
      if (!alive) return;
      if (acc && acc.role === "admin") {
        setAccount(acc);
        setState("ok");
      } else {
        setState("denied");
        router.replace("/");
      }
    });
    return () => {
      alive = false;
    };
  }, [router]);

  if (state === "loading") {
    return <div className="px-5 pt-12 text-ink-400">校验权限中…</div>;
  }
  if (state === "denied") {
    return <div className="px-5 pt-12 text-ink-400">无权限，正在返回…</div>;
  }

  return (
    <div className="px-5 pt-10 pb-12">
      <header className="mb-5">
        <h1 className="text-2xl font-medium">管理控制台</h1>
        <p className="text-xs text-ink-400 dark:text-ink-300 mt-1">
          {account?.email} · 管理员
        </p>
      </header>

      <nav className="flex gap-2 mb-6 border-b border-ink-100 dark:border-ink-700">
        {TABS.map((t) => {
          const active =
            t.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                "pb-2 px-1 text-sm border-b-2 -mb-px " +
                (active
                  ? "border-moon-400 text-moon-600 dark:text-moon-200 font-medium"
                  : "border-transparent text-ink-400")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
