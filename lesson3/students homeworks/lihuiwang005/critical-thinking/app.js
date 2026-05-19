const methods = [
  {
    id: "question",
    title: "提问",
    subtitle: "先确认命题，再确认它可回答什么",
    summary: "把一句话拆成主张、范围、对象和条件，避免一上来就对错判断。",
    prompts: ["这句话具体在说什么？", "它默认了哪些前提？", "结论是不是比证据走得更快？"],
    checks: ["主张是否清楚", "范围是否明确", "条件是否被省略"],
    payoff: "适合任何新信息进入判断前的第一步。"
  },
  {
    id: "evidence",
    title: "证据",
    subtitle: "先看来源，再看质量与相关性",
    summary: "证据不是越多越好，而是越相关、越独立、越能支持结论越好。",
    prompts: ["证据来自原始来源吗？", "样本是否足够代表整体？", "有没有独立验证？"],
    checks: ["来源是否可靠", "样本是否偏小", "数据是否被断章取义"],
    payoff: "适合判断新闻、研究结论和营销主张。"
  },
  {
    id: "reasoning",
    title: "推理",
    subtitle: "把证据和结论之间的链条拉直",
    summary: "重点不只是“有证据”，而是证据如何一步步支持结论，过程中是否发生跳步或偷换概念。",
    prompts: ["从证据到结论中间缺了哪一步？", "是否把相关性说成因果？", "有没有偷换定义？"],
    checks: ["推理链是否完整", "是否存在逻辑跳跃", "结论是否过度外推"],
    payoff: "适合分析论证、评论和方案评审。"
  },
  {
    id: "counter",
    title: "反例",
    subtitle: "主动找替代解释",
    summary: "真正稳的判断，通常能说明为什么反例不成立，或者它的边界在哪里。",
    prompts: ["有没有相反的案例？", "是否存在更简单的解释？", "这个结论在哪些条件下会失效？"],
    checks: ["是否考虑替代解释", "是否考虑边界条件", "是否主动寻找反证"],
    payoff: "适合防止过早下结论。"
  },
  {
    id: "conclusion",
    title: "结论",
    subtitle: "把判断变成可更新的版本",
    summary: "结论不是终点，而是基于现有证据的暂定判断；新的信息出现时，应该能修正。",
    prompts: ["我现在的判断有多确定？", "需要补什么证据？", "如果信息变化，判断会怎么变？"],
    checks: ["是否区分确定与推测", "是否保留条件", "是否允许修正"],
    payoff: "适合长期决策和复杂问题。"
  }
];

const misconceptions = [
  {
    id: "anti",
    title: "批判 = 否定一切",
    why: "很多人把“批判”理解成情绪化反对，于是误以为批判性思维就是找茬。",
    fix: "批判性思维的目标是提升判断质量，而不是提高对抗强度。",
    example: "遇到观点时，先问“依据是什么”，而不是先问“我同不同意”。"
  },
  {
    id: "force",
    title: "声音越强，思考越深",
    why: "表达强硬、语气笃定，容易被误当成逻辑扎实。",
    fix: "深度体现在证据、结构和边界，不体现在语气大小。",
    example: "能把不确定性讲清楚，往往比单纯下结论更有价值。"
  },
  {
    id: "stance",
    title: "只看立场，不看论证",
    why: "人们常被立场标签吸引，而忽略对方真正用了什么证据和推理。",
    fix: "先拆论证，再判断立场是否站得住。",
    example: "同样的立场可能来自好论证，也可能来自弱论证。"
  },
  {
    id: "skeptic",
    title: "怀疑就够了",
    why: "怀疑只是起点；如果停留在怀疑，不会产生更好的判断。",
    fix: "怀疑之后还要补证据、找反例、校正结论。",
    example: "好判断不是“我不信”，而是“我为什么不信，以及什么会改变我的看法”。"
  }
];

