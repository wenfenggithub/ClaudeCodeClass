// 服务端用户存储 — JSON 文件（.data/users.json）
//
// 原型阶段用 JSON 文件存账户，零外部依赖（npm run dev 即可跑通）。
// 模块级 async 写互斥锁保证单进程下顺序写入。
// 真实产品应迁移到 Postgres / SQLite；本文件接口保持稳定以便平滑替换。
//
// 隐私：服务端只存凭证 + 最小元数据 + 不透明的本地匿名 UUID（localUserId）。
// 任何日记/健康明文都不出端，不写入此文件。

import { promises as fs } from "node:fs";
import path from "node:path";
import { uid } from "@/lib/uid";

export type UserRole = "user" | "admin";

export interface ServerUser {
  id: string;
  email: string; // 小写、唯一
  nickname?: string;
  passwordHash: string;
  role: UserRole;
  disabled: boolean;
  /** 会话版本。密码重置等安全事件递增，用于让旧 cookie 失效。 */
  sessionVersion?: number;
  /** 关联的本地匿名 profile UUID（匿名升级），可被覆盖 */
  localUserId?: string;
  createdAt: string; // ISO
  lastLoginAt?: string; // ISO
}

export interface ResetTokenRecord {
  tokenHash: string;
  userId: string;
  expiresAt: number; // 毫秒时间戳
}

export interface ServerDB {
  users: ServerUser[];
  resetTokens: ResetTokenRecord[];
}

// 数据目录默认 <cwd>/.data，可用 HUSH_DATA_DIR 覆盖（便于测试隔离）。
const dataDir = () => process.env.HUSH_DATA_DIR || path.join(process.cwd(), ".data");
const dbFile = () => path.join(dataDir(), "users.json");

const EMPTY_DB: ServerDB = { users: [], resetTokens: [] };

// ---- 写互斥锁（promise 链） ----
let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeChain.then(fn, fn);
  // 无论成功失败都让链继续
  writeChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
}

export async function readDB(): Promise<ServerDB> {
  try {
    const raw = await fs.readFile(dbFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<ServerDB>;
    return {
      users: parsed.users ?? [],
      resetTokens: parsed.resetTokens ?? [],
    };
  } catch {
    return { ...EMPTY_DB, users: [], resetTokens: [] };
  }
}

async function writeDBRaw(db: ServerDB): Promise<void> {
  await ensureDir();
  await fs.writeFile(dbFile(), JSON.stringify(db, null, 2), "utf8");
}

/** 读改写一体化，串行执行避免并发覆盖 */
export function mutateDB<T>(fn: (db: ServerDB) => T | Promise<T>): Promise<T> {
  return withLock(async () => {
    const db = await readDB();
    const result = await fn(db);
    await writeDBRaw(db);
    return result;
  });
}

const normEmail = (e: string) => e.trim().toLowerCase();

export async function findUserByEmail(
  email: string,
): Promise<ServerUser | undefined> {
  const db = await readDB();
  const target = normEmail(email);
  return db.users.find((u) => u.email === target);
}

export async function findUserById(id: string): Promise<ServerUser | undefined> {
  const db = await readDB();
  return db.users.find((u) => u.id === id);
}

export async function countUsers(): Promise<number> {
  const db = await readDB();
  return db.users.length;
}

export async function listUsers(): Promise<ServerUser[]> {
  const db = await readDB();
  return db.users
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  nickname?: string;
  localUserId?: string;
}

/**
 * 创建用户。首个注册用户或命中 SEED_ADMIN_EMAIL → admin。
 * 邮箱重复抛 Error("email_taken")。
 */
export function createUser(input: CreateUserInput): Promise<ServerUser> {
  return mutateDB((db) => {
    const email = normEmail(input.email);
    if (db.users.some((u) => u.email === email)) {
      throw new Error("email_taken");
    }
    const seedAdmin = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const role: UserRole =
      db.users.length === 0 || (seedAdmin && email === seedAdmin)
        ? "admin"
        : "user";
    const user: ServerUser = {
      id: uid(),
      email,
      nickname: input.nickname?.trim() || undefined,
      passwordHash: input.passwordHash,
      role,
      disabled: false,
      sessionVersion: 0,
      localUserId: input.localUserId,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return user;
  });
}

export function updateUser(
  id: string,
  patch: Partial<Omit<ServerUser, "id">>,
): Promise<ServerUser | undefined> {
  return mutateDB((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u) return undefined;
    Object.assign(u, patch);
    return u;
  });
}

export function incrementSessionVersion(id: string): Promise<number | null> {
  return mutateDB((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u) return null;
    u.sessionVersion = (u.sessionVersion ?? 0) + 1;
    return u.sessionVersion;
  });
}

export function deleteUser(id: string): Promise<boolean> {
  return mutateDB((db) => {
    const before = db.users.length;
    db.users = db.users.filter((u) => u.id !== id);
    // 同时清理该用户的重置令牌
    db.resetTokens = db.resetTokens.filter((t) => t.userId !== id);
    return db.users.length < before;
  });
}

/** 当前 admin 数量（用于防锁死守卫） */
export async function countAdmins(): Promise<number> {
  const db = await readDB();
  return db.users.filter((u) => u.role === "admin" && !u.disabled).length;
}

// ---- 重置令牌 ----

export function addResetToken(rec: ResetTokenRecord): Promise<void> {
  return mutateDB((db) => {
    // 清理过期 + 同用户旧令牌
    const now = Date.now();
    db.resetTokens = db.resetTokens.filter(
      (t) => t.expiresAt > now && t.userId !== rec.userId,
    );
    db.resetTokens.push(rec);
  });
}

/** 消费令牌：命中且未过期则返回 userId 并删除该令牌 */
export function consumeResetToken(tokenHash: string): Promise<string | null> {
  return mutateDB((db) => {
    const now = Date.now();
    const idx = db.resetTokens.findIndex(
      (t) => t.tokenHash === tokenHash && t.expiresAt > now,
    );
    if (idx < 0) return null;
    const userId = db.resetTokens[idx].userId;
    db.resetTokens.splice(idx, 1);
    return userId;
  });
}

/** 对外安全视图：去除 passwordHash，localUserId 仅暴露是否存在 */
export interface SafeUser {
  id: string;
  email: string;
  nickname?: string;
  role: UserRole;
  disabled: boolean;
  hasLocalData: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export function toSafeUser(u: ServerUser): SafeUser {
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    role: u.role,
    disabled: u.disabled,
    hasLocalData: !!u.localUserId,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}
