# 安眠岛 · Hush

> 陪你慢慢睡着，一晚比一晚好。

一款基于睡眠健康科学（睡眠卫生 + CBT-I 思路）的**非医疗类**睡眠改善辅助工具。
本仓库是产品的 **Web 原型**（Next.js 14 + React 18 + TypeScript + Tailwind），
用于验证产品逻辑与交互，后续可平移到 Flutter / React Native 出 iOS / Android 产物。

> ⚠️ **医疗免责**：本应用是生活方式工具，不是医疗器械，不能用于诊断、治疗或预防任何疾病。
> 详见应用内「医疗免责声明」与 [`spec.md`](./spec.md) §1.5 / §9。

---

## 快速开始

```bash
npm install
npm run dev          # → http://localhost:3100
```

> dev server 不是常驻进程，关闭终端即停止；每次开发都需重新 `npm run dev`。

可选环境变量（复制 `.env.example` 到 `.env.local` 后按需填写）：

```bash
ALIYUN_DASHSCOPE_API_KEY=   # 阿里云 CosyVoice TTS（故事/冥想 AI 朗读，默认引擎）
AUTH_SECRET=                # 账户会话签名密钥（登录功能必填；缺省回退不安全开发值并告警）
SEED_ADMIN_EMAIL=           # 可选：指定邮箱注册即为管理员（否则首个注册用户为管理员）
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= SMTP_FROM=   # 密码找回邮件；未配时仅打印到服务端控制台
```

---

## 功能总览

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| 睡眠档案 | ✅ | 昵称 / 年龄段 / 作息 / 困扰类型 / 严重度 / 工作模式 |
| 睡眠日记 | ✅ | 早晨问卷（60 秒）+「回顾昨天」行为字段 |
| 睡眠评分 | ✅ | 6 维度加权（时长/效率/潜伏/夜醒/主观/规律），纯函数可测 |
| 睡眠报告 | ✅ | 日报六维 + 周报折线 + 节律散点 |
| 助眠音频 | ✅ | 31 条声音（匿名每类 1 个试听，登录后全部解锁）+ 混音 + 定时 + 收藏 + 今晚推荐 |
| 睡前故事 | ✅ 登录后 | 6 篇原创短篇 + TTS 朗读（阿里云 / Edge / 浏览器） |
| 呼吸训练 | ✅ 登录后 | 4-7-8 / 箱式 / 腹式 / 共振 |
| **冥想·放松** | ✅ 登录后 | **6 篇原创引导脚本（PMR / 身体扫描 / 正念 5·10·15 / 担忧卸载），复用 TTS；正念三档为不同内容，并用静默停顿接近 5/10/15 分钟** |
| CBT-I 工具 | ✅ 登录后 | 担忧时间 + 认知重构（8 模板） |
| 21 天计划 | ✅ | 默认模板 + 日历 + 任务勾选 |
| 个性化建议 | ✅ | 11 条规则引擎（单日 ≤3 条 / 7 天去重 / 反焦虑文案） |
| 风险识别 | ✅ | 持续低效率 / 情绪低落 / 自杀关键词端侧识别 + 心理援助热线 |
| **账户体系** | ✅ 原型 | **首页账户卡片：登录 / 注册 / 找回 / 重置；匿名基础功能可用；日记明文不出端** |
| **管理员控制台** | ✅ 原型 | **用户管理 + 内容管理 + 数据概览 + 角色权限** |
| 底部导航 | ✅ | 5 Tab 全局导航；当前页以低刺激高亮和轻微放大提示 |
| 会员订阅 | 🔜 V1.5 | 未开放，原型期全部免费 |

完整产品规格见 [`spec.md`](./spec.md)，任务拆解与进度见 [`task.md`](./task.md)。

---

## 技术栈

- **框架**：Next.js 14（App Router）+ React 18 + TypeScript
- **样式**：Tailwind CSS（低饱和昼夜双色板：`moon` / `ink` / `score` / `amber`）
- **状态**：Zustand（`lib/store.ts`），持久化到 IndexedDB（`idb-keyval`，单 blob）
- **图表**：Recharts　**动效**：Framer Motion + CSS
- **TTS**：阿里云 DashScope CosyVoice v3（默认）/ Microsoft Edge TTS（备用）/ 浏览器 Web Speech API（兜底），经 `/api/tts` 代理 + IndexedDB 缓存；服务端 API 需登录；含显式静默停顿的正念脚本在开启 AI 朗读时逐段云端播放并插入静默；MP3 缓存键含文本指纹，内容未变时二次播放不再调用三方 API
- **账户（原型）**：Next.js API 路由 + Node 内置 `crypto`（scrypt 哈希 + HMAC 签名 httpOnly cookie + SMTP 密码找回）+ JSON 文件存储 `.data/users.json`，零外部依赖
- **测试**：Vitest（104 条单元测试）