const cases = [
  {
    id: "headline",
    title: "标题党新闻",
    context: "一则标题声称某政策会“立刻改变所有人的收入”，用户只看标题就准备转发。",
    claim: "标题把复杂政策直接等同于单一结果。",
    suspicious: ["全文是否真的支持标题", "样本是否覆盖所有人", "时间跨度是否足够"],
    evidence: ["看原文，不看二次转述", "确认数据来源与发布时间", "区分预测、描述和结论"],
    reasoning: "标题只给了一个强结论，但没有给足够的条件和边界。更稳的做法是先回到原文和数据。",
    judgment: "需要保留判断，不能只凭标题得出结论。",
    lesson: "信息进入判断前，先回到原始来源。"
  },
  {
    id: "social",
    title: "社交截图传播",
    context: "一张聊天截图在群里广泛传播，大家根据截图推测一个人说了什么。",
    claim: "截图就等于完整语境。",
    suspicious: ["截图是否经过裁切", "是否缺少前后文", "是否可能伪造"],
    evidence: ["找完整对话链", "确认发出者和时间", "看是否有独立佐证"],
    reasoning: "截图可能真实，也可能选择性呈现。没有语境，结论通常不稳。",
    judgment: "必须先确认来源和上下文。",
    lesson: "离开语境的证据，价值会大幅下降。"
  },
  {
    id: "consumer",
    title: "消费决策",
    context: "某产品宣称“7 天见效”，评论区也有大量正面反馈。",
    claim: "短时间见效意味着效果稳定且普遍。",
    suspicious: ["评论是否有选择偏差", "样本是否来自真实用户", "有无对照和副作用信息"],
    evidence: ["看官方实验设计", "比较不同来源的反馈", "区分个体体验和普遍结论"],
    reasoning: "个别成功案例不等于普遍有效，特别是没有对照时。",
    judgment: "需要更高质量证据再决定。",
    lesson: "营销语句和用户体验，都不能自动替代证据。"
  },
  {
    id: "team",
    title: "团队方案评审",
    context: "团队成员提出一个新方案，现场气氛很强烈，但数据很少。",
    claim: "方案好，是因为直觉上很顺。",
    suspicious: ["有没有备选方案", "是否评估风险", "有没有指标定义"],
    evidence: ["把目标和指标写清楚", "比较旧方案与新方案", "定义失败条件"],
    reasoning: "热情并不能替代评估。好的方案要能说清楚为什么更好，以及哪里可能失败。",
    judgment: "先补结构，再做结论。",
    lesson: "方案评审要看可验证性，不只看表达气势。"
  }
];

const quotes = [
  {
    id: "feynman",
    theme: "反思",
    author: "Richard Feynman",
    quote: "The first principle is that you must not fool yourself.",
    source: "Cargo Cult Science, Caltech commencement address, 1974",
    verified: "来源可追溯到 Caltech 发布的《Cargo Cult Science》全文。",
    note: "提醒自己先识别自我欺骗，再谈判断。",
    link: "https://calteches.library.caltech.edu/51/2/CargoCult.htm"
  },
  {
    id: "russell",
    theme: "怀疑",
    author: "Bertrand Russell",
    quote: "The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.",
    source: "Attributed quote",
    verified: "常见转引版本较多，当前页面仅作启发性引用，出处细节建议继续核实。",
    note: "把“过度确定”当成风险信号。",
    link: "https://www.bookbrowse.com/quotes/detail/index.cfm/quote_number/426/the-whole-problem-with-the-world-is-that-fools-and-fanatics-are-always-so-certain-of-themselves-and-wiser-people-so-full-of-doubts"
  },
  {
    id: "sagan",
    theme: "证据",
    author: "Carl Sagan",
    quote: "Extraordinary claims require extraordinary evidence.",
    source: "Popularized by Carl Sagan",
    verified: "可作为广为人知的启发性表述使用；更严格的谱系可追溯到更早的类似原则。",
    note: "越特别的主张，越需要更强的证据链。",
    link: "https://link.springer.com/article/10.1007/s11406-016-9779-7"
  },
  {
    id: "dewey",
    theme: "判断",
    author: "John Dewey",
    quote: "Reflective thinking is active, persistent, and careful consideration of any belief or supposed form of knowledge.",
    source: "How We Think / educational tradition",
    verified: "Britannica 和 SEP 都把 Dewey 与 critical thinking 的教育传统联系起来。",
    note: "思考不是瞬间判断，而是持续审视。",
    link: "https://www.britannica.com/topic/critical-thinking"
  }
];

