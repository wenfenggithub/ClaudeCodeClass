"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  apiForgot,
  apiLogin,
  apiRegister,
  apiReset,
} from "@/lib/auth-client";
import { sanitizeNext, type AuthMode } from "@/lib/auth-links";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const inputCls =
  "w-full px-3 py-2.5 rounded-soft bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-base outline-none focus:border-moon-400";

const authModes = new Set<AuthMode>(["login", "register", "forgot", "reset"]);

function modeFromSearch(): AuthMode | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("auth");
  return authModes.has(raw as AuthMode) ? (raw as AuthMode) : null;
}

export function AuthPanel({
  compact = false,
  defaultExpanded = !compact,
}: {
  compact?: boolean;
  defaultExpanded?: boolean;
}) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);
  const setAccount = useStore((s) => s.setAccount);
  const signOut = useStore((s) => s.signOut);

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [mode, setMode] = useState<AuthMode>("login");
  const [next, setNext] = useState("/");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryMode = modeFromSearch();
    if (queryMode) {
      setMode(queryMode);
      setExpanded(true);
    }
    setNext(sanitizeNext(params.get("next")));
    setToken(params.get("token") ?? "");
  }, []);

  const target = useMemo(() => sanitizeNext(next), [next]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setExpanded(true);
    setError(null);
    setMessage(null);
    setPassword("");
    setConfirm("");
  };

  const finishAuth = () => {
    router.replace(target === "/" && !profile ? "/onboarding" : target);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await apiLogin({
      email,
      password,
      localUserId: profile?.userId,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setAccount(res.data.user);
    finishAuth();
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    setBusy(true);
    const res = await apiRegister({
      email,
      password,
      nickname: nickname || profile?.nickname,
      localUserId: profile?.userId,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setAccount(res.data.user);
    finishAuth();
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    const res = await apiForgot(email);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("如果该邮箱已注册，重置链接已经发出，请查收邮箱。");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) {
      setError("重置链接无效，请重新申请。");
      return;
    }
    if (password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setBusy(true);
    const res = await apiReset(token, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("密码已重置，现在可以用新密码登录。");
    setAccount(null);
    setMode("login");
    setPassword("");
    setConfirm("");
  };

  if (account && mode !== "reset" && mode !== "forgot") {
    if (compact) {
      return (
        <Card className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{account.email}</div>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
              {account.role === "admin" ? "管理员账户" : "已登录"}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void signOut()}>
            退出
          </Button>
        </Card>
      );
    }

    return (
      <Card className="space-y-3">
        <div>
          <div className="text-sm font-medium">{account.email}</div>
          <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
            {account.role === "admin" ? "管理员账户" : "已登录"}
            {" · 故事、放松训练与 AI 朗读已解锁"}
          </div>
        </div>
        <div className="flex gap-2">
          {account.role === "admin" && (
            <Link href="/admin" className="flex-1">
              <Button block size="sm" variant="outline">
                管理控制台
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={account.role === "admin" ? "" : "w-full"}
            onClick={() => void signOut()}
          >
            退出登录
          </Button>
        </div>
      </Card>
    );
  }

  if (!expanded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">账户</div>
            <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
              登录后解锁故事、放松训练和 AI 朗读
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" onClick={() => switchMode("login")}>
              登录
            </Button>
            <Button size="sm" variant="outline" onClick={() => switchMode("register")}>
              注册
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <div className="text-sm font-medium">
          {mode === "login" && "登录账户"}
          {mode === "register" && "注册账户"}
          {mode === "forgot" && "找回密码"}
          {mode === "reset" && "重置密码"}
        </div>
        <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
          睡眠记录仍然保存在本机。登录后解锁故事、放松训练、AI 朗读和管理员能力。
        </div>
      </div>

      {mode === "login" && (
        <form onSubmit={submitLogin} className="space-y-3">
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">邮箱</div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">密码</div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          {error && <div className="text-sm text-amber-500">{error}</div>}
          {message && <div className="text-sm text-score-high">{message}</div>}
          <Button block type="submit" disabled={busy}>
            {busy ? "登录中…" : "登录"}
          </Button>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={submitRegister} className="space-y-3">
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">邮箱</div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">
              昵称（选填）
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputCls}
              placeholder={profile?.nickname || "怎么称呼你"}
            />
          </label>
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">
              密码（至少 8 位）
            </div>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          {error && <div className="text-sm text-amber-500">{error}</div>}
          <Button block type="submit" disabled={busy}>
            {busy ? "创建中…" : "创建账户"}
          </Button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={submitForgot} className="space-y-3">
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">邮箱</div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          {error && <div className="text-sm text-amber-500">{error}</div>}
          {message && (
            <div className="text-sm text-ink-500 dark:text-ink-200">
              {message}
            </div>
          )}
          <Button block type="submit" disabled={busy}>
            {busy ? "发送中…" : "发送重置链接"}
          </Button>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={submitReset} className="space-y-3">
          {!token && (
            <div className="text-sm text-amber-500">
              当前重置链接无效，请重新申请。
            </div>
          )}
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">
              新密码（至少 8 位）
            </div>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          <label className="block text-sm">
            <div className="text-ink-500 dark:text-ink-300 mb-1">
              确认新密码
            </div>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              required
            />
          </label>
          {error && <div className="text-sm text-amber-500">{error}</div>}
          {message && <div className="text-sm text-score-high">{message}</div>}
          <Button block type="submit" disabled={busy || !token}>
            {busy ? "重置中…" : "确认重置"}
          </Button>
        </form>
      )}

      <div className="flex items-center justify-between text-sm">
        {mode !== "login" ? (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="text-moon-600 dark:text-moon-200"
          >
            去登录
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            className="text-moon-600 dark:text-moon-200"
          >
            忘记密码？
          </button>
        )}
        {mode !== "register" && (
          <button
            type="button"
            onClick={() => switchMode("register")}
            className="text-moon-600 dark:text-moon-200"
          >
            注册新账户
          </button>
        )}
      </div>
    </Card>
  );
}
