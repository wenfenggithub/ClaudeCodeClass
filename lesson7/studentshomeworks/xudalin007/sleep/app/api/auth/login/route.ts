import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/server/crypto";
import { findUserByEmail, toSafeUser, updateUser } from "@/lib/server/user-store";
import { setSessionCookie } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; localUserId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  // 统一错误文案，避免泄露邮箱是否存在
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }
  if (user.disabled) {
    return NextResponse.json(
      { error: "该账户已被停用，请联系管理员" },
      { status: 403 },
    );
  }

  const updated = await updateUser(user.id, {
    lastLoginAt: new Date().toISOString(),
    // 匿名升级：刷新关联的本地 UUID（若提供）
    ...(body.localUserId ? { localUserId: body.localUserId } : {}),
  });

  const res = NextResponse.json({ user: toSafeUser(updated ?? user) });
  setSessionCookie(res, {
    userId: user.id,
    role: user.role,
    sessionVersion: (updated ?? user).sessionVersion ?? 0,
  });
  return res;
}
