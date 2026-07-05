import { NextRequest, NextResponse } from "next/server";
import { hashPassword, hashToken } from "@/lib/server/crypto";
import {
  consumeResetToken,
  incrementSessionVersion,
  updateUser,
} from "@/lib/server/user-store";
import { clearSessionCookie } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const token = body.token?.trim();
  const password = body.password ?? "";
  if (!token) {
    return NextResponse.json({ error: "重置令牌缺失" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 });
  }

  const userId = await consumeResetToken(hashToken(token));
  if (!userId) {
    return NextResponse.json(
      { error: "链接已失效或已使用，请重新申请" },
      { status: 400 },
    );
  }

  const updated = await updateUser(userId, {
    passwordHash: hashPassword(password),
  });
  if (!updated) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }
  await incrementSessionVersion(userId);

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