---

## 常用命令

```bash
npm run dev            # 启动开发服务器（端口 3100）
npm run build          # 生产构建（server 模式，含 API 路由）
npm run start          # 启动生产服务器
npm run typecheck      # tsc --noEmit
npm run lint           # next lint
npm run test           # vitest run（104 条）
npm run test:watch     # vitest 监听模式

npm run fetch-sounds   # 从 GitHub（MIT）拉取基础环境录音到 public/sounds/
npm run import-sounds  # 扫 ~/Downloads 把 Pixabay 下的 mp3 自动归位
```

### 离线单文件预览

直接双击 `hush.html` 可查看旧版单文件预览（CDN 加载，仅合成声音）。v2.7 的首页账户卡片、登录权限、真实录音与服务端功能请使用 `npm run dev`。

---

## 体验路径

1. **首次使用**：首启进入 `/onboarding` → 引导卡片 + 医疗免责声明勾选 → 睡眠档案 → 推荐 21 天计划。
2. **账户**：首页顶部账户卡片可登录 / 注册 / 找回 / 重置密码；旧 `/login`、`/register`、`/forgot`、`/reset` 链接会回到首页对应模式。
3. **冥想**：登录后，底部「训练」→「冥想 · 放松」→ 选一篇 → 开始（可在「设置 · AI 朗读」开启云端语音；正念三档会逐段播放并保留静默停顿）。
4. **账户 + 管理员**：注册（**首个注册账户自动成为管理员**）后，首页账户卡片或「我的」出现「管理控制台」入口。
5. **找回密码**：首页账户卡片 → 忘记密码 → 输邮箱 → 从邮件里的重置链接进入；未配置 SMTP 时，开发环境会把链接打印到服务端控制台。

> 测试账户存于 `.data/users.json`（已 gitignore）。清空账户：删除该文件即可。

---

## 隐私与边界

- **本地优先**：睡眠日记、备注、风险标记等健康数据全部存于本机 IndexedDB，默认不上传。
- **不强制注册**：匿名可使用基础功能（引导、档案、日记、评分、报告、计划、助眠声音试听、本地导出/清空）；完整助眠声音、故事、放松训练、AI 朗读与管理员能力需登录。账户仅做可选「匿名升级」（关联本地匿名 UUID），**服务端只存凭证与最小元数据，不存任何日记/健康明文**。
- **风险识别始终免费**，自杀关键词识别在端侧完成、不出端。
- 详见 [`spec.md`](./spec.md) §9（医疗边界）、§12.8（隐私安全）。

---

## 重要限制

- **账户 / 管理员 / 故事 / 放松训练 / 云 TTS 需 server 模式**（`npm run dev` 或 `npm run start`）。
- `STATIC_EXPORT=1 npm run build` 静态导出会**移除所有 API 路由**，上述功能在该模式与 `hush.html` 单文件版下不可用。
- 生产部署前**必须**配置 `AUTH_SECRET`。

---

## 目录结构

```
app/                  # Next.js App Router 页面 + API 路由
  api/auth/*          # 注册/登录/登出/会话/找回
  api/admin/*         # 用户管理/内容/概览（requireAdmin）
  api/tts/            # TTS 代理（阿里云/Edge）
  admin/*             # 管理控制台页面
  practice/*          # 呼吸 / 冥想 / 担忧时间 / 认知重构
  ...                 # 首页/日记/报告/计划/助眠/我的/设置/引导/法务
components/           # UI 组件（ui/ 基础组件 + 业务组件）
lib/                  # 业务逻辑（纯函数优先，便于单测）
  server/             # 服务端专用（crypto / user-store / session / mailer）
  meditations.ts      # 冥想引导脚本　stories.ts 睡前故事
  tts-engine.ts       # TTS 播放引擎（resolveSpoken 统一解析故事+冥想）
  score/rules/risk.ts # 评分 / 建议 / 风险引擎（含 *.test.ts）
bin/                  # fetch-sounds / import-sounds 脚本
public/sounds/        # 音频素材（部分需自行下载，见该目录 download-links.html）
spec.md               # 产品规格说明书（PRD + 技术规划）
task.md               # 任务拆解与实施进度
```

更多面向贡献者 / AI 代理的约定见 [`AGENTS.md`](./AGENTS.md)。
