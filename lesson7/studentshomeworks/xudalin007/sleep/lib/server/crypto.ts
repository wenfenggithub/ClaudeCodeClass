// 服务端密码哈希 + 会话签名 + 重置令牌
// 全部使用 Node 内置 crypto，不引入任何依赖。
// 仅在服务端（API 路由，runtime="nodejs"）使用。

import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
  createHash,
} from "node:crypto";

// ---- 密码哈希（scrypt） ----

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

/** 生成 scrypt 哈希，格式 `scrypt$N$r$p$saltB64$hashB64` */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString(
    "base64",
  )}$${hash.toString("base64")}`;
}

/** 校验密码与已存哈希是否匹配（timingSafeEqual 防时序攻击） */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const N = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    const actual = scryptSync(password, salt, expected.length, { N, r, p });
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ---- 会话签名（HMAC-SHA256，无状态 cookie） ----

const DEV_SECRET = "hush-dev-insecure-secret-change-me";
let warnedSecret = false;

function authSecret(): string {
  const s = process.env.AUTH_SECRET?.trim();
  if (s) return s;
  if (!warnedSecret) {
    // eslint-disable-next-line no-console
    console.warn(
      "[auth] ⚠️ 未配置 AUTH_SECRET，使用开发默认密钥（生产环境必须配置！）",
    );
    warnedSecret = true;
  }
  return DEV_SECRET;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export interface SessionPayload {
  userId: string;
  role: "user" | "admin";
  /** 与用户表 sessionVersion 一致；不一致说明密码等凭证已变更 */
  sessionVersion?: number;
  /** 过期时间戳（毫秒） */
  exp: number;
}

/** 把 payload 签名为 cookie 字符串 `<payloadB64url>.<sigB64url>` */
export function signSession(payload: SessionPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(
    createHmac("sha256", authSecret()).update(body).digest(),
  );
  return `${body}.${sig}`;
}

/** 校验并解析 cookie，失败或过期返回 null */
export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = b64url(
    createHmac("sha256", authSecret()).update(body).digest(),
  );
  // 长度相等才比较，避免 timingSafeEqual 抛错
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---- 重置令牌 ----

/** 生成 32 字节 hex 明文令牌（发邮件用） */
export function randomToken(): string {
  return randomBytes(32).toString("hex");
}

/** 取令牌的 SHA-256 哈希（DB 只存哈希，防泄露重放） */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** 生成一个临时密码（管理员重置用） */
export function randomTempPassword(): string {
  // 12 位 base64url，去掉易混淆字符
  return b64url(randomBytes(9));
}
