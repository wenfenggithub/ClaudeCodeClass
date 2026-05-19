const defaultScenario = {
  principal: 10000,
  annualRate: 0.08,
  years: 40,
  annualContribution: 0,
  frequency: 1,
};

const state = {
  ...defaultScenario,
  selectedYear: defaultScenario.years,
  viewMode: "both",
};

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("zh-CN", {
  style: "percent",
  maximumFractionDigits: 1,
});

const frequencyLabels = {
  1: "按年复利",
  4: "按季度复利",
  12: "按月复利",
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function compoundGrow(value, annualRate, frequency) {
  return value * Math.pow(1 + annualRate / frequency, frequency);
}

function simpleValueWithContributions(principal, annualRate, annualContribution, year) {
  let value = principal * (1 + annualRate * year);

  for (let contributionYear = 1; contributionYear <= year; contributionYear += 1) {
    value += annualContribution * (1 + annualRate * (year - contributionYear));
  }

  return value;
}

function createAnnualData({ principal, annualRate, years, annualContribution, frequency }) {
  const data = [];
  let compound = principal;
  let invested = principal;

  for (let year = 0; year <= years; year += 1) {
    if (year > 0) {
      compound = compoundGrow(compound, annualRate, frequency) + annualContribution;
      invested += annualContribution;
    }

    const simple = simpleValueWithContributions(principal, annualRate, annualContribution, year);

    data.push({
      year,
      compound,
      simple,
      invested,
      principal,
      addedContributions: invested - principal,
      compoundGain: compound - invested,
      simpleGain: simple - invested,
    });
  }

  return data;
}

function formatCurrency(value) {
  return currencyFormatter.format(Math.round(value));
}

function formatAxisCurrency(value) {
  if (value >= 100000000) {
    return `${Math.round(value / 100000000)} 亿`;
  }

  if (value >= 10000) {
    return `${Math.round(value / 10000)} 万`;
  }

  return `${Math.round(value)}`;
}

function getMilestoneYears(years) {
  const candidates = [0, 10, 20, 30, 40, 50].filter((year) => year <= years);

  if (!candidates.includes(years)) {
    candidates.push(years);
  }

  return [...new Set(candidates)].sort((a, b) => a - b);
}

function getVisibleSeries(viewMode) {
  if (viewMode === "compound") {
    return [["compound", "chart-path chart-compound"]];
  }

  if (viewMode === "simple") {
    return [["simple", "chart-path chart-simple"]];
  }

  return [
    ["simple", "chart-path chart-simple"],
    ["compound", "chart-path chart-compound"],
  ];
}

function updateResultCards(data) {
  const finalRow = data[data.length - 1];
  const gainRatio = finalRow.compound > 0 ? finalRow.compoundGain / finalRow.compound : 0;

  document.querySelector("#finalValue").textContent = formatCurrency(finalRow.compound);
  document.querySelector("#totalInvested").textContent = formatCurrency(finalRow.invested);
  document.querySelector("#compoundGain").textContent = formatCurrency(finalRow.compoundGain);
  document.querySelector("#gainRatio").textContent = percentFormatter.format(gainRatio);
}

function updateMilestoneTable(data) {
  const years = data[data.length - 1].year;
  const rows = getMilestoneYears(years)
    .map((year) => {
      const row = data[year];
      return `
        <tr>
          <td>第 ${year} 年</td>
          <td>${formatCurrency(row.compound)}</td>
        </tr>
      `;
    })
    .join("");

  document.querySelector("#milestoneRows").innerHTML = rows;
}

function updateTimePanel(data) {
  const year = clamp(state.selectedYear, 0, state.years);
  const row = data[year];

  document.querySelector("#currentYearLabel").textContent = String(year);
  document.querySelector("#currentYearSummary").textContent =
    `${frequencyLabels[state.frequency]}，累计收益 ${formatCurrency(row.compoundGain)}`;
  document.querySelector("#currentCompound").textContent = formatCurrency(row.compound);
  document.querySelector("#currentInvested").textContent = formatCurrency(row.invested);
  document.querySelector("#currentGain").textContent = formatCurrency(row.compoundGain);

  const yearRange = document.querySelector("#yearRange");
  yearRange.max = String(state.years);
  yearRange.value = String(year);
}

function updateComposition(data) {
  const finalRow = data[data.length - 1];
  const total = Math.max(finalRow.compound, 1);
  const principalWidth = (finalRow.principal / total) * 100;
  const contributionWidth = (finalRow.addedContributions / total) * 100;
  const gainWidth = Math.max(0, (finalRow.compoundGain / total) * 100);

  document.querySelector("#principalSegment").style.width = `${principalWidth}%`;
  document.querySelector("#contributionSegment").style.width = `${contributionWidth}%`;
  document.querySelector("#gainSegment").style.width = `${gainWidth}%`;
  document.querySelector("#principalPart").textContent = formatCurrency(finalRow.principal);
  document.querySelector("#contributionPart").textContent = formatCurrency(finalRow.addedContributions);
  document.querySelector("#gainPart").textContent = formatCurrency(finalRow.compoundGain);
}

function findFirstYear(data, predicate) {
  const row = data.find(predicate);
  return row ? `第 ${row.year} 年` : "未达到";
}

function updateKeyNodes(data) {
  const finalRow = data[data.length - 1];
  const doubleTarget = finalRow.principal * 2;
  const tenYearsAgo = data[Math.max(0, finalRow.year - 10)];
  const lastDecadeGain = finalRow.compound - tenYearsAgo.compound;

  document.querySelector("#doubleYear").textContent = findFirstYear(
    data,
    (row) => row.compound >= doubleTarget,
  );
  document.querySelector("#gainOverPrincipalYear").textContent = findFirstYear(
    data,
    (row) => row.compoundGain >= row.principal,
  );
  document.querySelector("#lastDecadeGain").textContent = formatCurrency(lastDecadeGain);
}

function updateRiskNote() {
  const riskNote = document.querySelector("#riskNote");
  riskNote.hidden = state.annualRate < 0.15;
}

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function createLinePath(data, getX, getY, valueKey) {
  return data
    .map((item, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${getX(item.year).toFixed(2)} ${getY(item[valueKey]).toFixed(2)}`;
    })
    .join(" ");
}

function renderGrowthChart(data) {
  const svg = document.querySelector("#growthChart");
  const tooltip = document.querySelector("#chartTooltip");
  const width = 900;
  const height = 420;
  const margin = { top: 28, right: 26, bottom: 52, left: 76 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxYear = Math.max(1, data[data.length - 1].year);
  const visibleSeries = getVisibleSeries(state.viewMode);
  const values = data.flatMap((item) => [
    item.invested,
    ...visibleSeries.map(([key]) => item[key]),
  ]);
  const maxValue = Math.max(...values, 1) * 1.08;

  svg.replaceChildren();

  const getX = (year) => margin.left + (year / maxYear) * innerWidth;
  const getY = (value) => margin.top + innerHeight - (value / maxValue) * innerHeight;

  const yTicks = 5;
  for (let index = 0; index <= yTicks; index += 1) {
    const value = (maxValue / yTicks) * index;
    const y = getY(value);

    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y,
        y2: y,
        class: "chart-grid",
      }),
    );

    svg.appendChild(
      createSvgElement("text", {
        x: margin.left - 14,
        y: y + 4,
        "text-anchor": "end",
        class: "chart-label",
      }),
    ).textContent = formatAxisCurrency(value);
  }

  getMilestoneYears(maxYear).forEach((year) => {
    const x = getX(year);

    svg.appendChild(
      createSvgElement("line", {
        x1: x,
        x2: x,
        y1: margin.top,
        y2: height - margin.bottom,
        class: "chart-grid",
      }),
    );

    svg.appendChild(
      createSvgElement("text", {
        x,
        y: height - margin.bottom + 30,
        "text-anchor": "middle",
        class: "chart-label",
      }),
    ).textContent = `${year} 年`;
  });

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      x2: width - margin.right,
      y1: height - margin.bottom,
      y2: height - margin.bottom,
      class: "chart-axis",
    }),
  );

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      x2: margin.left,
      y1: margin.top,
      y2: height - margin.bottom,
      class: "chart-axis",
    }),
  );

  svg.appendChild(
    createSvgElement("path", {
      d: createLinePath(data, getX, getY, "invested"),
      class: "chart-path chart-invested",
    }),
  );

  visibleSeries.forEach(([key, className]) => {
    svg.appendChild(
      createSvgElement("path", {
        d: createLinePath(data, getX, getY, key),
        class: className,
      }),
    );
  });

  const selectedRow = data[state.selectedYear];
  const selectedX = getX(selectedRow.year);
  const selectedKey = state.viewMode === "simple" ? "simple" : "compound";

  svg.appendChild(
    createSvgElement("line", {
      x1: selectedX,
      x2: selectedX,
      y1: margin.top,
      y2: height - margin.bottom,
      class: "chart-selected-line",
    }),
  );

  svg.appendChild(
    createSvgElement("circle", {
      cx: selectedX,
      cy: getY(selectedRow[selectedKey]),
      r: 7,
      class: "chart-selected-dot",
    }),
  );

  const hoverGroup = createSvgElement("g", { opacity: "0" });
  const hoverLine = createSvgElement("line", {
    y1: margin.top,
    y2: height - margin.bottom,
    class: "chart-hover-line",
  });
  const compoundMarker = createSvgElement("circle", {
    r: 6,
    class: "chart-marker",
    stroke: "var(--green)",
  });
  const simpleMarker = createSvgElement("circle", {
    r: 5,
    class: "chart-marker",
    stroke: "var(--teal)",
  });

  hoverGroup.append(hoverLine, simpleMarker, compoundMarker);
  svg.appendChild(hoverGroup);

  const overlay = createSvgElement("rect", {
    x: margin.left,
    y: margin.top,
    width: innerWidth,
    height: innerHeight,
    fill: "transparent",
  });

  function updateHover(clientX) {
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const x = (clientX - rect.left) * scaleX;
    const clampedX = Math.max(margin.left, Math.min(width - margin.right, x));
    const year = Math.round(((clampedX - margin.left) / innerWidth) * maxYear);
    const row = data[year];
    const markerX = getX(row.year);

    hoverGroup.setAttribute("opacity", "1");
    hoverLine.setAttribute("x1", markerX);
    hoverLine.setAttribute("x2", markerX);
    compoundMarker.setAttribute("cx", markerX);
    compoundMarker.setAttribute("cy", getY(row.compound));
    simpleMarker.setAttribute("cx", markerX);
    simpleMarker.setAttribute("cy", getY(row.simple));
    compoundMarker.setAttribute(
      "opacity",
      state.viewMode === "simple" ? "0" : "1",
    );
    simpleMarker.setAttribute(
      "opacity",
      state.viewMode === "compound" ? "0" : "1",
    );

    const detailLines = [
      state.viewMode !== "simple" ? `<span>复利：${formatCurrency(row.compound)}</span>` : "",
      state.viewMode !== "compound" ? `<span>单利：${formatCurrency(row.simple)}</span>` : "",
      `<span>总投入：${formatCurrency(row.invested)}</span>`,
      `<span>累计收益：${formatCurrency(row.compoundGain)}</span>`,
    ].join("");

    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>第 ${row.year} 年</strong>${detailLines}`;

    const tooltipX = (markerX / width) * rect.width;
    const tooltipY = ((Math.min(getY(row.compound), getY(row.simple)) - 8) / height) * rect.height;
    const nextLeft = Math.min(rect.width - 218, Math.max(8, tooltipX + 14));
    const nextTop = Math.min(rect.height - 130, Math.max(8, tooltipY));

    tooltip.style.left = `${nextLeft}px`;
    tooltip.style.top = `${nextTop}px`;
  }

  overlay.addEventListener("pointermove", (event) => {
    updateHover(event.clientX);
  });

  overlay.addEventListener("pointerleave", () => {
    hoverGroup.setAttribute("opacity", "0");
    tooltip.hidden = true;
  });

  svg.appendChild(overlay);
}

function readControlValue(inputId, fallback) {
  const value = Number(document.querySelector(inputId).value);
  return Number.isFinite(value) ? value : fallback;
}

function syncControlPair(rangeId, inputId, value) {
  document.querySelector(rangeId).value = String(value);
  document.querySelector(inputId).value = String(value);
}

function readStateFromControls() {
  const principal = clamp(readControlValue("#principalInput", defaultScenario.principal), 1000, 1000000);
  const annualRatePercent = clamp(readControlValue("#rateInput", defaultScenario.annualRate * 100), 0, 30);
  const years = clamp(Math.round(readControlValue("#yearsInput", defaultScenario.years)), 1, 50);
  const annualContribution = clamp(
    readControlValue("#contributionInput", defaultScenario.annualContribution),
    0,
    200000,
  );
  const frequency = Number(document.querySelector("#frequencyInput").value);

  state.principal = principal;
  state.annualRate = annualRatePercent / 100;
  state.years = years;
  state.annualContribution = annualContribution;
  state.frequency = frequency;
  state.selectedYear = clamp(state.selectedYear, 0, years);

  syncControlPair("#principalRange", "#principalInput", principal);
  syncControlPair("#rateRange", "#rateInput", annualRatePercent);
  syncControlPair("#yearsRange", "#yearsInput", years);
  syncControlPair("#contributionRange", "#contributionInput", annualContribution);
}

function updatePresetState() {
  document.querySelectorAll(".preset-button").forEach((button) => {
    const rate = Number(button.dataset.rate);
    button.classList.toggle("is-active", Math.abs(rate - state.annualRate) < 0.0001);
  });
}

function render() {
  const annualData = createAnnualData(state);

  updateResultCards(annualData);
  updateMilestoneTable(annualData);
  updateTimePanel(annualData);
  updateComposition(annualData);
  updateKeyNodes(annualData);
  updatePresetState();
  updateRiskNote();
  renderGrowthChart(annualData);
}

function handleControlInput(event) {
  const pairs = {
    principalRange: "principalInput",
    principalInput: "principalRange",
    rateRange: "rateInput",
    rateInput: "rateRange",
    yearsRange: "yearsInput",
    yearsInput: "yearsRange",
    contributionRange: "contributionInput",
    contributionInput: "contributionRange",
  };

  const targetId = event.target.id;
  if (pairs[targetId]) {
    document.querySelector(`#${pairs[targetId]}`).value = event.target.value;
  }

  const yearsChanged = targetId === "yearsRange" || targetId === "yearsInput";
  readStateFromControls();
  if (yearsChanged) {
    state.selectedYear = state.years;
  }
  render();
}

function bindControls() {
  [
    "#principalRange",
    "#principalInput",
    "#rateRange",
    "#rateInput",
    "#yearsRange",
    "#yearsInput",
    "#contributionRange",
    "#contributionInput",
    "#frequencyInput",
  ].forEach((selector) => {
    document.querySelector(selector).addEventListener("input", handleControlInput);
  });

  document.querySelector("#yearRange").addEventListener("input", (event) => {
    state.selectedYear = Number(event.target.value);
    render();
  });

  document.querySelectorAll("input[name='viewMode']").forEach((input) => {
    input.addEventListener("change", (event) => {
      state.viewMode = event.target.value;
      render();
    });
  });

  document.querySelectorAll(".preset-button").forEach((button) => {
    button.addEventListener("click", () => {
      const ratePercent = Number(button.dataset.rate) * 100;
      syncControlPair("#rateRange", "#rateInput", ratePercent);
      readStateFromControls();
      render();
    });
  });
}

function init() {
  bindControls();
  readStateFromControls();
  state.selectedYear = state.years;
  render();
}

window.addEventListener("DOMContentLoaded", init);
