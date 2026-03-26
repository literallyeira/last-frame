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

    // Fetch both photo requests and editing requests in parallel
    const [photoData, editingData] = await Promise.all([
      supabase
        .from('photo_requests')
        .select('*')
        .eq('full_name', fullName.trim())
        .eq('phone', phone.trim())
        .order('created_at', { ascending: false }),
      supabase
        .from('editing_requests')
        .select('*')
        .eq('full_name', fullName.trim())
        .eq('phone', phone.trim())
        .order('created_at', { ascending: false })
    ]);

    if (photoData.error || editingData.error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      return;
    }

    const allPhotos = [];
    let hasAnyRequest = false;
    let isPreparing = false;

    // Process photo requests
    if (photoData.data && photoData.data.length > 0) {
      hasAnyRequest = true;
      photoData.data.forEach(req => {
        if (req.photos && req.photos.length > 0) {
          allPhotos.push(...req.photos);
        } else {
          isPreparing = true;
        }
      });
    }

    // Process editing requests
    if (editingData.data && editingData.data.length > 0) {
      hasAnyRequest = true;
      editingData.data.forEach(req => {
        if (req.result_photos && req.result_photos.length > 0) {
          allPhotos.push(...req.result_photos);
        } else {
          isPreparing = true;
        }
      });
    }

    if (allPhotos.length > 0) {
      setPhotos(allPhotos);
      setMessage({ 
        type: 'success', 
        text: isPreparing 
          ? 'Bazı fotoğraflarınız hazır, diğerleri hazırlanıyor!' 
          : 'Tüm fotoğraflarınız hazır!' 
      });
    } else if (hasAnyRequest) {
      setMessage({
        type: 'info',
        text: 'Talebiniz bulundu, ancak fotoğraflarınız henüz hazırlanıyor... En kısa sürede yüklenecek.',
      });
    } else {
      // No existing request found at all — create a new Photo Request
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
