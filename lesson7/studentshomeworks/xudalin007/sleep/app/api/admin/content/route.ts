import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/server/session";
import { STORIES } from "@/lib/stories";
import { MEDITATIONS } from "@/lib/meditations";

export const runtime = "nodejs";

// 只读内容清单（睡前故事 + 冥想脚本元数据）
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const stories = STORIES.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      estMinutes: s.estMinutes,
      paragraphs: s.paragraphs.length,
    }));
    const meditations = MEDITATIONS.map((m) => ({
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      kind: m.kind,
      estMinutes: m.estMinutes,
      paragraphs: m.paragraphs.length,
    }));
    return NextResponse.json({ stories, meditations });
  } catch (e) {
    return authErrorResponse(e);
  }
}
