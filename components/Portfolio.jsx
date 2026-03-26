'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Portfolio() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setItems(data);
    };
    fetchItems();
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="portfolio" className="section">
      <div className="section-container">
        <div className="portfolio-header reveal">
          <span className="section-label">Portföy</span>
          <h2 className="section-title">Çalışmalarımız</h2>
        </div>

        <div className="masonry-grid reveal">
          {items.map((item, i) => (
            <a
              key={item.id}
              className={`masonry-item ${i % 3 === 1 ? 'tall' : ''}`}
              href={item.image_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={item.image_url} alt={item.title || 'Portföy'} loading="lazy" />
              <div className="masonry-overlay">
                {item.title && <span className="masonry-title">{item.title}</span>}
                {item.category && <span className="masonry-category">{item.category}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
