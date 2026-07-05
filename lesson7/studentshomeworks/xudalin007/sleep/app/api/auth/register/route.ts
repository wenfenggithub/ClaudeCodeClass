import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/server/crypto";
import { createUser, toSafeUser } from "@/lib/server/user-store";
import { setSessionCookie } from "@/lib/server/session";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    password?: string;
    nickname?: string;
    localUserId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "请输入有效的邮箱" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 });
  }

  try {
    const user = await createUser({
      email,
      passwordHash: hashPassword(password),
      nickname: body.nickname,
      localUserId: body.localUserId,
    });
    const res = NextResponse.json({ user: toSafeUser(user) });
    setSessionCookie(res, {
      userId: user.id,
      role: user.role,
      sessionVersion: user.sessionVersion ?? 0,
    });
    return res;
  } catch (e) {
    if ((e as Error).message === "email_taken") {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
