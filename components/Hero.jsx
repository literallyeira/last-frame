'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Hero() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      // Get all portfolio items for the hero crossfade pool
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setPortfolioItems(data);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (portfolioItems.length <= 3) return;
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 3) % portfolioItems.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [portfolioItems.length]);

  const visibleItems = [];
  if (portfolioItems.length > 0) {
    for (let i = 0; i < Math.min(3, portfolioItems.length); i++) {
      visibleItems.push(portfolioItems[(startIndex + i) % portfolioItems.length]);
    }
  }

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-bg-circle"></div>
        <div className="hero-bg-circle"></div>
      </div>

      <div className="hero-container">
        {/* Sol Taraf: Metin */}
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

        {/* Sağ Taraf: Masonry Grid (Portföy) */}
        {visibleItems.length > 0 && (
          <div className="hero-portfolio-grid">
            {visibleItems.map((item, i) => (
              <a
                key={item.id}
                href={item.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`hero-portfolio-item ${i % 3 === 0 ? 'tall' : ''} ${i === 1 ? 'push-down' : ''}`}
              >
                <img key={item.id} src={item.image_url} alt={item.title || 'Portföy'} loading="lazy" className="fade-in-image" />
                <div className="hero-portfolio-overlay">
                  {item.title && <span>{item.title}</span>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="hero-scroll-indicator">
        <span>Kaydır</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
