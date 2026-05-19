import { useState } from 'react'

function fmt(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' 万亿'
  if (n >= 1e8) return (n / 1e8).toFixed(1) + ' 亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + ' 万'
  return n.toLocaleString()
}

const EVENTS = [
  {
    year: '1626',
    label: '曼哈顿岛交易',
    icon: '🏝️',
    story: '1626 年，荷兰人以价值 24 美元的饰品从印第安人手中买下曼哈顿岛。如果印第安人将这笔钱按年化 7% 投资，到今天会是多少？',
    calc: () => {
      const years = 2026 - 1626
      const val = 24 * Math.pow(1.07, years)
      return `24 美元 × (1 + 7%)^${years} = ${fmt(val)} 美元\n这超过了曼哈顿岛当前所有房地产的总值。印第安人亏掉了一个帝国。`
    },
  },
  {
    year: '古印度',
    label: '棋盘麦粒问题',
    icon: '🌾',
    story: '传说国际象棋发明者向国王索要的奖励：第 1 格 1 粒麦子，第 2 格 2 粒，第 3 格 4 粒……每格翻倍，共 64 格。国王爽快答应，后来才发现这是一个天文数字。',
    calc: () => {
      const total = BigInt(2) ** BigInt(64) - BigInt(1)
      return `2^64 - 1 = ${total.toLocaleString()} 粒\n≈ 全人类几千年的粮食总产量。这就是指数增长（100%复利）的威力。`
    },
  },
  {
    year: '1926-至今',
    label: '美国股市百年',
    icon: '📈',
    story: '标普 500 指数从 1926 年到 2025 年的近 100 年历史中，年化收益率约 10%（含股息再投资）。10,000 美元的投资会变成多少？',
    calc: () => {
      const val = 10000 * Math.pow(1.10, 99)
      return `$10,000 × (1 + 10%)^99 ≈ ${fmt(val)} 美元\n这就是为什么"长期持有指数基金"是普通投资者最有效的策略。`
    },
  },
  {
    year: '1965-2025',
    label: '巴菲特的雪球',
    icon: '❄️',
    story: '沃伦·巴菲特从 1965 年接管伯克希尔·哈撒韦，60 年间实现了约 20% 的年化回报率。初始投资 1 万美元的投资者，最终会获得多少？',
    calc: () => {
      const val = 10000 * Math.pow(1.20, 60)
      return `$10,000 × (1 + 20%)^60 = ${fmt(val)} 美元\n巴菲特的秘诀不是某一年赚得多，而是持续 60 年不亏损并保持复利增长。`
    },
  },
  {
    year: '1990-2020',
    label: '日本失去的三十年',
    icon: '📉',
    story: '1990 年日本泡沫经济破裂后，日经指数从 38,957 点跌至低位，随后近 30 年零利率甚至负利率。复利在零增长环境下完全失效。',
    calc: () => {
      const val = 10000 * Math.pow(1.001, 30)
      return `假设年化 0.1% 的"超低复利"：\n10,000 × (1 + 0.1%)^30 ≈ ${fmt(val)} 日元\n30 年几乎原地踏步。没有增长，就没有复利。复利的前提是正收益率 + 足够长的时间。`
    },
  },
]

export default function Timeline() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <section id="timeline" className="section">
      <span className="section-label">角度二</span>
      <h2 className="section-title">历史与故事</h2>
      <p className="section-subtitle">穿越时空，看看复利在历史中留下的惊人痕迹</p>

      <div className="timeline-wrap">
        <div className="timeline-track">
          {EVENTS.map((ev, i) => (
            <div
              key={i}
              className={`timeline-node${i === activeIdx ? ' timeline-node--active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <div className="timeline-dot" />
              <div className="timeline-year">{ev.year}</div>
              <div className="timeline-label">{ev.icon} {ev.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-detail" key={activeIdx}>
        <h4>{EVENTS[activeIdx].icon} {EVENTS[activeIdx].label}</h4>
        <p className="story">{EVENTS[activeIdx].story}</p>
        <div className="calc-note">
          {EVENTS[activeIdx].calc().split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
