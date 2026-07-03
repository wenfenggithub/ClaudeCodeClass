import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/server/session";
import { listUsers, toSafeUser } from "@/lib/server/user-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const users = await listUsers();
    return NextResponse.json({ users: users.map(toSafeUser) });
  } catch (e) {
    return authErrorResponse(e);
  }
}
