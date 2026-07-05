# SiteSync — 装修进度追踪平台 产品规格说明书

> **版本**: v3.0  
> **更新日期**: 2026-07-04  
> **技术栈**: Supabase / Node.js (Express) / HTML + Vanilla JS  

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户角色与权限](#2-用户角色与权限)
3. [功能需求](#3-功能需求)
4. [数据库设计](#4-数据库设计)
5. [API 接口设计](#5-api-接口设计)
6. [前端架构](#6-前端架构)
7. [认证与安全](#7-认证与安全)
8. [文件存储](#8-文件存储)
9. [部署架构](#9-部署架构)
10. [附录](#10-附录)

---

## 1. 产品概述

### 1.1 产品定位

SiteSync 是一个**装修进度可视化协作平台**，连接**设计师、施工方、业主**三方，通过施工日志时间轴 + 整改工单系统，让装修过程透明、高效。

### 1.2 核心价值

| 角色 | 痛点 | 解决方案 |
|------|------|----------|
| 设计师 | 无法实时掌握工地进展 | 时间轴看板，施工方每日上传 |
| 施工方 | 沟通碎片化，整改无追踪 | 整改工单闭环，状态透明 |
| 业主 | 看不到工地，不放心 | 图文日志，随时查看 |

### 1.3 技术架构

```
┌─────────────────────────────────────────────┐
│                  客户端                       │
│         HTML + CSS + Vanilla JS             │
│      (SPA via page-level scripts)           │
└──────────────────┬──────────────────────────┘
                   │ HTTP REST
┌──────────────────▼──────────────────────────┐
│              服务器层                        │
│         Node.js + Express                   │
│    • REST API (JSON)                        │
│    • 认证中间件 (Supabase Auth JWT)          │
│    • 业务逻辑                               │
│    • 文件上传代理                            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              数据存储层                       │
│             Supabase                        │
│    • PostgreSQL (业务数据)                   │
│    • Supabase Auth (用户认证)                │
│    • Supabase Storage (图片/文件)            │
│    • Row Level Security (数据权限)           │
└─────────────────────────────────────────────┘
```

---

## 2. 用户角色与权限

### 2.1 角色定义

| 角色 | 标识 | 权限级别 | 核心权限 |
|------|------|----------|----------|
| 设计师 | `designer` | 管理员 | 创建项目、管理成员、发布日志、创建整改、编辑工作室 |
| 施工方 | `contractor` | 编辑者 | 发布日志、评论、处理整改、上传整改照片 |
| 业主 | `homeowner` | 只读+评论 | 浏览时间轴、评论、查看整改进度 |

### 2.2 权限矩阵

| 操作 | 设计师 | 施工方 | 业主 |
|------|:---:|:---:|:---:|
| 创建项目 | ✅ | ❌ | ❌ |
| 编辑项目信息 | ✅ | ❌ | ❌ |
| 管理项目成员 | ✅ | ❌ | ❌ |
| 发布施工日志 | ✅ | ✅ | ❌ |
| 编辑/删除自己的日志 | ✅ | ✅ | ❌ |
| 删除他人日志 | ✅ | ❌ | ❌ |
| 发表评论 | ✅ | ✅ | ✅ |
| 删除自己的评论 | ✅ | ✅ | ✅ |
| 创建整改工单 | ✅ | ❌ | ❌ |
| 更新整改状态（确认/完成） | ❌ | ✅ | ❌ |
| 更新整改状态（验收/打回/关闭） | ✅ | ❌ | ❌ |
| 查看项目内容 | ✅ | ✅ | ✅ |
| 修改工作室品牌 | ✅ | ❌ | ❌ |
| 邀请成员 | ✅ | ❌ | ❌ |

### 2.3 路由访问权限

| 路径 | 设计师 | 施工方 | 业主 | 未登录 |
|------|:---:|:---:|:---:|:---:|
| `/login.html` | ✅ | ✅ | ✅ | ✅ |
| `/register.html` | — | — | — | ✅ |
| `/invite.html?token=xxx` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard.html` | ✅ | ✅ | ✅ | ❌ |
| `/project.html?id=xxx` | ✅ | ✅ | ✅ | ❌ |
| `/project-settings.html?id=xxx` | ✅ | ❌ | ❌ | ❌ |
| `/project-members.html?id=xxx` | ✅ | ❌ | ❌ | ❌ |
| `/issues.html?id=xxx` | ✅ | ✅ | ✅ | ❌ |
| `/studio-settings.html` | ✅ | ❌ | ❌ | ❌ |
| `/notifications.html` | ✅ | ✅ | ✅ | ❌ |

---

## 3. 功能需求

### 3.1 认证模块

#### F1 — 设计师注册
- 填写: 邮箱 + 密码 + 工作室名称
- 调用 Supabase Auth `signUp`
- 自动创建 studio 记录和 designer profile
- 注册成功自动登录 → 跳转工作台

#### F2 — 登录
- 支持邮箱 + 密码登录
- 支持 Magic Link（邮件发送一次性登录链接）
- 登录后按角色跳转对应页面

#### F3 — 邀请流程
- 设计师填写被邀请人邮箱 + 选择角色（施工方/业主）
- 系统生成含 token 的邀请链接
- MVP: 在页面展示邀请链接（后续接 Resend 邮件）
- 被邀请人点击链接 → 设置密码 + 显示名称 → 激活账号
- 自动加入对应项目

#### F4 — 退出登录
- 清除本地 token/session → 跳转登录页

### 3.2 工作台

#### F5 — 项目列表
- 显示当前用户参与的所有项目
- 卡片信息: 封面图 | 项目名 | 地址 | 当前阶段 badge | 最近更新时间
- 无项目时显示空状态引导
- 设计师可见"创建项目"按钮

#### F6 — 创建项目
- 设计师填写: 项目名称(必填) + 地址(必填) + 面积 + 风格 + 封面图 + 开工日期
- 创建后自动将设计师加入项目成员
- 成功 → 跳转到项目时间轴页

### 3.3 施工日志（核心）

#### F7 — 时间轴浏览
- 日志按日期倒序瀑布流展示
- 每条日志: 日期 + 阶段标签 + 图片网格 + 文字内容 + 发布者信息 + 评论数
- 月份跳转导航
- 无限滚动分页（cursor 分页，每页 20 条）
- 支持下拉刷新

#### F8 — 发布日志
- 施工方/设计师可发布
- 选择阶段（必选，从 7 个阶段中选择）
- 上传照片（支持多张，前端压缩至 1920px 宽）
- 可填写文字说明（可选）
- 发布后自动更新项目当前阶段
- 通知项目其他成员

#### F9 — 图片浏览
- 网格自适应: 1张全宽 / 2张2列 / 3张1大2小 / 4+张2列
- 点击图片 → 全屏 PhotoViewer
- 左右滑动/箭头切换该日志内的图片
- 图片懒加载

#### F10 — 日志管理
- 作者可编辑/删除自己的日志
- 设计师可删除任何日志
- 编辑: 修改文字内容 + 增删图片 + 修改阶段

### 3.4 评论系统

#### F11 — 评论列表
- 每条日志下方可展开评论区
- 评论按时间正序排列
- 设计师评论有左侧品牌色边框标识

#### F12 — 发表/删除评论
- 三方均可发表评论
- 输入文字 → 发送（Enter 键快捷发送）
- 作者或设计师可删除评论
- 新评论通知日志作者

### 3.5 整改工单

#### F13 — 整改列表
- 按状态分 Tab: "待处理" | "已完成"
- 每条: 状态圆点 + 标题 + 创建者 + 日期
- 点击 → 弹出详情面板

#### F14 — 整改生命周期

```
pending  ──→ confirmed ──→ fixed ──→ verified ──→ closed
(设计师创建) (施工方确认) (施工方完成) (设计师验收)  (关闭)
                                 │
                                 └──→ pending (设计师打回)
```

- 每次状态变更触发通知
- 施工方完成时可上传整改后照片

### 3.6 通知系统

#### F15 — 通知列表
- 铃铛图标 + 未读数量 badge
- 点击展开最近 10 条通知下拉
- 点击通知 → 标记已读 + 跳转目标
- "全部已读"和列表页入口

#### F16 — 通知触发
| 事件 | 接收人 |
|------|--------|
| 新日志发布 | 项目其他成员 |
| 新评论 | 日志作者 |
| 整改创建 | 被指派的施工方 |
| 整改验收通过 | 被指派的施工方 |
| 整改打回 | 被指派的施工方 |

### 3.7 项目管理

#### F17 — 成员管理
- 查看项目成员列表（头像、名称、角色）
- 设计师可添加成员（发送邀请）
- 设计师可移除成员

#### F18 — 项目设置
- 设计师可编辑项目信息
- 状态切换: active → completed → archived（需确认）
- completed 时提示"施工方不可再发布日志"

### 3.8 工作室品牌

#### F19 — 品牌设置
- 设计师可修改工作室名称
- 上传 Logo（Supabase Storage）
- 选择品牌色（Color Picker）
- 品牌色全局生效（CSS 变量注入）

---

## 4. 数据库设计

### 4.1 ER 图

```
studios 1───* profiles *───1 auth.users
   │               │
   │               ├──────* project_members *──────┐
   │               │                               │
   └───────────────┼──* projects                   │
                   │       │                       │
                   │       ├──* daily_logs         │
                   │       │       ├──* comments   │
                   │       ├──* issue_orders       │
                   │       └──* notifications      │
                   │                               │
                   └───────────────────────────────┘
```

### 4.2 表结构

#### `studios` — 工作室

```sql
CREATE TABLE studios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  brand_color   TEXT NOT NULL DEFAULT '#1A1A1A',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `profiles` — 用户档案

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('designer', 'contractor', 'homeowner')),
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `projects` — 项目

```sql
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  address           TEXT NOT NULL,
  cover_image_url   TEXT,
  area_sqm          NUMERIC(8,2),
  style             TEXT,
  current_phase     TEXT NOT NULL DEFAULT '拆旧'
                    CHECK (current_phase IN ('拆旧','水电','泥木','油漆','安装','软装','验收')),
  start_date        DATE,
  expected_end_date DATE,
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'archived')),
  homeowner_name    TEXT,
  homeowner_phone   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `project_members` — 项目成员

```sql
CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('designer', 'contractor', 'homeowner')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
```

#### `daily_logs` — 施工日志

```sql
CREATE TABLE daily_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       TEXT,
  phase         TEXT NOT NULL
                CHECK (phase IN ('拆旧','水电','泥木','油漆','安装','软装','验收')),
  images        JSONB NOT NULL DEFAULT '[]',
  video_url     TEXT,
  publish_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`images` JSONB 格式:
```json
[
  { "url": "https://...", "width": 1920, "height": 1080, "order": 0 },
  { "url": "https://...", "width": 1920, "height": 1440, "order": 1 }
]
```

#### `comments` — 评论

```sql
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id      UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `issue_orders` — 整改工单

```sql
CREATE TABLE issue_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  log_id            UUID REFERENCES daily_logs(id) ON DELETE SET NULL,
  created_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  reference_images  JSONB NOT NULL DEFAULT '[]',
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','fixed','verified','closed')),
  fixed_images      JSONB NOT NULL DEFAULT '[]',
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `notifications` — 通知

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.3 索引

```sql
CREATE INDEX idx_profiles_studio    ON profiles(studio_id);
CREATE INDEX idx_projects_studio    ON projects(studio_id);
CREATE INDEX idx_project_members_p  ON project_members(project_id);
CREATE INDEX idx_project_members_u  ON project_members(user_id);
CREATE INDEX idx_daily_logs_project ON daily_logs(project_id, publish_date DESC);
CREATE INDEX idx_daily_logs_phase   ON daily_logs(project_id, phase);
CREATE INDEX idx_comments_log       ON comments(log_id);
CREATE INDEX idx_issues_project     ON issue_orders(project_id, status);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
```

### 4.4 RLS 策略

#### `studios`
- 同 studio 的认证用户可读取
- 仅设计师可更新（同 studio）

#### `profiles`
- 同 studio 的认证用户可读取
- 仅本人可更新

#### `projects`
- 项目成员可读取
- 仅所在 studio 的设计师可创建/更新

#### `daily_logs`
- 项目成员可读取
- 项目的施工方或设计师可创建
- 作者或项目设计者可更新/删除

#### `issue_orders`
- 项目成员可读取
- 设计师可创建
- 被指派人可更新状态（confirmed → fixed）
- 设计师可更新状态（fixed → verified/pending, verified → closed）

### 4.5 触发器

```sql
-- 项目 updated_at 自动更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issue_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. API 接口设计

### 5.1 基础约定

- **Base URL**: `http://localhost:3001/api/v1`
- **认证方式**: Bearer Token（Supabase JWT），通过 `Authorization: Bearer <token>` 传递
- **Content-Type**: `application/json`（文件上传使用 `multipart/form-data`）
- **响应格式**: 

```json
{
  "data": { ... },
  "meta": { "nextCursor": "...", "hasMore": true },
  "error": null
}
```

**错误格式**:
```json
{
  "data": null,
  "error": { "code": "UNAUTHORIZED", "message": "请先登录" }
}
```

### 5.2 API 列表

#### 认证（Supabase Auth 直接调用，不经过 Node 服务）

| Method | Path | 说明 |
|--------|------|------|
| POST | Supabase `auth.signUp` | 注册 |
| POST | Supabase `auth.signInWithPassword` | 密码登录 |
| POST | Supabase `auth.signInWithOtp` | Magic Link |
| POST | Supabase `auth.signOut` | 退出 |

> 说明: 注册/登录由客户端直接调用 Supabase Auth SDK。Node 服务仅处理业务 API。
> 注册后客户端调用 `POST /api/v1/auth/onboard` 写入 profiles + studios。

#### 用户

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| POST | `/auth/onboard` | ✅ | 注册后创建 profile + studio |
| GET | `/users/me` | ✅ | 获取当前用户 + profile + studio |

#### 工作室

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| GET | `/studio` | ✅ | 获取当前用户所属工作室 |
| PATCH | `/studio` | 设计师 | 更新工作室信息 |

#### 项目

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| GET | `/projects` | ✅ | 获取用户参与的项目列表 |
| POST | `/projects` | 设计师 | 创建新项目 |
| GET | `/projects/:id` | 成员 | 获取项目详情 |
| PATCH | `/projects/:id` | 设计师 | 更新项目信息 |
| PATCH | `/projects/:id/status` | 设计师 | 更改项目状态 |
| GET | `/projects/:id/members` | 成员 | 获取成员列表 |
| POST | `/projects/:id/members` | 设计师 | 添加成员（发送邀请） |
| DELETE | `/projects/:id/members/:userId` | 设计师 | 移除成员 |

#### 施工日志

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| GET | `/projects/:id/logs` | 成员 | 日志列表（cursor 分页） |
| POST | `/projects/:id/logs` | 施工方/设计师 | 创建日志 |
| PATCH | `/projects/:id/logs/:logId` | 作者 | 编辑日志 |
| DELETE | `/projects/:id/logs/:logId` | 作者/设计师 | 删除日志 |

#### 评论

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| GET | `/logs/:logId/comments` | 成员 | 评论列表 |
| POST | `/logs/:logId/comments` | ✅ | 发表评论 |
| DELETE | `/logs/:logId/comments/:commentId` | 作者/设计师 | 删除评论 |

#### 整改

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| GET | `/projects/:id/issues` | 成员 | 整改列表 |
| POST | `/projects/:id/issues` | 设计师 | 创建整改 |
| PATCH | `/projects/:id/issues/:issueId` | 权限控制 | 更新整改状态 |

#### 通知

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| GET | `/notifications` | ✅ | 通知列表 |
| PATCH | `/notifications/:id/read` | 本人 | 单条已读 |
| PATCH | `/notifications/read-all` | 本人 | 全部已读 |

#### 上传

| Method | Path | Auth | 说明 |
|--------|------|:---:|------|
| POST | `/upload` | ✅ | 上传图片 （multipart/form-data）|

### 5.3 API 路由文件结构

```
server/
├── package.json
├── .env
├── src/
│   ├── index.js              # 入口，Express 启动
│   ├── config.js             # 环境变量 / Supabase 客户端初始化
│   ├── middleware/
│   │   ├── auth.js           # JWT 验证中间件（解析 Supabase JWT）
│   │   ├── requireRole.js    # 角色校验中间件
│   │   └── validate.js       # Zod 请求体验证中间件
│   ├── routes/
│   │   ├── auth.js           # /api/v1/auth/*
│   │   ├── users.js          # /api/v1/users/*
│   │   ├── studio.js         # /api/v1/studio/*
│   │   ├── projects.js       # /api/v1/projects/*
│   │   ├── logs.js           # /api/v1/logs/*  和 /api/v1/projects/:id/logs/*
│   │   ├── comments.js       # /api/v1/logs/:logId/comments/*
│   │   ├── issues.js         # /api/v1/projects/:id/issues/*
│   │   ├── notifications.js  # /api/v1/notifications/*
│   │   └── upload.js         # /api/v1/upload/*
│   ├── services/
│   │   ├── supabase.js       # Supabase 客户端封装
│   │   ├── notification.js   # 通知创建服务
│   │   └── storage.js        # 文件上传封装
│   └── utils/
│       ├── errors.js         # 错误类与错误处理
│       └── response.js       # 统一响应格式
```

---

## 6. 前端架构

### 6.1 技术选型

| 关注点 | 方案 |
|--------|------|
| HTML | 纯 HTML5，语义标签 |
| CSS | 原生 CSS + CSS Variables（主题色） |
| JS | Vanilla JS (ES Modules)，无框架 |
| HTTP | `fetch` API |
| 路由 | 多页面（每个页面独立 .html） |
| 构建 | 无需构建工具，直接部署静态文件 |

### 6.2 目录结构

```
public/
├── index.html              # 入口（自动跳转 /login.html 或 /dashboard.html）
├── login.html              # 登录页
├── register.html           # 注册页
├── invite.html             # 邀请接受页
├── dashboard.html          # 工作台
├── project.html            # 项目时间轴
├── project-settings.html   # 项目设置
├── project-members.html    # 成员管理
├── issues.html             # 整改列表
├── studio-settings.html    # 工作室设置
├── notifications.html      # 通知列表
├── 404.html                # 404 页面
├── css/
│   ├── reset.css           # CSS Reset
│   ├── variables.css       # CSS 变量（品牌色注入）
│   ├── common.css          # 公共样式（按钮、表单、卡片等）
│   ├── components.css      # 组件样式
│   ├── login.css           # 认证页样式
│   ├── dashboard.css       # 工作台
│   ├── project.css         # 项目时间轴
│   ├── issues.css          # 整改
│   └── responsive.css      # 响应式断点
├── js/
│   ├── config.js           # Supabase 配置 + 初始化
│   ├── auth.js             # 认证工具（登录/注册/退出/获取用户）
│   ├── api.js              # 通用 fetch 封装（自动带 token）
│   ├── router.js           # 前端路由守卫
│   ├── utils.js            # 工具函数
│   ├── components/
│   │   ├── navbar.js       # 导航栏组件
│   │   ├── photo-viewer.js # 全屏图片浏览器
│   │   ├── image-uploader.js # 图片上传组件
│   │   ├── log-editor.js   # 日志编辑器
│   │   └── notification-bell.js # 通知铃铛
│   ├── pages/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── invite.js
│   │   ├── dashboard.js
│   │   ├── project.js
│   │   ├── project-settings.js
│   │   ├── project-members.js
│   │   ├── issues.js
│   │   ├── studio-settings.js
│   │   └── notifications.js
│   └── lib/
│       └── supabase.js     # Supabase JS SDK 封装
└── assets/
    ├── logo.svg            # 默认 Logo
    └── icons/              # SVG 图标
```

### 6.3 页面间导航

```
login.html ───────────────────────────────────────────┐
  │ (注册链接)                                          │
  ├──► register.html ──► dashboard.html                │
  │                        │                           │
  │    invite.html ────────┘                           │
  │                        ├──► project.html           │
  │                        │      ├──► issues.html     │
  │                        │      ├──► project-settings.html
  │                        │      └──► project-members.html
  │                        ├──► studio-settings.html   │
  │                        └──► notifications.html     │
  └──► (Magic Link 邮件) ──► dashboard.html            │
```

### 6.4 SPA-like 体验

虽然是多页面，但通过以下方式保持状态:
- **token** 存储在 `localStorage`，每个页面加载时读取
- 公共 `api.js` 自动从 `localStorage` 获取 token 并附加到请求头
- `navbar.js` 在所有认证页面加载，提供统一的导航栏和通知铃铛
- Supabase Auth 的 session 自动持久化在 `localStorage`

### 6.5 响应式设计

| 断点 | 宽度 | 布局 |
|------|------|------|
| Mobile | < 768px | 单列 + 底部 Tab 导航 |
| Tablet | 768px - 1024px | 2列卡片 + 侧边栏(折叠) |
| Desktop | > 1024px | 侧边栏(展开) + 3列卡片 |

---

## 7. 认证与安全

### 7.1 认证流程

```
┌──────────┐      ┌──────────────┐      ┌──────────┐
│  客户端    │      │  Supabase     │      │  Node    │
│ (HTML)   │      │  Auth         │      │  Server  │
└────┬─────┘      └──────┬───────┘      └────┬─────┘
     │                    │                   │
     │ 1. signUp/signIn   │                   │
     │───────────────────►│                   │
     │                    │                   │
     │ 2. JWT + Session   │                   │
     │◄───────────────────│                   │
     │                    │                   │
     │ 3. POST /auth/onboard (注册时)          │
     │  (with JWT) ──────────────────────────►│
     │                    │                   │
     │ 4. 业务 API 请求   │                   │
     │  (with JWT) ──────────────────────────►│
     │                    │                   │
     │                    │ 5. 验证 JWT       │
     │                    │◄──────────────────│
     │                    │                   │
```

### 7.2 安全措施

- **传输安全**: HTTPS（生产环境）+ Supabase TLS
- **认证**: Supabase Auth JWT，服务端验证 `auth.users`
- **数据权限**: Supabase RLS 作为最后防线
- **应用层鉴权**: Node 中间件验证 JWT + 角色
- **存储安全**: Supabase Storage RLS 策略
- **输入验证**: Zod schema 验证所有请求体
- **环境变量**: `.env` 存储敏感配置，不提交 Git

---

## 8. 文件存储

### 8.1 Bucket 规划

| Bucket | 用途 | 公开访问 | 文件类型 | 路径规则 |
|--------|------|:---:|------|------|
| `log-images` | 施工日志照片 | ✅ | JPEG/PNG/WebP | `{project_id}/{uuid}.jpg` |
| `project-covers` | 项目封面图 | ✅ | JPEG/PNG/WebP | `{project_id}/cover.jpg` |
| `studio-logos` | 工作室 Logo | ✅ | JPEG/PNG/SVG | `{studio_id}/logo` |

### 8.2 图片处理

- **上传前压缩**（客户端 JS）: 最大宽度 1920px, JPEG 质量 0.85
- **缩略图**: 使用 Supabase Image Transformation
  - 列表页缩略图: `?width=400&height=300&resize=cover`
  - 时间轴图片: `?width=800`
- **格式**: 上传时统一为 JPEG

### 8.3 Storage RLS

```sql
-- log-images: 项目成员可上传，公开可读
CREATE POLICY "公开读取" ON storage.objects
  FOR SELECT USING (bucket_id = 'log-images');

CREATE POLICY "项目成员上传" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'log-images'
    AND auth.uid() IS NOT NULL
  );
```

---

## 9. 部署架构

### 9.1 服务划分

| 服务 | 方案 | 端口/URL |
|------|------|----------|
| 前端静态文件 | Nginx / Vercel / Netlify | 80/443 |
| Node.js API | PM2 / Docker / Railway | 3001 |
| Supabase | Supabase 托管云服务 | supabase.co |

### 9.2 环境变量

**Node 服务 (server/.env)**:
```
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
```

**前端 (public/js/config.js 或构建时注入)**:
```js
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
const API_BASE = 'http://localhost:3001/api/v1';
```

### 9.3 启动方式

```bash
# 开发环境
# Terminal 1: 启动 Node API
cd server && npm run dev

# Terminal 2: 启动前端静态服务
cd public && npx serve . -p 3000

# 或使用 live-server
cd public && npx live-server --port=3000
```

---

## 10. 附录

### 10.1 7 个装修阶段

```
拆旧 → 水电 → 泥木 → 油漆 → 安装 → 软装 → 验收
```

### 10.2 整改状态流转图

```
                    ┌──────────┐
                    │  pending │  (设计师创建)
                    └────┬─────┘
                         │ 施工方确认
                    ┌────▼─────┐
                    │ confirmed│
                    └────┬─────┘
                         │ 施工方完成 + 上传整改照
                    ┌────▼─────┐
               ┌────│  fixed   │◄────────┐
               │    └────┬─────┘         │
               │         │ 设计师验收     │ 设计师打回
               │    ┌────▼─────┐         │
               │    │ verified │─────────┘
               │    └────┬─────┘
               │         │ 设计师关闭
               │    ┌────▼─────┐
               │    │  closed  │
               │    └──────────┘
               │
               └── 设计师打回重做
```

### 10.3 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|------|
| 2026-05-19 | v2.0 | 初版，技术栈 Next.js + Supabase |
| 2026-07-04 | v3.0 | 架构重构: Node.js + HTML + Supabase |
