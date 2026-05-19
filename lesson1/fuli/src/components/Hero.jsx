import { useEffect, useRef, useState, useCallback } from 'react'

const QUOTES = [
  { text: '复利是世界第八大奇迹。理解它的人，赚取它；不理解的人，支付它。', author: '阿尔伯特·爱因斯坦' },
  { text: '人生就像滚雪球，重要的是找到很湿的雪和很长的坡。', author: '沃伦·巴菲特' },
  { text: '理解复利的威力和获得它的难度，是理解许多事情的核心。', author: '查理·芒格' },
]

export default function Hero() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const progressRef = useRef(0)
  const [quoteIdx, setQuoteIdx] = useState(0)

  // Rotate quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx(i => (i + 1) % QUOTES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth * devicePixelRatio
    const H = canvas.height = canvas.offsetHeight * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    const p = progressRef.current

    // Grid
    ctx.strokeStyle = 'rgba(30,41,59,0.4)'
    ctx.lineWidth = 0.5
    const gridSize = 50
    for (let x = gridSize; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = gridSize; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    // Compound interest curve
    const margin = { left: w * 0.08, right: w * 0.08, top: h * 0.15, bottom: h * 0.15 }
    const plotW = w - margin.left - margin.right
    const plotH = h - margin.top - margin.bottom

    // Axes
    ctx.strokeStyle = 'rgba(148,163,184,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + plotH)
    ctx.lineTo(margin.left + plotW, margin.top + plotH)
    ctx.stroke()

    // Curve points (compound interest: A = P(1+r)^t)
    // Normalize: x = t/maxT, y = (A-P)/maxGrowth  (simplified scaling)
    const points = []
    const steps = 200
    const rate = 0.08
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 50
      const value = Math.pow(1 + rate, t)
      const x = margin.left + (i / steps) * plotW * p
      // Logarithmic-ish scaling for visual appeal
      const maxVal = Math.pow(1 + rate, 50)
      const y = margin.top + plotH - (value / maxVal) * plotH * 0.85
      points.push({ x, y, t, value })
    }

    // Draw filled area under curve
    if (points.length > 1) {
      const grad = ctx.createLinearGradient(0, margin.top, 0, margin.top + plotH)
      grad.addColorStop(0, 'rgba(245,158,11,0.25)')
      grad.addColorStop(1, 'rgba(245,158,11,0.0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(points[0].x, margin.top + plotH)
      for (const pt of points) ctx.lineTo(pt.x, pt.y)
      ctx.lineTo(points[points.length - 1].x, margin.top + plotH)
      ctx.closePath()
      ctx.fill()
    }

    // Draw curve line
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,158,11,0.4)'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Glow dot at the leading edge
    if (points.length > 0) {
      const last = points[points.length - 1]
      const glowGrad = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 15)
      glowGrad.addColorStop(0, 'rgba(251,191,36,1)')
      glowGrad.addColorStop(0.4, 'rgba(245,158,11,0.6)')
      glowGrad.addColorStop(1, 'rgba(245,158,11,0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(last.x, last.y, 15, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(last.x, last.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // Floating particles around the curve tip (only a few)
    if (points.length > 0 && p > 0.1) {
      const last = points[points.length - 1]
      const seed = Date.now() / 2000
      for (let i = 0; i < 5; i++) {
        const angle = seed + i * 1.3
        const dist = 20 + Math.sin(seed * 2 + i) * 10
        const px = last.x + Math.cos(angle) * dist
        const py = last.y + Math.sin(angle) * dist
        const alpha = 0.3 + Math.sin(seed * 3 + i) * 0.2
        ctx.fillStyle = `rgba(251,191,36,${alpha})`
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Axis labels
    ctx.fillStyle = '#64748b'
    ctx.font = '11px "Inter","PingFang SC","Microsoft YaHei",sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('时间（年）', margin.left + plotW / 2, margin.top + plotH + 30)

    ctx.save()
    ctx.translate(margin.left - 30, margin.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('财富增长', 0, 0)
    ctx.restore()
  }, [])

  useEffect(() => {
    let start = null
    const duration = 3000

    const animate = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      progressRef.current = Math.min(1, elapsed / duration)
      draw()
      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animRef.current = requestAnimationFrame(animate)

    const onResize = () => draw()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [draw])

  return (
    <section id="hero" className="hero-section">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-content">
        <h1 className="hero-title">复利的力量</h1>
        <p className="hero-formula">
          A = P × (1 + <em>r</em>)<sup>t</sup>
        </p>
        <div className="hero-quote-wrap">
          <p className="hero-quote" key={quoteIdx}>
            "{QUOTES[quoteIdx].text}"
          </p>
          <p className="hero-quote-author">— {QUOTES[quoteIdx].author}</p>
        </div>
      </div>
      <div className="hero-scroll">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        向下滚动探索
      </div>
    </section>
  )
}