const resources = [
  {
    id: "britannica",
    title: "Critical thinking | Britannica",
    source: "Britannica",
    type: "入门",
    tags: ["概念", "历史", "教育"],
    summary: "短而清楚的概念总览，适合先建立定义、历史和常见技能框架。",
    url: "https://www.britannica.com/topic/critical-thinking"
  },
  {
    id: "iep",
    title: "Critical Thinking | Internet Encyclopedia of Philosophy",
    source: "IEP",
    type: "深入",
    tags: ["定义", "推理", "方法"],
    summary: "强调理由、判断与方法的关系，适合进一步理解批判性思维的哲学结构。",
    url: "https://iep.utm.edu/critical-thinking/"
  },
  {
    id: "sep",
    title: "Critical Thinking | Stanford Encyclopedia of Philosophy",
    source: "SEP",
    type: "深入",
    tags: ["哲学", "教育", "反思"],
    summary: "更适合查历史脉络、理论争议和 reflective thinking 的背景。",
    url: "https://plato.stanford.edu/archives/fall2024/entries/critical-thinking/"
  },
  {
    id: "fct",
    title: "Defining Critical Thinking",
    source: "Foundation for Critical Thinking",
    type: "实践",
    tags: ["标准", "技能", "教育"],
    summary: "实践向的定义和标准参考，适合设计练习和检查清单。",
    url: "https://www.criticalthinking.org/pages/our-concept-and-definition-of-critical-thinking/411"
  },
  {
    id: "procon",
    title: "About ProCon",
    source: "Britannica ProCon",
    type: "案例",
    tags: ["对照", "观点", "辩论"],
    summary: "适合做 pro/con 对照阅读，训练从论证而非立场出发看问题。",
    url: "https://www.britannica.com/procon/About-ProCon"
  },
  {
    id: "edu",
    title: "Critical thinking in philosophy of education",
    source: "Britannica",
    type: "深入",
    tags: ["教育", "理由", "判断"],
    summary: "适合了解批判性思维如何进入教育目标和课程设计。",
    url: "https://www.britannica.com/topic/philosophy-of-education/Critical-thinking"
  }
];

const practiceItems = [
  {
    id: "claim",
    title: "判断一条主张",
    tag: "证据",
    prompt: "看到一句话：“这款产品 7 天内能明显改善所有人的状态。” 你最先做什么？",
    options: [
      "直接相信，因为说得很具体",
      "先找原始来源、样本和边界条件",
      "只看评论区的点赞数量"
    ],
    answer: 1,
    explanation: "先查来源和边界条件，才能判断主张是否站得住。具体不等于可靠，评论热度也不等于证据。",
    followUp: "对应方法：提问、证据、推理"
  },
  {
    id: "screenshot",
    title: "处理一张截图",
    tag: "语境",
    prompt: "群里流传一张聊天截图，大家据此推断一个人的立场。你更应优先检查什么？",
    options: [
      "截图是否好看",
      "是否有完整语境与独立验证",
      "谁转发得最多"
    ],
    answer: 1,
    explanation: "截图可能是断章取义。先确认完整语境和独立验证，才能判断它是否真的能支撑结论。",
    followUp: "对应方法：提问、反例、结论"
  },
  {
    id: "proposal",
    title: "评审一个方案",
    tag: "推理",
    prompt: "团队提出一个新方案，但只有直觉支持，没有数据。你最关键的下一步是什么？",
    options: [
      "补定义、补指标、补对照",
      "先让表达最强的人拍板",
      "直接进入全面推广"
    ],
    answer: 0,
    explanation: "方案评审的核心不是气势，而是可验证性。先把目标、指标和对照补齐，判断才会稳定。",
    followUp: "对应方法：分解、比较、评估"
  }
];

const heroNotes = {
  question: "先确认命题是否清楚、可验证，再进入判断。",
  evidence: "证据要看来源、数量、相关性与独立性。",
  reasoning: "从证据到结论的链条，不能有偷换和跳步。",
  counter: "反例和替代解释，决定判断是否稳固。",
  conclusion: "结论是暂定版本，要能随新信息修正。"
};

const state = {
  heroFocus: "question",
  methodId: methods[0].id,
  misconceptionId: misconceptions[0].id,
  caseId: cases[0].id,
  quoteFilter: "全部",
  quoteId: quotes[0].id,
  practiceId: practiceItems[0].id,
  practiceChoice: null,
  practiceSubmitted: false,
  practiceCompletedIds: new Set(),
  resourceFilter: "全部",
  resourceQuery: ""
};

