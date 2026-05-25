# anthropics/financial-services — Skills 索引

> 已安装插件数: 20 | Skills 总数: ~80 | 命令 (Slash Commands): ~50

---

## 目录

1. [**垂直领域插件 (Vertical Plugins)**](#1-垂直领域插件-vertical-plugins)
   - [financial-analysis — 财务分析与建模](#financial-analysis)
   - [investment-banking — 投资银行](#investment-banking)
   - [equity-research — 股权研究](#equity-research)
   - [private-equity — 私募股权](#private-equity)
   - [wealth-management — 财富管理](#wealth-management)
   - [fund-admin — 基金行政管理](#fund-admin)
   - [operations — KYC/AML 运营](#operations)
2. [**智能代理插件 (Agent Plugins)**](#2-智能代理插件-agent-plugins)
   - [pitch-agent — 投行 Pitch 全流程](#pitch-agent)
   - [market-researcher — 市场研究](#market-researcher)
   - [earnings-reviewer — 财报分析](#earnings-reviewer)
   - [meeting-prep-agent — 客户会议准备](#meeting-prep-agent)
   - [model-builder — 模型构建](#model-builder)
   - [gl-reconciler — GL 对账](#gl-reconciler)
   - [kyc-screener — KYC 筛查](#kyc-screener)
   - [valuation-reviewer — 估值审阅](#valuation-reviewer)
   - [month-end-closer — 月末结账](#month-end-closer)
   - [statement-auditor — 报表审计](#statement-auditor)
3. [**合作伙伴插件 (Partner-Built)**](#3-合作伙伴插件-partner-built)
   - [lseg — LSEG 金融数据分析](#lseg)
   - [sp-global — S&P Global 数据](#sp-global)
4. [**跨插件共用工具 Skills**](#4-跨插件共用工具-skills)
5. [**管理员工具**](#5-管理员工具)

---

## 1. 垂直领域插件 (Vertical Plugins)

这些插件提供**离散的、领域特定的 Workflow**，安装在 Claude Code 中后可以通过自然语言触发。

---

### financial-analysis

> **核心领域**: 财务建模、估值、图表、审计

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **3-statement-model** | 填充三表模型模板 (IS/BS/CF)，公式联动 | 需要填写或补全财务模型模板时 |
| **dcf-model** | 建立 DCF 估值模型，含 WACC 计算、敏感性分析 | 需要对公司做 DCF 估值、内在价值分析时 |
| **lbo-model** | 填充 LBO 模型模板，含 Sources & Uses、债务表、回报分析 | 需要为 PE 交易搭建 LBO 模型时 |
| **comps-analysis** | 可比公司分析，含运营指标、估值倍数、统计基准 | 需要做同业估值比较、IPO 定价时 |
| **competitive-analysis** | 竞争格局分析 Deck，含市场定位、深度研究、战略综合 | 需要竞争格局图、竞品对标时 |
| **audit-xls** | 审计电子表格中的公式、常见错误、财务模型完整性 (BS平衡、现金闭环) | 模型不平、检查公式错误、QA 模型时 |
| **clean-data-xls** | 清洗杂乱的电子表格 (去空格、统一大小写、标准化日期、去重) | 数据混乱、需要预处理分析时 |
| **deck-refresh** | 仅替换已有 Deck 中的数字，不重建整个 PPT | 季度更新、换数据、更新 comps 时 |
| **ib-check-deck** | 投行 Deck 质量检查 (数字一致性、叙事对齐、语言润色、格式) | 发出去之前的终审检查 |
| **pitch-deck** | 将源数据填入投行 Pitch Deck 模板 | 有 PPT 模板需要填入数据时 |
| **pptx-author** | 无头模式 (headless) 生成 .pptx 文件 | 在托管代理会话中离线生成 PPT |
| **xlsx-author** | 无头模式生成 .xlsx 文件 | 在托管代理会话中离线生成 Excel |
| **ppt-template-creator** | 将用户提供的 PPT 模板创建为可复用的 Skill | 想从模板创建一个可复用的 Skill 时 |
| **skill-creator** | 创建新 Skill 的元指南 | 需要创建一个新的自定义 Skill |
| **catalyst-calendar** | 维护催化剂日历 (业绩日、会议、产品发布等) | 需要跟踪覆盖公司的催化剂时间线 |

**Slash 命令**: `/3-statement-model`, `/comps`, `/dcf`, `/lbo`, `/debug-model`, `/competitive-analysis`, `/ppt-template`

---

### investment-banking

> **核心领域**: M&A 流程、交易支持、买方/卖方材料

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **buyer-list** | 为卖方 M&A 建立潜在买方列表 (战略买家 & 财务买家) | 准备卖方材料、评估潜在买家时 |
| **cim-builder** | 撰写保密信息备忘录 (CIM) | 准备卖方材料、起草信息备忘录时 |
| **datapack-builder** | 从 CIM/SEC  filings 等来源构建专业数据包 | M&A 尽职调查、投委会材料时 |
| **deal-tracker** | 跟踪多个进行中的交易 (里程碑、截止日、行动项) | 管理交易管线、周度交易回顾时 |
| **merger-model** | 搭建并购增值/稀释分析模型 | 评估潜在收购、准备 merger consequences 分析时 |
| **pitch-deck** | 填入数据到投行 Pitch Deck 模板 | (同上) |
| **process-letter** | 起草流程函/投标说明书 (IOI、终轮竞标、管理层会议) | 卖方流程中需要起草 bid instructions 时 |
| **strip-profile** | 创建 1-4 页的投行公司简介 profile | 需要信息密集的公司概况页时 |
| **teaser** | 起草匿名一页公司简介 (不暴露公司身份) | 买方感兴趣但尚未签 NDA 时 |

**Slash 命令**: `/buyer-list`, `/cim`, `/deal-tracker`, `/merger-model`, `/one-pager`, `/process-letter`, `/teaser`

---

### equity-research

> **核心领域**: 覆盖报告、盈利分析、股票筛选

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **earnings-analysis** | 撰写 8-12 页正式盈利更新报告 (beat/miss、关键指标、修正估计) | 公司发布季报后需要更新报告时 |
| **earnings-preview** | 盈利前的预测分析 (估计模型、情景框架、关键关注点) | 公司发布财报前的准备 |
| **model-update** | 用新数据更新财务模型 (盈利、指引、宏观变化) | 业绩后、指引更新后、需刷新假设时 |
| **initiating-coverage** | 完整 5 步覆盖启动报告流程 (研究→建模→估值→图表→报告) | 首次覆盖一家公司时 |
| **sector-overview** | 行业/板块全景报告 (市场动态、竞争定位、主题趋势) | 板块启动、主题研究、内部知识建设时 |
| **idea-generation** | 系统性股票筛选和投资创意 (量化筛选、主题研究、模式识别) | 寻找新想法、运行筛选、主题扫描时 |
| **morning-note** | 撰写晨会笔记 (隔夜动态、交易想法、关键事件) | 晨会前准备、每日复盘时 |
| **thesis-tracker** | 维护投资论点，跟踪数据点和催化剂 | 跟踪持仓/观察名单的论点最新状态 |
| **catalyst-calendar** | 催化剂日历 | (同上) |

**Slash 命令**: `/earnings`, `/earnings-preview`, `/initiate`, `/model-update`, `/sector`, `/screen`, `/morning-note`, `/thesis`, `/catalysts`

---

### private-equity

> **核心领域**: 交易 sourcing、尽调、投后管理

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **deal-sourcing** | 发现目标公司、检查 CRM、起草创始人外联邮件 | 寻找新交易、行业 prospecting 时 |
| **deal-screening** | 快速筛选 CIM/Teaser，通过/不通过框架 | 评估新流进的项目、决定是否推进时 |
| **dd-checklist** | 生成并跟踪尽调清单 (按行业/交易类型定制) | 启动尽调、检查数据室时 |
| **dd-meeting-prep** | 准备尽调会议 (管理层演示、专家电话、客户参考) | 尽调会议/电话前准备问题清单 |
| **ic-memo** | 撰写投委会备忘录 (综合尽调、财务分析、交易条款) | 准备投委会材料时 |
| **unit-economics** | 分析单位经济模型 (ARR cohorts、LTV/CAC、净留存) | 评估 SaaS 订阅类公司的经济质量时 |
| **returns-analysis** | 搭建 IRR/MOIC 敏感性表 | 交易评估、压力测试、IC 回报展示时 |
| **portfolio-monitoring** | 跟踪投资组合公司表现 vs 计划 | 月度/季度财务审阅、董事会材料准备时 |
| **value-creation-plan** | 收购后价值创造计划 (100天计划、EBITDA 桥接、KPI) | 交易完成后制定运营计划时 |
| **ai-readiness** | 扫描投后组合中的 AI 机会 | 季度回顾、年度规划时判断哪些公司可先用 AI |
| **ic-memo** | IC 备忘录 | (同上 PE) |
| **portfolio-monitoring** | 组合监控 | (同上 PE) |
| **returns-analysis** | 回报分析 | (同上 PE) |

**Slash 命令**: `/source`, `/screen-deal`, `/dd-checklist`, `/dd-prep`, `/ic-memo`, `/unit-economics`, `/returns`, `/portfolio`, `/value-creation`, `/ai-readiness`

---

### wealth-management

> **核心领域**: 客户服务、资产配置、财务规划

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **client-report** | 生成专业客户业绩报告 (回报、配置、市场点评) | 季度/年度客户报告分发时 |
| **client-review** | 准备客户回顾会议 (业绩摘要、配置分析、谈话要点) | 季度回顾、年度检查、临时会议前 |
| **financial-plan** | 制定或更新综合财务规划 (退休、教育、遗产、现金流) | 新客户 onboarding、年度规划更新时 |
| **investment-proposal** | 为新客户撰写投资提案 (方法、配置、预期、费率) | 开发新客户、展示新策略时 |
| **portfolio-rebalance** | 分析组合偏离度并生成再平衡交易建议 | 组合偏离、需要再平衡时 |
| **tax-loss-harvesting** | 识别应税账户的亏损收割机会 | 岁末税务规划、发现未实现亏损时 |

**Slash 命令**: `/client-report`, `/client-review`, `/financial-plan`, `/proposal`, `/rebalance`, `/tlh`

---

### fund-admin

> **核心领域**: 基金运营、月末结账、GL 对账

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **gl-recon** | GL ↔ 子分类账对账 (按交易日/时段匹配，发现 breaks，分类原因) | 日常/月末对账运行 |
| **break-trace** | 根因追溯对账 break 到源头 (从 break 行回溯到原始分录) | gl-recon 分类出 break 后的下一步 |
| **accrual-schedule** | 构建期末应计项目表 (计算、引用支持、草拟凭证) | 月末结账时 |
| **roll-forward** | 构建资产负债表科目的 roll-forward 表 | 月末结账包和审计支持 |
| **variance-commentary** | 对超过阈值的 P&L/BS 行写差异分析评论 | 月末结账包和管理报告 |
| **nav-tieout** | LP 报表与 NAV pack 校对 (重新计算资本账户) | LP 报表分发前的最后检查 |

---

### operations

> **核心领域**: KYC/AML 运营

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **kyc-doc-parse** | 解析投资者/客户 onboarding 包为结构化的 KYC 字段 | KYC 筛查第一步，输出供规则引擎使用 |
| **kyc-rules** | 将 KYC/AML 规则评分应用于解析后的记录 | KYC-doc-parse 之后，给结果评分和归类 |

---

## 2. 智能代理插件 (Agent Plugins)

这些是**命名代理** (Named Agents)，每个解决一个端到端的金融任务。既可作为 Claude Code 的 Cowork 插件使用，也可作为托管代理 (Managed Agent) 部署。

---

### pitch-agent

> **一句话**: Comps + Precedents + LBO → 品牌 Pitch Deck，全自动

**端到端工作流**:
1. 从 CapIQ/FactSet 拉取可比公司和先例交易
2. 搭建 DCF 和 football-field 估值模型 (Excel)
3. 在银行的 PPT 模板上生成品牌 Pitch Deck

**包含 Skills**: comps-analysis, dcf-model, lbo-model, 3-statement-model, sector-overview, pitch-deck, deck-refresh, ib-check-deck, pptx-author, xlsx-author, audit-xls

**何时使用**: MD 或高级银行家要求对某个标的做第一版 Pitch
**输出**: `./out/pitch-<target>.pptx` + `./out/model.xlsx`

---

### market-researcher

> **一句话**: 板块/主题 → 行业概览 → 竞争格局 → 同业 comps → 创意短名单

**端到端工作流**:
1. 调研行业/主题全景
2. 绘制竞争格局
3. 扩展同业 comps 表
4. 打包为研究报告 (可选 PPT)

**包含 Skills**: sector-overview, competitive-analysis, comps-analysis, idea-generation, pptx-author

**何时使用**: 分析师或 PM 需要某个板块/主题的基础研究
**输出**: `./out/primer-<sector>.docx` (可选 `.pptx`)

---

### earnings-reviewer

> **一句话**: 财报电话会 + 文件 → 模型更新 → 报告草稿

**端到端工作流**:
1. 读取盈利电话会记录和申报文件
2. 更新覆盖模型
3. 撰写发布后的盈利笔记

**包含 Skills**: earnings-analysis, earnings-preview, model-update, morning-note, audit-xls, xlsx-author

**何时使用**: 一家已覆盖公司发布业绩后
**输出**: `./out/note-<ticker>.docx` + `./out/model-<ticker>.xlsx`

---

### meeting-prep-agent

> **一句话**: 每次客户会议前的简报包

**端到端工作流**:
1. 来自 CRM 的关系历史
2. 持仓和近期活动
3. 市场环境背景
4. 建议议程

**包含 Skills**: client-report, client-review, investment-proposal, pptx-author

**何时使用**: 在任何客户/潜在客户会议前
**输出**: `./out/briefing-<client>.pptx`

---

### model-builder

> **一句话**: 从 ticker 和假设集开始，在 Excel 中搭建金融模型

**端到端工作流**:
1. 从 CapIQ/Daloopa 拉取数据
2. 按规格搭建模型
3. 审计勾稽关系

**包含 Skills**: dcf-model, lbo-model, 3-statement-model, comps-analysis, audit-xls, xlsx-author

**何时使用**: 需要从零开始搭建干净的 DCF/LBO/三表模型
**输出**: `./out/model.xlsx`

---

### gl-reconciler

> **一句话**: 找到 GL ↔ 子分类账之间的 breaks，根因追溯，生成例外报告

**端到端工作流**:
1. 按交易日和资产类匹配双方
2. 将 breaks 分类为金额/数量/时间差
3. 追溯源头交易
4. 根因声明 + 路由给审批

**包含 Skills**: gl-recon, break-trace, audit-xls, xlsx-author

**何时使用**: 日常或月末对账运行
**输出**: 例外报告

---

### kyc-screener

> **一句话**: 解析 onboarding 文档，运行规则引擎，筛查制裁名单

**端到端工作流**:
1. 读取文档包 (身份、所有权、资金来源)
2. 运行 KYC/AML 规则评分
3. 筛查制裁/PEP 名单
4. 找出缺口并升级上报

**包含 Skills**: kyc-doc-parse, kyc-rules, xlsx-author

**何时使用**: 新客户 onboarding 或定期 Refresh
**输出**: `./out/escalation-<packet>.xlsx`

---

### valuation-reviewer

> **一句话**: 吸收 GP 估值包 → 运行估值模板 → 准备好 LP 报告

**包含 Skills**: ic-memo, portfolio-monitoring, returns-analysis, xlsx-author

**何时使用**: 季度末的组合估值审查
**输出**: `./out/lp-pack-<fund>.xlsx`

---

### month-end-closer

> **一句话**: 应计项目 + Roll-forward + 差异分析 → 结账包

**端到端工作流**: accrual-schedule → roll-forward → variance-commentary → audit

**包含 Skills**: accrual-schedule, roll-forward, variance-commentary, audit-xls, xlsx-author

**何时使用**: 期间末结账
**输出**: `./out/close-package-<entity>-<period>.xlsx`

---

### statement-auditor

> **一句话**: 在分发前审计批量生成的 LP 报表

**包含 Skills**: nav-tieout, audit-xls, xlsx-author

**何时使用**: LP 报表分发前的最后检查
**输出**: `./out/signoff-<batch>.xlsx`

---

## 3. 合作伙伴插件 (Partner-Built)

### lseg

> LSEG (伦敦证券交易所集团) 金融数据分析

**前提**: 需要 LSEG MCP Server 访问凭证和相应数据权限

**Skills**:

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **bond-relative-value** | 债券相对价值分析 + 利差分解 + 情景压力测试 | 分析债券丰富/便宜程度、做 spread 分解时 |
| **fx-carry-trade** | FX Carry 交易机会评估 (即期/远期、波动率曲面、历史) | 分析 carry 交易、比较 FX 远期曲线时 |
| **equity-research** | 股权研究快照 (分析师一致预期、基本面、股价表现) | 快速了解一只股票时 |
| **swap-curve-strategy** | 利率互换曲线分析 + 政府债/通胀曲线叠加 | 分析互换曲线、识别 steepener/flattener 交易 |
| **option-vol-analysis** | 期权波动率分析 (vol surface、Greeks、隐含vs已实现) | 期权定价、波动率交易策略时 |
| **fixed-income-portfolio** | 固收组合审阅 (定价、现金流、情景分析) | 检查债券组合久期、DV01、现金流瀑布时 |
| **macro-rates-monitor** | 宏观利率仪表板 (经济指标、收益率曲线、breakevens) | 监控宏观环境、分析收益率曲线形态时 |
| **bond-futures-basis** | 债券期货基差分析 (CTD 识别、隐含回购利率) | 分析债券期货基差、计算 CTD 时 |

**Slash 命令**: `/analyze-bond-rv`, `/analyze-fx-carry`, `/research-equity`, `/analyze-swap-curve`, `/analyze-option-vol`, `/review-fi-portfolio`, `/macro-rates`, `/analyze-bond-basis`

---

### sp-global

> S&P Global / Capital IQ 数据

**前提**: 需要 S&P Capital IQ Pro 或 S&P Global LLM-ready API 订阅

**Skills**:

| Skill | 是什么 | 何时使用 |
|-------|--------|----------|
| **tear-sheet** | 生成专业一页公司 Tear Sheet (4 种受众模式: 股权研究/投行/M&A/企业战略/商务拓展) | 需要快速的公司概况、会议前准备、目标公司研究时 |
| **earnings-preview-beta** | 生成 4-5 页盈利预览 (含最近一份盈利电话会分析、竞争格局、估值、近期新闻) | 公司发布财报前需要结构化预览时 |
| **funding-digest** | 生成一页 PPT 摘要最近融资轮次和资本市场活动 | 需要周度 Deal flow 摘要、资本市场监管时 |

---

## 4. 跨插件共用工具 Skills

这些 Skills 被多个插件复用，提供底层能力:

| Skill | 提供者 | 用途 |
|-------|----------|------|
| **pptx-author** | financial-analysis, pitch-agent, market-researcher, meeting-prep-agent | headless 模式生成 .pptx 文件 |
| **xlsx-author** | financial-analysis, earnings-reviewer, gl-reconciler, kyc-screener, model-builder, month-end-closer, pitch-agent, statement-auditor, valuation-reviewer | headless 模式生成 .xlsx 文件 |
| **audit-xls** | financial-analysis, pitch-agent, model-builder, earnings-reviewer, gl-reconciler, month-end-closer, statement-auditor | 电子表格审计 (公式检查、勾稽校验) |

---

## 5. 管理员工具

### claude-for-msft-365-install

> 为 Microsoft 365 插件配置云访问权限

**Slash 命令**:
- `/bootstrap` — 引导安装过程
- `/setup` — 配置环境设置
- `/consent` — Azure 管理员同意流程
- `/manifest` — 生成自定义 manifest
- `/debug` — 调试和诊断
- `/update-user-attrs` — 通过 Graph API 更新用户属性

---

## 快速参考: 按角色推荐

| 角色 | 最常用的插件 |
|------|-------------|
| **投行分析师** | pitch-agent, investment-banking, financial-analysis |
| **股权研究员** | equity-research, earnings-reviewer, market-researcher, sp-global |
| **私募股权** | private-equity, valuation-reviewer, financial-analysis |
| **基金会计/运营** | fund-admin, month-end-closer, gl-reconciler, statement-auditor |
| **财富管理** | wealth-management, meeting-prep-agent |
| **合规/KYC** | operations, kyc-screener |
| **固收/宏观交易** | lseg, sp-global |
| **CEO/产品/企业战略** | office-hours, plan-ceo-review, market-researcher, sp-global |

---

## 使用方式

每个 Skill 在 Claude Code 中**自动匹配相关请求**。你只需用自然语言描述需求，Claude 会自动调用对应的 Skill。也可以直接用 `/` 命令显式调用特定功能。

例如:
- "分析苹果的 Q3 业绩" → 触发 `earnings-analysis`
- "帮我搭建一个 DCF 模型" → 触发 `dcf-model`
- "检查这个 Excel 模型" → 触发 `audit-xls`
- "准备张三先生的季度客户会议" → 触发 `client-review`
- "找找数据中心行业的收购标的" → 触发 `deal-sourcing`
