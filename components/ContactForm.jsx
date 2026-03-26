'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !messageText.trim()) {
      setFeedback({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const { error } = await supabase
      .from('contact_messages')
      .insert([
        {
          full_name: fullName.trim(),
          phone: phone.trim(),
          message: messageText.trim(),
        },
      ]);

    setLoading(false);

    if (error) {
      setFeedback({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } else {
      setFeedback({
        type: 'success',
        text: 'Mesajınız iletildi! En kısa sürede dönüş yapacağız.',
      });
      setFullName('');
      setPhone('');
      setMessageText('');
    }
  };

  return (
    <section id="iletisim" className="section">
      <div className="section-container">
        <div className="section-split reveal">
          <div className="section-text-side">
            <span className="section-label">İletişim</span>
            <h2 className="section-title">Bizimle<br />Konuşun</h2>
            <p className="section-subtitle">
              Soru, randevu veya işbirliği için
              bize ulaşın.
            </p>
            <div className="contact-info-block">
              <div className="contact-info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Las Lagunas Boulevard, Burton</span>
              </div>
              <div className="contact-info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>(+1) 537-237</span>
              </div>
            </div>
            
            <div className="contact-images-block">
              <div className="contact-image-wrapper">
                <img src="/map.png" alt="Location Map" />
                <div className="contact-image-badge">Konum</div>
              </div>
              <div className="contact-image-wrapper">
                <img src="/store.png" alt="Store Front" />
                <div className="contact-image-badge">Stüdyo</div>
              </div>
            </div>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Ad Soyad</label>
              <input
                id="contact-name"
                className="form-input"
                type="text"
                placeholder="Adınız ve soyadınız"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-phone">Telefon</label>
              <input
                id="contact-phone"
                className="form-input"
                type="tel"
                placeholder="000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Mesaj</label>
              <textarea
                id="contact-message"
                className="form-textarea"
                placeholder="Mesajınızı buraya yazın..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="form-button"
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>

            {feedback && (
              <div className={`form-message ${feedback.type}`}>
                {feedback.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
