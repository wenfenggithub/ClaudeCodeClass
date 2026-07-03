import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { POST } from "@/app/api/auth/forgot/route";
import { createUser } from "@/lib/server/user-store";
import { hashPassword } from "@/lib/server/crypto";

const TMP = path.join(os.tmpdir(), `hush-auth-route-test-${process.pid}`);
process.env.HUSH_DATA_DIR = TMP;

async function clean() {
  await fs.rm(TMP, { recursive: true, force: true });
}

beforeEach(clean);
afterAll(clean);

function forgotRequest(email: string): NextRequest {
  return new NextRequest("http://localhost/api/auth/forgot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

describe("/api/auth/forgot", () => {
  it("不向浏览器响应泄露重置链接", async () => {
    await createUser({
      email: "reset@example.com",
      passwordHash: hashPassword("OldPass123"),
    });

    const res = await POST(forgotRequest("reset@example.com"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(json.resetLink).toBeUndefined();
    expect(json.devMode).toBeUndefined();
  });
});
