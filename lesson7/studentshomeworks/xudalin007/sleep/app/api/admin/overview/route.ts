import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/server/session";
import { listUsers } from "@/lib/server/user-store";

export const runtime = "nodejs";

// 隐私安全：服务端本就不存任何健康/日记数据，概览只聚合账户元数据。
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const users = await listUsers();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const within = (iso: string | undefined, days: number) =>
      !!iso && now - new Date(iso).getTime() < days * DAY;

    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const disabled = users.filter((u) => u.disabled).length;
    const new7d = users.filter((u) => within(u.createdAt, 7)).length;
    const new30d = users.filter((u) => within(u.createdAt, 30)).length;
    const active7d = users.filter((u) => within(u.lastLoginAt, 7)).length;
    const linked = users.filter((u) => !!u.localUserId).length;

    // 近 14 天每日注册数（用于柱状图）
    const daily: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      const key = d.toISOString().slice(0, 10);
      const count = users.filter((u) => u.createdAt.slice(0, 10) === key).length;
      daily.push({ date: key.slice(5), count });
    }

    return NextResponse.json({
      total,
      admins,
      disabled,
      new7d,
      new30d,
      active7d,
      linked,
      daily,
    });
  } catch (e) {
    return authErrorResponse(e);
  }
}
