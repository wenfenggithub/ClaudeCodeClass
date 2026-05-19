import { useState } from 'react'

const BOOKS = [
  {
    title: '穷查理宝典',
    author: '查理·芒格 / Peter D. Kaufman',
    desc: '芒格的智慧箴言录，涵盖投资、决策与人生哲学。复利思维贯穿全书。',
    icon: '📘',
    search: '穷查理宝典 查理芒格',
  },
  {
    title: '巴菲特致股东的信',
    author: '沃伦·巴菲特 / Lawrence Cunningham',
    desc: '从历年致股东信中提炼的投资精华。复利是巴菲特思想的核心关键词之一。',
    icon: '📗',
    search: '巴菲特致股东的信',
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    desc: '金钱心理学：为什么财富积累更多取决于行为而非智商。有专门的复利章节。',
    icon: '📙',
    search: 'The Psychology of Money 摩根豪泽尔',
  },
  {
    title: '滚雪球：巴菲特和他的财富人生',
    author: 'Alice Schroeder',
    desc: '巴菲特唯一授权的官方传记，书名本身就是对复利最形象的比喻。',
    icon: '📕',
    search: '滚雪球 巴菲特传记',
  },
  {
    title: '复利的力量',
    author: '多作者合集',
    desc: '系统阐述复利在投资、商业、个人成长中的应用，适合各阶段读者。',
    icon: '📓',
    search: '复利的力量 投资',
  },
]

export default function Resources() {
  const [keyword, setKeyword] = useState('')
  const [toast, setToast] = useState(false)

  const handleSearch = () => {
    const q = keyword.trim() ? `复利 ${keyword.trim()}` : '复利 投资'
    window.open(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`, '_blank')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // fallback
    }
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  return (
    <section id="resources" className="section">
      <span className="section-label">扩展</span>
      <h2 className="section-title">外部资源与延伸阅读</h2>
      <p className="section-subtitle">好的学习不止于此。搜索更多内容，或者从经典著作中继续深入。</p>

      <div className="resources-layout">
        <div>
          <h3 style={{ marginBottom: 16 }}>搜索更多</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索：复利 + 关键词..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch}>搜索</button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
            将在 DuckDuckGo 中搜索，保护你的隐私
          </p>

          <div style={{ marginTop: 32 }}>
            <button className="share-btn" onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
              {toast ? '已复制链接！' : '分享此页面'}
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 16 }}>推荐阅读</h3>
          <div className="book-list">
            {BOOKS.map((b, i) => (
              <div className="book-card" key={i}>
                <div className="book-cover">{b.icon}</div>
                <div className="book-info">
                  <h4>{b.title}</h4>
                  <p>{b.author}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{b.desc}</p>
                  <a
                    href={`https://search.douban.com/book/subject_search?search_text=${encodeURIComponent(b.search)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    豆瓣搜索 →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
