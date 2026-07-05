import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { findUserById, toSafeUser } from "@/lib/server/user-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ user: null });
  const user = await findUserById(session.userId);
  if (!user || user.disabled) return NextResponse.json({ user: null });
  if ((session.sessionVersion ?? 0) !== (user.sessionVersion ?? 0)) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: toSafeUser(user) });
}
