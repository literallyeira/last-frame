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
                placeholder="000 000 00 00"
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
