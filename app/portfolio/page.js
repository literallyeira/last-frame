'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import './portfolio.css';

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (data) setPortfolioItems(data);
      setLoading(false);
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    // Smooth reveal effect on load after data loads
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
    
    return () => revealObserver.disconnect();
  }, [loading, portfolioItems]);

  return (
    <>
      <Navbar />
      
      <main className="portfolio-page">
        <header className="portfolio-header-container reveal">
          <h1 className="portfolio-hero-title">Tüm Çalışmalar</h1>
          <p className="portfolio-hero-subtitle">
            Stüdyomuzda çekilmiş, düzenlenmiş ve dijitalleştirilmiş tüm kareler bir arada. 
            Sanatımızın tamamını burada keşfedebilirsiniz.
          </p>
        </header>

        <section className="portfolio-masonry-container">
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</div>
          ) : portfolioItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Henüz fotoğraf eklenmemiş.</div>
          ) : (
            <div className="portfolio-masonry-grid">
              {portfolioItems.map((item, i) => (
                <a
                  key={item.id}
                  href={item.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-masonry-item reveal"
                >
                  <img src={item.image_url} alt={item.title || 'Portföy'} loading="lazy" />
                  <div className="portfolio-masonry-overlay">
                    {item.title && <div className="portfolio-masonry-title">{item.title}</div>}
                    {item.category && <div className="portfolio-masonry-category">{item.category}</div>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
