# 对话过程与提示词清单

> 完整记录本次会话的交互流程、每个步骤使用的提示词、以及产物说明。

---

## 目录

1. [流程概览](#流程概览)
2. [逐轮对话记录](#逐轮对话记录)
3. [提示词清单（可直接复用）](#提示词清单可直接复用)
4. [产物清单](#产物清单)
5. [关键经验总结](#关键经验总结)

---

## 流程概览

```
安装金融Skills → 通读整理索引 → 调研设计工作室 → 聚焦室内私宅 → 深度调研 → 生成调研产物 → 整理过程文档
     ↓              ↓                ↓                ↓              ↓              ↓             ↓
  20个插件     skill_overview   初步调研报告    调整方向重搜    深度调研.md    research_report  本文件
               .md              财务+客户                              .md/.html
```

---

## 逐轮对话记录

### 第 1 轮：安装 Skills

**用户输入：**
> 安装 anthropics/financial-services仓库下的Skills 到 Claude Code。

**执行过程：**

1. 搜索 `anthropics/financial-services` 仓库确认存在
2. 验证 `claude plugin` 命令可用
3. 添加 marketplace：
   ```bash
   claude plugin marketplace add anthropics/financial-services
   ```
4. 读取 `marketplace.json` 获取全部 20 个插件列表
5. 分 3 批并行安装全部插件：
   - 第一批（7 个垂直技能包）：financial-analysis, investment-banking, equity-research, private-equity, wealth-management, fund-admin, operations
   - 第二批（7 个 agent 插件）：pitch-agent, market-researcher, earnings-reviewer, meeting-prep-agent, model-builder, gl-reconciler, kyc-screener
   - 第三批（6 个其他）：valuation-reviewer, month-end-closer, statement-auditor, lseg, sp-global, claude-for-msft-365-install
6. 验证安装：`claude plugin list`

**产物：** 20 个插件全部安装并启用

---

### 第 2 轮：整理 Skills 索引

**用户输入：**
> 通读所有skill,整理成一份可读的索引（每个skill是什么，能做什么，何时用）

**执行过程：**

1. 查找所有插件目录下的 `plugin.json` 文件（20 个）
2. 列出每个插件的目录结构（commands/skills/agents/hooks）
3. 启动 3 个 Explore Agent 并行读取：
   - Agent 1：7 个垂直技能包的 SKILL.md 和 commands
   - Agent 2：10 个 agent 插件的 SKILL.md 和 agents 定义
   - Agent 3：LSEG、S&P Global、M365 插件的全部文件
4. 整合所有 Agent 返回的结果
5. 编写 `FINANCIAL_SKILLS_INDEX.md`（后改名为 `skill_overview.md`）

**产物：** `skill_overview.md` — 覆盖全部 20 个插件、100+ 项技能、39 个 slash command 的完整索引

---

### 第 3 轮：查看文件

**用户输入：**
> 帮我打开文件夹我查看下

**执行过程：**
```bash
open ~/.claude/plugins/marketplaces/claude-for-financial-services
open /Users/tina/aiprojects/lesson-5
```

---

### 第 4 轮：重命名文件

**用户输入：**
> 帮我转化成skill_overview.md（skill介绍汇总）

**执行过程：**
```bash
mv FINANCIAL_SKILLS_INDEX.md skill_overview.md
```

---

### 第 5 轮：设计工作室调研（初始方向）

**用户输入：**
> 帮我调研下苏州做的比较好的个人设计工作室的客户来源分析，财务分析等

**执行过程：**

使用 3 个 WebSearch 并行搜索：
1. `苏州 个人设计工作室 成功案例 客户来源 2024 2025`
2. `苏州 独立设计师 工作室 商业模式 收入 获客渠道`
3. `苏州 设计工作室 品牌设计 平面设计 经营分析 标杆`

**发现的案例：** 遇义设计（品牌包装）、平介设计（建筑空间）、匡吉绣（苏绣文创）、福马设计、黑蜂设计、西柚品牌设计、力英品牌设计、采绎来（文创平台）

**产物：** 初步调研结果（口头输出，未写文件）

---

### 第 6 轮：聚焦室内私宅设计

**用户输入：**
> 帮我调整为室内私宅设计的个人工作室 全方面分析优秀室内设计工作室的优势和战略方向

**执行过程：**

5 个 WebSearch 并行搜索：
1. `苏州 独立室内设计师 私宅设计 工作室 成功案例`
2. `中国 独立室内设计师 私宅 工作室 标杆 商业模式 获客 小红书`
3. `室内设计工作室 私宅 个人设计师 年收入 客单价 财务模型`
4. `室内设计师 私宅 个人工作室 核心竞争力 差异化战略 品牌定位`
5. `私宅设计 设计师个人IP 抖音小红书 获客 转化率 客单价 案例`

**产物：** `室内私宅设计工作室_全方位分析.md` — 10 章节完整分析报告

---

### 第 7 轮：展开深度调研

**用户输入：**
> 展开说说这些室内设计工作室 做个详细的调研

**执行过程：**

1. 启动 3 个后台 Agent 并行调研（苏州本地 / 全国标杆 / 财务运营数据）
2. 由于 Agent 环境缺少 WebSearch 权限，Agent 返回权限错误
3. 改为主线程直接使用 WebSearch 工具，逐批搜索：
   - 厐喜/PXD 详细信息
   - 舍下草堂详细信息
   - 乾峰学长获客数据
   - 张海华设计费标准
   - 时光筑造运营数据
   - 行业收入分布数据
   - 财务利润结构拆解
   - 获客成本 CAC 数据
   - 小红书获客全链路
4. 多轮搜索后整合数据

**产物：** `室内私宅设计工作室_深度调研.md` — 6 章节、含真实数据的深度报告

---

### 第 8 轮：生成调研产物

**用户输入：**
> 帮我生成一个research_report.md/.html 调研产物 文件

**执行过程：**

1. 复制深度调研为 `research_report.md`
2. 编写 Python 脚本 `convert_to_html.py` 进行 Markdown → HTML 转换
3. 生成带完整 CSS 样式的 `research_report.html`（表格高亮、引用块、代码块、响应式布局、打印优化）
4. 清理临时脚本文件
5. 打开两个文件

**产物：** `research_report.md` + `research_report.html`

---

### 第 9 轮：整理过程文档（本轮）

**用户输入：**
> 帮我整个过程和提示词清单 整理成一份questions_summary.md 文件

**产物：** 本文件 `questions_summary.md`

---

## 提示词清单（可直接复用）

### 插件管理

```bash
# 添加第三方 marketplace
claude plugin marketplace add anthropics/financial-services

# 安装指定 marketplace 的插件
claude plugin install financial-analysis@claude-for-financial-services
claude plugin install investment-banking@claude-for-financial-services
claude plugin install equity-research@claude-for-financial-services
claude plugin install private-equity@claude-for-financial-services
claude plugin install wealth-management@claude-for-financial-services
claude plugin install fund-admin@claude-for-financial-services
claude plugin install operations@claude-for-financial-services
claude plugin install pitch-agent@claude-for-financial-services
claude plugin install market-researcher@claude-for-financial-services
claude plugin install earnings-reviewer@claude-for-financial-services
claude plugin install meeting-prep-agent@claude-for-financial-services
claude plugin install model-builder@claude-for-financial-services
claude plugin install gl-reconciler@claude-for-financial-services
claude plugin install kyc-screener@claude-for-financial-services
claude plugin install valuation-reviewer@claude-for-financial-services
claude plugin install month-end-closer@claude-for-financial-services
claude plugin install statement-auditor@claude-for-financial-services
claude plugin install lseg@claude-for-financial-services
claude plugin install sp-global@claude-for-financial-services
claude plugin install claude-for-msft-365-install@claude-for-financial-services

# 查看已安装插件
claude plugin list
```

### 使用 Agent 批量读取 Skills

```
# Agent 1 提示词
Very thorough exploration. Read ALL SKILL.md files and commands/*.md files 
in these directories. For each skill/command, extract: name, what it does 
(2-3 sentences), when to use it (1-2 sentences), and any slash commands it exposes.

Directories to cover:
- /path/to/plugins/vertical-plugins/financial-analysis/
- /path/to/plugins/vertical-plugins/investment-banking/
... (list all directories)

Return a structured summary for each plugin with ALL its skills/commands listed.

# Agent 2 提示词 (agent 插件)
Very thorough exploration. Read ALL SKILL.md files and agents/* files 
in these directories. ...

# Agent 3 提示词 (合作伙伴插件)
Very thorough exploration. Read ALL files in these directories...
```

### 调研搜索词清单

**设计工作室调研（通用）：**

```
苏州 个人设计工作室 成功案例 客户来源 2024 2025
苏州 独立设计师 工作室 商业模式 收入 获客渠道
苏州 设计工作室 品牌设计 平面设计 经营分析 标杆
```

**室内私宅设计调研：**

```
苏州 独立室内设计师 私宅设计 工作室 成功案例 2024 2025
中国 独立室内设计师 私宅 工作室 标杆 商业模式 获客 小红书
室内设计工作室 私宅 个人设计师 年收入 客单价 财务模型 成本 利润
室内设计师 私宅 个人工作室 核心竞争力 差异化战略 品牌定位
私宅设计 设计师个人IP 抖音小红书 获客 转化率 客单价 案例
```

**特定工作室深挖：**

```
厐喜 PXD设计 苏州 私宅 设计费 收费标准 团队
张海华 仁海设计 苏州 私宅 设计费 桃花坞 太湖
无界设计 吴燕 苏州 别墅 设计费 团队 金鸡湖
曹亮 STUDIO LIANG 苏州 光漪
李亚芹 苏州 别墅设计师 设计费 代表作品
舍下草堂 宁洁 周丁丁 设计费 年收入 团队 商业模式
乾峰学长 室内设计师 IP 抖音 获客 转化 客单价 625万
家芝Studio 北京 室内设计 新知识分子 小红书 获客
时光筑造 深圳 室内设计 小红书 年营收5000万 团队
```

**财务与获客数据：**

```
室内设计师 个人工作室 年收入 营收 利润 成本 真实数据
室内设计工作室 软装利润 施工利润 设计费 收入拆解
室内设计师 获客成本 CAC 小红书 抖音 土巴兔 平台费用
深圳 室内设计工作室 小红书 年销售额 5000万 高客单价 获客
设计师 一人公司 年收入50万 单干 创业
```

**战略与差异化：**

```
室内设计师 私宅 核心竞争力 差异化战略 品牌定位
私宅设计 设计师个人IP 抖音小红书 获客
```

---

## 产物清单

| 文件 | 说明 | 大小估计 |
|------|------|----------|
| `skill_overview.md` | 20 个金融插件的完整索引，含 100+ 技能和 39 个 slash command | ~25KB |
| `室内私宅设计工作室_全方位分析.md` | 第一版室内私宅设计调研（10 章节） | ~30KB |
| `室内私宅设计工作室_深度调研.md` | 深度调研版（6 章节，含真实数据） | ~40KB |
| `research_report.md` | 调研产物 Markdown 源文件（同深度调研内容） | ~40KB |
| `research_report.html` | 调研产物 HTML 版（带专业排版/CSS/打印优化） | ~50KB |
| `questions_summary.md` | 本文件：对话过程与提示词清单 | ~15KB |

---

## 关键经验总结

### 1. Agent 工具权限问题

后台 Agent 默认不继承主线程的 WebSearch/WebFetch 权限，导致 Agent 在需要联网时失败。如果要用 Agent 做网络调研，需要：
- 在主线程直接使用 WebSearch（推荐）
- 或在 Agent 调用前确认工具权限配置

### 2. 并行搜索策略

对于多维度调研任务（工作室案例 + 财务数据 + 获客策略），建议：
- 第一轮：先用 3-5 个宽泛搜索词了解全貌
- 第二轮：根据第一轮发现的案例名称，逐个深挖
- 第三轮：补搜缺失的维度（财务/获客成本等）

### 3. HTML 生成的坑

Bash heredoc 中嵌入复杂 Python 脚本时，反引号 `` ` `` 会被 shell 解释。解决方案：先 Write Python 脚本到文件，再 `python3 script.py` 执行，执行完删除临时脚本。

### 4. 调研效率最大化

最优流程：
1. 用户提出调研需求
2. 先用 1-2 轮宽泛搜索摸清领域
3. 把发现的关键词/案例名称用于第二轮深搜
4. 一次性写文件，避免反复修改

### 5. 文件命名建议

- 中间产物用中文名（如 `室内私宅设计工作室_深度调研.md`），方便用户分辨内容
- 最终产物用英文名（如 `research_report.md`），方便分享和引用
- 需要浏览器查看的用 `.html`，需要编辑的用 `.md`