const dom = {
  methodsRail: document.getElementById("methods-rail"),
  methodsDetail: document.getElementById("methods-detail"),
  misconceptionRail: document.getElementById("misconception-rail"),
  misconceptionDetail: document.getElementById("misconception-detail"),
  caseRail: document.getElementById("case-rail"),
  caseDetail: document.getElementById("case-detail"),
  quoteFilters: document.getElementById("quote-filters"),
  quoteSpotlight: document.getElementById("quote-spotlight"),
  quoteGrid: document.getElementById("quote-grid"),
  practiceRail: document.getElementById("practice-rail"),
  practiceDetail: document.getElementById("practice-detail"),
  resourceFilters: document.getElementById("resource-filters"),
  resourceGrid: document.getElementById("resource-grid"),
  resourceSearch: document.getElementById("resource-search"),
  externalSearch: document.getElementById("external-search"),
  heroNote: document.getElementById("hero-focus-note"),
  heroCanvas: document.getElementById("hero-canvas")
};

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function findById(list, id) {
  return list.find((item) => item.id === id) || list[0];
}

function renderMethods() {
  dom.methodsRail.innerHTML = methods
    .map(
      (method) => `
        <button class="rail-button ${method.id === state.methodId ? "is-active" : ""}" type="button" data-method="${method.id}" role="tab" aria-selected="${method.id === state.methodId}">
          <strong>${escapeHTML(method.title)}</strong>
          <small>${escapeHTML(method.subtitle)}</small>
        </button>
      `
    )
    .join("");

  const method = findById(methods, state.methodId);

  dom.methodsDetail.innerHTML = `
    <p class="eyebrow">当前方法</p>
    <h3>${escapeHTML(method.title)}</h3>
    <p>${escapeHTML(method.summary)}</p>
    <div class="detail-grid">
      <div class="detail-block">
        <h4>常问问题</h4>
        <ul class="bullet-list">
          ${method.prompts.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
        </ul>
      </div>
      <div class="detail-block">
        <h4>检查点</h4>
        <ul class="bullet-list">
          ${method.checks.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
        </ul>
      </div>
      <div class="detail-block">
        <h4>适用时机</h4>
        <p>${escapeHTML(method.payoff)}</p>
      </div>
      <div class="detail-block">
        <h4>补充提醒</h4>
        <p>方法不是顺序死板的流程，而是让判断更完整的工具箱。</p>
      </div>
    </div>
  `;
}

function renderMisconceptions() {
  dom.misconceptionRail.innerHTML = misconceptions
    .map(
      (item) => `
        <button class="rail-button ${item.id === state.misconceptionId ? "is-active" : ""}" type="button" data-misconception="${item.id}" role="tab" aria-selected="${item.id === state.misconceptionId}">
          <strong>${escapeHTML(item.title)}</strong>
          <small>点击看辨析</small>
        </button>
      `
    )
    .join("");

  const item = findById(misconceptions, state.misconceptionId);

  dom.misconceptionDetail.innerHTML = `
    <p class="eyebrow">误区辨析</p>
    <h3>${escapeHTML(item.title)}</h3>
    <div class="detail-list">
      <div class="detail-block">
        <h4>为什么常见</h4>
        <p>${escapeHTML(item.why)}</p>
      </div>
      <div class="detail-block">
        <h4>如何纠正</h4>
        <p>${escapeHTML(item.fix)}</p>
      </div>
      <div class="detail-block">
        <h4>示例判断</h4>
        <p>${escapeHTML(item.example)}</p>
      </div>
    </div>
  `;
}

