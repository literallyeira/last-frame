'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PhotoRequestForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('photo_requests')
      .insert([{ full_name: fullName.trim(), phone: phone.trim() }]);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } else {
      setMessage({ type: 'success', text: 'Talebiniz alındı! En kısa sürede fotoğraflarınız hazırlanacak.' });
      setFullName('');
      setPhone('');
    }
  };

  return (
    <section id="galeri" className="section">
      <div className="section-container">
        <div className="section-header reveal">
          <span className="section-label">Fotoğraf Galerisi</span>
          <h2 className="section-title">Fotoğraflarınıza<br />Ulaşın</h2>
          <p className="section-subtitle">
            Bilgilerinizi girin, fotoğraflarınızı sizin için hazırlayalım.
          </p>
        </div>

        <form className="form-card reveal" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="photo-name">Ad Soyad</label>
            <input
              id="photo-name"
              className="form-input"
              type="text"
              placeholder="Adınız ve soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="photo-phone">Telefon</label>
            <input
              id="photo-phone"
              className="form-input"
              type="tel"
              placeholder="0 (5XX) XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="form-button gallery-btn"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Galeriye Git'}
          </button>

          {message && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
