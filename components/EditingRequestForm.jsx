'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EditingRequestForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !subject.trim()) {
      setMessage({ type: 'error', text: 'Lütfen zorunlu alanları doldurun.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('editing_requests')
      .insert([
        {
          full_name: fullName.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          description: description.trim() || null,
        },
      ]);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } else {
      setMessage({
        type: 'success',
        text: 'Düzenleme talebiniz alındı! Sizinle iletişime geçeceğiz.',
      });
      setFullName('');
      setPhone('');
      setSubject('');
      setDescription('');
    }
  };

  return (
    <section id="duzenleme" className="section">
      <div className="section-container">
        <div className="section-split reverse reveal">
          <div className="section-text-side">
            <span className="section-label">Düzenleme & Destek</span>
            <h2 className="section-title">Fotoğraflarınızı<br />Dönüştürün</h2>
            <p className="section-subtitle">
              Arka plan değişimi, renk düzeltme,
              yapay zeka destekli iyileştirme ve daha fazlası.
            </p>
            <a href="#galeri" className="editing-cta-link">
              <span>Talebinizi görüntüleyin</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-name">Ad Soyad</label>
              <input
                id="edit-name"
                className="form-input"
                type="text"
                placeholder="Adınız ve soyadınız"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-phone">Telefon</label>
              <input
                id="edit-phone"
                className="form-input"
                type="tel"
                placeholder="000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-subject">Konu</label>
              <input
                id="edit-subject"
                className="form-input"
                type="text"
                placeholder="Örn: Arka plan değişimi"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-desc">Açıklama</label>
              <textarea
                id="edit-desc"
                className="form-textarea"
                placeholder="Detaylı açıklama yazabilirsiniz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="form-button"
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Gönder'}
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
