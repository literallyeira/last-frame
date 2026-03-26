'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PhotoRequestForm() {
  const router = useRouter();
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

    // Fetch both photo requests and editing requests in parallel to check if ANY exist
    const [photoData, editingData] = await Promise.all([
      supabase
        .from('photo_requests')
        .select('id')
        .eq('full_name', fullName.trim())
        .eq('phone', phone.trim())
        .limit(1),
      supabase
        .from('editing_requests')
        .select('id')
        .eq('full_name', fullName.trim())
        .eq('phone', phone.trim())
        .limit(1)
    ]);

    if (photoData.error || editingData.error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      return;
    }

    const hasNoRequest = (photoData.data?.length ?? 0) === 0 && (editingData.data?.length ?? 0) === 0;

    if (hasNoRequest) {
      // No existing request found at all — create a new Photo Request (register them)
      const { error: insertError } = await supabase
        .from('photo_requests')
        .insert([{ full_name: fullName.trim(), phone: phone.trim() }]);

      if (insertError) {
        setLoading(false);
        setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
        return;
      }
    }

    // Redirect to the dedicated photos page
    router.push(`/my-photos?name=${encodeURIComponent(fullName.trim())}&phone=${encodeURIComponent(phone.trim())}`);
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
              Bilgilerinizi girin, size özel hazırlanmış tüm çekim ve düzenleme sonuçlarına anında ulaşın.
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
                required
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
                required
              />
            </div>

            <button
              type="submit"
              className="form-button gallery-btn"
              disabled={loading}
            >
              {loading ? 'Yönlendiriliyor...' : 'Galeriye Git'}
            </button>

            {message && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
