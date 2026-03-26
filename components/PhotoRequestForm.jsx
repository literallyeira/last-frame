'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PhotoRequestForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [photos, setPhotos] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setPhotos(null);

    // Check if a request already exists for this name + phone
    const { data: existing, error: selectError } = await supabase
      .from('photo_requests')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('phone', phone.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (selectError) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      return;
    }

    if (existing && existing.length > 0) {
      const req = existing[0];
      if (req.photos && req.photos.length > 0) {
        // Photos are ready
        setPhotos(req.photos);
        setMessage({ type: 'success', text: 'Fotoğraflarınız hazır!' });
      } else {
        // Request exists but photos not yet uploaded
        setMessage({
          type: 'info',
          text: 'Fotoğraflarınız hazırlanıyor... En kısa sürede yüklenecek.',
        });
      }
    } else {
      // No existing request — create one
      const { error: insertError } = await supabase
        .from('photo_requests')
        .insert([{ full_name: fullName.trim(), phone: phone.trim() }]);

      if (insertError) {
        setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      } else {
        setMessage({
          type: 'success',
          text: 'Talebiniz alındı! Fotoğraflarınız hazırlandığında buradan ulaşabilirsiniz.',
        });
      }
    }

    setLoading(false);
  };

  return (
    <section id="galeri" className="section">
      <div className="section-container">
        <div className="section-split reveal">
          <div className="section-text-side">
            <span className="section-label">Fotoğraf Galerisi</span>
            <h2 className="section-title">Fotoğraflarınıza<br />Ulaşın</h2>
            <p className="section-subtitle">
              Bilgilerinizi girin, fotoğraflarınızı kontrol edin.
              Hazırsa doğrudan görüntüleyin.
            </p>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
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
                placeholder="000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="form-button gallery-btn"
              disabled={loading}
            >
              {loading ? 'Kontrol ediliyor...' : 'Galeriye Git'}
            </button>

            {message && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {photos && photos.length > 0 && (
              <div className="photo-gallery-result">
                {photos.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="photo-gallery-item"
                  >
                    <img src={url} alt={`Fotoğraf ${i + 1}`} />
                  </a>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
