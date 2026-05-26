# Claude Code Skill 索引

共 **46 个 Skill**，按功能领域分为 13 个类别。

---

## 配置与基础设置

| Skill | 用途 | 何时使用 |
|---|---|---|
| **update-config** | 配置 Claude Code 的 settings.json，包括权限、环境变量、hooks、自动化行为等 | 需要允许某类命令、添加权限、设置环境变量、配置自动化行为（如"每次 X 时做 Y"） |
| **keybindings-help** | 自定义键盘快捷键，修改 ~/.claude/keybindings.json | 想改键位绑定、添加快捷键组合、修改提交键 |
| **init** | 为新项目初始化 CLAUDE.md 文件，自动生成代码库文档 | 新项目首次使用 Claude Code，需要建立项目上下文文档 |

## 工作流管理

| Skill | 用途 | 何时使用 |
|---|---|---|
| **context-save** | 保存当前工作上下文（git 状态、已做决策、剩余工作） | 需要暂存当前进度，方便之后恢复 |
| **context-restore** | 恢复之前由 /context-save 保存的工作上下文 | 回到之前保存的工作状态继续干活 |
| **freeze** | 限制文件编辑范围到指定目录，阻止对目录外的 Edit/Write 操作 | 需要限定修改范围，防止误改其他模块 |
| **unfreeze** | 清除 /freeze 设定的编辑边界，恢复全局可编辑 | 不再需要文件编辑限制时 |
| **careful** | 危险命令安全护栏，对 rm -rf、DROP TABLE、force-push 等操作发出警告 | 需要额外的安全保护层 |
| **guard** | /careful + /freeze 的组合，同时启用危险命令警告和目录编辑限制 | 需要全套安全保护时 |

## 开发与部署

| Skill | 用途 | 何时使用 |
|---|---|---|
| **ship** | 发布工作流：合并 base 分支、运行测试、review diff、更新 VERSION、更新 CHANGELOG | 准备发布一个新版本时 |
| **land-and-deploy** | 完整的 landing + 部署流程：合并 PR、等待 CI、验证生产环境健康 | PR 合入后需要自动部署并验证 |
| **setup-deploy** | 配置部署设置，检测部署平台（Fly.io 等） | 首次配置 /land-and-deploy 的部署参数 |
| **landing-report** | 只读队列看板，显示当前各 VERSION 槽位的发布状态 | 查看当前发布队列状态 |
| **canary** | 部署后金丝雀监控：监控生产应用的 console 错误、性能回归 | 新版本刚上线，需要实时监控是否异常 |
| **gstack-upgrade** | 升级 gstack 到最新版本，自动检测全局或本地安装方式 | gstack 有新版本需要升级时 |

## 代码评审

| Skill | 用途 | 何时使用 |
|---|---|---|
| **review** | PR 合并前评审：分析 diff 中的 SQL 安全、LLM 信任边界、安全漏洞等 | PR 合入前的代码审查 |
| **security-review** | 对当前分支的待提交变更做安全审查 | 关注安全问题的代码审查 |
| **simplify** | 审查已修改代码的可复用性、质量和效率，并自动修复发现的问题 | 写完代码后想做一次质量优化 |
| **health** | 代码质量仪表盘：运行类型检查、lint、测试等现有工具，汇总质量报告 | 想全面了解代码质量状况 |
| **codex** | OpenAI Codex CLI 封装：独立 diff 审查（codex review 模式） | 想用 Codex 做额外的代码审查 |

## 调试与排查

| Skill | 用途 | 何时使用 |
|---|---|---|
| **investigate** | 系统性调试与根因分析，分四阶段：调查→分析→假设→验证 | 遇到 Bug 需要深入排查根因 |
| **benchmark** | 性能回归检测：建立基线，发现性能退化 | 怀疑性能下降，需要对比基准数据 |

## 浏览器与 QA

| Skill | 用途 | 何时使用 |
|---|---|---|
| **gstack** | 快速无头浏览器，用于 QA 测试和网站 dogfooding | 需要对网页进行自动化导航和交互测试 |
| **browse** | 快速无头浏览器，导航任意 URL、与页面交互 | 需要浏览网页或做简单的页面测试 |
| **qa** | 系统性 QA 测试 Web 应用，发现问题后自动修复 | 完整的端到端质量保证流程 |
| **qa-only** | 仅报告模式的 QA 测试，不自动修复，产出结构化报告 | 只需要测试报告，不需要自动修 Bug |
| **scrape** | 从网页抓取数据，首次调用先原型化流程 | 需要从网页提取结构化数据 |
| **skillify** | 将最近一次成功的 /scrape 流程固化为永久浏览器技能 | 某个抓取流程需要复用，想保存为可重复调用的 skill |
| **open-gstack-browser** | 启动 GStack 浏览器：AI 控制的 Chromium，内置侧边栏扩展 | 需要用完整的 AI 驱动浏览器做复杂测试 |
| **setup-browser-cookies** | 从用户的真实 Chromium 浏览器导入 cookies 到无头浏览会话 | 需要以登录状态访问网站进行测试 |