function renderCases() {
  dom.caseRail.innerHTML = cases
    .map(
      (item) => `
        <button class="rail-button ${item.id === state.caseId ? "is-active" : ""}" type="button" data-case="${item.id}" role="tab" aria-selected="${item.id === state.caseId}">
          <strong>${escapeHTML(item.title)}</strong>
          <small>展开分析路径</small>
        </button>
      `
    )
    .join("");

  const item = findById(cases, state.caseId);

  dom.caseDetail.innerHTML = `
    <p class="eyebrow">案例分析</p>
    <h3>${escapeHTML(item.title)}</h3>
    <div class="detail-list">
      <div class="detail-block">
        <h4>场景背景</h4>
        <p>${escapeHTML(item.context)}</p>
      </div>
      <div class="detail-block">
        <h4>表面结论</h4>
        <p>${escapeHTML(item.claim)}</p>
      </div>
      <div class="detail-block">
        <h4>可疑点</h4>
        <ul class="bullet-list">
          ${item.suspicious.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}
        </ul>
      </div>
      <div class="detail-block">
        <h4>需要补的证据</h4>
        <ul class="bullet-list">
          ${item.evidence.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}
        </ul>
      </div>
      <div class="detail-block">
        <h4>推理结果</h4>
        <p>${escapeHTML(item.reasoning)}</p>
      </div>
      <div class="detail-block">
        <h4>结论</h4>
        <p>${escapeHTML(item.judgment)}</p>
      </div>
      <div class="detail-block">
        <h4>学习要点</h4>
        <p>${escapeHTML(item.lesson)}</p>
      </div>
    </div>
  `;
}

function renderQuoteFilters() {
  const filters = ["全部", "反思", "怀疑", "证据", "判断"];
  dom.quoteFilters.innerHTML = filters
    .map(
      (filter) => `
        <button class="chip ${filter === state.quoteFilter ? "is-active" : ""}" type="button" data-quote-filter="${escapeHTML(filter)}">${escapeHTML(filter)}</button>
      `
    )
    .join("");
}

function getVisibleQuotes() {
  if (state.quoteFilter === "全部") {
    return quotes;
  }
  return quotes.filter((item) => item.theme === state.quoteFilter);
}

function renderQuotes() {
  renderQuoteFilters();

  const visible = getVisibleQuotes();
  if (!visible.some((item) => item.id === state.quoteId)) {
    state.quoteId = visible[0]?.id || quotes[0].id;
  }

  const featured = findById(visible.length ? visible : quotes, state.quoteId);

  dom.quoteSpotlight.innerHTML = `
    <p class="eyebrow">精选引文</p>
    <blockquote>${escapeHTML(featured.quote)}</blockquote>
    <p class="quote-meta">${escapeHTML(featured.author)} · ${escapeHTML(featured.source)}</p>
    <p class="resource-note">${escapeHTML(featured.verified)}</p>
    <p>${escapeHTML(featured.note)}</p>
    <a class="button button-secondary" href="${escapeHTML(featured.link)}" target="_blank" rel="noreferrer">原文链接 ↗</a>
  `;

  dom.quoteGrid.innerHTML = visible
    .map(
      (item) => `
        <button class="quote-card ${item.id === state.quoteId ? "is-active" : ""}" type="button" data-quote="${item.id}">
          <blockquote>${escapeHTML(item.quote)}</blockquote>
          <div class="quote-tags">
            <span class="chip">${escapeHTML(item.theme)}</span>
            <span class="chip">${escapeHTML(item.author)}</span>
          </div>
          <p class="quote-meta">${escapeHTML(item.source)}</p>
        </button>
      `
    )
    .join("");
}

function renderPracticeRail() {
  dom.practiceRail.innerHTML = practiceItems
    .map(
      (item) => `
        <button class="rail-button ${item.id === state.practiceId ? "is-active" : ""}" type="button" data-practice="${item.id}" role="tab" aria-selected="${item.id === state.practiceId}">
          <strong>${escapeHTML(item.title)}</strong>
          <small>${escapeHTML(item.tag)}</small>
        </button>
      `
    )
    .join("");
}

