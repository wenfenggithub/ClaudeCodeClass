import Hero from './components/Hero'
import Calculator from './components/Calculator'
import Timeline from './components/Timeline'
import Quotes from './components/Quotes'
import Comparison from './components/Comparison'
import Philosophy from './components/Philosophy'
import Resources from './components/Resources'
import NavBar from './components/NavBar'
import './App.css'

export default function App() {
  return (
    <>
      <NavBar />
      <Hero />
      <Calculator />
      <Timeline />
      <Quotes />
      <Comparison />
      <Philosophy />
      <Resources />
      <footer className="site-footer">
        <p>复利学习平台 — 理解"世界第八大奇迹"</p>
        <p className="footer-disclaimer">数据演示仅供参考，不构成投资建议</p>
      </footer>
    </>
  )
}
