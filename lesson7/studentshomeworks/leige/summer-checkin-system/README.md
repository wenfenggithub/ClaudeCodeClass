# 🌻 幼升小暑期学习打卡与成长记录系统

面向幼升小儿童家庭的暑期学习打卡工具。家长可以为孩子制定学习任务，每天打卡记录，查看完成情况和成长统计。

## 功能特性

- **📊 首页仪表盘** — 今日概览、暑假倒计时、连续打卡天数、累计统计
- **📋 任务管理** — 新增/编辑/删除任务，支持9种分类，启用/停用控制
- **✅ 今日打卡** — 一键打卡、切换完成状态、填写备注、批量保存
- **📅 历史记录** — 按日期查看打卡情况、完成率颜色标识、分页浏览
- **📈 统计分析** — 完成率趋势、分类排行、最佳打卡日、连续天数

## 技术栈

| 层级 | 技术 |
|------|------|
| 数据层 | Supabase (PostgreSQL) |
| 后端 | Node.js + Express |
| 前端 | 原生 HTML + CSS + JavaScript |
| 部署 | vittable.com 子域名 + PM2 |

## 快速开始

### 1. Supabase 数据库配置

在 Supabase 控制台的 SQL Editor 中执行 `sql/schema.sql` 创建表和示例数据。

### 2. 环境配置

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 Supabase 项目凭据：

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动服务

```bash
# 开发模式（文件变更自动重启）
npm run dev

# 生产模式
npm start
```

访问 http://localhost:3000

## 项目结构

```
summer-checkin-system/
├── server.js          # 后端 Express 服务
├── package.json       # 项目配置和依赖
├── .env.example       # 环境变量模板
├── README.md          # 项目说明
├── spec.md            # 产品规格说明书
├── task.md            # 任务清单
├── sql/
│   └── schema.sql     # Supabase 建表语句
└── public/
    ├── index.html     # 前端页面
    ├── style.css      # 样式表
    └── app.js         # 前端逻辑
```

## API 接口

### 任务
- `GET /api/tasks` — 获取任务列表（`?category=&active=`）
- `GET /api/tasks/:id` — 获取单个任务
- `POST /api/tasks` — 新增任务
- `PUT /api/tasks/:id` — 更新任务
- `DELETE /api/tasks/:id` — 删除任务

### 打卡
- `GET /api/checkins/today` — 今日打卡列表
- `POST /api/checkins` — 保存打卡（UPSERT）
- `GET /api/checkins/history` — 历史记录（分页）

### 统计
- `GET /api/stats` — 综合统计数据

## 部署

### 使用 PM2

```bash
npm install -g pm2
pm2 start server.js --name summer-checkin
pm2 save
pm2 startup
```

### Nginx 反向代理

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

## License

MIT
