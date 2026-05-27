# Claude for Financial Services — 技能完整索引

> 来源: `anthropics/financial-services` | 已安装 20 个插件 | 共 39 个 slash command

---

## 目录

- [一、垂直技能包](#一垂直技能包)
  - [1. Financial Analysis — 核心财务建模](#1-financial-analysis--核心财务建模)
  - [2. Investment Banking — 投资银行](#2-investment-banking--投资银行)
  - [3. Equity Research — 卖方研究](#3-equity-research--卖方研究)
  - [4. Private Equity — 私募股权](#4-private-equity--私募股权)
  - [5. Wealth Management — 财富管理](#5-wealth-management--财富管理)
  - [6. Fund Admin — 基金运营](#6-fund-admin--基金运营)
  - [7. Operations — 运营合规](#7-operations--运营合规)
- [二、Agent 插件](#二agent-插件)
- [三、合作伙伴插件](#三合作伙伴插件)
- [四、其他插件](#四其他插件)
- [五、斜杠命令速查表](#五斜杠命令速查表)

---

## 一、垂直技能包

### 1. Financial Analysis — 核心财务建模

**功能:** DCF、可比公司、LBO、3 表模型、竞争分析、PPT/Excel 操作

#### Slash Commands (7 个)

| 命令 | 技能 | 功能 | 何时使用 |
|------|------|------|----------|
| `/dcf <ticker>` | dcf-model | 构建机构级 DCF 估值模型：收入预测、WACC/CAPM、FCF 计算、终值、股权桥、三张敏感性表 | 需要对一家公司进行现金流折现估值、内在价值分析 |
| `/comps <ticker>` | comps-analysis | 构建可比公司分析：运营指标、估值倍数、统计基准（Max/P75/Median/P25/Min），数据优先级 MCP → 财报 → 不搜网 | 公募估值、同行对标、IPO 定价、IC 汇报 |
| `/lbo <deal>` | lbo-model | 完成 LBO 模型模板：公式填充、计算验证、专业格式、敏感性表 | PE 交易材料、IC 展示、保荐人案例分析 |
| `/3-statement-model <file>` | 3-statement-model | 完成三表联动财务模型（利润表/资产负债表/现金流量表），公式优先、蓝灰格式、情景分析 | 填充模型模板、完成半成品框架、关联报表 |
| `/competitive-analysis <company>` | competitive-analysis | 竞争格局报告：市场定位、竞品深挖、对比分析、战略综合（两阶段：需求对齐 → 构建） | 竞争格局分析、同行对比、市场定位、战略审查 |
| `/debug-model <xlsx>` | audit-xls | 审计电子表格：公式准确性、错误检查、模型完整性（BS 平衡、现金核对、滚动核对） | 检查公式、找错误、QA、模型调不平、交付前审查 |
| `/ppt-template <pptx>` | ppt-template-creator | 将 PPT 模板做成可复用的技能包（分析占位符位置和布局） | 需要把公司模板封装成可复用的生成技能 |

#### 仅通过自然语言触发的技能

| 技能 | 功能 | 何时使用 |
|------|------|----------|
| clean-data-xls | 清洗脏数据：去空格、统一大小写、修正文本数字、标准化日期、去重 | "清洗这个数据" / "格式化" / "去重" |
| deck-refresh | 更新已有 PPT 中的数字（季度刷新、盈利更新、comp roll）——四阶段：取数据→读取一切→方案审批→最小改动执行 | "更新 Q4 数据" / "刷新 comps" / "换新盈利" |
| ib-check-deck | 投行 PPT 质量检查：数字一致性、数据叙事对齐、语言润色、视觉 QC（只读不写） | 发客户之前的终审、QC、校对 |
| xlsx-author | 无头模式生成 .xlsx 文件（openpyxl），遵循蓝/黑/绿颜色规范 | 托管 Agent 模式下需要交付文件（不驱动实时 Excel） |
| pptx-author | 无头模式生成 .pptx 文件（python-pptx），每页一个观点，每个数字可追溯到模型 | 托管 Agent 模式下需要交付 PPT 文件 |

---

### 2. Investment Banking — 投资银行

**功能:** Pitch deck、CIM、Teaser、买家名单、并购模型、交易追踪

#### Slash Commands (7 个)

| 命令 | 技能 | 功能 | 何时使用 |
|------|------|------|----------|
| `/one-pager <ticker>` | strip-profile | 创建投行 strip profile（公司简介），1-4 页信息密集幻灯片，四象限布局，4:3 比例 | 为 pitch book 创建公司简介页 |
| `/cim <company>` | cim-builder | 起草保密信息备忘录：执行摘要、公司概况、行业、增长机会、客户/销售、运营、财务 | 卖方 M&A 流程中准备 CIM |
| `/teaser <company>` | teaser | 起草匿名一页公司 Teaser，不披露身份的引人注目的摘要 | 卖方流程初期试探买方兴趣 |
| `/buyer-list <sector>` | buyer-list | 构建潜在买方全景：战略买家（竞争对手/相邻/垂直整合/平台）和财务保荐人，分层排优先级 | 卖方委任准备、构建买方全景 |
| `/merger-model <deal>` | merger-model | 并购增/稀释分析：备考 EPS 影响、协同敏感性、购买价格分配、资金来源与用途 | 评估收购、准备并购后果分析、交易条款建议 |
| `/process-letter <type>` | process-letter | 起草流程函和投标说明：IOI 说明、最终投标程序、第二轮函、管理层会议邀请 | 起草流程函/投标说明/IOI 函 |
| `/deal-tracker` | deal-tracker | 追踪多个正在推进的交易：里程碑、截止日期、行动项、周度交易审查摘要 | 管理业务簿、追踪流程里程碑、周度交易审查 |

#### 仅通过自然语言触发的技能

| 技能 | 功能 | 何时使用 |
|------|------|----------|
| pitch-deck | 将 Excel/CSV 数据填充到 PPT 模板（表格、图表、箭头均用真实对象），含验证循环 | 提供了模板和数据源需填充 |
| datapack-builder | 从 CIM/招股书/SEC 财报/MCP 构建 8-tab 财务数据包（货币/数字/百分比专业格式），含标准化调整和情景 | M&A DD、PE 分析、IC 材料、跨组合标准化 |

---

### 3. Equity Research — 卖方研究

**功能:** 首次覆盖、盈利分析、晨会纪要、投资论点、行业概览、标的筛选

#### Slash Commands (9 个)

| 命令 | 技能 | 功能 | 何时使用 |
|------|------|------|----------|
| `/initiate <ticker>` | initiating-coverage | 创建机构级首次覆盖报告（5 步流程：公司研究→建模→估值→图表 25-35 张→报告 30-50 页 DOCX） | 对一家公司启动首次覆盖（JPM/GS/MS 标准） |
| `/earnings <ticker> <Q>` | earnings-analysis | 创建盈利更新报告（8-12 页、3000-5000 字）：beat/miss 分析、汇总表、8-12 张图、来源超链接 | 覆盖公司发布季报后快速出更新 |
| `/earnings-preview <ticker>` | earnings-preview | 财报前分析：预估模型、情景框架（Bull/Base/Bear）、关键关注指标 | 季报发布前准备预判、情景和关键催化剂 |
| `/morning-note` | morning-note | 起草晨会纪要：隔夜发展、交易想法、覆盖股票关键事件（7am 晨会格式：精炼、有观点、可执行） | 晨会准备 / "隔夜发生了什么" / "交易想法" |
| `/thesis <ticker>` | thesis-tracker | 维护投资论点：追踪关键数据点、催化剂、里程碑，含计分卡框架和更新日志 | 新信息后更新论点 / 审查仓位逻辑 |
| `/sector <industry>` | sector-overview | 行业全景报告：市场动态、竞争格局、关键玩家、估值背景、主题趋势、TAM | 客户请求、行业启动、主题研究、内部知识 |
| `/screen <criteria>` | idea-generation | 系统化股票筛选：量化筛选（价值/成长/质量/做空/特殊事件）+ 主题研究 → 多头和空头想法 | 寻找新想法、跑筛选、主题扫描 |
| `/catalysts <timeframe>` | catalyst-calendar | 构建覆盖范围内的催化剂日历：盈利日期、会议、产品发布、监管决策、宏观事件 | 查看即将发生的事件、优先排期 |
| `/model-update <ticker>` | model-update | 用新数据更新财务模型：季报、管理层指引、宏观变化、调整假设 | 盈利后 / 指引更新后 / 假设需要刷新时 |

---

### 4. Private Equity — 私募股权

**功能:** 交易搜寻、DD 清单、IC 备忘录、价值创造、投后监控、回报分析

#### Slash Commands (10 个)

| 命令 | 技能 | 功能 | 何时使用 |
|------|------|------|----------|
| `/source <criteria>` | deal-sourcing | PE 交易搜寻三步骤：网络搜索发现 → CRM 查重（Gmail/Slack）→ 起草创始人外联邮件 | 搜寻新标的、在某领域发掘公司、接触创始人 |
| `/screen-deal <file>` | deal-screening | 快速筛选入站交易（CIM/Teaser/经纪人材料）：提取关键指标、基金标准过/不过框架、一页筛选备忘录 | 审查新交易流、分流入站材料 |
| `/dd-checklist <company>` | dd-checklist | 生成并追踪尽调清单（财务/商业/法律/运营/HR/IT/ESG），含请求列表、状态追踪、红旗升级 | 尽调启动、数据室审查组织、未完成项追踪 |
| `/dd-prep <company> <type>` | dd-meeting-prep | 尽调会议准备：管理层陈述、专家网络、客户访谈、顾问会议——目标问题列表按优先级/主题排列 | 任何尽调会议之前 |
| `/unit-economics <company>` | unit-economics | 分析单位经济：ARR 队列、LTV/CAC、净留存、回收期、收入质量、利润瀑布（SaaS/订阅必备） | 评估收入质量、队列分析、评估客户经济 |
| `/ic-memo <company>` | ic-memo | 起草投委会备忘录：执行摘要、公司概况、行业分析、财务分析、投资论点、交易条款、回报、风险 | 准备投委会、写交易报告 |
| `/returns <params>` | returns-analysis | 构建 IRR/MOIC 敏感性表：进入倍数/杠杆/退出倍数/增长/持有期情景，含回报瀑布归因 | 交易规模评估、压力测试、IC 回报展示 |
| `/value-creation <company>` | value-creation-plan | 构建收购后价值创造计划：收入/成本/运营杠杆 → EBITDA 桥、百日计划、KPI 目标、问责框架 | 交割后规划、运营合伙人材料、董事会路线图 |
| `/portfolio <company>` | portfolio-monitoring | 追踪组合公司表现 vs 计划：月度/季度财报数据提取、KPI 提取、预算差异标记（绿/黄/红） | 审查组合公司财报、董事会材料、合规监控 |
| `/ai-readiness <folder>` | ai-readiness | 扫描组合中最高杠杆 AI 机会：消化季度更新、逐公司走/不走门禁问题、快速胜利排序 | 季度组合审查、年度规划、AI 投资优先级 |

---

### 5. Wealth Management — 财富管理

**功能:** 客户审查、财务规划、投资建议书、组合再平衡、税损收割

#### Slash Commands (6 个)

| 命令 | 技能 | 功能 | 何时使用 |
|------|------|------|----------|
| `/client-review <client>` | client-review | 客户审查会议准备：组合表现、配置分析 vs IPS、谈话要点、主动建议（再平衡/TLH/Roth 转换）、一页摘要 | 季度审查前 / 年度检查 / 临时客户会议 |
| `/financial-plan <client>` | financial-plan | 综合财务规划：退休预测（蒙特卡洛）、教育、遗产、现金流、风险管理、情景建模（15-25 页 + Excel） | 新客入驻 / 年度审查 / "我能退休吗" / 教育规划 |
| `/proposal <prospect>` | investment-proposal | 新客投资建议书：公司方法、建议配置、预期回报（蒙特卡洛）、费率、启动计划（12-15 页） | 争取新客户 / 展示新策略 |
| `/rebalance <client>` | portfolio-rebalance | 组合漂移分析：生成再平衡交易建议，考虑税务影响、交易成本、洗售规则、资产位置优化 | 偏离 IPS / 配置偏离 / 再平衡需求 |
| `/tlh <client>` | tax-loss-harvesting | 识别税损收割机会：未实现亏损仓位、节税估算、替代证券建议、跨账户洗售检查 | 年末税务规划 / "有浮亏吗" / TLH |
| `/client-report <client> <period>` | client-report | 客户报告（8-12 页 PDF）：组合回报、配置分解、持仓明细、市场评论、活动摘要 | 季度/年度客户报告 |

---

### 6. Fund Admin — 基金运营

**功能:** 总账对账、断点追因、NAV 核验、应计、滚动、波动说明

> 该插件无 slash commands，全部通过自然语言触发。

| 技能 | 功能 | 何时使用 |
|------|------|----------|
| gl-recon | 总账 vs 子账对账（按仓位或交易级别）：识别断点（金额/数量/时间/仅GL/仅子账），按原因分类（时间差/FX/映射/重复/费用/数据质量） | 每日或月末对账 |
| break-trace | 对账断点根本原因分析：从断点行追溯至原始分录两侧，比对属性，输出根因诊断 | gl-recon 分类断点后进一步追因 |
| nav-tieout | LP 报表 vs 基金 NAV 包逐行核对：独立重新计算 LP 资本账户，标记任何不匹配（容差 0.01） | LP 报表发出前的最终验证 |
| accrual-schedule | 期末应计时间表：逐项计算、引用依据、草拟日记账分录（只草拟不记账，需控制人签批） | 月末关账时的应计工作 |
| roll-forward | 资产负债表科目滚动对账：期初+变动-冲销=期末，每项关联 GL，含脚注校验（通过/失败/未解释差异） | 月末关账包和审计支持 |
| variance-commentary | 波动说明撰写：每条超过阈值的 P&L 和 BS 行（当期 vs 上期 vs 预算），用业务活动解释驱动因素 | 月末关账包和管理层报告 |

---

### 7. Operations — 运营合规

**功能:** KYC 文档解析、反洗钱规则引擎

> 该插件无 slash commands，全部通过自然语言触发。

| 技能 | 功能 | 何时使用 |
|------|------|----------|
| kyc-doc-parse | 解析客户入驻材料为结构化 KYC 字段：身份、所有权、控制权、资金来源、文件清单（输入视为不受信任） | KYC 筛查第一步，输出供规则引擎使用 |
| kyc-rules | 应用 KYC/AML 规则网格：按司法辖区/申请人类型/所有权不透明度/PEP 暴露/制裁/资金来源计算风险评级，逐条输出结果并引用规则依据 | kyc-doc-parse 之后进行评分和分流 |

---

## 二、Agent 插件

Agent 是端到端完成特定任务的自主工作流，内置多个 skill 协作完成复杂任务。

| Agent | 功能 | 何时使用 |
|-------|------|----------|
| **Pitch Agent** | 给定目标公司和战略背景，自主拉取可比/先例交易数据、构建 DCF 和 Football-Field 估值（Excel）、生成品牌 Pitch Deck（PPT） | MD 或高级银行家要第一稿 pitch；不用于编辑已有 deck |
| **Market Researcher** | 产出行业或主题市场研究：行业概览、竞争格局、同行交易 comps、投资主题短名单——包装为研报 + 可选 slides | 分析师或 PM 要某个行业/主题的入门报告 |
| **Earnings Reviewer** | 端到端处理盈利事件：读取电话会记录和财报、更新覆盖模型、起草盈利后点评 | 覆盖公司发财报时；支持单只交互或批量托管 Agent |
| **Meeting Prep Agent** | 客户/潜在客户会议前构建简报包：CRM 关系历史、持仓和近期活动、市场背景、建议议程 | 任何客户会议之前；可与日历事件配对 |
| **Model Builder** | 从股票代码和假设集在 Excel 中实时构建 DCF、LBO、三表、交易 comps | 需要从零构建干净模型；不用于更新已有覆盖模型 |
| **GL Reconciler** | 跨资产类别总账对子账对账：发现断点、追溯根因、将异常报告流转至签批 | 每日或月末对账；不用于日记账过账 |
| **KYC Screener** | 解析入驻文件包、运行 KYC/AML 规则引擎、筛查制裁和 PEP 名单、标记需升级的缺口 | 新客入驻或定期刷新；不用于交易监控 |
| **Valuation Reviewer** | 消化 GP 估值包、套用估值模板、阶段性生成 LP 报告 | 季度末组合估值审查；不用于交易时承销 |
| **Month-End Closer** | 为实体运行月末关账：应计、滚动、波动说明——阶段性生成关账包供控制人签批 | 期末关账；不用于日常对账 |
| **Statement Auditor** | 对一批预生成的 LP 资本账户报表 vs 基金 NAV 包进行审计：核对余额、分配、费用、标记差异 | LP 报表发出前的最终检查 |

---

## 三、合作伙伴插件

### LSEG (London Stock Exchange Group)

> **前提:** 需要 LSEG 数据订阅 + LFA MCP Server 连接
> **覆盖:** 债券定价、外汇定价、曲线、互换、期权、波动率曲面、量化分析、时间序列、YieldBook 固收分析

| 命令 | 功能 | 何时使用 |
|------|------|----------|
| `/analyze-bond-basis <future>` | 分析国债期货基差：定价期货、识别 CTD、计算总/净基差、隐含回购利率、基差交易机会 | 分析国债期货基差 / 寻找 CTD / 基差交易 |
| `/analyze-bond-rv <bond>` | 债券相对价值分析：定价+收益率曲线+信用利差分解+情景压力测试（平行利率冲击） | 评估债券贵/便宜 / 利差分解 / 情景分析 |
| `/research-equity <ticker>` | 综合股票研究快照：IBES 一致预期+基本面+价格表现+宏观背景 | 股票研究 / 估值评估 / 投资论据构建 |
| `/analyze-fx-carry <pair>` | 外汇套息交易评估：即期+远期点+远期曲线+波动率曲面 → 套息/波动率比 | 套息交易分析 / 远期曲线比较 |
| `/analyze-swap-curve <ccy>` | 利率互换曲线构建：叠加国债→互换利差/实际利率分解（通胀盈亏）/曲线交易（陡峭化/平坦化/蝶式） | 互换曲线分析 / 曲线交易 / 互换利差 |
| `/analyze-option-vol <underlying>` | 波动率环境分析：生成波动率曲面（股票或外汇）、期权定价含完整 Greeks、隐含 vs 已实现波动率比较 | 期权定价 / 波动率曲面 / 波动率策略 |
| `/review-fi-portfolio <ISINs>` | 固收组合风险回报报告：全部持仓定价、参考数据、现金流瀑布、利率情景压力测试 | 债券组合审查 / 久期/DV01 / 现金流建模 |
| `/macro-rates <country>` | 宏观利率仪表盘：GDP/CPI/失业/PMI + 收益率曲线斜率 + 实际利率分解 + 金融条件 | 宏观监控 / 收益率曲线 / 政策利率预期 |

### S&P Global (Kensho)

> **前提:** 需要 S&P Global LLM-ready API 或 Capital IQ Pro 订阅
> **覆盖:** 公司 tear sheet、交易摘要、盈利预览

| 触发方式 | 功能 | 何时使用 |
|----------|------|----------|
| 自然语言 "给我 xx 公司的 tear sheet" | tear-sheet：生成受众特定的 1-2 页公司摘要（支持 ER/IB/CorpDev/Sales 四模式），.docx 输出 | 需要公司概况/一页纸/快照 |
| 自然语言 "deal flow digest" / "weekly funding recap" | funding-digest：单页 PPT 总结近期融资和资本市场动态，含 stat cards 和 top deals 表 | 交易流摘要 / 周报 / 资金动态简报 |
| 自然语言 "NKE 盈利预览" | earnings-preview：4-5 页 HTML 盈利预览（Chart.js 图表），仅使用 Kensho Grounding + S&P Global MCP 数据 | 单个上市公司的盈利前分析 |

---

## 四、其他插件

### Claude for Microsoft 365 Install

> **用途:** 为 Claude Office 插件配置企业级云直连（Vertex AI / Bedrock / Azure AI Foundry / LLM Gateway）

| 命令 | 功能 |
|------|------|
| `/claude-for-msft-365-install:setup` | 完整交互式设置向导：选云后端→创建 OAuth/IAM→Azure 管理员同意→生成 manifest→用户配置→验证→部署 |
| `/claude-for-msft-365-install:manifest` | 生成自定义插件 manifest XML（支持 Office 和 Outlook 两类模板） |
| `/claude-for-msft-365-install:consent` | 生成 Azure 管理员同意 URL（Entra SSO + Outlook Graph），含验证步骤 |
| `/claude-for-msft-365-install:update-user-attrs` | 向 Azure AD 写入每用户配置（token/region/role），支持单用户 PATCH 和批量 CSV |
| `/claude-for-msft-365-install:bootstrap` | 构建 bootstrap endpoint 合约文档（HTTPS handler 启动时返回每用户 JSON 配置） |
| `/claude-for-msft-365-install:debug` | 诊断部署问题：连接失败、配置过期、插件不显示、SSO 循环等 |

---

## 五、斜杠命令速查表

### 投资银行 / 资本市场 (14 个)

| 命令 | 来源插件 |
|------|----------|
| `/dcf <ticker>` | financial-analysis |
| `/comps <ticker>` | financial-analysis |
| `/lbo <deal>` | financial-analysis |
| `/3-statement-model <file>` | financial-analysis |
| `/competitive-analysis <co>` | financial-analysis |
| `/debug-model <xlsx>` | financial-analysis |
| `/ppt-template <pptx>` | financial-analysis |
| `/one-pager <ticker>` | investment-banking |
| `/cim <company>` | investment-banking |
| `/teaser <company>` | investment-banking |
| `/buyer-list <sector>` | investment-banking |
| `/merger-model <deal>` | investment-banking |
| `/process-letter <type>` | investment-banking |
| `/deal-tracker` | investment-banking |

### 研究 (9 个)

| 命令 | 来源插件 |
|------|----------|
| `/initiate <ticker>` | equity-research |
| `/earnings <ticker> <Q>` | equity-research |
| `/earnings-preview <ticker>` | equity-research |
| `/morning-note` | equity-research |
| `/thesis <ticker>` | equity-research |
| `/sector <industry>` | equity-research |
| `/screen <criteria>` | equity-research |
| `/catalysts <timeframe>` | equity-research |
| `/model-update <ticker>` | equity-research |

### 私募股权 (10 个)

| 命令 | 来源插件 |
|------|----------|
| `/source <criteria>` | private-equity |
| `/screen-deal <file>` | private-equity |
| `/dd-checklist <company>` | private-equity |
| `/dd-prep <company> <type>` | private-equity |
| `/unit-economics <company>` | private-equity |
| `/ic-memo <company>` | private-equity |
| `/returns <params>` | private-equity |
| `/value-creation <company>` | private-equity |
| `/portfolio <company>` | private-equity |
| `/ai-readiness <folder>` | private-equity |

### 财富管理 (6 个)

| 命令 | 来源插件 |
|------|----------|
| `/client-review <client>` | wealth-management |
| `/financial-plan <client>` | wealth-management |
| `/proposal <prospect>` | wealth-management |
| `/rebalance <client>` | wealth-management |
| `/tlh <client>` | wealth-management |
| `/client-report <client> <period>` | wealth-management |

### LSEG 固收/宏观/外汇/期权 (8 个)

| 命令 | 来源插件 |
|------|----------|
| `/analyze-bond-basis <futures>` | lseg |
| `/analyze-bond-rv <bond>` | lseg |
| `/research-equity <ticker>` | lseg |
| `/analyze-fx-carry <pair>` | lseg |
| `/analyze-swap-curve <ccy>` | lseg |
| `/analyze-option-vol <underlying>` | lseg |
| `/review-fi-portfolio <ISINs>` | lseg |
| `/macro-rates <country>` | lseg |

### M365 部署 (6 个)

| 命令 | 来源插件 |
|------|----------|
| `/claude-for-msft-365-install:setup` | claude-for-msft-365-install |
| `/claude-for-msft-365-install:manifest` | claude-for-msft-365-install |
| `/claude-for-msft-365-install:consent` | claude-for-msft-365-install |
| `/claude-for-msft-365-install:update-user-attrs` | claude-for-msft-365-install |
| `/claude-for-msft-365-install:bootstrap` | claude-for-msft-365-install |
| `/claude-for-msft-365-install:debug` | claude-for-msft-365-install |

---

> **注意:** LSEG 和 S&P Global 插件需要对应的数据订阅和 API key 才能正常工作。Fund Admin 和 Operations 插件无 slash commands，通过自然语言描述需求触发。
