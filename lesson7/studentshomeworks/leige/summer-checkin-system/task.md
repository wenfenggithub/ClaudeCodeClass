# 任务清单 (task.md)

## 1. 项目初始化 ✅

- [x] 创建项目目录结构
- [x] 初始化 package.json
- [x] 安装依赖（express, cors, dotenv, @supabase/supabase-js）
- [x] 创建 .env.example 环境变量模板

## 2. Supabase 数据库搭建 ✅

- [x] 编写 schema.sql 建表语句
- [x] 创建 tasks 表（含索引和触发器）
- [x] 创建 checkins 表（含唯一约束和外键）
- [x] 添加 updated_at 自动更新触发器
- [x] 插入示例任务数据
- [x] 在 Supabase 控制台执行 schema.sql
- [x] 关闭 RLS 以允许 anon key 访问
- [x] 验证表结构和约束

## 3. 后端接口开发 ✅

- [x] Supabase 客户端配置
- [x] GET /api/tasks — 任务列表（支持分类和启用状态筛选）
- [x] GET /api/tasks/:id — 获取单个任务
- [x] POST /api/tasks — 新增任务
- [x] PUT /api/tasks/:id — 更新任务
- [x] DELETE /api/tasks/:id — 删除任务
- [x] GET /api/checkins/today — 今日打卡（含任务信息合并）
- [x] POST /api/checkins — 保存打卡（UPSERT）
- [x] GET /api/checkins/history — 历史记录（分页、按日期分组）
- [x] GET /api/stats — 综合统计（今日、累计、连续、分类、最佳日）
- [x] 基本错误处理（try-catch + 状态码）
- [x] CORS 配置
- [x] 静态文件服务（public 目录）

## 4. 前端页面开发 ✅

- [x] index.html — 单页应用结构，5个页面区域
- [x] summer-checkin.html — 独立版本，CSS+JS 全部内嵌，单文件即可分享使用
- [x] 顶部导航栏，5个页面切换按钮
- [x] style.css — 完整样式（响应式、卡片布局、动画）
- [x] 首页仪表盘（8个统计卡片）
- [x] 今日打卡页（任务列表、完成切换、备注、批量保存）
- [x] 任务管理页（列表、筛选、新增/编辑弹窗、删除确认）
- [x] 历史记录页（按日期分组、完成率颜色标识、分页）
- [x] 统计分析页（统计卡片、分类完成表格）
- [x] Toast 提示组件
- [x] 移动端响应式适配（640px 断点）
- [x] 前端直接调用 Supabase REST API（fetch），零外部依赖，支持 file:// 打开

## 5. 联调测试

- [x] 启动本地服务器
- [x] 测试任务 CRUD 接口
- [x] 测试打卡功能（今日列表、保存、切换状态、UPSERT 防重复）
- [x] 测试历史记录分页
- [x] 测试统计数据准确性
- [x] 测试 Supabase REST API 直接调用（fetch）
- [ ] 测试移动端显示效果
- [ ] 测试 summer-checkin.html 在 file:// 协议下完整流程

## 6. GitHub 提交

- [ ] git init 初始化仓库
- [ ] 创建 .gitignore（忽略 node_modules, .env）
- [ ] 提交所有源码
- [ ] 推送到 GitHub

## 7. 部署到 vittable.com 子域名

- [ ] 确保服务器有 Node.js 18+ 运行环境
- [ ] 克隆项目到服务器
- [ ] 配置 .env 文件（Supabase 凭据）
- [ ] npm install 安装依赖
- [ ] 配置 Nginx 反向代理（summer-checkin.vittable.com → localhost:3000）
- [ ] 使用 PM2 启动并守护进程
- [ ] 配置 SSL 证书（Let's Encrypt）
- [ ] 验证线上访问

## 8. 后续优化计划

- [ ] 添加家长多孩子支持（切换孩子档案）
- [ ] 添加每日打卡提醒通知
- [ ] 添加周报/月报生成功能
- [ ] 添加星星/勋章奖励系统，激励孩子
- [ ] 添加数据导出（CSV/PDF）
- [ ] 添加简单图表（Chart.js 柱状图展示趋势）
- [ ] 添加家长密码保护
- [ ] PWA 支持（离线可用、添加到主屏幕）
