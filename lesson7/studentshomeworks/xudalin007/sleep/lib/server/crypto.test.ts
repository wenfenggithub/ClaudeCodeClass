import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signSession,
  verifySession,
  randomToken,
  hashToken,
} from "./crypto";

describe("密码哈希", () => {
  it("哈希不等于明文", () => {
    const h = hashPassword("hunter2pass");
    expect(h).not.toContain("hunter2pass");
    expect(h.startsWith("scrypt$")).toBe(true);
  });

  it("正确密码校验通过", () => {
    const h = hashPassword("correct horse");
    expect(verifyPassword("correct horse", h)).toBe(true);
  });

  it("错误密码校验失败", () => {
    const h = hashPassword("correct horse");
    expect(verifyPassword("wrong horse", h)).toBe(false);
  });

  it("损坏的哈希返回 false 而非抛错", () => {
    expect(verifyPassword("x", "not-a-valid-hash")).toBe(false);
  });

  it("相同密码两次哈希不同（随机盐）", () => {
    expect(hashPassword("samepw1234")).not.toBe(hashPassword("samepw1234"));
  });
});

describe("会话签名", () => {
  it("签名后可校验通过", () => {
    const token = signSession({
      userId: "u1",
      role: "admin",
      exp: Date.now() + 10000,
    });
    const payload = verifySession(token);
    expect(payload?.userId).toBe("u1");
    expect(payload?.role).toBe("admin");
  });

  it("会话可携带版本号", () => {
    const token = signSession({
      userId: "u1",
      role: "user",
      sessionVersion: 3,
      exp: Date.now() + 10000,
    });

    expect(verifySession(token)?.sessionVersion).toBe(3);
  });

  it("过期会话被拒", () => {
    const token = signSession({
      userId: "u1",
      role: "user",
      exp: Date.now() - 1000,
    });
    expect(verifySession(token)).toBeNull();
  });

  it("被篡改的会话被拒", () => {
    const token = signSession({
      userId: "u1",
      role: "user",
      exp: Date.now() + 10000,
    });
    const tampered = token.slice(0, -2) + "xy";
    expect(verifySession(tampered)).toBeNull();
  });

  it("undefined / 空 token 返回 null", () => {
    expect(verifySession(undefined)).toBeNull();
    expect(verifySession("")).toBeNull();
    expect(verifySession("no-dot")).toBeNull();
  });
});

describe("重置令牌", () => {
  it("令牌哈希稳定且不等于明文", () => {
    const t = randomToken();
    expect(t).toHaveLength(64); // 32 字节 hex
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).not.toBe(t);
  });
});
