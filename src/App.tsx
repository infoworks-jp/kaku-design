import { useEffect, useRef, useState } from 'react'

type InkBlob = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  life: number
  max: number
  red: boolean
}

function InkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const blobs: InkBlob[] = []
    let width = window.innerWidth
    let height = window.innerHeight
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const addInk = (x: number, y: number, force = 1) => {
      const count = 3 + Math.round(force * 4)
      for (let i = 0; i < count; i += 1) {
        blobs.push({
          x: x + (Math.random() - 0.5) * 34,
          y: y + (Math.random() - 0.5) * 34,
          r: 14 + Math.random() * 46 * force,
          vx: (Math.random() - 0.5) * 0.36,
          vy: (Math.random() - 0.5) * 0.28,
          life: 0,
          max: 280 + Math.random() * 420,
          red: Math.random() > 0.95,
        })
      }
      if (blobs.length > 220) blobs.splice(0, blobs.length - 220)
    }

    const onMove = (e: PointerEvent) => addInk(e.clientX, e.clientY, 0.5)
    const onDown = (e: PointerEvent) => addInk(e.clientX, e.clientY, 1.8)

    resize()
    for (let i = 0; i < 36; i += 1) addInk(Math.random() * width, Math.random() * height, 0.72)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'multiply'
      ctx.filter = 'blur(17px) contrast(120%)'

      for (let i = blobs.length - 1; i >= 0; i -= 1) {
        const b = blobs[i]
        b.life += 1
        b.x += b.vx + Math.sin((b.life + i) * 0.016) * 0.11
        b.y += b.vy + Math.cos((b.life + i) * 0.013) * 0.08
        b.r += 0.026
        const alpha = Math.max(0, 1 - b.life / b.max)
        const rgb = b.red ? '125,26,18' : '8,8,8'
        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.9)
        gradient.addColorStop(0, `rgba(${rgb},${0.13 * alpha})`)
        gradient.addColorStop(0.38, `rgba(${rgb},${0.075 * alpha})`)
        gradient.addColorStop(1, `rgba(${rgb},0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r * 2.9, 0, Math.PI * 2)
        ctx.fill()
        if (b.life > b.max) blobs.splice(i, 1)
      }

      ctx.filter = 'none'
      if (Math.random() < 0.05) addInk(Math.random() * width, Math.random() * height, 0.42)
      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return <canvas ref={ref} className="ink-canvas" aria-hidden="true" />
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible')),
      { threshold: 0.15 },
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <InkCanvas />
      <div className="grain" />

      <header>
        <a href="#top" className="brand">
          <b>加来広告事務所</b>
          <span>KAKU DESIGN</span>
        </a>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
          <span>MENU</span><i /><i />
        </button>
      </header>

      <nav className={menuOpen ? 'drawer open' : 'drawer'}>
        {['ABOUT', 'WORKS', 'SERVICE', 'CONTACT'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>
        ))}
      </nav>

      <main>
        <section id="top" className="hero">
          <div className="hero-inner">
            <p className="vertical-copy">想いを、かたちに。</p>
            <h1>加来広告事務所</h1>
            <div className="hero-rule" />
            <p className="hero-services">DESIGN<br />BRANDING<br />PHOTOGRAPHY<br />WEB</p>
          </div>
          <div className="scroll">SCROLL<i /></div>
        </section>

        <section id="about" className="section light reveal">
          <div className="index">01</div>
          <div className="content narrow">
            <p className="label">ABOUT</p>
            <h2>想いを、かたちに。</h2>
            <p>加来広告事務所は、デザイン・ブランディング・写真・Webを通じて、伝えたい想いを、記憶に残るかたちへ整えます。</p>
            <p>飾りすぎず、語りすぎず。必要なものだけを残し、その人や仕事らしさが見える表現をつくります。</p>
          </div>
        </section>

        <section id="works" className="section dark reveal">
          <div className="index">02</div>
          <div className="content">
            <p className="label">WORKS</p>
            <h2>制作実績</h2>
            <div className="works">
              {[
                ['味一番\\nつばさ', '味一番つばさ', 'BRANDING / WEB'],
                ['YOJI\\n& HANA', 'YOJI & HANA', 'ART DIRECTION / PHOTO'],
                ['Rio inc.', '株式会社 吏央', 'LOGO / BRANDING'],
                ['WEB\\nDESIGN', 'Webサイト制作', 'WEB DESIGN'],
              ].map(([mark, title, type], i) => (
                <article key={title}>
                  <div className={`visual v${i}`}>
                    {mark.split('\\n').map((line) => <span key={line}>{line}<br /></span>)}
                  </div>
                  <p className="work-title">{title}</p>
                  <p className="work-type">{type}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="service" className="section light reveal">
          <div className="index">03</div>
          <div className="content">
            <p className="label">SERVICE</p>
            <h2>できること</h2>
            <div className="services-grid">
              {[
                ['GRAPHIC DESIGN', 'ロゴ、印刷物、販促物など、伝えるための形を整えます。'],
                ['WEB DESIGN', '見た目だけでなく、使いやすく更新しやすいWebサイトを制作します。'],
                ['PHOTOGRAPHY', '人物、商品、店舗など、空気感まで伝わる写真を撮影・調整します。'],
                ['BRANDING', '名前、言葉、ロゴ、見せ方を揃え、仕事の印象をつくります。'],
              ].map(([title, description], i) => (
                <article key={title}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section light reveal">
          <div className="index">04</div>
          <div className="content contact">
            <div>
              <p className="label">CONTACT</p>
              <h2>ご相談・お見積り</h2>
              <p>制作のご相談は、メールでお気軽にお問い合わせください。</p>
            </div>
            <a className="contact-btn" href="mailto:info@example.com">MAILを送る</a>
          </div>
        </section>
      </main>

      <footer>
        <div><b>加来広告事務所</b><span>KAKU DESIGN</span></div>
        <p>© 2026 KAKU DESIGN OFFICE</p>
      </footer>
    </>
  )
}
