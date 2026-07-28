import SuminagashiBackground from './components/SuminagashiBackground'

const works = [
  {
    title: '地元企業ブランディング',
    category: 'Brand Identity',
    summary: 'ロゴ・ステートメント・店舗ツールを統合し、地域での認知を再設計。'
  },
  {
    title: '観光キャンペーン設計',
    category: 'Campaign Design',
    summary: 'キービジュアルからSNS連携まで、一貫した導線で来訪意欲を喚起。'
  },
  {
    title: '採用広報クリエイティブ',
    category: 'Recruiting Communication',
    summary: '企業の温度感を可視化し、応募前後の体験設計まで伴走。'
  }
]

const services = [
  'ブランド戦略・コンセプト開発',
  'グラフィックデザイン・アートディレクション',
  'Webサイト企画・UIデザイン',
  'パンフレット・ポスター・広告制作'
]

function App(): JSX.Element {
  return (
    <div className="page-root">
      <SuminagashiBackground />
      <header className="site-header">
        <a className="site-logo" href="#top">
          KAKU DESIGN
        </a>
        <nav aria-label="主なセクション">
          <ul className="site-nav">
            <li><a href="#about">ABOUT</a></li>
            <li><a href="#works">WORKS</a></li>
            <li><a href="#service">SERVICE</a></li>
            <li><a href="#contact">CONTACT</a></li>
          </ul>
        </nav>
      </header>

      <main id="top" className="content-wrap">
        <section className="hero" aria-labelledby="hero-title">
          <p id="hero-title" className="hero-vertical" lang="ja">
            加来広告事務所
          </p>
          <div className="hero-copy-block">
            <p className="hero-subcopy" lang="ja">想いを、かたちに。</p>
            <p className="hero-body" lang="ja">
              加来広告事務所は、ことばと造形を行き来しながら、
              企業や地域の魅力を伝えるコミュニケーションを設計します。
            </p>
          </div>
        </section>

        <section id="about" className="section-card" aria-labelledby="about-title">
          <h2 id="about-title">ABOUT</h2>
          <p lang="ja">
            伝えたい想いの芯を見つけ、受け手の心に届く輪郭へ。加来広告事務所は、
            取材・編集・デザインを横断して、長く愛される表現をつくります。
          </p>
        </section>

        <section id="works" className="section-card" aria-labelledby="works-title">
          <h2 id="works-title">WORKS</h2>
          <div className="works-grid">
            {works.map((work) => (
              <article key={work.title} className="work-item">
                <p className="work-category">{work.category}</p>
                <h3>{work.title}</h3>
                <p lang="ja">{work.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="service" className="section-card" aria-labelledby="service-title">
          <h2 id="service-title">SERVICE</h2>
          <ul className="service-list" lang="ja">
            {services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="contact" className="section-card contact" aria-labelledby="contact-title">
          <h2 id="contact-title">CONTACT</h2>
          <p lang="ja">ご相談・ご依頼はメールにてお気軽にご連絡ください。</p>
          <a className="contact-link" href="mailto:info@kaku-design.jp">
            info@kaku-design.jp
          </a>
        </section>
      </main>
    </div>
  )
}

export default App