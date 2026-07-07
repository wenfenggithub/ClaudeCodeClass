# 产品规格说明书 (spec.md)

## 1. 项目名称

**幼升小暑期学习打卡与成长记录系统**

## 2. 项目背景

幼升小阶段是儿童学习习惯养成的关键时期。暑假期间，家长通常会为孩子安排拼音、识字、数学、阅读等多类学习任务，但普遍面临以下问题：

- 任务种类繁多，缺乏统一的记录和管理工具
- 每天手动统计完成情况，耗时且容易遗漏
- 无法直观看到孩子的学习进度和成长轨迹
- 需要一种简单有效的方式来激励孩子坚持学习

本系统旨在为家长提供一款轻量级、易用的暑期学习打卡工具，帮助家庭更好地规划和追踪孩子的学习任务。

## 3. 目标用户

**主要用户**：幼升小阶段（5-7岁）儿童的家长

**用户特征**：
- 关注孩子教育，希望系统化安排学习任务
- 需要简单直观的操作界面，不需要复杂功能
- 可能在手机或电脑上使用
- 希望看到可视化的学习进度和统计数据

## 4. 需求分析

### 4.1 功能性需求

| 序号 | 功能 | 描述 | 优先级 |
|------|------|------|--------|
| F1 | 首页仪表盘 | 展示今日概览、暑假倒计时、连续打卡天数等关键指标 | P0 |
| F2 | 任务管理 | 新增/编辑/删除/查看学习任务，支持分类和启用/停用 | P0 |
| F3 | 今日打卡 | 查看今日任务列表，完成/取消打卡，填写备注 | P0 |
| F4 | 历史记录 | 按日期查看历史打卡情况，展示每日完成率 | P1 |
| F5 | 统计分析 | 展示累计完成次数、分类统计、最佳打卡日等 | P1 |

### 4.2 非功能性需求

- 页面加载速度快（2秒以内）
- 移动端和桌面端均可正常使用
- 界面风格温馨、适合教育类产品
- 数据安全可靠，不丢失打卡记录

## 5. 功能模块

### 5.1 首页仪表盘

展示8个核心指标卡片：
- 今天日期
- 暑假倒计时（距8月31日的天数）
- 今日任务总数
- 今日已完成数量
- 今日完成率（百分比）
- 连续打卡天数
- 累计打卡次数
- 累计打卡天数

### 5.2 任务管理

- 任务列表展示：名称、分类标签、启用状态、描述
- 新增任务：填写名称（必填）、分类、说明、是否启用
- 编辑任务：修改任务任意字段
- 删除任务：确认后删除（关联打卡记录级联删除）
- 按分类筛选任务
- 任务分类：拼音、识字、数学、阅读、英语、运动、写字、生活习惯、其他

### 5.3 今日打卡

- 展示所有已启用任务的打卡列表
- 每个任务可切换完成/未完成状态（点击圆形按钮）
- 每个任务可填写备注（如"今天读得很好"）
- 一键保存所有打卡记录
- 同一任务同一天不会产生重复记录（数据库 UNIQUE 约束 + UPSERT）

### 5.4 历史记录

- 按日期倒序展示历史打卡
- 每天显示：日期、完成率、完成/未完成任务列表
- 显示任务名称、分类、备注
- 完成率颜色标识：≥80% 绿色、50-79% 黄色、<50% 红色
- 分页浏览（每页30条）

### 5.5 统计分析

统计卡片：
- 总任务数、累计完成次数、近7天完成率
- 连续打卡天数、累计打卡天数、最佳打卡日

分类统计表格：
- 各分类完成次数排行

## 6. 技术架构

支持两种运行模式：

**模式一：独立 HTML 文件（零依赖，推荐分发）**
```
┌─────────────────────────────────────────┐
│               客户端 (Browser)            │
│         summer-checkin.html（单文件）          │
│         内嵌 CSS + JS                    │
│         fetch() 直接调 Supabase REST API │
└──────────────────┬──────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────┐
│         数据层 (Supabase PostgreSQL)      │
│         Row Level Security             │
└─────────────────────────────────────────┘
```

**模式二：Express 后端（适用于生产部署）**
```
┌─────────────────────────────────────────┐
│               客户端 (Browser)            │
│         index.html + style.css + app.js │
│         fetch() 直接调 Supabase REST API │
└──────────────────┬──────────────────────┘
                   │ 或通过 Express 代理
┌──────────────────▼──────────────────────┐
│          服务端 (Node.js + Express)       │
│         RESTful API 接口层（可选）         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         数据层 (Supabase PostgreSQL)      │
└─────────────────────────────────────────┘
```

