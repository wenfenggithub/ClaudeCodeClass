import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

// 隔离：把数据目录指向临时目录，避免污染开发者的 .data/
const TMP = path.join(os.tmpdir(), `hush-userstore-test-${process.pid}`);
process.env.HUSH_DATA_DIR = TMP;

import {
  createUser,
  findUserByEmail,
  incrementSessionVersion,
  updateUser,
  deleteUser,
  countAdmins,
  listUsers,
} from "./user-store";
import { hashPassword } from "./crypto";

async function clean() {
  await fs.rm(TMP, { recursive: true, force: true });
}

beforeEach(clean);
afterAll(clean);

const pw = () => hashPassword("password123");

describe("用户存储", () => {
  it("首个用户成为管理员，第二个为普通用户", async () => {
    const u1 = await createUser({ email: "a@x.com", passwordHash: pw() });
    const u2 = await createUser({ email: "b@x.com", passwordHash: pw() });
    expect(u1.role).toBe("admin");
    expect(u2.role).toBe("user");
  });

  it("邮箱大小写归一化且重复被拒", async () => {
    await createUser({ email: "Dup@X.com", passwordHash: pw() });
    await expect(
      createUser({ email: "dup@x.com", passwordHash: pw() }),
    ).rejects.toThrow("email_taken");
    const found = await findUserByEmail("DUP@x.COM");
    expect(found?.email).toBe("dup@x.com");
  });

  it("countAdmins 反映启用的管理员数", async () => {
    await createUser({ email: "admin@x.com", passwordHash: pw() }); // admin
    await createUser({ email: "user@x.com", passwordHash: pw() }); // user
    expect(await countAdmins()).toBe(1);
  });

  it("禁用与删除可用", async () => {
    const a = await createUser({ email: "a@x.com", passwordHash: pw() });
    await createUser({ email: "b@x.com", passwordHash: pw() });
    await updateUser(a.id, { disabled: true });
    expect((await findUserByEmail("a@x.com"))?.disabled).toBe(true);
    expect(await deleteUser(a.id)).toBe(true);
    expect(await findUserByEmail("a@x.com")).toBeUndefined();
    expect((await listUsers()).length).toBe(1);
  });

  it("SEED_ADMIN_EMAIL 命中即为管理员", async () => {
    process.env.SEED_ADMIN_EMAIL = "boss@x.com";
    await createUser({ email: "first@x.com", passwordHash: pw() }); // 首个 → admin
    const boss = await createUser({ email: "boss@x.com", passwordHash: pw() });
    expect(boss.role).toBe("admin");
    delete process.env.SEED_ADMIN_EMAIL;
  });

  it("会话版本默认 0，安全事件可递增", async () => {
    const u = await createUser({ email: "version@x.com", passwordHash: pw() });
    expect(u.sessionVersion).toBe(0);

    expect(await incrementSessionVersion(u.id)).toBe(1);
    expect((await findUserByEmail("version@x.com"))?.sessionVersion).toBe(1);
  });
});
