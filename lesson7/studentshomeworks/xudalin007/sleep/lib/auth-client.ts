// 客户端认证 — /api/auth/* 的 fetch 封装
// 账户是「可选升级」：未登录时 App 仍以本地匿名 profile 正常运行。
"use client";

export type UserRole = "user" | "admin";

export interface Account {
  id: string;
  email: string;
  nickname?: string;
  role: UserRole;
  disabled: boolean;
  hasLocalData: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface ApiOk<T> {
  ok: true;
  data: T;
}
interface ApiErr {
  ok: false;
  error: string;
  status: number;
}
export type ApiResult<T> = ApiOk<T> | ApiErr;

async function post<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}`, status: res.status };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "网络错误，请确认服务端已启动", status: 0 };
  }
}

export async function apiMe(): Promise<Account | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user ?? null;
  } catch {
    return null;
  }
}

export function apiRegister(input: {
  email: string;
  password: string;
  nickname?: string;
  localUserId?: string;
}) {
  return post<{ user: Account }>("/api/auth/register", input);
}

export function apiLogin(input: {
  email: string;
  password: string;
  localUserId?: string;
}) {
  return post<{ user: Account }>("/api/auth/login", input);
}

export function apiLogout() {
  return post<{ ok: true }>("/api/auth/logout", {});
}

export function apiForgot(email: string) {
  return post<{ ok: true }>("/api/auth/forgot", { email });
}

export function apiReset(token: string, password: string) {
  return post<{ ok: true }>("/api/auth/reset", { token, password });
}
