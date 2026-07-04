# SiteSync MVP 开发任务清单

> 基于 `spec.md` v3.0 拆分。所有任务使用 `- [ ]` 勾选，完成后改为 `- [x]`。

**技术栈**: Supabase / Node.js (Express) / HTML + CSS + Vanilla JS
**总 Sprint 数**: 8
**预计工期**: 6-8 周（单人全职）

---

## 总体进度

- [ ] **Sprint 0: 项目初始化与基础设施** (0/6)
- [ ] **Sprint 1: 认证与用户系统** (0/4)
- [ ] **Sprint 2: 工作室品牌设置** (0/2)
- [ ] **Sprint 3: 项目管理** (0/5)
- [ ] **Sprint 4: 施工日志与时间轴（核心）** (0/6)
- [ ] **Sprint 5: 评论与整改系统** (0/5)
- [ ] **Sprint 6: 通知系统** (0/3)
- [ ] **Sprint 7: 导航布局与响应式** (0/4)
- [ ] **Sprint 8: 打磨与上线准备** (0/6)

---

## Sprint 0: 项目初始化与基础设施 `预估 2-3 天`

**目标**: Supabase 连接正常，Node 服务跑通，前端静态页面骨架就位。
**可交付物**: 三个层均可启动，数据库表已创建。

### T0.1 — Node.js 服务初始化 `P0` `预估 0.5d`

**描述**: 创建 Express 项目结构，安装核心依赖。

- [ ] 创建 `server/` 目录
- [ ] `cd server && npm init -y`
- [ ] `npm install express cors dotenv @supabase/supabase-js zod multer`
- [ ] `npm install -D nodemon`
- [ ] 创建目录骨架:

```
server/
├── package.json
├── .env
├── .env.example
├── src/
│   ├── index.js
│   ├── config.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── requireRole.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── studio.js
│   │   ├── projects.js
│   │   ├── logs.js
│   │   ├── comments.js
│   │   ├── issues.js
│   │   ├── notifications.js
│   │   └── upload.js
│   ├── services/
│   │   ├── supabase.js
│   │   ├── notification.js
│   │   └── storage.js
│   └── utils/
│       ├── errors.js
│       └── response.js
```

- [ ] `src/index.js` 启动 Express 监听 3001 端口，挂载 CORS + JSON 解析 + 基础路由
- [ ] `package.json` 添加 `"dev": "nodemon src/index.js"` 脚本
- [ ] `src/utils/errors.js` 定义 `AppError` 类（code + message + statusCode）
- [ ] `src/utils/response.js` 定义 `success(res, data, meta?)` 和 `error(res, err)` 统一响应

**涉及文件**: `server/src/index.js` / `server/src/utils/*.js`
**AC**: `npm run dev` → `curl http://localhost:3001/api/v1/health` 返回 `{"ok":true}`

---

### T0.2 — Supabase 项目与本地环境变量 `P0` `预估 0.25d`

**描述**: Supabase 控制台创建项目，配置本地环境变量。

