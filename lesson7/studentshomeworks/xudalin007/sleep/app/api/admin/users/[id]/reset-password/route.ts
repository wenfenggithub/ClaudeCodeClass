import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/server/session";
import { randomToken, hashToken } from "@/lib/server/crypto";
import { findUserById, addResetToken } from "@/lib/server/user-store";

export const runtime = "nodejs";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 管理员生成的链接给 60 分钟

// 管理员为某用户生成重置链接（原型直接返回链接，便于线下转交）
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin(req);
    const target = await findUserById(params.id);
    if (!target) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    const token = randomToken();
    await addResetToken({
      tokenHash: hashToken(token),
      userId: target.id,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });
    const link = `${req.nextUrl.origin}/reset?token=${token}`;
    return NextResponse.json({ ok: true, resetLink: link, email: target.email });
  } catch (e) {
    return authErrorResponse(e);
  }
}
