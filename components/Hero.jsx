export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-bg-circle"></div>
        <div className="hero-bg-circle"></div>
      </div>

      <div className="hero-content">
        <span className="hero-badge">Fotoğraf Stüdyosu</span>
        <h1>
          Her Kare,
          <br />
          Bir <em>Hikaye.</em>
        </h1>
        <p className="hero-subtitle">
          Profesyonel fotoğraf çekimi, düzenleme ve dijital hizmetler.
          Anılarınızı en güzel haliyle yaşatıyoruz.
        </p>
        <a href="#galeri" className="hero-cta">
          Keşfet
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </a>
      </div>

      <div className="hero-scroll-indicator">
        <span>Kaydır</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
