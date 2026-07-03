import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/server/session";
import {
  findUserById,
  updateUser,
  deleteUser,
  countAdmins,
  toSafeUser,
} from "@/lib/server/user-store";

export const runtime = "nodejs";

// 启用 / 禁用
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin(req);
    const target = await findUserById(params.id);
    if (!target) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    let body: { disabled?: boolean };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }

    if (typeof body.disabled === "boolean") {
      // 防锁死：不能禁用最后一个有效 admin
      if (body.disabled && target.role === "admin" && !target.disabled) {
        const admins = await countAdmins();
        if (admins <= 1) {
          return NextResponse.json(
            { error: "不能停用最后一个管理员" },
            { status: 400 },
          );
        }
      }
      const updated = await updateUser(params.id, { disabled: body.disabled });
      return NextResponse.json({ user: updated ? toSafeUser(updated) : null });
    }

    return NextResponse.json({ error: "无可更新字段" }, { status: 400 });
  } catch (e) {
    return authErrorResponse(e);
  }
}

// 删除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdmin(req);
    const target = await findUserById(params.id);
    if (!target) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    if (target.id === admin.id) {
      return NextResponse.json(
        { error: "不能删除当前登录的自己" },
        { status: 400 },
      );
    }
    // 防锁死：不能删除最后一个有效 admin
    if (target.role === "admin" && !target.disabled) {
      const admins = await countAdmins();
      if (admins <= 1) {
        return NextResponse.json(
          { error: "不能删除最后一个管理员" },
          { status: 400 },
        );
      }
    }
    const ok = await deleteUser(params.id);
    return NextResponse.json({ ok });
  } catch (e) {
    return authErrorResponse(e);
  }
}