function renderPractice() {
  renderPracticeRail();

  const item = findById(practiceItems, state.practiceId);
  const completed = state.practiceCompletedIds.size;
  const isAnswered = state.practiceChoice !== null;
  const isCorrect = state.practiceSubmitted && state.practiceChoice === item.answer;
  const resultClass = state.practiceSubmitted ? (isCorrect ? "is-correct" : "is-wrong") : "";
  const resultTitle = state.practiceSubmitted
    ? isCorrect
      ? "判断正确"
      : "还可以再收紧一点"
    : "先作答，再看解析";

  dom.practiceDetail.innerHTML = `
    <p class="eyebrow">练习进度</p>
    <div class="practice-meta">
      <span class="chip is-active">${completed}/${practiceItems.length} 已完成</span>
      <span class="chip">${escapeHTML(item.tag)}</span>
      ${state.practiceCompletedIds.has(item.id) ? '<span class="chip">本题已检查</span>' : ""}
    </div>
    <h3>${escapeHTML(item.title)}</h3>
    <div class="question-card">
      <p>${escapeHTML(item.prompt)}</p>
      <div class="answer-list">
        ${item.options
          .map(
            (option, index) => `
              <button class="answer-option ${state.practiceChoice === index ? "is-selected" : ""}" type="button" data-answer="${index}">
                <span class="answer-badge">${index + 1}</span>
                <span>${escapeHTML(option)}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <div class="hero-actions">
        <button class="button button-primary" id="practice-submit" type="button" ${isAnswered ? "" : "disabled"}>查看反馈</button>
        <button class="button button-secondary" id="practice-next" type="button">下一个练习</button>
      </div>
      <div class="feedback-box ${resultClass}">
        <strong>${escapeHTML(resultTitle)}</strong>
        <p>${state.practiceSubmitted ? escapeHTML(item.explanation) : "选择一个答案后再检查。"}</p>
        <p class="resource-note">${state.practiceSubmitted ? escapeHTML(item.followUp) : "提示：先补证据，再看结论。"} </p>
      </div>
    </div>
  `;
}

function renderResourceFilters() {
  const filters = ["全部", "入门", "深入", "实践", "案例"];
  dom.resourceFilters.innerHTML = filters
    .map(
      (filter) => `
        <button class="chip ${filter === state.resourceFilter ? "is-active" : ""}" type="button" data-resource-filter="${escapeHTML(filter)}">${escapeHTML(filter)}</button>
      `
    )
    .join("");
}

function getVisibleResources() {
  const query = state.resourceQuery.trim().toLowerCase();
  return resources.filter((item) => {
    const matchesFilter = state.resourceFilter === "全部" || item.type === state.resourceFilter;
    const haystack = [
      item.title,
      item.source,
      item.summary,
      item.type,
      item.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesFilter && matchesQuery;
  });
}

function renderResources() {
  renderResourceFilters();

  const visible = getVisibleResources();
  dom.resourceGrid.innerHTML = visible.length
    ? visible
        .map(
          (item) => `
            <article class="resource-card">
              <div>
                <p class="eyebrow">${escapeHTML(item.type)}</p>
                <h3>${escapeHTML(item.title)}</h3>
                <p class="resource-meta">${escapeHTML(item.source)}</p>
              </div>
              <p>${escapeHTML(item.summary)}</p>
              <div class="resource-tags">
                ${item.tags.map((tag) => `<span class="chip">${escapeHTML(tag)}</span>`).join("")}
              </div>
              <a class="button button-secondary" href="${escapeHTML(item.url)}" target="_blank" rel="noreferrer">打开原文 ↗</a>
            </article>
          `
        )
        .join("")
    : `
      <article class="resource-card">
        <p class="resource-note">没有匹配的资料。可以换一个关键词，或者切换资料类型。</p>
      </article>
    `;
}

function renderHeroNote() {
  dom.heroNote.textContent = heroNotes[state.heroFocus];
}

function setHeroFocus(focus) {
  state.heroFocus = focus;
  renderHeroNote();
  updateHeroChipState();
}

function updateHeroChipState() {
  document.querySelectorAll(".focus-chip").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focus === state.heroFocus);
  });
}

function updateSectionNav() {
  const navLinks = document.querySelectorAll(".primary-nav a");
  navLinks.forEach((link) => link.classList.remove("is-active"));

  const sections = ["overview", "methods", "misconceptions", "cases", "quotes", "practice", "resources"];
  const sectionElements = sections
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const current = sectionElements.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= 160 && rect.bottom > 160;
  });

  if (!current) {
    return;
  }

  const active = document.querySelector(`.primary-nav a[href="#${current.id}"]`);
  if (active) {
    active.classList.add("is-active");
  }
}

function setupHeroCanvas() {
  const canvas = dom.heroCanvas;
  const ctx = canvas.getContext("2d");
  let frame = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const points = [
    { id: "question", x: 0.15, y: 0.18, label: "问题" },
    { id: "evidence", x: 0.62, y: 0.2, label: "证据" },
    { id: "reasoning", x: 0.38, y: 0.46, label: "推理" },
    { id: "counter", x: 0.18, y: 0.7, label: "反例" },
    { id: "conclusion", x: 0.66, y: 0.72, label: "结论" },
    { id: "review", x: 0.5, y: 0.88, label: "复核" }
  ];

  const segments = [
    [0, 2],
    [1, 2],
    [2, 3],
    [2, 4],
    [3, 5],
    [4, 5]
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    draw(performance.now());
  }

  function pointAt(index) {
    return {
      x: canvas.clientWidth * points[index].x,
      y: canvas.clientHeight * points[index].y
    };
  }

  function drawArrow(from, to, accent = false, alpha = 1) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const len = Math.hypot(dx, dy);
    ctx.save();
    ctx.translate(from.x, from.y);
    ctx.rotate(angle);
    ctx.strokeStyle = accent ? `rgba(15, 118, 110, ${alpha})` : `rgba(84, 98, 112, ${alpha})`;
    ctx.lineWidth = accent ? 2.4 : 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len - 12, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(len - 12, 0);
    ctx.lineTo(len - 18, -5);
    ctx.lineTo(len - 18, 5);
    ctx.closePath();
    ctx.fillStyle = accent ? `rgba(15, 118, 110, ${alpha})` : `rgba(84, 98, 112, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  function drawNode(node, selected, pulse) {
    const width = Math.min(160, canvas.clientWidth * 0.18);
    const height = 60;
    const x = canvas.clientWidth * node.x - width / 2;
    const y = canvas.clientHeight * node.y - height / 2;

    ctx.save();
    ctx.fillStyle = selected ? "#d7f1ed" : "#ffffff";
    ctx.strokeStyle = selected ? "#0f766e" : "#c8d3da";
    ctx.lineWidth = selected ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();

    if (selected) {
      ctx.strokeStyle = `rgba(15, 118, 110, ${0.2 + pulse * 0.35})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(x - 2, y - 2, width + 4, height + 4, 10);
      ctx.stroke();
    }

    ctx.fillStyle = "#15222c";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, x + width / 2, y + height / 2 - 6);
    ctx.fillStyle = "#546270";
    ctx.font = "12px system-ui, sans-serif";
    const hint = node.id === "question"
      ? "先问清楚"
      : node.id === "evidence"
        ? "再看证据"
        : node.id === "reasoning"
          ? "连起逻辑"
          : node.id === "counter"
            ? "找替代解释"
            : node.id === "conclusion"
              ? "形成判断"
              : "修正更新";
    ctx.fillText(hint, x + width / 2, y + height / 2 + 12);
    ctx.restore();
  }

  function draw(timestamp) {
    if (!canvas.width || !canvas.height) {
      return;
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.fillStyle = "#f8fafb";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const gridStep = 32;
    ctx.strokeStyle = "#e3eaee";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.clientWidth; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.clientHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.clientHeight; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.clientWidth, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(21, 34, 44, 0.12)";
    ctx.setLineDash([4, 6]);
    segments.forEach(([fromIndex, toIndex]) => {
      const from = pointAt(fromIndex);
      const to = pointAt(toIndex);
      drawArrow(from, to, false, 0.6);
    });
    ctx.setLineDash([]);

    const time = reducedMotion.matches ? 0 : timestamp / 1800;
    const activeIndex = Math.floor(time) % points.length;
    const pulse = 0.5 + 0.5 * Math.sin(timestamp / 700);

    points.forEach((node, index) => {
      drawNode(node, node.id === state.heroFocus || index === activeIndex, pulse);
    });

    const segmentIndex = Math.floor((time * 1.3) % segments.length);
    const [fromIndex, toIndex] = segments[segmentIndex];
    const from = pointAt(fromIndex);
    const to = pointAt(toIndex);
    const progress = time % 1;
    const dotX = from.x + (to.x - from.x) * progress;
    const dotY = from.y + (to.y - from.y) * progress;

    ctx.fillStyle = "rgba(180, 83, 9, 0.95)";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(15, 118, 110, 0.9)";
    ctx.beginPath();
    ctx.arc(dotX + 12, dotY + 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (!reducedMotion.matches) {
      frame = requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  reducedMotion.addEventListener?.("change", resize);
  resize();

  if (!reducedMotion.matches) {
    frame = requestAnimationFrame(draw);
  }

  return () => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    window.removeEventListener("resize", resize);
  };
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const methodButton = event.target.closest("[data-method]");
    if (methodButton) {
      state.methodId = methodButton.dataset.method;
      renderMethods();
      return;
    }

    const misconceptionButton = event.target.closest("[data-misconception]");
    if (misconceptionButton) {
      state.misconceptionId = misconceptionButton.dataset.misconception;
      renderMisconceptions();
      return;
    }

    const caseButton = event.target.closest("[data-case]");
    if (caseButton) {
      state.caseId = caseButton.dataset.case;
      renderCases();
      return;
    }

    const quoteFilter = event.target.closest("[data-quote-filter]");
    if (quoteFilter) {
      state.quoteFilter = quoteFilter.dataset.quoteFilter;
      renderQuotes();
      return;
    }

    const quoteButton = event.target.closest("[data-quote]");
    if (quoteButton) {
      state.quoteId = quoteButton.dataset.quote;
      renderQuotes();
      return;
    }

    const practiceButton = event.target.closest("[data-practice]");
    if (practiceButton) {
      state.practiceId = practiceButton.dataset.practice;
      state.practiceChoice = null;
      state.practiceSubmitted = false;
      renderPractice();
      return;
    }

    const answerButton = event.target.closest("[data-answer]");
    if (answerButton) {
      state.practiceChoice = Number(answerButton.dataset.answer);
      state.practiceSubmitted = false;
      renderPractice();
      return;
    }

    const resourceFilter = event.target.closest("[data-resource-filter]");
    if (resourceFilter) {
      state.resourceFilter = resourceFilter.dataset.resourceFilter;
      renderResources();
      return;
    }

    const focusChip = event.target.closest("[data-focus]");
    if (focusChip) {
      setHeroFocus(focusChip.dataset.focus);
    }
  });

  document.querySelectorAll(".focus-chip").forEach((chip) => {
    chip.addEventListener("mouseenter", () => {
      setHeroFocus(chip.dataset.focus);
    });
    chip.addEventListener("focus", () => {
      setHeroFocus(chip.dataset.focus);
    });
  });

  const focusStrip = document.querySelector(".focus-strip");
  if (focusStrip) {
    focusStrip.addEventListener("pointerleave", () => {
      setHeroFocus("question");
    });
  }

  dom.resourceSearch.addEventListener("input", (event) => {
    state.resourceQuery = event.target.value;
    renderResources();
  });

  dom.externalSearch.addEventListener("click", () => {
    const query = dom.resourceSearch.value.trim() || "批判性思维";
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query + " critical thinking")}`;
    window.open(url, "_blank", "noreferrer");
  });

  document.addEventListener("click", (event) => {
    const submitButton = event.target.closest("#practice-submit");
    if (submitButton) {
      const item = findById(practiceItems, state.practiceId);
      if (state.practiceChoice === null) {
        return;
      }
      state.practiceSubmitted = true;
      state.practiceCompletedIds.add(item.id);
      renderPractice();
      return;
    }

    const nextButton = event.target.closest("#practice-next");
    if (nextButton) {
      const currentIndex = practiceItems.findIndex((item) => item.id === state.practiceId);
      const nextItem = practiceItems[(currentIndex + 1) % practiceItems.length];
      state.practiceId = nextItem.id;
      state.practiceChoice = null;
      state.practiceSubmitted = false;
      renderPractice();
    }
  });

  window.addEventListener("scroll", updateSectionNav, { passive: true });
}

function init() {
  renderMethods();
  renderMisconceptions();
  renderCases();
  renderQuotes();
  renderPractice();
  renderResources();
  renderHeroNote();
  updateHeroChipState();
  bindEvents();
  setupHeroCanvas();
  updateSectionNav();
}

if (typeof CanvasRenderingContext2D !== "undefined" && !("roundRect" in CanvasRenderingContext2D.prototype)) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    const radius = Array.isArray(r) ? r : [r, r, r, r];
    this.beginPath();
    this.moveTo(x + radius[0], y);
    this.lineTo(x + w - radius[1], y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius[1]);
    this.lineTo(x + w, y + h - radius[2]);
    this.quadraticCurveTo(x + w, y + h, x + w - radius[2], y + h);
    this.lineTo(x + radius[3], y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius[3]);
    this.lineTo(x, y + radius[0]);
    this.quadraticCurveTo(x, y, x + radius[0], y);
    this.closePath();
  };
}

init();
