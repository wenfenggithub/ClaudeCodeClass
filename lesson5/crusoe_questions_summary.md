# crusoe  会话问题清单

> 整理本次会话中用户提出的所有问题与需求，按时间顺序排列。

---

## 1. 仓库 Skill 综览报告

> **原话：** 查看 https://github.com/anthropics/financial-services，生成一个 HTML 报告，结构描述这个项目里面每个 skill 的介绍、作用、建议等。

- **问题目的：** 摸清 `anthropics/financial-services` 这个仓库的「家底」—— 有哪些 Agent、哪些 Vertical Plugin、每个 Skill 各自能做什么，并以可阅读的 HTML 形式沉淀下来作为索引。

---

## 2. 研究 Crusoe 应该用哪些 Skill

> **原话：** 我想研究 www.crusoe.ai 这家公司的业务，建议用哪些 skill。

- **问题目的：** 把仓库里的工具映射到一个具体的研究对象上 —— 验证「Skill 工具集」对真实公司研究任务的适配度；同时排除掉对私营公司不适用的估值类 Skill。

---

## 3. 按建议顺序跑完 4 个 Skill

> **原话：** 按顺序跑 1，2，3，4。

- **问题目的：** 真正执行上一步的研究方案 —— 让 `sector-overview` → `competitive-analysis` → `tear-sheet` → `funding-digest` 这条工作流跑出端到端产物，看是否能产出一份完整的公司研究报告。

---

## 4. 输出形态升级：HTML 转苹果风 PPT

> **原话：** 把 HTML 内容做成 PPT，苹果风格。

- **问题目的：** 把研究结论从「网页阅读形态」升级成「可演示形态」；用苹果风格（极简、大字、黑白主色）让信息密度让位于叙事节奏，便于对外汇报或个人沉浸阅读。

---

## 5. 整理本次会话的问题清单

> **原话：** 请把本次会话中我提出的所有问题整理成 Markdown 清单……保存为 `Github_questions_summary.md`。

- **问题目的：** 沉淀本次会话的思考主线 —— 把零散提问串成一条清晰的工作流，便于下次延续或复盘。

---

## 6. 用同样流程研究 goodvision.ai

> **原话：** 你可以按照前面的研究 Crusoe 公司的几个 skill，同样的方式和流程研究一下 https://goodvision.ai 这个公司么？

- **问题目的：** 把本次会话中验证过的「Skill 工作流」复用到下一个研究对象上 —— 形成可重复的私营公司研究范式。

---

# 会话主线总结

本次会话是一条**从「认识工具」→「选用工具」→「执行工具」→「升级形态」→「沉淀方法」→「复用方法」**的完整学习曲线：

| 阶段 | 核心动作 | 产出物 |
|---|---|---|
| ① 认识工具 | 梳理 `anthropics/financial-services` 仓库 | `financial-services-skills-report.html` |
| ② 选用工具 | 针对 Crusoe 筛选合适 Skill 组合 | 4 个 Skill 的推荐清单 |
| ③ 执行工具 | 跑通 4 个 Skill 的研究流程 | `crusoe-research-report.html` |
| ④ 升级形态 | 把 HTML 报告转为苹果风 PPT | `crusoe-deck.pptx`（20 张幻灯片） |
| ⑤ 沉淀方法 | 整理本次会话的问题清单 | `Github_questions_summary.md`（本文件） |
| ⑥ 复用方法 | 把流程套用到 goodvision.ai | 进行中 |

**主线一句话概括：** 用 Anthropic 官方金融服务 Skill 仓库验证一条「私营公司研究的可复用工作流」，并将其产物分别落地为索引文档、研究报告和演示 PPT。

---

# 待办事项

- [x] 生成 `financial-services-skills-report.html` —— 仓库 Skill 综览
- [x] 推荐研究 Crusoe 的 Skill 组合
- [x] 生成 `crusoe-research-report.html` —— Crusoe 研究报告
- [x] 生成 `crusoe-deck.pptx` —— 苹果风演示 PPT
- [x] 生成 `Github_questions_summary.md` —— 本会话问题清单
- [ ] **进行中：** 用同样流程研究 goodvision.ai
  - [ ] ① 赛道概览（计算机视觉 / 交通 / 视频分析）
  - [ ] ② 竞品对比
  - [ ] ③ 公司画像（Tear Sheet）
  - [ ] ④ 融资 / 商业动态
  - [ ] 合成 HTML 报告
  - [ ] （可选）转成苹果风 PPT
