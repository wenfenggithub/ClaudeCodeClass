# Financial Services Skills — 完整索引

> 来源：`anthropics/financial-services` 仓库。共 **65 个 Skill**，覆盖 9 个业务领域。
>
> Skill 是领域知识和分步工作流，Claude 在相关场景自动激活；Command（`/xxx`）是手动触发的快捷指令。

---

## 目录

1. [core · 核心建模与分析](#1-core--核心建模与分析-financial-analysis)（13 个）
2. [investment-banking · 投资银行](#2-investment-banking--投资银行)（9 个）
3. [equity-research · 股票研究](#3-equity-research--股票研究)（9 个）
4. [private-equity · 私募股权](#4-private-equity--私募股权)（10 个）
5. [wealth-management · 财富管理](#5-wealth-management--财富管理)（6 个）
6. [fund-admin · 基金运营](#6-fund-admin--基金运营)（6 个）
7. [operations · 运营与合规](#7-operations--运营与合规)（2 个）
8. [lseg · 伦敦证交所数据](#8-lseg--伦敦证交所数据-partner)（8 个）
9. [sp-global · 标普全球数据](#9-sp-global--标普全球数据-partner)（3 个）

---

## 1. core · 核心建模与分析 (financial-analysis)

### comps-analysis → `/comps`
构建机构级可比公司分析——运营指标、估值倍数、统计基准，输出 Excel。适用于上市公司估值（M&A、投资分析）、IPO/融资定价、行业对标。需要可比上市公司作为参照，不适合高度多元化集团或亏损公司。

### dcf-model → `/dcf`
DCF 自由现金流折现估值模型。从 SEC 文件和分析师报告获取财务数据，构建现金流预测、WACC 计算、敏感性分析，输出专业 Excel 模型和摘要。当用户需要内在价值评估、DCF 估值或详细财务建模时触发。

### lbo-model → `/lbo`
杠杆收购模型。在 Excel 中完成 LBO 模板——填入公式、验证计算、确保专业格式标准。适用于 PE 交易、deal material、投委会材料。

### 3-statement-model → `/3-statement-model`
填充三表财务模型模板（利润表、资产负债表、现金流量表）。当用户提供已构建好的模板框架需要填入数据、完成公式链接时使用。支持从 SEC 文件获取数据。

### audit-xls → `/debug-model`
审计电子表格——公式准确性、错误、常见错误。可限定范围、单表或全模型，包括财务模型完整性检查（BS 平衡、现金勾稽、逻辑校验）。触发词："audit this sheet"、"check my formulas"、"model won't balance"。

### clean-data-xls
清洗杂乱表格数据——去除空白、统一大小写、修正文本型数字、规范日期、去重、标记混合类型列。触发词："clean this data"、"normalize this data"、"dedupe"。

### competitive-analysis → `/competitive-analysis`
竞争格局分析框架——市场定位、竞对深度剖析、对比分析、战略总结。触发词："competitive landscape"、"peer comparison"、"market positioning"、"who are the competitors to X"。

### deck-refresh
更新 PPT 中的数字——季度刷新、盈利更新、comps 滚动更新、市场数据调整。触发词："update the deck with Q4 numbers"、"refresh the comps"、"roll this forward"。

### ib-check-deck
投行 PPT 质量检查。审查：(1) 跨页数字一致性，(2) 数据与叙事匹配，(3) IB 标准语言润色，(4) 视觉和格式 QC。触发词："check my numbers"、"reconcile figures across slides"、"is this client-ready"。

### pptx-author
无头模式生成 .pptx 文件——用于 Managed Agent 场景（无 Office 运行环境时）。

### xlsx-author
无头模式生成 .xlsx 文件——用于 Managed Agent 场景（无 Office 运行环境时）。

### ppt-template-creator → `/ppt-template`
从用户提供的 PPT 模板创建可复用的模板 Skill（而非直接生成演示文稿）。当用户想把自己的品牌模板教给 Claude 时使用。

### skill-creator
创建新 Skill 或更新已有 Skill 的指南。帮助用户扩展 Claude 的专业知识、工作流或工具集成。

---

## 2. investment-banking · 投资银行

### strip-profile → `/one-pager`
制作投行公司简介（Strip Profile）——1-4 页信息密集型幻灯片，含象限布局、图表和表格。用于 pitch book、deal material 和客户演示。

### pitch-deck
将源数据（Excel/CSV）填入投行 Pitch Deck 模板的已有幻灯片中。用于已有 PPT 模板需要填充的场景，非从零创建。

### cim-builder → `/cim`
起草保密信息备忘录（CIM）——将公司信息组织成专业的、投资人可读的文档。用于卖方 M&A 流程材料准备。触发词："CIM"、"offering memorandum"、"info memo"。

### teaser → `/teaser`
起草匿名一页公司 Teaser——在不披露公司身份的前提下创建有吸引力的摘要，用于在 NDA 签署前测试买家兴趣。触发词："teaser"、"blind teaser"、"one-pager for process"。

### buyer-list → `/buyer-list`
构建卖方 M&A 的潜在买家范围——识别战略买家和财务买家，评估匹配度和优先级。触发词："buyer list"、"potential acquirers"、"strategic buyers"。

### merger-model → `/merger-model`
并购增厚/稀释分析——模拟 pro forma EPS 影响、协同效应敏感性、购买价格分配。触发词："merger model"、"accretion dilution"、"pro forma EPS"。

### datapack-builder
从 CIM、OM、SEC 文件、网络搜索或 MCP 数据源构建专业财务 Data Pack。提取、规范化和标准化数据为投委会就绪的 Excel 工作簿。

### process-letter → `/process-letter`
起草卖方 M&A 流程信函和投标说明——包含 IOI 说明、最终报价程序、管理层会议邀请。触发词："process letter"、"bid instructions"、"IOI letter"。

### deal-tracker → `/deal-tracker`
跟踪多个活跃交易——里程碑、截止日期、行动项、状态更新。维护交易流水线视图，标记即将到期和逾期事项。触发词："deal tracker"、"deal pipeline"、"weekly deal review"。

---

## 3. equity-research · 股票研究

### earnings-analysis → `/earnings`
创建专业股票研究盈利更新报告（8-12 页、3000-5000 字），分析已覆盖公司的季度业绩。聚焦 beat/miss 分析、关键指标、更新估计和修订 thesis。含 1-3 张汇总表和 8-12 张图表。触发词："earnings update"、"Q1/Q2/Q3/Q4 results"、"quarterly analysis"。

### earnings-preview → `/earnings-preview`
构建财报前瞻分析——估计模型、场景框架、关键关注指标。在公司发布季报前使用，设置多空场景。触发词："earnings preview"、"what to watch for [company] earnings"、"pre-earnings"。

### initiating-coverage → `/initiate`
创建机构级股票研究首次覆盖报告（Initiation Report），通过 5 步工作流完成：(1) 公司调研 → (2) 财务建模 → (3) 估值分析 → (4) 图表生成 → (5) 报告组装。每步有明确交付物和前置依赖。

### model-update → `/model-update`
用新数据更新财务模型——季度业绩、管理层指引、宏观变化或修订假设。调整估计、重新计算估值、标记重大变化。触发词："update model"、"plug earnings"、"refresh estimates"。

### morning-note → `/morning-note`
起草简洁晨会纪要——总结隔夜动态、交易想法和覆盖股票的关键事件。适合 7 点晨会格式——精炼、有观点、可执行。触发词："morning note"、"what happened overnight"、"daily note"。

### sector-overview → `/sector`
创建行业全景报告——市场动态、竞争地位、主要玩家、主题趋势。用于客户请求、行业首次覆盖或内部知识建设。触发词："sector overview"、"industry deep dive"、"market landscape"。

### thesis-tracker → `/thesis`
维护和更新投资品种的 Investment Thesis——跟踪关键数据点、催化剂和 thesis 里程碑。触发词："update thesis for [company]"、"is my thesis still intact"、"review my positions"。

### catalyst-calendar → `/catalysts`
构建和维护覆盖范围内的催化剂日历——盈利日期、会议、产品发布、监管决策、宏观事件。帮助确定关注优先级和事件前布局。触发词："catalyst calendar"、"upcoming events"、"earnings calendar"。

### idea-generation → `/screen`
系统化股票筛选和投资想法挖掘——结合量化筛选、主题研究和模式识别，发现新的多头和空头想法。触发词："stock screen"、"find ideas"、"what looks interesting"、"pitch me something"。

---

## 4. private-equity · 私募股权

### deal-sourcing → `/source`
PE 交易搜寻工作流——发现目标公司、检查 CRM 中已有关系、起草个性化创始人 Outreach 邮件。触发词："find companies"、"source deals"、"draft founder email"。

### deal-screening → `/screen-deal`
快速筛选流入交易流——CIM、Teaser、Broker 材料 vs 基金投资标准。提取关键交易指标、运行 pass/fail 框架、输出一页筛选备忘录。触发词："screen this deal"、"should we look at this"、"triage this teaser"。

### dd-checklist → `/dd-checklist`
生成和跟踪全面尽职调查清单——按目标公司行业、交易类型和复杂度定制。涵盖所有主要工作流，含请求清单、状态跟踪和红旗升级。触发词："dd checklist"、"diligence request list"、"what do we still need"。

### dd-meeting-prep → `/dd-prep`
准备尽调会议——管理层演示、专家网络通话、客户访谈、顾问会议。生成针对性问题清单、参考基准和需探查的红旗。触发词："prep for management meeting"、"expert call questions"、"diligence call prep"。

### unit-economics → `/unit-economics`
分析 PE 标的的单位经济模型——ARR 队列、LTV/CAC、净留存率、回收期、收入质量、利润瀑布。对 SaaS/订阅制企业至关重要。触发词："unit economics"、"cohort analysis"、"net retention"、"revenue quality"。

### returns-analysis → `/returns`
构建 IRR/MOIC 敏感性表格——在不同入场倍数、杠杆、退出倍数、增长和持有期场景下建模回报。触发词："returns analysis"、"IRR sensitivity"、"MOIC table"、"back of the envelope"。

### ic-memo → `/ic-memo`
起草结构化投委会备忘录——整合尽调发现、财务分析和交易条款为 IC 就绪文档。触发词："write IC memo"、"investment committee memo"、"deal write-up"。

### portfolio-monitoring → `/portfolio`
跟踪和分析 Portfolio Company 业绩 vs 计划。接收月度/季度财务包（Excel/PDF），提取 KPI，标记预算差异，生成摘要仪表板。触发词："review portfolio company"、"monthly financials"、"covenant check"。

### value-creation-plan → `/value-creation`
构建收购后价值创造计划——收入、成本和运营杠杆映射至 EBITDA 桥。含 100 天优先事项、KPI 目标和问责框架。触发词："value creation plan"、"100-day plan"、"post-close plan"、"EBITDA bridge"。

### ai-readiness → `/ai-readiness`
扫描 Portfolio 中最高杠杆 AI 机会、排名。接收多家 Portco 季度更新和财务数据，识别每家速赢机会，汇总为单一排名行动清单。触发词："AI readiness"、"AI opportunity scan"、"AI quick wins"。

---

## 5. wealth-management · 财富管理

### client-review → `/client-review`
准备客户评审会议——组合业绩摘要、配置分析、谈话要点和行动项。触发词："client review"、"meeting prep for [client]"、"quarterly review"。

### financial-plan → `/financial-plan`
构建或更新全面财务规划——退休预测、教育基金、遗产规划和现金流分析。触发词："financial plan"、"retirement plan"、"education funding"、"estate plan"。

### client-report → `/client-report`
生成专业客户业绩报告——组合回报、配置明细、市场评论。适用于季度或年度分发。触发词："client report"、"performance report"、"quarterly report"。

### investment-proposal → `/proposal`
创建面向潜在客户的投资建议书——公司投资方法、建议配置、预期成果、费用结构。触发词："investment proposal"、"pitch new client"、"proposal for [client]"。

### portfolio-rebalance → `/rebalance`
分析组合配置偏离并生成再平衡交易建议——考虑税务影响、交易成本和wash sale规则。触发词："rebalance"、"portfolio drift"、"allocation check"。

### tax-loss-harvesting → `/tlh`
识别应税账户的税务损失收割机会——发现未实现亏损头寸、建议替代证券、跟踪wash sale窗口。触发词："tax-loss harvesting"、"TLH"、"unrealized losses"、"year-end tax planning"。

---

## 6. fund-admin · 基金运营

### gl-recon
对账总账到子账——在头寸或交易层面匹配，发现断账（break），按可能原因分类。用于跨资产类别的日度或月度对账运行。

### break-trace
追溯对账断账到源交易或过账——从断账行追溯到双方的原始分录，说明差异内容和原因。在 gl-recon 识别断账后使用。

### accrual-schedule
构建期末应计计划——为每项应计计算分录、引用支持文档、起草日记账。用于月结流程；日记账是草稿，需审计师审批。

### roll-forward
构建资产负债表账户的 Roll-Forward——期初余额 + 变动 - 冲销 = 期末余额，每个组成部分与 GL 关联。用于月结包和审计支持。

### variance-commentary
为每项超过阈值的 P&L 和 BS 科目撰写波动评论（Flux Commentary）——当期 vs 前期、实际 vs 预算，解释驱动因素。用于月结包和管理报告。

### nav-tieout
校验 LP 对账单与基金 NAV 包——从 NAV 组成部分重新计算 LP 资本账户，标记任何不符项目。在 LP 对账单分发前使用。

---

## 7. operations · 运营与合规

### kyc-doc-parse
解析投资人或客户 Onboarding 文件包为结构化 KYC 字段——身份、所有权、控制权、资金来源、文件清单。作为 KYC 筛查的第一步，输出供规则引擎使用。

### kyc-rules
将公司 KYC/AML 规则网格应用于已解析的 Onboarding 记录——分配风险评级、列出每项规则结果及引用依据、标记缺失或需升级项。在 kyc-doc-parse 之后使用；仅打分和路由，不做决定。

---

## 8. lseg · 伦敦证交所数据 (Partner)

### bond-relative-value → `/analyze-bond-rv`
债券相对价值分析——结合定价、收益率曲线背景、信用利差和场景压力测试。用于分析债券贵贱、利差分解、债券对比、利率冲击场景。**依赖 LSEG 数据。**

### bond-futures-basis → `/analyze-bond-basis`
分析国债期货 Basis——定价期货、识别最廉可交割券（CTD）、与收益率曲线对比评估交割期权价值和 Basis 交易机会。**依赖 LSEG 数据。**

### swap-curve-strategy → `/analyze-swap-curve`
分析利率互换曲线——多期限定价、叠加国债和通胀曲线、识别曲线交易机会。用于分析互换利差、实际利率分解、steepener/flattener/butterfly 策略。**依赖 LSEG 数据。**

### fx-carry-trade → `/analyze-fx-carry`
评估外汇 Carry Trade 机会——结合即期汇率、远期点、利差、波动率面和历史价格趋势。**依赖 LSEG 数据。**

### option-vol-analysis → `/analyze-option-vol`
期权波动率分析——结合波动率面数据、期权定价含希腊字母和历史价格数据，评估隐含 vs 实现波动率。**依赖 LSEG 数据。**

### macro-rates-monitor → `/macro-rates`
构建宏观和利率仪表板——宏观指标、收益率曲线、通胀盈亏平衡率和互换利率。用于监控宏观状况、收益率曲线形态分析、实际 vs 名义利率分解。**依赖 LSEG 数据。**

### equity-research → `/research-equity`
生成综合股票研究快照——结合分析师一致预期、公司基本面、历史价格和宏观经济背景。**依赖 LSEG 数据。**

### fixed-income-portfolio → `/review-fi-portfolio`
审查固定收益组合——多债券定价、参考数据、现金流分析和场景分析。用于债券组合审查、久期/DV01 计算、现金流瀑布、利率压力测试。**依赖 LSEG 数据。**

---

## 9. sp-global · 标普全球数据 (Partner)

### tear-sheet
使用 S&P Capital IQ 数据（通过 Kensho LLM-ready API MCP）生成专业公司 Tear Sheet。支持四种受众：股票研究、投行/M&A、企业发展和销售/BD。适用于公开和私有公司。**依赖 S&P Global 数据。**

### funding-digest
生成一页 PPT 幻灯片，总结关注行业/公司近期融资轮次和资本市场活动关键要点。触发词："deal flow digest"、"weekly funding recap"、"capital markets update"。输出含关键要点、估值数据和 Capital IQ Deal 链接的专业单页 PPTX。**依赖 S&P Global 数据。**

### earnings-preview-single
为单家公司生成精炼的 4-5 页股票研究财报预览。分析最新财报电话会议记录、竞争对手格局、估值和近期新闻，输出专业 HTML 报告。**依赖 S&P Global 数据。**

---

## 快速查找表

| 场景 | 使用 Skill | 快捷命令 |
|---|---|---|
| 估值一家公司（DCF法） | `dcf-model` | `/dcf` |
| 可比公司分析 | `comps-analysis` | `/comps` |
| LBO 交易建模 | `lbo-model` | `/lbo` |
| 构建三表财务模型 | `3-statement-model` | `/3-statement-model` |
| 审计/调试 Excel 模型 | `audit-xls` | `/debug-model` |
| 清洗 Excel 数据 | `clean-data-xls` | — |
| 制作公司简介页 | `strip-profile` | `/one-pager` |
| 投行 Pitch Deck 填充 | `pitch-deck` | — |
| 起草 CIM 保密备忘录 | `cim-builder` | `/cim` |
| 起草匿名 Teaser | `teaser` | `/teaser` |
| 构建潜在买家名单 | `buyer-list` | `/buyer-list` |
| 并购增厚/稀释分析 | `merger-model` | `/merger-model` |
| 跟踪交易状态 | `deal-tracker` | `/deal-tracker` |
| 撰写季度盈利报告 | `earnings-analysis` | `/earnings` |
| 财报前瞻分析 | `earnings-preview` | `/earnings-preview` |
| 首次覆盖报告 | `initiating-coverage` | `/initiate` |
| 更新财务模型 | `model-update` | `/model-update` |
| 晨会纪要 | `morning-note` | `/morning-note` |
| 行业深度研究 | `sector-overview` | `/sector` |
| 投资 Thesis 追踪 | `thesis-tracker` | `/thesis` |
| 催化剂日历 | `catalyst-calendar` | `/catalysts` |
| 股票筛选与 Idea 挖掘 | `idea-generation` | `/screen` |
| PE 交易搜寻 | `deal-sourcing` | `/source` |
| PE 快速筛选 Deal | `deal-screening` | `/screen-deal` |
| 尽调清单管理 | `dd-checklist` | `/dd-checklist` |
| 尽调会议准备 | `dd-meeting-prep` | `/dd-prep` |
| 单位经济模型分析 | `unit-economics` | `/unit-economics` |
| 回报敏感性分析 | `returns-analysis` | `/returns` |
| 投委会备忘录 | `ic-memo` | `/ic-memo` |
| 投后组合监控 | `portfolio-monitoring` | `/portfolio` |
| 价值创造计划 | `value-creation-plan` | `/value-creation` |
| AI 机会扫描 | `ai-readiness` | `/ai-readiness` |
| 客户评审会议准备 | `client-review` | `/client-review` |
| 财务规划 | `financial-plan` | `/financial-plan` |
| 客户报告生成 | `client-report` | `/client-report` |
| 投资建议书 | `investment-proposal` | `/proposal` |
| 组合再平衡 | `portfolio-rebalance` | `/rebalance` |
| 税务损失收割 | `tax-loss-harvesting` | `/tlh` |
| GL 对账 | `gl-recon` | — |
| 断账溯源 | `break-trace` | — |
| 应计计划 | `accrual-schedule` | — |
| Roll-Forward 表 | `roll-forward` | — |
| 波动评论 | `variance-commentary` | — |
| NAV 勾稽 | `nav-tieout` | — |
| KYC 文档解析 | `kyc-doc-parse` | — |
| KYC 规则评分 | `kyc-rules` | — |
| 债券相对价值 (LSEG) | `bond-relative-value` | `/analyze-bond-rv` |
| 国债期货 Basis (LSEG) | `bond-futures-basis` | `/analyze-bond-basis` |
| 互换曲线策略 (LSEG) | `swap-curve-strategy` | `/analyze-swap-curve` |
| 外汇 Carry Trade (LSEG) | `fx-carry-trade` | `/analyze-fx-carry` |
| 期权波动率 (LSEG) | `option-vol-analysis` | `/analyze-option-vol` |
| 宏观利率仪表板 (LSEG) | `macro-rates-monitor` | `/macro-rates` |
| 股票快照 (LSEG) | `equity-research` | `/research-equity` |
| FI 组合审查 (LSEG) | `fixed-income-portfolio` | `/review-fi-portfolio` |
| 公司 Tear Sheet (S&P) | `tear-sheet` | — |
| 融资动态摘要 (S&P) | `funding-digest` | — |
| 财报预览 (S&P) | `earnings-preview-single` | — |
| 生成 PPTX 文件 | `pptx-author` | — |
| 生成 XLSX 文件 | `xlsx-author` | — |
| 创建 PPT 模板 Skill | `ppt-template-creator` | `/ppt-template` |
| PPT 质量检查 | `ib-check-deck` | — |
| PPT 数据刷新 | `deck-refresh` | — |
| 竞争格局分析 | `competitive-analysis` | `/competitive-analysis` |
| 创建新 Skill | `skill-creator` | — |
| 构建 Data Pack | `datapack-builder` | — |
| 起草流程信函 | `process-letter` | `/process-letter` |

---

## MCP 数据集成

以下 MCP 数据源由 `financial-analysis` 核心插件集中管理，所有 Skill 共享：

| Provider | 用途 |
|---|---|
| S&P Global (Kensho) | 公司基本面、一致预期、估值、交易 |
| FactSet | 财务数据、一致估计、市场数据 |
| Daloopa | 标准化财务数据 |
| LSEG | FICC、外汇、股票、宏观数据 |
| Morningstar | 基金和股票数据 |
| Moody's | 信用评级和研究 |
| MT Newswires | 实时新闻 |
| Aiera | 事件和采访文字记录 |
| PitchBook | PE/VC、M&A、IPO 数据 |
| Chronograph | PE 组合监控 |
| Egnyte | 文档管理和协作 |
