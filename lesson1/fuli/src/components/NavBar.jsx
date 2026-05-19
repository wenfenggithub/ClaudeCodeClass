import { useState, useEffect } from 'react'

const SECTIONS = [
  { id: 'hero', label: '首页' },
  { id: 'calculator', label: '计算器' },
  { id: 'timeline', label: '历史' },
  { id: 'quotes', label: '名言' },
  { id: 'comparison', label: '对比' },
  { id: 'philosophy', label: '哲学' },
  { id: 'resources', label: '资源' },
]

export default function NavBar() {
  const [active, setActive] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100)
      const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean)
      for (let i = sections.length - 1; i >= 0; i--) {
        const rect = sections[i].getBoundingClientRect()
        if (rect.top <= window.innerHeight * 0.4) {
          setActive(SECTIONS[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <span className="navbar__logo" onClick={() => scrollTo('hero')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          复利研究所
        </span>
        <div className="navbar__links">
          {SECTIONS.slice(1).map(s => (
            <button
              key={s.id}
              className={`navbar__link${active === s.id ? ' navbar__link--active' : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
