# AGENTS.md

面向 AI 代理与人类贡献者的协作约定。开始改动前请通读本文件、[`spec.md`](./spec.md) 与 [`task.md`](./task.md)。

## 项目本质

这是「安眠岛 / Hush」睡眠改善 App 的 **Web 原型**（Next.js 14 App Router + React 18 + TS + Tailwind）。
目标是验证产品逻辑与交互，而非生产就绪。许多模块刻意做了原型级简化（见下文），后续会平移到 Flutter。

核心价值观贯穿全部改动：**温和、循序渐进、非焦虑、本地优先、隐私安全、非医疗**。

## 启动与验证

```bash
npm install
npm run dev          # http://localhost:3100（dev server 非常驻，需手动启动）
npm run typecheck    # 改完务必跑
npm run lint
npm run test         # 104 条单元测试，务必保持全绿
npm run build        # 涉及路由/构建改动时跑
```

**提交前最低要求**：`npm run typecheck` + `npm run test` 全过。涉及页面/路由改动再补 `npm run build`。

## 代码风格

- 跟随周边代码：组件用 `"use client"`（除纯 server 文件）；中文 UI 文案；2 空格缩进；命名与现有保持一致。
- **复用基础组件**：`components/ui/`（`Button` / `Card` / `SelectGroup` / `Slider` / `StarRating`）。不要重造按钮/卡片。
- **Tailwind 设计 token**：色板用 `moon`（主色）/ `ink`（中性）/ `score`（评分）/ `amber`（强调）。
  **禁止用红色**表达"差/失败/警告"——项目统一用 `amber` 替代（见 `danger-soft` 变体）。
- **反焦虑文案**：禁用「失败 / 差 / 糟糕 / 你已连续 X 天没…」；用「进步」而非「缺口」，结尾「鼓励 + 行动」。
- 业务逻辑尽量写成**纯函数**放 `lib/`，便于单测（参考 `score.ts` / `rules.ts` / `risk.ts`）。
- ID 用 `lib/uid.ts` 的 `uid()`。日期统一 ISO 字符串。

## 架构要点

### 状态与存储
- 单一 Zustand store：`lib/store.ts`，整个 `AppState` 序列化为一个 blob 存 IndexedDB（`lib/storage.ts`，key `hush.app.v1`）。
- 新增持久化字段：改 `lib/types.ts` 的 `AppState` + `EMPTY_STATE` + store 的 `persist()` 快照三处。
- `account` 分片是**非持久化**的（账户状态在服务端，每次启动从 `/api/auth/me` 拉取）——**不要**把它加进 `persist()` 快照。
- `profile.userId` 是本地匿名 UUID，是所有健康数据的归属键。

### TTS（故事 + 冥想共用）
- 播放引擎单例：`lib/tts-engine.ts`。`resolveSpoken(id)` 统一解析睡前故事（`lib/stories.ts`）与冥想（`lib/meditations.ts`）。
- **冥想 id 必须以 `med-` 前缀**，避免与故事 id 碰撞（有单测 `tts-resolver.test.ts` / `meditations.test.ts` 守卫）。
- 新增可朗读内容只需在对应内容模块加条目，引擎与缓存（`lib/cloud-tts.ts`）零改动。
- 正念脚本支持 `[[pause:N]]` 显式静默标记；云端 TTS 开启时逐段合成非标记文本，并由播放器插入静默，避免把控制标记发到云端合成。
- MP3 缓存 key 含 engine + voice + speed + id + 文本指纹，按内容隔离，存 IndexedDB；同一内容二次播放必须命中缓存，脚本改写后必须自动避开旧缓存。
- 故事、放松训练（呼吸 / 冥想 / 担忧时间 / 认知重构）与 `/api/tts` 属于登录后能力；UI 入口保持可见但置灰提示，服务端路由也要 `requireUser` 兜底。

### 账户 / 管理员（原型级服务端）
- 服务端专用代码全在 `lib/server/`，**只在 API 路由中 import**（用了 Node `crypto` / `fs`）。
- 所有 `app/api/auth/*` 与 `app/api/admin/*` 路由必须声明 `export const runtime = "nodejs"`（scrypt/fs 不支持 Edge）。
- 密码：`crypto.ts` scrypt 哈希；会话：HMAC 签名 httpOnly cookie（无状态，`AUTH_SECRET`）。
- 账户存 JSON 文件 `.data/users.json`（gitignore，写互斥锁）；测试用 `HUSH_DATA_DIR` 环境变量隔离临时目录。
- 管理 API 用 `requireAdmin(req)`（服务端）+ `app/admin/layout.tsx`（前端路由守卫）**双重校验**。
- 角色：首个注册用户或 `SEED_ADMIN_EMAIL` → `admin`。**防锁死**：最后一个有效管理员不可停用/删除。
- 隐私铁律：服务端**只存凭证 + 最小元数据 + 不透明 localUserId**，绝不写入日记/备注等健康明文。
- 登录 / 注册 / 找回 / 重置统一由首页账户卡片 `components/AuthPanel.tsx` 承载；`/login`、`/register`、`/forgot`、`/reset` 只做回到首页对应模式的兼容入口。

### 导航
- 底部 5 Tab：首页 / 助眠 / 训练 / 计划 / 我的（`components/BottomNav.tsx`）。
- 全屏 / 沉浸页隐藏底部导航：在 `components/AppShell.tsx` 的 `HIDE_NAV_PREFIXES` 增前缀。

## 改动后必须同步的文档

**这是硬性约定**：任何用户可见功能或架构变化，都要同步更新：
- `spec.md`：顶部加变更摘要（递增版本号）、对应章节状态、§14 实施现状对照表与测试覆盖数。
- `task.md`：顶部「当前实施进度」加条目、勾选对应阶段任务并写「完成情况」。
- `CHANGELOG.md`：在 `[Unreleased]` 或新版本段落记录（遵循 Keep a Changelog 格式）。
- 涉及环境变量：更新 `.env.example`。

## 红线（不要做）

- ❌ 不做疾病诊断、治疗方案、用药建议；不用「治愈/根治/临床证明」等绝对化表述。
- ❌ 不用红色表达负面；不堆砌焦虑文案。
- ❌ 不把健康明文上传服务端；不在前端暴露 API Key / 密码哈希。
- ❌ 不强制注册——匿名必须能用基础功能（引导、档案、日记、评分、报告、计划、助眠声音试听、本地数据导出/清空）。
- ❌ 不在静态导出（`STATIC_EXPORT`）假设 API 路由可用；账户/管理员/云 TTS 仅 server 模式。

## 当前已知简化（原型级）

- 账户：JSON 文件存储、无第三方登录（手机号/Apple/微信）、无订阅校验、无端到端同步。
- 存储：IndexedDB 单 blob，生产应迁 SQLite + SQLCipher。
- 通知：设置页可调时间但未接 Web Notification API。
- 放松训练/故事：TTS 朗读版本，真人录制留待版权采购；当前登录后可用。
- 详见 `task.md`「已知简化 / 占位」与 `spec.md` §14.2。
