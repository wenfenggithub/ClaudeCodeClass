import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend)

function fmt(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + ' 亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + ' 万'
  return n.toLocaleString('zh-CN')
}

function compound(P, r, t) { return P * Math.pow(1 + r, t) }
function simple(P, r, t) { return P * (1 + r * t) }

// 1. Simple vs Compound
function SimpleVsCompound() {
  const P = 100000; const r = 0.08; const T = 30
  const labels = Array.from({ length: T }, (_, i) => `第${i + 1}年`)
  const compoundData = labels.map((_, i) => compound(P, r, i + 1))
  const simpleData = labels.map((_, i) => simple(P, r, i + 1))

  const data = {
    labels: labels.filter((_, i) => i % 3 === 0),
    datasets: [
      { label: '复利', data: compoundData.filter((_, i) => i % 3 === 0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2.5 },
      { label: '单利', data: simpleData.filter((_, i) => i % 3 === 0), borderColor: '#64748b', borderDash: [6, 4], fill: false, tension: 0.3, pointRadius: 0, borderWidth: 1.5 },
    ],
  }

  const diff = compound(P, r, T) - simple(P, r, T)

  return (
    <div className="comparison-panel">
      <h3>单利 vs 复利</h3>
      <p className="desc">本金 10 万，年化 8%，30 年。两者起点相同，但终点天差地别。</p>
      <div className="comp-chart-row">
        <div style={{ height: 260 }}><Line data={data} options={miniLineOpts} /></div>
        <div>
          <div className="comp-stat"><div className="num amber">{fmt(compound(P, r, T))}</div><div className="lbl">复利终值</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num" style={{ color: '#94a3b8' }}>{fmt(simple(P, r, T))}</div><div className="lbl">单利终值</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num amber">{fmt(diff)}</div><div className="lbl">复利多赚</div></div>
        </div>
      </div>
      <div className="comp-insight">第 1 年两者几乎相同，第 30 年复利比单利多出 <strong>{fmt(diff)}</strong>——这就是指数增长的力量。</div>
    </div>
  )
}

// 2. Early vs Late Start
function EarlyVsLate() {
  const r = 0.08
  // A: starts at 25, invests 12000/yr for 10 years, then stops, grows to 65
  let balanceA = 0
  for (let y = 0; y < 10; y++) {
    balanceA = (balanceA + 12000) * (1 + r)
  }
  for (let y = 10; y < 40; y++) {
    balanceA = balanceA * (1 + r)
  }
  // B: starts at 35, invests 12000/yr for 30 years, grows to 65
  let balanceB = 0
  for (let y = 0; y < 30; y++) {
    balanceB = (balanceB + 12000) * (1 + r)
  }

  const totalA = 12000 * 10
  const totalB = 12000 * 30

  // Build chart data
  const labels = Array.from({ length: 41 }, (_, i) => i)
  const dataA = []; const dataB = []
  let balA = 0; let balB = 0
  for (let y = 0; y <= 40; y++) {
    if (y < 10) {
      balA = (balA + 12000) * (1 + r)
    } else {
      balA = balA * (1 + r)
    }
    if (y >= 10 && y < 40) {
      balB = (balB + 12000) * (1 + r)
    } else if (y >= 40) {
      balB = balB * (1 + r)
    }
    dataA.push(balA)
    dataB.push(balB)
  }

  const chartData = {
    labels: labels.filter((_, i) => i % 4 === 0).map(i => `${i + 25}岁`),
    datasets: [
      { label: 'A: 25岁开始投10年', data: dataA.filter((_, i) => i % 4 === 0), borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 0, fill: false },
      { label: 'B: 35岁开始投30年', data: dataB.filter((_, i) => i % 4 === 0), borderColor: '#3b82f6', borderWidth: 2.5, tension: 0.3, pointRadius: 0, fill: false },
    ],
  }

  return (
    <div className="comparison-panel">
      <h3>早开始 vs 晚开始</h3>
      <p className="desc">A 从 25 岁每年投 1.2 万投 10 年，B 从 35 岁每年投 1.2 万投 30 年。65 岁时谁更多？</p>
      <div className="comp-chart-row">
        <div style={{ height: 260 }}><Line data={chartData} options={miniLineOpts} /></div>
        <div>
          <div className="comp-stat"><div className="num amber">{fmt(balanceA)}</div><div className="lbl">A 最终（总投入 {fmt(totalA)}）</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num blue">{fmt(balanceB)}</div><div className="lbl">B 最终（总投入 {fmt(totalB)}）</div></div>
        </div>
      </div>
      <div className="comp-insight">A 投入更少（{fmt(totalA)} vs {fmt(totalB)}），但最终 <strong>更多</strong>！因为 A 的复利多了 10 年时间。时间，是复利中最不可替代的变量。</div>
    </div>
  )
}

// 3. Fee Trap
function FeeTrap() {
  const P = 100000; const rHigh = 0.08 - 0.01; const rLow = 0.08 - 0.001; const T = 30
  const valHigh = compound(P, rHigh, T)
  const valLow = compound(P, rLow, T)
  const eaten = valLow - valHigh

  return (
    <div className="comparison-panel">
      <h3>费率陷阱：1% 管理费吃掉你多少收益？</h3>
      <p className="desc">同样 10 万本金、8% 名义收益，1% 费率 vs 0.1% 费率，30 年后差距惊人。</p>
      <div className="comp-chart-row">
        <div style={{ height: 200 }}>
          <Bar
            data={{
              labels: ['0.1% 费率', '1% 费率'],
              datasets: [{ data: [valLow, valHigh], backgroundColor: ['#10b981', '#ef4444'], borderRadius: 8 }],
            }}
            options={{
              ...miniBarOpts,
              plugins: {
                ...miniBarOpts.plugins,
                tooltip: { callbacks: { label: (ctx) => fmt(ctx.raw) } },
              },
            }}
          />
        </div>
        <div>
          <div className="comp-stat"><div className="num green">{fmt(valLow)}</div><div className="lbl">0.1% 费率最终</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num red">{fmt(valHigh)}</div><div className="lbl">1% 费率最终</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num red">{fmt(eaten)}</div><div className="lbl">被费率吞噬的收益</div></div>
        </div>
      </div>
      <div className="comp-insight">区区 0.9% 的费率差，30 年吞噬了 <strong>{fmt(eaten)}</strong>——超过本金的 <strong>{(eaten / P * 100).toFixed(1)}%</strong>！这被称为"复利的黑暗面"。</div>
    </div>
  )
}

// 4. Inflation
function InflationErosion() {
  const P = 100000; const nominalR = 0.08; const inflation = 0.03; const T = 30
  const realR = (1 + nominalR) / (1 + inflation) - 1
  const nominalVal = compound(P, nominalR, T)
  const realVal = compound(P, realR, T)

  const labels = Array.from({ length: T }, (_, i) => `第${i + 1}年`)
  const nominalData = labels.map((_, i) => compound(P, nominalR, i + 1))
  const realData = labels.map((_, i) => compound(P, realR, i + 1))

  const chartData = {
    labels: labels.filter((_, i) => i % 3 === 0),
    datasets: [
      { label: '名义 8%', data: nominalData.filter((_, i) => i % 3 === 0), borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 0 },
      { label: `实际 ${(realR * 100).toFixed(1)}%`, data: realData.filter((_, i) => i % 3 === 0), borderColor: '#ef4444', borderWidth: 2, tension: 0.3, pointRadius: 0 },
    ],
  }

  return (
    <div className="comparison-panel">
      <h3>通胀侵蚀：你的"真实"复利是多少？</h3>
      <p className="desc">名义年化 8%，通胀 3%，实际收益率只有 4.85%。30 年后购买力差距巨大。</p>
      <div className="comp-chart-row">
        <div style={{ height: 260 }}><Line data={chartData} options={miniLineOpts} /></div>
        <div>
          <div className="comp-stat"><div className="num amber">{fmt(nominalVal)}</div><div className="lbl">名义终值（账面数字）</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num red">{fmt(realVal)}</div><div className="lbl">实际购买力（折现后）</div></div>
        </div>
      </div>
      <div className="comp-insight">通胀悄悄削弱复利效应。名义上赚了 {fmt(nominalVal - P)}，但实际购买力只增长了 {fmt(realVal - P)}。永远关注"实际收益率"。</div>
    </div>
  )
}

// 5. Negative Compound (Credit Card Debt)
function NegativeCompound() {
  const debt = 10000; const r = 0.18; const T = 5
  const labels = Array.from({ length: T * 12 }, (_, i) => `${i + 1}月`)
  const data = labels.map((_, i) => compound(debt, r / 12, i + 1))
  const finalDebt = compound(debt, r, T)

  const chartData = {
    labels: labels.filter((_, i) => i % 6 === 0),
    datasets: [
      { label: '债务雪球', data: data.filter((_, i) => i % 6 === 0), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2.5 },
    ],
  }

  return (
    <div className="comparison-panel">
      <h3>负复利：信用卡债务的黑洞</h3>
      <p className="desc">信用卡年利率 18%，欠款 1 万不还，5 年后会变成多少？这是复利最可怕的应用。</p>
      <div className="comp-chart-row">
        <div style={{ height: 260 }}><Line data={chartData} options={miniLineOpts} /></div>
        <div>
          <div className="comp-stat"><div className="num red">{fmt(debt)}</div><div className="lbl">原始欠款</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num red" style={{ fontSize: '1.8rem' }}>{fmt(finalDebt)}</div><div className="lbl">5 年后欠款</div></div>
          <div className="comp-stat" style={{ marginTop: 12 }}><div className="num red">{fmt(finalDebt - debt)}</div><div className="lbl">纯利息</div></div>
        </div>
      </div>
      <div className="comp-insight">爱因斯坦说："不理解复利的人，支付它。"信用卡 18% 的复利就是最好的例子。永远不要让复利在负债端为你"工作"。</div>
    </div>
  )
}

const miniLineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 16, font: { size: 11 } } },
    tooltip: {
      backgroundColor: '#1a1f2e', borderColor: '#334155', borderWidth: 1,
      callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.raw)}` },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(30,41,59,0.3)' }, ticks: { color: '#64748b', font: { size: 10 } } },
    y: { grid: { color: 'rgba(30,41,59,0.3)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => fmt(v) } },
  },
}

const miniBarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: 'rgba(30,41,59,0.3)' }, ticks: { color: '#64748b', callback: (v) => fmt(v) } },
  },
}

export default function Comparison() {
  return (
    <section id="comparison" className="section">
      <span className="section-label">角度四</span>
      <h2 className="section-title">对比与陷阱</h2>
      <p className="section-subtitle">复利并非只有美好的一面。理解它的陷阱，才能真正驾驭它。</p>
      <div className="comparison-grid">
        <SimpleVsCompound />
        <EarlyVsLate />
        <FeeTrap />
        <InflationErosion />
        <NegativeCompound />
      </div>
    </section>
  )
}