## 设计与规划

| Skill | 用途 | 何时使用 |
|---|---|---|
| **design-consultation** | 设计咨询：理解产品、研究竞品、提出完整设计方案 | 启动新功能前的设计阶段 |
| **design-shotgun** | 设计发散：生成多个 AI 设计变体，打开对比面板收集反馈 | 需要快速产生多个设计方案做对比选择 |
| **design-review** | 设计师视角 QA：检查视觉一致性、间距、层级、AI 痕迹等问题 | UI 实现后需要设计验收 |
| **design-html** | 设计定稿：生成 Pretext 原生的生产级 HTML/CSS | 设计确认后需要产出最终前端代码 |
| **plan-ceo-review** | CEO/创始人视角的计划审查：重新思考问题、挑战预设、寻找 10 星产品方案 | 重大决策前需要战略层面的审视 |
| **plan-eng-review** | 工程经理视角的计划审查：锁定执行方案，包括架构、数据流、图表 | 技术方案需要工程层面的把关 |
| **plan-design-review** | 设计师视角的计划审查：交互式，对各设计维度评分 | 产品设计方向需要设计师视角的反馈 |
| **plan-devex-review** | 开发者体验计划审查：探索开发者画像、对标竞品 DX | 需要审查工具/API 的开发者体验设计 |
| **autoplan** | 自动审查流水线：依次运行 CEO、设计、工程、DX 全部 review | 需要全面的多角色计划审查 |

## 文档

| Skill | 用途 | 何时使用 |
|---|---|---|
| **document-generate** | 为功能/模块/整个项目从零生成缺失文档 | 项目缺少文档需要补全 |
| **document-release** | 发布后文档更新：读取全部项目文档，交叉参考 diff，更新文档 | 新版本发布后需要同步更新文档 |
| **make-pdf** | 将 Markdown 文件转为排版精美的 PDF（1 英寸页边距、智能分页） | 需要把文档导出为正式 PDF |

## 学习与回顾

| Skill | 用途 | 何时使用 |
|---|---|---|
| **learn** | 管理项目学习记录：审查、搜索、裁剪、导出 gstack 积累的经验 | 需要回顾或清理项目积累的知识 |
| **retro** | 每周工程回顾：分析提交历史、工作模式、代码质量趋势 | 周末/迭代末做工程回顾 |
| **office-hours** | YC Office Hours 模式：Startup 模式用 6 个强制问题暴露需求真实性 | 需要像 YC 导师一样审视产品和方向 |

## AI 与模型

| Skill | 用途 | 何时使用 |
|---|---|---|
| **claude-api** | 构建、调试、优化 Claude API / Anthropic SDK 应用，包含 prompt caching | 代码中 import anthropic SDK、调 Claude API、配置缓存/thinking/tool use 等功能 |
| **benchmark-models** | 跨模型基准测试：同一 prompt 跑 Claude、GPT（Codex）、Gemini 对比 | 需要对比不同模型在特定任务上的表现 |

## 基础设施

| Skill | 用途 | 何时使用 |
|---|---|---|
| **cso** | 首席安全官模式：基础设施优先的安全审计，包括密钥考古、依赖检查 | 需要深度的安全审查 |
| **sync-gbrain** | 将 gbrain 与当前仓库代码同步，刷新 CLAUDE.md 中的 agent 搜索指引 | 代码库变动后需要更新 gbrain 索引 |
| **setup-gbrain** | 设置 gbrain：安装 CLI、初始化本地 PGLite 或 Supabase | 首次接入 gbrain 知识库 |

## 定时任务

| Skill | 用途 | 何时使用 |
|---|---|---|
| **loop** | 按固定间隔重复运行一个 prompt 或 slash command | 需要定期检查某状态（如"每 5 分钟检查部署状态"） |
| **schedule** | 创建、管理、运行定时远程 Agent（routines），基于 cron 调度 | 需要在云端定时执行自动化任务 |

## 其他

| Skill | 用途 | 何时使用 |
|---|---|---|
| **fewer-permission-prompts** | 扫描历史对话中常见的只读 Bash/MCP 调用，自动添加到 allowlist 以减少权限弹窗 | 频繁被权限提示打断，想减少不必要的确认 |
| **pair-agent** | 将远程 AI Agent 与浏览器配对，生成 setup key 并打印连接指令 | 需要用远程 Agent 配合浏览器工作 |
