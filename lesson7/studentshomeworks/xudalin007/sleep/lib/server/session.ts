// 服务端会话工具 — 基于签名 httpOnly cookie（无状态）
// 仅在 API 路由（runtime="nodejs"）使用。

import { NextRequest, NextResponse } from "next/server";
import {
  signSession,
  verifySession,
  type SessionPayload,
} from "./crypto";
import { findUserById, type ServerUser } from "./user-store";

export const SESSION_COOKIE = "hush_session";
const MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 天

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** 从请求读会话（仅校验签名/过期，不查库） */
export function getSession(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** 在响应上写会话 cookie */
export function setSessionCookie(
  res: NextResponse,
  payload: Omit<SessionPayload, "exp">,
): void {
  const full: SessionPayload = {
    ...payload,
    exp: Date.now() + MAX_AGE_SEC * 1000,
  };
  res.cookies.set({
    name: SESSION_COOKIE,
    value: signSession(full),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

/** 清除会话 cookie */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * 要求已登录且未被禁用，返回完整用户。
 * 失败抛 AuthError(401)。
 */
export async function requireUser(req: NextRequest): Promise<ServerUser> {
  const session = getSession(req);
  if (!session) throw new AuthError(401, "未登录");
  const user = await findUserById(session.userId);
  if (!user || user.disabled) throw new AuthError(401, "会话已失效");
  if ((session.sessionVersion ?? 0) !== (user.sessionVersion ?? 0)) {
    throw new AuthError(401, "会话已失效，请重新登录");
  }
  return user;
}

/** 要求管理员角色，失败抛 AuthError(401|403) */
export async function requireAdmin(req: NextRequest): Promise<ServerUser> {
  const user = await requireUser(req);
  if (user.role !== "admin") throw new AuthError(403, "需要管理员权限");
  return user;
}

/** 把 AuthError 转为 JSON 响应（路由 catch 用） */
export function authErrorResponse(e: unknown): NextResponse {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return NextResponse.json({ error: "服务器错误" }, { status: 500 });
}
