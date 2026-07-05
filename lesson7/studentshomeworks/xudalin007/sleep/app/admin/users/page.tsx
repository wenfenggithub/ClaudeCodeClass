"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SafeUser {
  id: string;
  email: string;
  nickname?: string;
  role: "user" | "admin";
  disabled: boolean;
  hasLocalData: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<{ id: string; link: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/users", { cache: "no-store" });
    if (!r.ok) {
      setError("加载用户失败");
      return;
    }
    const j = await r.json();
    setUsers(j.users);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleDisabled = async (u: SafeUser) => {
    setError(null);
    const r = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !u.disabled }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "操作失败");
      return;
    }
    await load();
  };

  const doDelete = async (id: string) => {
    setError(null);
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "删除失败");
    }
    setConfirmDelete(null);
    await load();
  };

  const genResetLink = async (id: string) => {
    setError(null);
    const r = await fetch(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
    });
    if (!r.ok) {
      setError("生成失败");
      return;
    }
    const j = await r.json();
    setResetLink({ id, link: j.resetLink });
  };

  if (error && !users) {
    return <div className="text-sm text-amber-500">{error}</div>;
  }
  if (!users) return <div className="text-ink-400 text-sm">载入中…</div>;

  return (
    <div className="space-y-3">
      {error && <div className="text-sm text-amber-500 px-1">{error}</div>}

      {users.map((u) => (
        <Card key={u.id} className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {u.email}
                {u.role === "admin" && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-pill bg-moon-50 text-moon-600 dark:bg-moon-700/40 dark:text-moon-100">
                    管理员
                  </span>
                )}
                {u.disabled && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-pill bg-amber-100 text-amber-500">
                    已停用
                  </span>
                )}
              </div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                注册 {u.createdAt.slice(0, 10)}
                {u.lastLoginAt && ` · 最近登录 ${u.lastLoginAt.slice(0, 10)}`}
                {u.hasLocalData && " · 已关联本地数据"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={u.disabled ? "primary" : "danger-soft"}
              onClick={() => toggleDisabled(u)}
            >
              {u.disabled ? "启用" : "停用"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => genResetLink(u.id)}
            >
              重置密码
            </Button>
            {confirmDelete === u.id ? (
              <>
                <Button
                  size="sm"
                  variant="danger-soft"
                  onClick={() => doDelete(u.id)}
                >
                  确认删除
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(null)}
                >
                  取消
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(u.id)}
              >
                删除
              </Button>
            )}
          </div>

          {resetLink?.id === u.id && (
            <div className="text-xs bg-amber-100 dark:bg-amber-500/20 rounded-soft p-2 break-all">
              <div className="text-amber-500 font-medium mb-1">
                重置链接（60 分钟有效，转交给该用户）
              </div>
              <a
                href={resetLink.link.replace(/^https?:\/\/[^/]+/, "")}
                className="text-moon-600 dark:text-moon-200 underline"
              >
                {resetLink.link}
              </a>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
