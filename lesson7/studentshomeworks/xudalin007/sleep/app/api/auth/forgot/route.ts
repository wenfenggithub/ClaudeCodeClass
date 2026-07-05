import { NextRequest, NextResponse } from "next/server";
import { randomToken, hashToken } from "@/lib/server/crypto";
import { findUserByEmail, addResetToken } from "@/lib/server/user-store";
import { sendResetEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 分钟

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "请输入邮箱" }, { status: 400 });
  }

  const user = await findUserByEmail(email);

  // 恒返回 200，避免用户枚举
  if (user && !user.disabled) {
    const token = randomToken();
    await addResetToken({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });
    const origin = req.nextUrl.origin;
    const link = `${origin}/reset?token=${token}`;
    await sendResetEmail(user.email, link);
  }

  return NextResponse.json({
    ok: true,
  });
}
