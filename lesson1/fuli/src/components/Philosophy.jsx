import { useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

function OnePercentRule() {
  const chartData = {
    labels: Array.from({ length: 365 }, (_, i) => `第${i + 1}天`),
    datasets: [
      {
        label: '每天进步 1%',
        data: Array.from({ length: 365 }, (_, i) => Math.pow(1.01, i + 1)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2.5,
      },
      {
        label: '每天退步 1%',
        data: Array.from({ length: 365 }, (_, i) => Math.pow(0.99, i + 1)),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 16, font: { size: 12 } } },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30,41,59,0.3)' },
        ticks: { color: '#64748b', font: { size: 10 }, callback: (_, i) => i % 60 === 0 ? `第${i + 1}天` : '' },
      },
      y: {
        grid: { color: 'rgba(30,41,59,0.3)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  }

  return (
    <div className="one-percent-banner fade-in">
      <h3>1% 法则 — 复利最震撼的日常演绎</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
        每天只改变 1%，一年后的差距有多大？以下是数学的答案。
      </p>
      <div className="one-percent-formula">
        <div className="one-percent-item">
          <div className="formula">1.01<sup>365</sup></div>
          <div className="result up">37.78</div>
          <div className="desc">每天进步 1%，一年后是原来的 37.8 倍</div>
        </div>
        <div className="one-percent-item">
          <div className="formula">0.99<sup>365</sup></div>
          <div className="result down">0.03</div>
          <div className="desc">每天退步 1%，一年后只剩原来的 3%</div>
        </div>
      </div>
      <div style={{ height: 280, marginTop: 32 }}>
        <Line data={chartData} options={opts} />
      </div>
    </div>
  )
}

function KnowledgeCompound() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = (canvas.width = canvas.offsetWidth * devicePixelRatio)
    const H = (canvas.height = canvas.offsetHeight * devicePixelRatio)
    ctx.scale(devicePixelRatio, devicePixelRatio)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    const nodes = []
    const centerX = w / 2
    const centerY = h / 2

    // Generate nodes from center outward
    for (let layer = 0; layer < 5; layer++) {
      const count = layer === 0 ? 1 : layer * 4 + 2
      const radius = layer * 35 + 10
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i - Math.PI / 2
        nodes.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          layer,
          angle,
          radius: 3 + layer * 0.5,
        })
      }
    }

    let frame = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, w, h)

      const visibleLayers = Math.min(5, 1 + Math.floor(frame / 40))

      // Draw connections
      ctx.strokeStyle = 'rgba(245,158,11,0.2)'
      ctx.lineWidth = 0.8
      nodes.forEach((a, i) => {
        if (a.layer > visibleLayers) return
        nodes.forEach((b, j) => {
          if (j <= i) return
          if (b.layer > visibleLayers) return
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 65) {
            const alpha = 1 - dist / 65
            ctx.strokeStyle = `rgba(245,158,11,${alpha * 0.3})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      nodes.forEach((n) => {
        if (n.layer > visibleLayers) return
        const alpha = n.layer === 0 ? 1 : (n.layer <= visibleLayers ? 0.8 : 0.2)
        const pulse = Math.sin(frame * 0.05 + n.layer) * 0.3 + 1
        const r = n.radius * pulse

        ctx.fillStyle = `rgba(245,158,11,${alpha})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()

        if (n.layer === 0) {
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      if (visibleLayers < 5) {
        requestAnimationFrame(animate)
      }
    }
    animate()
  }, [])

  return (
    <div className="phil-card">
      <div className="phil-card__icon">🧩</div>
      <h3>知识复利</h3>
      <p>
        每一个新概念都是一条新的"知识连线"。当你学到第 5 个领域时，概念间的交叉连接不再是线性增长——而是<strong>组合爆炸</strong>。
        每天阅读 30 分钟，一年就是 182 小时，足以掌握 2-3 个全新领域的基础框架。
      </p>
      <canvas ref={canvasRef} style={{ width: '100%', height: 200, marginTop: 16, borderRadius: 8 }} />
    </div>
  )
}

function HabitCompound() {
  return (
    <div className="phil-card">
      <div className="phil-card__icon">🔄</div>
      <h3>习惯复利</h3>
      <p>
        好习惯是最稳定的"正收益率资产"：每天健身 → 体能指数增长；每天写作 → 思维深度指数增长。
      </p>
      <div style={{ marginTop: 16, background: 'var(--bg-secondary)', borderRadius: 8, padding: 16 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>习惯复利换算器</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          <div>🏃 每天跑步 20 分钟 → 一年 121 小时 → 约 15 个马拉松</div>
          <div>📖 每天阅读 30 分钟 → 一年 182 小时 → 约 30-40 本书</div>
          <div>✍️ 每天写作 500 字 → 一年 18 万字 → 相当于 2 本书</div>
          <div>💰 每天省 30 元投资 → 年化 8% → 30 年后 {(() => {
            const monthly = 30 * 30
            const r = 0.08 / 12
            const n = 30 * 12
            const fv = monthly * ((Math.pow(1 + r, n) - 1) / r)
            if (fv >= 1e4) return (fv / 1e4).toFixed(1) + ' 万'
            return Math.round(fv).toLocaleString()
          })()} 元</div>
        </div>
      </div>
    </div>
  )
}

function RelationshipCompound() {
  return (
    <div className="phil-card">
      <div className="phil-card__icon">🤝</div>
      <h3>关系复利</h3>
      <p>
        信任就像存款——每次兑现承诺，都在往账户里存入一笔"信任本金"。这些信任会自我增值：
        一次成功的合作带来更多合作机会，良好的口碑会通过人际网络指数传播。
      </p>
      <p style={{ marginTop: 12 }}>
        反过来，失信就像信用卡负债——每次背弃承诺都会让"信任债务"以复利速度膨胀，直到无法挽回。
      </p>
      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>关系复利公式</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-light)' }}>
          信任 = (一致性 × 时间)^真诚度
        </div>
      </div>
    </div>
  )
}

export default function Philosophy() {
  return (
    <section id="philosophy" className="section">
      <span className="section-label">角度五</span>
      <h2 className="section-title">生活与哲学：复利思维</h2>
      <p className="section-subtitle">复利不仅是金融概念——它是一种看待世界的方式</p>

      <div className="phil-grid">
        <OnePercentRule />
        <KnowledgeCompound />
        <HabitCompound />
        <RelationshipCompound />
      </div>
    </section>
  )
}
