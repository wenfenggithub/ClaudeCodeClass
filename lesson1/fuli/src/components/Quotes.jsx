const QUOTES = [
  {
    text: '复利是世界第八大奇迹。理解它的人，赚取它；不理解它的人，支付它。',
    author: '阿尔伯特·爱因斯坦',
    role: '理论物理学家 · 诺贝尔奖得主',
    avatar: '🧠',
    color: '#8b5cf6',
    demo: '10万 × (1+10%)^30 = 174.5万 → 30年翻17倍',
  },
  {
    text: '人生就像滚雪球，重要的是找到很湿的雪和很长的坡。',
    author: '沃伦·巴菲特',
    role: '伯克希尔·哈撒韦董事长 · "股神"',
    avatar: '💰',
    color: '#f59e0b',
    demo: '湿的雪 = 好公司（高ROE）\n很长的坡 = 长期持有（60年）→ $10,000 → $563,475,000',
  },
  {
    text: '理解复利的威力和获得它的难度，是理解许多事情的核心。',
    author: '查理·芒格',
    role: '伯克希尔·哈撒韦副董事长 · 巴菲特搭档',
    avatar: '📚',
    color: '#3b82f6',
    demo: '复利需要两步：① 找到正收益；② 坚持足够久。两者都很难——大多数人在第②步失败。',
  },
  {
    text: '钱能生钱，生出来的钱又能生更多。',
    author: '本杰明·富兰克林',
    role: '美国开国元勋 · 发明家 · 思想家',
    avatar: '⚡',
    color: '#10b981',
    demo: '富兰克林1790年遗赠$5,000给波士顿，200年后变成了$5,000,000+，完美诠释了这句话。',
  },
  {
    text: '复利是投资者最好的朋友，时间是最强大的武器。',
    author: '约翰·博格',
    role: '先锋集团创始人 · "指数基金之父"',
    avatar: '🏛️',
    color: '#ec4899',
    demo: 'S&P 500指数基金年化10%，扣除极低费率后，复利效应几乎完整保留。省下的费率也是复利的一部分。',
  },
]

export default function Quotes() {
  return (
    <section id="quotes" className="section">
      <span className="section-label">角度三</span>
      <h2 className="section-title">名言与智慧</h2>
      <p className="section-subtitle">大师们如何理解复利？每一句名言背后都藏着深刻的数学与人生哲理</p>

      <div className="quotes-grid">
        {QUOTES.map((q, i) => (
          <div
            className="quote-card fade-in"
            key={i}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              className="quote-card__avatar"
              style={{ background: `${q.color}20`, color: q.color }}
            >
              {q.avatar}
            </div>
            <div className="quote-card__text">
              {q.text}
            </div>
            <div className="quote-card__author">{q.author}</div>
            <div className="quote-card__role">{q.role}</div>
            <div className="quote-card__demo">
              {q.demo.split('\n').map((line, j) => (
                <div key={j}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
