import { useState, useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
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

const FMT = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 })

function fmt(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + ' 万'
  return FMT.format(n)
}

function compound(P, r, t) {
  return P * Math.pow(1 + r, t)
}

function simple(P, r, t) {
  return P * (1 + r * t)
}

export default function Calculator() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(30)
  const [mode, setMode] = useState('lump') // 'lump' | 'dca'
  const [monthly, setMonthly] = useState(2000)

  const compoundFinal = compound(principal, rate / 100, years)
  const simpleFinal = simple(principal, rate / 100, years)
  const totalInterest = compoundFinal - principal
  const multiple = compoundFinal / principal

  // Rule of 72
  const rule72Years = (72 / rate).toFixed(1)

  // Data points for compound vs simple interest chart
  const lineData = useMemo(() => {
    const labels = []
    const compoundData = []
    const simpleData = []
    for (let y = 1; y <= years; y++) {
      labels.push(`第${y}年`)
      compoundData.push(compound(principal, rate / 100, y))
      simpleData.push(simple(principal, rate / 100, y))
    }
    return {
      labels,
      datasets: [
        {
          label: '复利收益',
          data: compoundData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f59e0b',
          borderWidth: 2.5,
        },
        {
          label: '单利收益',
          data: simpleData,
          borderColor: '#64748b',
          borderDash: [6, 4],
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#94a3b8',
          borderWidth: 1.5,
        },
      ],
    }
  }, [principal, rate, years])

  // Doubling points (Rule of 72)
  const doubleYears = useMemo(() => {
    const pts = []
    let target = principal
    for (let i = 0; i < 3; i++) {
      target *= 2
      const y = Math.log(target / principal) / Math.log(1 + rate / 100)
      if (y <= years) pts.push({ year: y.toFixed(1), amount: target })
    }
    return pts
  }, [principal, rate, years])

  // DCA calculation
  const dcaResult = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    const months = years * 12
    const futureValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    const totalInvested = monthly * months
    return { futureValue, totalInvested }
  }, [monthly, rate, years])

  // DCA vs Lump sum bar chart
  const dcaBarData = useMemo(() => {
    const lumpFinal = compound(principal, rate / 100, years)
    return {
      labels: ['一次性投入', '每月定投'],
      datasets: [
        {
          label: '累计投入',
          data: [principal, dcaResult.totalInvested],
          backgroundColor: 'rgba(148,163,184,0.5)',
          borderRadius: 6,
        },
        {
          label: '最终市值',
          data: [lumpFinal, dcaResult.futureValue],
          backgroundColor: 'rgba(245,158,11,0.7)',
          borderRadius: 6,
        },
      ],
    }
  }, [principal, rate, years, dcaResult, monthly])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', usePointStyle: true, padding: 20, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: '#1a1f2e',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30,41,59,0.5)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (v, i) => (i % Math.max(1, Math.floor(years / 10)) === 0 ? `第${i + 1}年` : ''),
        },
      },
      y: {
        grid: { color: 'rgba(30,41,59,0.5)' },
        ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => fmt(v) },
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } },
      y: { grid: { color: 'rgba(30,41,59,0.5)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => fmt(v) } },
    },
  }

  return (
    <section id="calculator" className="section">
      <span className="section-label">角度一</span>
      <h2 className="section-title">数学与直觉：互动计算器</h2>
      <p className="section-subtitle">拖动滑块调整参数，观察复利曲线如何随时间指数增长</p>

      <div className="calc-layout">
        {/* Controls */}
        <div className="calc-controls">
          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">本金</span>
              <span className="slider-value">{fmt(principal)}</span>
            </div>
            <input
              type="range" min="1000" max="1000000" step="1000" value={principal}
              onChange={e => setPrincipal(+e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">年化收益率</span>
              <span className="slider-value">{rate}%</span>
            </div>
            <input
              type="range" min="1" max="30" step="0.5" value={rate}
              onChange={e => setRate(+e.target.value)}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-label">投资年限</span>
              <span className="slider-value">{years} 年</span>
            </div>
            <input
              type="range" min="1" max="50" step="1" value={years}
              onChange={e => setYears(+e.target.value)}
            />
          </div>

          <div className="result-cards">
            <div className="result-card">
              <div className="result-card__label">最终金额</div>
              <div className="result-card__value result-card__value--accent">{fmt(compoundFinal)}</div>
            </div>
            <div className="result-card">
              <div className="result-card__label">总收益（复利 - 本金）</div>
              <div className="result-card__value">{fmt(totalInterest)}</div>
            </div>
            <div className="result-card">
              <div className="result-card__label">收益倍数</div>
              <div className="result-card__value">{multiple.toFixed(2)}x</div>
            </div>
          </div>

          <span className="rule72-badge">
            72法则：约 {rule72Years} 年翻倍
          </span>
        </div>

        {/* Chart Area */}
        <div>
          <div className="chart-wrapper">
            <div className="chart-header">
              <div className="chart-tabs">
                <button
                  className={`chart-tab${mode === 'lump' ? ' chart-tab--active' : ''}`}
                  onClick={() => setMode('lump')}
                >
                  一次性投入
                </button>
                <button
                  className={`chart-tab${mode === 'dca' ? ' chart-tab--active' : ''}`}
                  onClick={() => setMode('dca')}
                >
                  每月定投
                </button>
              </div>
              {mode === 'lump' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  复利比单利多赚 {fmt(compoundFinal - simpleFinal)}
                </span>
              )}
            </div>

            {mode === 'lump' ? (
              <>
                <div style={{ height: 320 }}>
                  <Line data={lineData} options={chartOptions} />
                </div>
                {doubleYears.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {doubleYears.map((d, i) => (
                      <span key={i} className="rule72-badge">
                        约 {d.year} 年 → {fmt(d.amount)}（{i === 0 ? '翻倍' : `${Math.pow(2, i + 1)}x`}）
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="dca-compare">
                  <div className="dca-card">
                    <h4>每月定投 {fmt(monthly)}</h4>
                    <div className="big gold">{fmt(dcaResult.futureValue)}</div>
                    <div className="sub">累计投入 {fmt(dcaResult.totalInvested)}</div>
                  </div>
                  <div className="dca-card">
                    <h4>一次性投入 {fmt(principal)}</h4>
                    <div className="big gold">{fmt(compoundFinal)}</div>
                    <div className="sub">累计投入 {fmt(principal)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label">每月定投金额</span>
                      <span className="slider-value">{fmt(monthly)}</span>
                    </div>
                    <input
                      type="range" min="500" max="50000" step="500" value={monthly}
                      onChange={e => setMonthly(+e.target.value)}
                    />
                  </div>
                  <div style={{ height: 220, marginTop: 16 }}>
                    <Bar data={dcaBarData} options={barOptions} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