- [ ] 在 [supabase.com](https://supabase.com) 创建新项目
- [ ] 创建 `server/.env`:

```
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
```

- [ ] 创建 `server/.env.example`（值替换为占位符）
- [ ] 创建 `public/js/config.js`:

```js
// Supabase 前端配置
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
const API_BASE = 'http://localhost:3001/api/v1';
```

- [ ] 在 `public/index.html` 中通过 `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm">` 引入 Supabase JS SDK

**涉及文件**: `server/.env` / `server/.env.example` / `public/js/config.js` / `public/index.html`
**AC**: Node 服务可连接 Supabase；浏览器可初始化 Supabase 客户端

---

### T0.3 — Supabase 服务端客户端初始化 `P0` `预估 0.25d`

**描述**: 封装服务端 Supabase 客户端，供各路由使用。

- [ ] `server/src/config.js` — 读取 `.env`，导出 `config` 对象
- [ ] `server/src/services/supabase.js` — 初始化 `supabaseAdmin`（service_role key，用于服务端操作）和 `supabaseAnon`（anon key，用于验证 JWT）
- [ ] 验证: 在 `index.js` 中调用 `supabaseAdmin.from('studios').select('*').limit(0)` 确认连接正常

**涉及文件**: `server/src/config.js` / `server/src/services/supabase.js`
**AC**: 服务启动时可向 Supabase 发起查询

---

### T0.4 — 数据库 Schema 迁移 `P0` `预估 0.5d`

**描述**: 在 Supabase SQL Editor 执行建表语句。

- [ ] 创建 `studios` 表
- [ ] 创建 `profiles` 表（关联 `auth.users`）
- [ ] 创建 `projects` 表
- [ ] 创建 `project_members` 表（含 UNIQUE 约束）
- [ ] 创建 `daily_logs` 表
- [ ] 创建 `comments` 表
- [ ] 创建 `issue_orders` 表
- [ ] 创建 `notifications` 表
- [ ] 创建 9 条索引（参照 spec.md 4.3）
- [ ] 创建 `updated_at` 自动触发器（spec.md 4.5）

**涉及文件**: `server/supabase/migrations/001_schema.sql`
**AC**: 所有表在 Supabase Table Editor 中可见，外键关系正确

---

### T0.5 — RLS 策略配置 `P0` `预估 0.5d`

**描述**: 为每张业务表配置 Row Level Security 策略。

- [ ] `studios`: 同 studio 成员可读，仅设计师可更新
- [ ] `profiles`: 同 studio 成员可读，仅本人可更新
- [ ] `projects`: 项目成员可读，仅所在 studio 设计师可创建/更新
- [ ] `project_members`: 项目成员可读，仅设计师可管理
- [ ] `daily_logs`: 项目成员可读，施工方/设计师可创建，作者或设计师可更新删除
- [ ] `comments`: 项目成员可读，认证用户可创建，作者或设计师可删除
- [ ] `issue_orders`: 项目成员可读，设计师可创建，权限角色可更新状态
- [ ] `notifications`: 用户仅可读写自己的通知
- [ ] Storage buckets 的 RLS 策略

**涉及文件**: `server/supabase/migrations/002_rls.sql`
**AC**: Supabase Dashboard → Policies 中每张表策略可见且逻辑正确

---

### T0.6 — 前端页面骨架搭建 `P0` `预估 0.25d`

**描述**: 创建所有 HTML 页面骨架 + 公共 CSS/JS 目录。

- [ ] 创建所有 HTML 页面（空骨架，含基础 `<head>` 和 `<body>`）:

```
public/
├── index.html
├── login.html
├── register.html
├── invite.html
├── dashboard.html
├── project.html
├── project-settings.html
├── project-members.html
├── issues.html
├── studio-settings.html
├── notifications.html
├── 404.html
```

- [ ] 创建 CSS 文件骨架:

```
public/css/
├── reset.css
├── variables.css
├── common.css
├── components.css
└── responsive.css
```

- [ ] 创建 JS 文件骨架:

```
public/js/
├── config.js
├── auth.js
├── api.js
├── router.js
├── utils.js
├── components/
│   ├── navbar.js
│   ├── photo-viewer.js
│   ├── image-uploader.js
│   ├── log-editor.js
│   └── notification-bell.js
└── pages/
    ├── login.js
    ├── register.js
    ├── invite.js
    ├── dashboard.js
    ├── project.js
    ├── project-settings.js
    ├── project-members.js
    ├── issues.js
    ├── studio-settings.js
    └── notifications.js
```

- [ ] `public/js/api.js` 封装 `fetch` 请求: 自动带 `Authorization: Bearer <token>`、统一 JSON 解析、错误处理
- [ ] `public/js/router.js` 实现路由守卫: 未登录访问受保护页面 → 跳转 `login.html`

**AC**: `npx serve public -p 3000` → 浏览器访问各页面不报 404；`api.js` 可调用 `GET /api/v1/health`

---

## Sprint 1: 认证与用户系统 `预估 4-5 天`

**目标**: 注册、登录、邀请完整通路，角色区分，路由守卫。
**可交付物**: 设计师可注册登录，施工方/业主可通过邀请链接加入。

### T1.1 — 认证中间件 `P0` `预估 0.5d`

**描述**: Node 服务端 JWT 验证 + 角色校验中间件。

- [ ] `server/src/middleware/auth.js` — 解析 `Authorization: Bearer <token>`:
  - 调用 Supabase `auth.getUser(token)` 验证 JWT
  - 成功后 `req.user = { id, email }` → `next()`
  - 失败 → 401 `{ code: "UNAUTHORIZED", message: "请先登录" }`
- [ ] `server/src/middleware/requireRole.js` — 角色校验中间件工厂:
  ```js
  // 用法: router.post('/', requireRole('designer'), handler)
  exports.requireRole = (...roles) => async (req, res, next) => {
    const profile = await getProfile(req.user.id);
    if (!roles.includes(profile.role)) return res.status(403).json(...);
    req.profile = profile;
    next();
  };
  ```
- [ ] `server/src/middleware/validate.js` — Zod schema 验证中间件工厂

**涉及文件**: `server/src/middleware/auth.js` / `server/src/middleware/requireRole.js` / `server/src/middleware/validate.js`
**AC**: 无效 token → 401；角色不符 → 403

---

### T1.2 — 设计师注册与登录 `P0` `预估 1.5d`

**描述**: 注册同时创建 studio + profile；登录验证角色。

**服务端**:
- [ ] `POST /api/v1/auth/onboard` — 注册后回调:
  - 验证 JWT（`req.user` 来自 auth 中间件）
  - 接收 `{ studio_name }`
  - use service_role key INSERT `studios` + `profiles`（role=designer）
  - 返回 `{ user, profile, studio }`
- [ ] `GET /api/v1/users/me` — 返回当前用户 + profile + studio（联表查询）

**客户端**:
- [ ] `register.html` — 表单: 邮箱 + 密码 + 工作室名称
- [ ] `public/js/pages/register.js`:
  - 调用 Supabase `signUp({ email, password })`
  - 成功后自动调用 `POST /api/v1/auth/onboard`
  - 成功后保存 token → 跳转 `dashboard.html`
  - 失败显示错误提示
- [ ] `login.html` — Tab 切换: 密码登录 | Magic Link
- [ ] `public/js/pages/login.js`:
  - 密码登录: Supabase `signInWithPassword`
  - Magic Link: Supabase `signInWithOtp`
  - 登录后调用 `GET /api/v1/users/me` 获取角色 → 跳转 `dashboard.html`
- [ ] `public/js/auth.js` — 封装:
  - `initSupabase()` — 初始化 Supabase 客户端
  - `getToken()` — 从 localStorage 获取 token
  - `saveToken(token)` — 保存 token
  - `logout()` — 清除 token + Supabase signOut → 跳转登录页
  - `checkAuth()` — 检查是否已登录，未登录 → 跳转登录页

**涉及文件**: `server/src/routes/auth.js` / `server/src/routes/users.js` / `public/login.html` / `public/register.html` / `public/js/pages/login.js` / `public/js/pages/register.js` / `public/js/auth.js`
**AC**: 完整注册→登录→跳转链路畅通；Supabase `auth.users` + `studios` + `profiles` 三表有对应记录

---

### T1.3 — 邀请流程 `P0` `预估 1.5d`

**描述**: 设计师邀请施工方/业主 → 生成 token → 被邀请人设置密码注册。

- [ ] `POST /api/v1/invites` — 设计师调用，接收 `{ email, role, project_id }`:
  - 使用 service_role key 生成 sign-up link 或创建临时记录
  - 生成 UUID token 存入 `invites` 表（或复用 `profiles` 扩展字段）
  - MVP 返回 `{ invite_url }` 在响应中展示（后续接 Resend 邮件）
- [ ] `GET /api/v1/invites/:token` — 验证 token 有效且未过期 → 返回邀请信息
- [ ] `POST /api/v1/invites/:token/accept` — 设置密码 + 显示名称:
  - 调用 Supabase `signUp` 创建用户
  - INSERT `profiles`（role=被邀请角色）
  - INSERT `project_members`
  - 标记 token 为已使用
- [ ] `invite.html` — 解析 URL token → 调 `GET /api/v1/invites/:token`
  - 无效/过期 token → 提示"链接已失效"
  - 有效 → 显示邀请信息 + 设置密码 + 显示名称表单
- [ ] `public/js/pages/invite.js` — 处理邀请接受流程

**涉及文件**: `server/src/routes/auth.js`（invites 部分）/ `public/invite.html` / `public/js/pages/invite.js`
**AC**: 完整链路: 设计师发送邀请 → token 生成 → 被邀请人可接受并设置密码 → 自动加入项目

---

### T1.4 — 前端路由守卫 `P0` `预估 0.5d`

**描述**: 保护页面未登录不可访问。

- [ ] `public/js/router.js` — 导出 `guardPage()`:
  - 检查 `localStorage` 中是否有 token
  - 有 token: 调用 `GET /api/v1/users/me` 验证有效性
  - 有效: 设置 `window.currentUser` 供页面使用 → 继续渲染
  - 无效: 清除 token → `window.location = '/login.html'`
- [ ] 在所有受保护页面的 `<script>` 开头调用 `guardPage()`
- [ ] `login.html` / `register.html`: 已登录用户自动跳转 `dashboard.html`

**涉及文件**: `public/js/router.js` / 各页面 HTML
**AC**: 未登录访问 `dashboard.html` → 自动跳转 `login.html`；已登录访问 `login.html` → 自动跳转 `dashboard.html`

---

## Sprint 2: 工作室品牌设置 `预估 1-2 天`

**目标**: 设计师可自定义 Logo、品牌色、工作室名称。

### T2.1 — 工作室 API `P0` `预估 0.5d`

**描述**: 获取和更新工作室信息。

- [ ] `GET /api/v1/studio` — 返回当前用户所属 studio（需 auth 中间件）
- [ ] `PATCH /api/v1/studio` — 更新 name / logo_url / brand_color，仅设计师（需 auth + requireRole('designer')）

**涉及文件**: `server/src/routes/studio.js`
**AC**: `curl -H "Authorization: Bearer <token>" /api/v1/studio` 返回正确数据

---

### T2.2 — 品牌设置页面 `P0` `预估 1d`

**描述**: 设计师修改工作室名称、上传 Logo、选择品牌色。

**客户端**:
- [ ] `studio-settings.html` — 页面 UI:
  - 工作室名称 Input
  - Logo 上传区（点击上传到 Supabase Storage `studio-logos`）
  - 品牌色 `<input type="color">`
  - 保存按钮
- [ ] `public/js/pages/studio-settings.js`:
  - 加载当前 studio 数据预填
  - Logo 上传: 调用 `POST /api/v1/upload` → 得到 URL → 更新 `logo_url`
  - 保存: 调用 `PATCH /api/v1/studio`
  - 品牌色保存后同步写入 `document.documentElement.style.setProperty('--color-brand', color)`

**服务端**:
- [ ] `POST /api/v1/upload` — 接收 `multipart/form-data` → 上传到 Supabase Storage:
  - 接收 `bucket` 参数指定目标 bucket
  - 文件命名: `{bucket}/{uuid}.jpg`
  - 返回 `{ url }`
- [ ] `server/src/services/storage.js` — 封装 Supabase Storage 上传

**涉及文件**: `public/studio-settings.html` / `public/js/pages/studio-settings.js` / `server/src/routes/upload.js` / `server/src/services/storage.js`
**AC**: 修改名称/Logo/颜色 → 保存 → 刷新后生效 → 品牌色在全局可见（CSS 变量注入）

---

## Sprint 3: 项目管理 `预估 4-5 天`

**目标**: 设计师可创建/管理项目，三方通过工作台看到各自项目。

### T3.1 — 项目 CRUD API `P0` `预估 1d`

**描述**: 项目的创建、列表、详情、编辑、状态变更。

- [ ] `GET /api/v1/projects` — 根据用户角色返回参与的项目列表:
  - 联表 `project_members` + `projects` 查询
  - 返回项目列表（含 `current_phase`、成员数、最近日志时间）
- [ ] `POST /api/v1/projects` — 仅设计师，创建 project + 自动添加自己为 project_member
- [ ] `GET /api/v1/projects/:id` — 验证用户是该项目的成员，返回项目详情
- [ ] `PATCH /api/v1/projects/:id` — 仅所在 studio 的设计师，更新基础信息
- [ ] `PATCH /api/v1/projects/:id/status` — 仅设计师，active / completed / archived 切换

**涉及文件**: `server/src/routes/projects.js`
**AC**: 完整 CRUD + 状态变更可用，权限校验正确

---

### T3.2 — 创建项目页面 `P0` `预估 1d`

**描述**: 设计师填写项目信息、上传封面。

**客户端**:
- [ ] `dashboard.html` 页面中创建 Dialog/Modal 承载表单
- [ ] 表单: 项目名称(必填) + 地址(必填) + 封面图 + 面积 + 风格 + 开工日期 + 预计完工
- [ ] 封面图上传: 前端压缩 → `POST /api/v1/upload` bucket=`project-covers` → 得到 URL
- [ ] 提交: `POST /api/v1/projects` → 成功 → 跳转 `project.html?id={id}`
- [ ] `public/js/pages/dashboard.js` 中集成创建项目逻辑

**CSS**:
- [ ] Modal/Dialog 组件样式（居中弹出、遮罩层、关闭按钮）

**涉及文件**: `public/dashboard.html` / `public/js/pages/dashboard.js` / `public/css/components.css`
**AC**: 填写必填字段 → 上传封面 → 提交 → 跳转项目时间轴页

---

### T3.3 — 成员管理功能 `P0` `预估 1d`

**描述**: 项目内添加/移除施工方和业主成员。

**服务端**:
- [ ] `GET /api/v1/projects/:id/members` — 返回 `[{user_id, display_name, avatar_url, role, joined_at}]`
- [ ] `POST /api/v1/projects/:id/members` — 接收 `{email, role}` → 调用邀请流程（复用 T1.3）
- [ ] `DELETE /api/v1/projects/:id/members/:userId` — 移除成员

**客户端**:
- [ ] `project-members.html` — 成员列表页:
  - 加载成员列表
  - "添加成员"按钮 → Dialog 输入邮箱 + 选择角色
  - 移除按钮（仅设计师可见）
- [ ] `public/js/pages/project-members.js`

**涉及文件**: `server/src/routes/projects.js` / `public/project-members.html` / `public/js/pages/project-members.js`
**AC**: 添加成员 → 展示邀请链接 → 成员出现在列表 → 可移除

---

### T3.4 — 项目设置页面 `P0` `预估 0.5d`

**描述**: 编辑项目信息、更改状态。

**客户端**:
- [ ] `project-settings.html` — 预填当前值的编辑表单
- [ ] 状态切换: active → completed（确认弹窗）→ archived（确认弹窗）
- [ ] completed 时提示"施工方不可再发布日志"
- [ ] `public/js/pages/project-settings.js`

**涉及文件**: `public/project-settings.html` / `public/js/pages/project-settings.js`
**AC**: 可编辑字段 → 保存生效；状态切换有确认提示

---

### T3.5 — 工作台仪表盘 `P0` `预估 1d`

**描述**: 项目卡片列表，角色差异化视图。

**客户端**:
- [ ] `dashboard.html` — 页面结构:
  - 顶部 Navbar（页面标题 + 通知铃铛 + 用户头像下拉）
  - 项目卡片网格
  - 空状态引导（无项目时）
  - "创建项目"按钮（仅设计师可见）
- [ ] `public/js/pages/dashboard.js`:
  - 调用 `GET /api/v1/projects` 获取列表
  - 动态渲染 DOM 卡片: 封面图(无封面用渐变色占位) + 项目名 + 地址截断 + 阶段 badge + 更新时间
  - 点击卡片 → 跳转 `project.html?id={id}`
- [ ] `public/css/dashboard.css` — 卡片样式 + 网格布局

**CSS**:
- [ ] 卡片网格: mobile 1 列 / tablet 2 列 / desktop 3 列（CSS Grid）
- [ ] 封面图渐变占位（无封面时显示品牌色渐变）

**涉及文件**: `public/dashboard.html` / `public/js/pages/dashboard.js` / `public/css/dashboard.css`
**AC**: 不同角色看到不同项目列表；卡片信息完整；点击跳转正常

---

## Sprint 4: 施工日志与时间轴（核心功能） `预估 6-8 天`

**目标**: 完整的上传 → 展示 → 浏览闭环。
**可交付物**: 施工方可拍照上传，三方在时间轴上看到图文日志。

### T4.1 — 施工日志 API `P0` `预估 1d`

**描述**: 日志 CRUD + 分页 + 月份筛选。

- [ ] `GET /api/v1/projects/:id/logs` — 支持 `?cursor=&limit=20&month=2026-07`:
  - cursor 分页（基于 `publish_date DESC, created_at DESC`）
  - 返回 `{ data: Log[], meta: { nextCursor, hasMore } }`
  - 每条日志 JOIN `profiles` 获取作者信息 + 子查询评论数
- [ ] `POST /api/v1/projects/:id/logs` — 创建日志:
  - 校验 author 是项目成员且角色为 designer/contractor
  - 必填 phase（校验在 PHASES 枚举内），可选 content, images
  - 创建后更新 `projects.current_phase` → 触发通知给项目其他成员
- [ ] `PATCH /api/v1/projects/:id/logs/:logId` — 仅作者可编辑
- [ ] `DELETE /api/v1/projects/:id/logs/:logId` — 作者或设计师可删

**涉及文件**: `server/src/routes/logs.js`
**AC**: 完整 CRUD + cursor 分页 + 月份筛选可用；权限校验正确

---

### T4.2 — 图片上传组件 `P0` `预估 1d`

**描述**: 前端压缩 + 上传到 Supabase Storage + 拖拽排序。

**客户端**:
- [ ] `public/js/components/image-uploader.js` — 可复用图片上传组件:
  - `<input multiple accept="image/*">` + 拖拽区域
  - 选图后前端压缩: 最大宽度 1920px, JPEG 质量 0.85（使用 Canvas API）
  - 压缩后逐张上传到 `POST /api/v1/upload` bucket=`log-images`
  - 上传进度显示（XHR upload.onprogress）
  - 网格预览: 可删除单张、可拖拽排序（简易实现: 上下箭头或拖拽）
  - 上传失败自动重试一次，失败图片标记"上传失败"可手动重试
  - 返回已上传图片数组 `[{url, width, height, order}]`
- [ ] `public/css/components.css` — 上传区域 + 图片预览网格样式

**涉及文件**: `public/js/components/image-uploader.js` / `public/css/components.css`
**AC**: 选择图片 → 压缩 → 上传 → 预览出现 → 可排序删除

---

### T4.3 — 日志编辑器 `P0` `预估 2d`

**描述**: 施工方/设计师发布新日志。

**客户端**:
- [ ] `public/js/components/log-editor.js` — 日志编辑器组件:
  - 移动端: 底部 Sheet 弹出（占 90% 屏高）
  - 桌面端: 居中 Dialog 720px
  - 照片选择: 集成 `image-uploader.js`
  - 阶段选择: 横向可滚动 chip/button 列表（7 个阶段），必选
  - 文字 textarea: placeholder "记录今天的施工内容..."（可选填）
  - "发布"按钮: 底部固定
  - 发布流程: 确认图片全部上传完成 → 收集数据 → POST 日志 API → 关闭 Sheet → 时间轴自动刷新
- [ ] LogEditor Sheet/Dialog 样式（`public/css/components.css`）

**涉及文件**: `public/js/components/log-editor.js` / `public/css/components.css`
**AC**: 选图 → 选阶段 → (可选)写文字 → 发布 → 时间轴出现新日志。拍照到发布耗时 < 30 秒。

---

### T4.4 — 时间轴页面（核心） `P0` `预估 2.5d`

**描述**: 项目时间轴，所有日志的瀑布流展示。

**客户端**:
- [ ] `project.html` — 页面结构:
  - 顶部固定 Header: 项目名称 + PhaseProgress 进度条 + 返回按钮
  - 主体: 日志列表容器 `<div id="timeline">`
  - FAB 右下角悬浮按钮: 仅 designer/contractor 可见，点击唤起 LogEditor
  - 月份导航: 桌面右侧浮动列表 / 移动端顶部下拉
- [ ] `public/js/pages/project.js` — 核心渲染逻辑:
  - 首次加载: `GET /api/v1/projects/:id/logs?limit=20` 渲染首屏
  - 无限滚动: IntersectionObserver 监听底部 sentinel → 加载下一页（cursor）
  - 月份跳转: 统计有日志的月份列表 → 点击滚动或重载
  - 下拉刷新（移动端）
  - 每条日志渲染: 日期 + 阶段标签 chip + 图片网格 + 文字 + 发布者信息 + 评论数 badge
- [ ] `public/js/components/photo-viewer.js` — 全屏图片浏览器:
  - 深色底，图片居中
  - 左右箭头/滑动切换该日志内的图片
  - 底部信息: 日期 + 阶段
  - 点击背景或 X 按钮关闭
- [ ] `public/css/project.css` — 时间轴布局 + 日志卡片样式

**LogCard 渲染规则**:
- [ ] 日期行: "2026年7月4日" + 阶段标签 chip
- [ ] 照片网格自适应: 1 张全宽 / 2 张 2 列 / 3 张 1大2小 / 4+ 张 2 列
- [ ] 文字内容区（如有 content），支持换行
- [ ] 底部 meta: 发布者头像+名称 + 评论数 + 待整改数 badge
- [ ] 长按/右键菜单: 编辑/删除（仅作者可操作）

**ImageGrid 组件**:
- [ ] 根据图片数量自适应布局
- [ ] 图片懒加载（`loading="lazy"` 或 IntersectionObserver）
- [ ] 点击 → 打开 PhotoViewer
- [ ] Supabase Image Transformation 生成缩略图: `?width=800`

**涉及文件**: `public/project.html` / `public/js/pages/project.js` / `public/js/components/photo-viewer.js` / `public/css/project.css`
**AC**: 时间轴可无限滚动、图片可放大浏览、月份可跳转

---

### T4.5 — 阶段进度条 `P1` `预估 0.5d`

**描述**: 项目顶部 7 阶段进度指示器。

**客户端**:
- [ ] 读取 `projects.current_phase`
- [ ] 7 个圆点 + 连接线: 已完成(实心+品牌色) / 当前(大圆+脉冲动画) / 未开始(空心+灰线)
- [ ] 移动端横向可滚动（`overflow-x: auto`）
- [ ] `public/css/components.css` — 进度条样式 + 脉冲动画

**涉及文件**: `public/js/pages/project.js`（渲染 PhaseProgress） / `public/css/components.css`
**AC**: 当前阶段正确高亮，移动端可横向滑动查看全部阶段

---

### T4.6 — 日志编辑与删除 `P1` `预估 0.5d`

**描述**: 已发布日志的编辑和删除功能。

**客户端**:
- [ ] LogCard 右键/长按菜单 → "编辑" / "删除"
- [ ] 编辑: 复用 LogEditor，预填现有数据（文字 + 阶段 + 图片）
- [ ] 删除: 确认弹窗 → `DELETE /api/v1/projects/:id/logs/:logId` → 从 DOM 移除
- [ ] 删除时附带删除 Supabase Storage 图片（可选，或保留）

**涉及文件**: `public/js/pages/project.js` / `public/js/components/log-editor.js`
**AC**: 编辑保存后卡片内容更新；删除后卡片从时间轴消失

---

## Sprint 5: 评论与整改系统 `预估 4-5 天`

**目标**: 三方可在日志下评论，设计师可发起整改并追踪。
**可交付物**: 评论增删可用，整改生命周期完整。

### T5.1 — 评论 API `P0` `预估 0.5d`

**描述**: 日志下评论的增删查。

- [ ] `GET /api/v1/logs/:logId/comments` — 按时间正序返回（JOIN profiles）
- [ ] `POST /api/v1/logs/:logId/comments` — 创建评论:
  - 三方均可（需 auth 中间件）
  - 校验作者是项目成员
  - 触发通知给日志作者（调用 `notification.js` 服务）
- [ ] `DELETE /api/v1/logs/:logId/comments/:commentId` — 作者或设计师可删

**涉及文件**: `server/src/routes/comments.js`
**AC**: 评论增删可用，权限正确

---

### T5.2 — 评论区 UI `P0` `预估 1d`

**描述**: LogCard 下方展开的评论区。

**客户端**:
- [ ] 点击 LogCard 评论图标 → 展开评论区（CSS transition 高度动画）
- [ ] `GET /api/v1/logs/:logId/comments` 加载评论列表
- [ ] `public/js/components/comment-list.js` — 评论列表组件:
  - CommentItem 渲染: 头像 + 名称 + 相对时间 + 内容
  - 设计师评论有左侧品牌色边框（`border-left: 3px solid var(--color-brand)`）
  - 删除按钮（仅作者/设计师可见）
- [ ] 底部输入框: `<input>` + 发送按钮，Enter 发送
  - 调用 `POST /api/v1/logs/:logId/comments`
  - 成功后追加到评论列表
- [ ] 空状态: "暂无评论，说点什么吧"
- [ ] `public/css/components.css` — 评论列表 + 评论项样式

**涉及文件**: `public/js/components/comment-list.js` / `public/css/components.css`
**AC**: 展开/收起流畅，评论实时显示

---

### T5.3 — 整改工单 API `P0` `预估 1d`

**描述**: 整改完整生命周期管理。

- [ ] `GET /api/v1/projects/:id/issues` — 支持 `?status=pending` 筛选
- [ ] `POST /api/v1/projects/:id/issues` — 仅设计师，必填 title, log_id
- [ ] `PATCH /api/v1/projects/:id/issues/:issueId` — 状态流转控制:

```
pending → confirmed (施工方确认)
confirmed → fixed (施工方完成 + fixed_images)
fixed → verified (设计师验收)
fixed → pending (设计师打回)
verified → closed (设计师关闭)
```

- [ ] 每次状态变更调用 `notification.js` 服务发送通知
- [ ] `server/src/services/notification.js` — 通知创建服务:
  - `createNotification({ userId, type, title, body, link })`

**涉及文件**: `server/src/routes/issues.js` / `server/src/services/notification.js`
**AC**: 完整状态流转正确，权限校验到位

---

### T5.4 — 整改列表页 `P0` `预估 1d`

**描述**: 项目维度的整改工单列表。

**客户端**:
- [ ] `issues.html` — 页面结构:
  - Tab: "待处理"（count badge）| "已完成"（count badge）
  - 整改行列表容器
  - 点击 → 详情面板
- [ ] `public/js/pages/issues.js`:
  - 加载 `GET /api/v1/projects/:id/issues`
  - 每个 IssueRow: 状态 dot(颜色) + title + 创建者 + 日期
  - 点击打开 Issue 详情面板: title, description, 关联日志图, 当前状态, 操作按钮
- [ ] `public/css/issues.css` — Tab + 列表 + 详情面板样式

**涉及文件**: `public/issues.html` / `public/js/pages/issues.js` / `public/css/issues.css`
**AC**: Tab 切换正常，badge 计数正确

---

### T5.5 — 整改状态操作 UI `P0` `预估 0.5d`

**描述**: 各角色各状态下正确的操作按钮。

| 当前状态 | 施工方可操作 | 设计师可操作 |
|------|------|------|
| pending | 确认整改 | 编辑/删除 |
| confirmed | 标记完成 + 上传整改照 | — |
| fixed | — | 验收通过 / 打回重做 |
| verified | — | 关闭 |

- [ ] 整改完成时施工方可上传整改照片（复用 `image-uploader.js`，上传到 `log-images` bucket）
- [ ] 按钮防重复点击（disabled 状态 + loading 文字）
- [ ] `public/js/pages/issues.js` 中实现状态操作逻辑

**涉及文件**: `public/js/pages/issues.js`
**AC**: 每个角色在对应状态下看到正确的按钮，操作后状态正确流转

---

## Sprint 6: 通知系统 `预估 2-3 天`

**目标**: 关键操作自动通知相关人员。
**可交付物**: 通知铃铛 + 未读 badge + 通知列表。

### T6.1 — 通知 API `P0` `预估 0.5d`

**描述**: 通知列表、已读标记。

- [ ] `GET /api/v1/notifications` — 按 `created_at DESC` 分页（当前用户）
- [ ] `PATCH /api/v1/notifications/:id/read` — 单条已读
- [ ] `PATCH /api/v1/notifications/read-all` — 全部已读

**涉及文件**: `server/src/routes/notifications.js`
**AC**: 通知列表可读，已读状态可变更

---

### T6.2 — 通知触发逻辑 `P0` `预估 0.5d`

**描述**: 关键业务操作后自动 INSERT 通知。

| type | 触发时机 | 接收人 |
|------|------|------|
| log_published | 新日志发布 | 项目其他成员 |
| comment_added | 新评论 | 日志作者（非评论者自己） |
| issue_created | 整改创建 | 施工方 assigned_to |
| issue_resolved | 验收通过 | 施工方 assigned_to |
| issue_reopened | 打回重做 | 施工方 assigned_to |

- [ ] `server/src/services/notification.js`:
  - `notifyProjectMembers(projectId, excludeUserId, {type, title, body, link})`
  - `notifyUser(userId, {type, title, body, link})`
- [ ] 在日志创建、评论创建、整改状态变更的 API Route 中调用通知服务
- [ ] MVP 不使用 DB Trigger，直接在应用层写入

**涉及文件**: `server/src/routes/logs.js` / `server/src/routes/comments.js` / `server/src/routes/issues.js` / `server/src/services/notification.js`
**AC**: 日志发布 → 其他成员收到通知；评论 → 作者收到通知；整改创建 → 施工方收到通知

---

### T6.3 — 通知 UI `P0` `预估 1d`

**描述**: 顶部铃铛 + 未读 badge + 通知列表。

**客户端**:
- [ ] `public/js/components/notification-bell.js` — 通知铃铛组件:
  - 铃铛图标（SVG）+ 红色未读 count badge
  - 定时轮询（每 30 秒）`GET /api/v1/notifications?limit=1` 检查未读数量
  - 点击弹出 Dropdown: 最近 10 条通知
  - 点击通知 → 标记已读 + 跳转目标链接
  - 底部"查看全部" → 跳转 `notifications.html`
  - 空状态: "暂无通知"
  - 未读通知有浅色背景区分
- [ ] `notifications.html` — 通知列表全页:
  - "全部已读"按钮
  - 通知列表按时间倒序
- [ ] `public/js/pages/notifications.js`
- [ ] `public/css/components.css` — 铃铛 + Dropdown + 通知项样式

**涉及文件**: `public/js/components/notification-bell.js` / `public/notifications.html` / `public/js/pages/notifications.js` / `public/css/components.css`
**AC**: 铃铛显示未读数，点击展开下拉，通知可跳转

---

## Sprint 7: 导航布局与响应式 `预估 2-3 天`

**目标**: 桌面端侧边栏 + 移动端底部 Tab，所有页面响应式。

### T7.1 — 公共 CSS 体系 `P0` `预估 0.5d`

**描述**: CSS Reset + 变量 + 公共样式。

- [ ] `public/css/reset.css` — CSS Reset（基于 modern-normalize）
- [ ] `public/css/variables.css` — CSS 自定义属性:
  ```css
  :root {
    --color-brand: #1A1A1A;
    --color-bg: #FAFAFA;
    --color-surface: #FFFFFF;
    --color-text: #1A1A1A;
    --color-text-secondary: #6B7280;
    --color-border: #E5E7EB;
    --color-success: #10B981;
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  ```
- [ ] `public/css/common.css` — 公共样式:
  - `.btn` / `.btn-primary` / `.btn-danger` / `.btn-ghost`
  - `.input` / `.textarea` / `.label`
  - `.card` / `.badge` / `.chip`
  - `.dialog-overlay` / `.dialog-content`
  - `.sheet-overlay` / `.sheet-content`
  - `.skeleton` / `.spinner`
  - `.toast`

**涉及文件**: `public/css/reset.css` / `public/css/variables.css` / `public/css/common.css`
**AC**: 所有公共 class 可用，视觉一致

---

### T7.2 — 桌面端导航布局 `P0` `预估 1d`

**描述**: 侧边栏 + 顶部栏 + 内容区。

**客户端**:
- [ ] `public/js/components/navbar.js` — 导航组件:
  - 读取 `window.currentUser` 获取用户信息
  - 桌面: 渲染侧边栏（左侧 240px 固定） + 顶部栏
  - 侧边栏: 工作室 Logo + 导航链接（工作台、通知、设置）+ 项目快速切换列表
  - 顶部栏: 当前页面标题 + NotificationBell + 用户头像(Dropdown: 设置/退出)
- [ ] `public/css/components.css` — 侧边栏 + 顶部栏 + Dropdown 样式
- [ ] 各页面引入 `navbar.js` 并调用初始化

**涉及文件**: `public/js/components/navbar.js` / `public/css/components.css` / 各 HTML 页面
**AC**: 桌面端侧边栏固定，点击导航切换页面

---

### T7.3 — 移动端布局 `P0` `预估 0.5d`

**描述**: 底部 Tab 导航 + 顶部 Header。

**客户端**:
- [ ] `public/js/components/navbar.js` — 移动端适配:
  - 底部固定 `<nav>`: 3 Tab（项目 / 通知 / 设置），图标 + 文字
  - 顶部 Header: 页面标题 + 返回按钮（子页面）
  - 项目内 Header: 返回按钮 + 项目名 + 阶段进度条(简化版)
- [ ] `public/css/responsive.css` — 响应式规则:
  - `@media (max-width: 767px)`: 隐藏侧边栏，显示底部 Tab
  - `@media (min-width: 768px)`: 隐藏底部 Tab，显示侧边栏

**涉及文件**: `public/js/components/navbar.js` / `public/css/responsive.css`
**AC**: 移动端底部 Tab 切换正常，桌面端侧边栏正常

---

### T7.4 — 响应式断点统一 `P0` `预估 0.5d`

**描述**: 各组件在 375px / 768px / 1440px 宽度下表现正常。

- [ ] 照片网格: mobile 2 列 / tablet 3 列 / desktop 4 列
- [ ] 项目卡片: mobile 1 列 / tablet 2 列 / desktop 3 列（CSS Grid `grid-template-columns: repeat(auto-fill, minmax(...))`）
- [ ] LogEditor: mobile 全屏 Sheet / desktop Dialog 720px
- [ ] 整改列表: mobile 全宽 / desktop 紧凑列表
- [ ] `public/css/responsive.css` — 各组件断点样式

**涉及文件**: `public/css/responsive.css` / 各页面 CSS
**AC**: 三个断点下无布局溢出

---

## Sprint 8: 打磨与上线准备 `预估 3-4 天`

**目标**: 体验打磨、错误处理、部署上线。
**可交付物**: 生产环境可访问的完整 MVP。

### T8.1 — 加载状态与骨架屏 `P0` `预估 1d`

**描述**: 所有异步加载场景有视觉反馈。

- [ ] 工作台项目卡片加载时显示 Skeleton（灰色脉冲动画）
- [ ] 时间轴日志卡片加载中 Skeleton
- [ ] 图片加载前显示低质量占位色块
- [ ] 评论列表加载中 Skeleton
- [ ] 整改列表加载中 Skeleton
- [ ] 上传进度条实时显示（百分比 + 进度条）
- [ ] `public/css/common.css` — `.skeleton` + `@keyframes shimmer` 动画

**涉及文件**: 各页面 JS + `public/css/common.css`
**AC**: 加载过程无布局跳动，骨架屏与实际内容形状一致

---

### T8.2 — 空状态与错误状态 `P0` `预估 0.5d`

**描述**: 各场景的无数据、失败、权限不足态。

- [ ] 工作台无项目: 空状态插图 + "还没有项目，创建第一个吧" + 创建按钮
- [ ] 时间轴无日志: "施工尚未开始，等待第一条日志" + 发布按钮
- [ ] 整改列表空: 各 Tab 不同文案
- [ ] 通知列表空: "暂无通知"
- [ ] 网络错误: toast 提示 + "重试"按钮（`public/js/utils.js` 封装 `showToast`）
- [ ] 403 无权限: 显示 403 提示 + 返回按钮
- [ ] 404 页: "页面不存在或已被删除" + 返回工作台链接
- [ ] API 错误全局处理: `public/js/api.js` 拦截 401 → 跳转登录，其他 → toast 提示

**涉及文件**: `public/404.html` / `public/js/utils.js` / `public/js/api.js` / 各页面
**AC**: 各边界状态有合适的 UI

---

### T8.3 — 过渡动画与微交互 `P1` `预估 0.5d`

**描述**: 关键交互路径动画。

- [ ] 照片查看器: fadeIn + scale 0.95→1（CSS transition）
- [ ] LogEditor Sheet: 底部滑入滑出（transform translateY）
- [ ] 评论展开/收起: 高度动画（max-height transition）
- [ ] Modal/Dialog: fadeIn overlay + scale bounce
- [ ] 整改状态 dot 颜色过渡（transition background-color）
- [ ] 通知已读/未读: 背景色 fade
- [ ] Toast 消息: 右上角滑入 → 自动消失

**涉及文件**: `public/css/common.css` / `public/css/components.css`
**AC**: 动效自然不突兀，非阻塞用户操作

---

### T8.4 — 性能优化 `P1` `预估 0.5d`

**描述**: 关键性能指标优化。

- [ ] 图片使用 Supabase Image Transformation 缩略图:
  - 列表页: `?width=400&height=300&resize=cover`
  - 时间轴: `?width=800`
  - 全屏查看: 原图
- [ ] 图片懒加载: `<img loading="lazy">` + IntersectionObserver 兜底
- [ ] CSS/JS 合理拆分，首屏加载最小化
- [ ] 静态资源添加合适的 `Cache-Control` 头（Nginx 或 serve 配置）
- [ ] Lighthouse Mobile 评分 > 80

**涉及文件**: `public/js/utils.js`（懒加载工具） / 各页面 JS（图片 URL 构造）
**AC**: 时间轴滚动流畅，图片加载不卡顿

---

### T8.5 — 入口与 Meta 信息 `P1` `预估 0.25d`

**描述**: SEO 基础配置 + 首页重定向。

- [ ] `public/index.html` — 检测登录状态:
  - 已登录 → 跳转 `dashboard.html`
  - 未登录 → 跳转 `login.html`
- [ ] 所有页面 `<title>` + `<meta name="description">`
- [ ] favicon（使用 emoji 🏗️ 或 SVG）
- [ ] `public/manifest.json`（可选 PWA）

**涉及文件**: `public/index.html` / 所有 HTML 页面 / `public/favicon.ico`
**AC**: 浏览器 Tab 显示正确 title；访问根路径正常跳转

---

### T8.6 — 部署上线 `P0` `预估 0.5d`

**描述**: 部署 Node 服务 + 前端静态文件到生产环境。

- [ ] 推送代码到 GitHub（`server/` + `public/`）
- [ ] Node API 部署（Railway / Render / VPS + PM2）:
  - 配置环境变量
  - 设置 CORS `FRONTEND_URL` 为生产前端域名
- [ ] 前端静态文件部署（Vercel / Netlify / Nginx）:
  - 修改 `public/js/config.js` 中 `API_BASE` 为生产 API 地址
- [ ] Supabase Auth → 添加生产 URL 到 redirect allowlist
- [ ] 验证生产环境完整链路: 注册 → 登录 → 创建项目 → 发布日志 → 评论 → 整改

**涉及文件**: 无（配置层面）
**AC**: 生产 URL 可访问，完整用户流程正常

---

## Sprint 依赖关系

```
Sprint 0 (基础设施)
    │
    ▼
Sprint 1 (认证)
    │
    ├──► Sprint 2 (品牌设置)
    │
    └──► Sprint 3 (项目管理)
              │
              ▼
         Sprint 4 (日志时间轴 ★)
              │
              ├──► Sprint 5 (评论整改)
              │
              └──► Sprint 6 (通知)
                        │
                        ▼
                   Sprint 7 (布局)
                        │
                        ▼
                   Sprint 8 (打磨)
```

---

## 技术风险

| 风险 | 缓解措施 |
|------|------|
| Supabase RLS 策略遗漏导致数据泄露 | 每个 API 完成后用不同角色账号手动测试 |
| 图片上传体验差（大文件慢） | 前端 Canvas 压缩必须到位，上传进度 UI 必须实时显示 |
| 时间轴无限滚动性能 | cursor 分页 + IntersectionObserver，必要时上 DOM 回收 |
| Supabase Auth JWT 验证在 Node 层的可靠性 | 严格按 Supabase 文档配置 `auth.getUser(token)`，缓存验证结果 |
| 多页面间状态同步（token、品牌色） | localStorage 统一管理，`auth.js` 和 `api.js` 作为公共入口 |
| Vanilla JS 复杂交互难以维护 | 组件化封装（每个组件独立 JS 文件 + 事件委托），代码注释清晰 |

---

## 与 Next.js 旧版架构的关键差异

| 维度 | 旧架构 (v2.0) | 新架构 (v3.0) |
|------|------|------|
| 前端框架 | Next.js + React + TypeScript | HTML + Vanilla JS |
| 样式方案 | TailwindCSS + shadcn/ui | 纯 CSS + CSS Variables |
| 服务端 | Next.js API Routes | Express 独立服务 |
| 认证 | `@supabase/ssr` cookie | Supabase Auth SDK + localStorage token |
| 表单单验证 | Zod (前后端) | Zod (服务端) + HTML5 表单验证 (客户端) |
| 路由 | App Router 文件路由 | 多页面 HTML + JS 路由守卫 |
| 渲染 | SSR + RSC | CSR (纯客户端渲染) |
| 构建 | `next build` | 无需构建 |
| 部署 | Vercel | 前端任意静态托管 + Node 服务任意部署 |

---

## 总工时

| Sprint | 预估 |
|------|------|
| 0 - 基础设施 | 2-3 天 |
| 1 - 认证 | 4-5 天 |
| 2 - 品牌设置 | 1-2 天 |
| 3 - 项目管理 | 4-5 天 |
| 4 - 日志时间轴 | 6-8 天 |
| 5 - 评论整改 | 4-5 天 |
| 6 - 通知 | 2-3 天 |
| 7 - 布局 | 2-3 天 |
| 8 - 打磨 | 3-4 天 |
| **合计** | **28-38 天** |

---

## 变更记录

| 日期 | 变更内容 |
|------|------|
| 2026-05-19 | 基于 spec.md v2.0 编写，技术栈 Next.js + Supabase |
| 2026-07-04 | 基于 spec.md v3.0 重写，技术栈切换为 Supabase + Node.js (Express) + HTML + Vanilla JS |