**技术选型**：
- **数据存储**：Supabase (PostgreSQL)
- **后端**：Node.js 18+ / Express 4.x（可选，summer-checkin.html 不依赖后端）
- **前端**：原生 HTML + CSS + JavaScript（无框架，零外部依赖）
- **数据访问**：浏览器原生 fetch() 直接调用 Supabase REST API

## 7. 数据库设计

### tasks 表

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| title | VARCHAR(200) | 任务名称 | NOT NULL |
| category | VARCHAR(50) | 分类 | NOT NULL, DEFAULT '其他' |
| description | TEXT | 任务说明 | DEFAULT '' |
| is_active | BOOLEAN | 是否启用 | DEFAULT TRUE |
| created_at | TIMESTAMPTZ | 创建时间 | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新时间 | DEFAULT NOW() |

### checkins 表

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| task_id | INTEGER | 任务ID | NOT NULL, FK → tasks(id) |
| checkin_date | DATE | 打卡日期 | NOT NULL, DEFAULT CURRENT_DATE |
| is_done | BOOLEAN | 是否完成 | DEFAULT FALSE |
| note | TEXT | 备注 | DEFAULT '' |
| created_at | TIMESTAMPTZ | 创建时间 | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新时间 | DEFAULT NOW() |

**约束**：
- `UNIQUE(task_id, checkin_date)` — 同一任务同一天仅一条记录
- `FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE` — 删除任务时级联删除打卡记录

## 8. API 设计

### 任务接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取所有任务（支持 ?category=&active= 筛选） |
| GET | /api/tasks/:id | 获取单个任务 |
| POST | /api/tasks | 新增任务 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |

### 打卡接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/checkins/today | 获取今日打卡列表（含任务信息） |
| POST | /api/checkins | 保存/更新打卡记录（UPSERT） |
| GET | /api/checkins/history | 获取历史记录（分页，支持日期范围） |

### 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats | 获取综合统计数据 |

## 9. 页面设计

### 文件说明

| 文件 | 用途 |
|------|------|
| `summer-checkin.html` | **独立分享版**，CSS/JS 全部内嵌，单文件即可运行 |
| `index.html` + `style.css` + `app.js` | 开发版，三文件分离 |

### 页面结构
```
├── 首页仪表盘 (dashboard)
│   └── 8个统计卡片
├── 今日打卡 (checkin)
│   └── 任务列表 + 完成切换 + 备注输入 + 保存按钮
├── 任务管理 (tasks)
│   └── 筛选器 + 任务列表 + 新增/编辑弹窗
├── 历史记录 (history)
│   └── 按日期分组展示 + 分页
└── 统计分析 (stats)
    └── 6个统计卡片 + 分类表格
```

### 设计风格
- 配色：教育类产品的清爽风格，蓝色主色调
- 卡片式布局，清晰的信息层级
- 圆角边框、柔和阴影
- 移动端响应式适配（640px 断点）

## 10. 部署说明

### 部署到 vittable.com 子域名

1. **前提条件**：
   - 已在 Supabase 创建项目并执行 schema.sql
   - 已获取 SUPABASE_URL 和 SUPABASE_ANON_KEY
   - 服务器已安装 Node.js 18+

2. **部署步骤**：
   ```bash
   # 克隆项目
   git clone <repo-url> summer-checkin
   cd summer-checkin

   # 安装依赖
   npm install

   # 配置环境变量
   cp .env.example .env
   # 编辑 .env 填入真实 Supabase 凭据

   # 启动服务（生产环境建议使用 PM2）
   npm start
   ```

3. **Nginx 反向代理配置**（如使用 vittable.com 子域名）：
   ```nginx
   server {
       server_name summer-checkin.vittable.com;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **使用 PM2 守护进程**：
   ```bash
   npm install -g pm2
   pm2 start server.js --name summer-checkin
   pm2 save
   pm2 startup
   ```

## 11. 项目亮点

1. **极简易用**：无需注册登录，家长打开即用，专注于打卡本身
2. **单文件即用**：summer-checkin.html 零依赖、零安装，双击打开或微信发送即可使用
3. **UPSERT 机制**：打卡记录使用数据库级 UNIQUE 约束 + UPSERT，杜绝重复记录
4. **可视化反馈**：仪表盘、完成率、连续打卡天数、分类排行，多维度展示学习进度
5. **移动端友好**：响应式设计，手机和电脑均可流畅使用
6. **数据完整性**：外键级联删除、时间戳自动更新触发器、完善的错误处理
