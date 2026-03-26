'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function MyPhotosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get('name');
  const phone = searchParams.get('phone');

  const [loading, setLoading] = useState(true);
  const [photoRequests, setPhotoRequests] = useState([]);
  const [editingRequests, setEditingRequests] = useState([]);
  const [editingResponses, setEditingResponses] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name || !phone) {
      router.push('/');
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const [photoData, editingData, responsesData] = await Promise.all([
          supabase
            .from('photo_requests')
            .select('*')
            .ilike('full_name', name)
            .eq('phone', phone)
            .order('created_at', { ascending: false }),
          supabase
            .from('editing_requests')
            .select('*')
            .ilike('full_name', name)
            .eq('phone', phone)
            .order('created_at', { ascending: false }),
          supabase
            .from('editing_responses')
            .select('*')
            .order('created_at', { ascending: true })
        ]);

        if (photoData.error) throw photoData.error;
        if (editingData.error) throw editingData.error;

        setPhotoRequests(photoData.data || []);
        setEditingRequests(editingData.data || []);

        // Group responses by editing_request_id
        if (responsesData.data) {
          const grouped = {};
          const editIds = new Set((editingData.data || []).map(e => e.id));
          responsesData.data.forEach(r => {
            if (editIds.has(r.editing_request_id)) {
              if (!grouped[r.editing_request_id]) grouped[r.editing_request_id] = [];
              grouped[r.editing_request_id].push(r);
            }
          });
          setEditingResponses(grouped);
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [name, phone, router]);

  if (loading) {
    return (
      <div className="my-photos-loading">
        <div className="loader"></div>
        <p>Fotoğraflarınız yükleniyor...</p>
      </div>
    );
  }

  const allPhotos = photoRequests.flatMap(r => r.photos || []);
  const isPendingPhotos = photoRequests.some(r => !r.photos?.length);

  return (
    <main className="my-photos-page">
      <div className="my-photos-container">
        <header className="my-photos-header">
          <Link href="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Ana Sayfaya Dön
          </Link>
          <div className="header-content">
            <span className="welcome-tag">Hoş Geldiniz</span>
            <h1>{name}</h1>
            <p className="phone-tag">{phone}</p>
          </div>
        </header>

        {/* SECTION: ORIGINAL PHOTOS */}
        {allPhotos.length > 0 && (
          <section className="photos-section">
            <div className="section-header">
              <h2>Çekim Fotoğrafları</h2>
              <span className="count">{allPhotos.length} Kare</span>
            </div>
            <div className="my-photos-grid">
              {allPhotos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="photo-item reveal visible">
                  <img src={url} alt={`Çekim ${i + 1}`} loading="lazy" />
                  <div className="photo-overlay">
                    <span>Görüntüle</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {isPendingPhotos && allPhotos.length === 0 && (
          <div className="status-notice info">
            <p>Çekim fotoğraflarınız henüz hazırlanıyor. Tamamlandığında burada görünecektir.</p>
          </div>
        )}

        {/* Info notice about editing tickets */}
        {editingRequests.length > 0 && allPhotos.length > 0 && (
          <div className="status-notice info" style={{ marginTop: '16px' }}>
            <p>Düzenleme talepleriniz ve yanıtları sayfanın aşağısında yer almaktadır. ↓</p>
          </div>
        )}

        {/* SECTION: EDITING REQUESTS AS TICKETS */}
        {editingRequests.length > 0 && (
          <section className="photos-section edited">
            <div className="section-header">
              <h2>Düzenleme Talepleri</h2>
              <span className="count">{editingRequests.length} Talep</span>
            </div>
            
            <div className="ticket-list">
              {editingRequests.map((req) => {
                const responses = editingResponses[req.id] || [];
                return (
                  <div key={req.id} className="customer-ticket">
                    {/* Ticket header */}
                    <div className="customer-ticket-header">
                      <div className="customer-ticket-subject">{req.subject}</div>
                      <span className={`customer-ticket-status ${req.status}`}>
                        {req.status === 'pending' ? 'İşleniyor' : 'Yanıtlandı'}
                      </span>
                    </div>

                    {/* Customer's original description */}
                    {req.description && (
                      <div className="customer-ticket-desc">
                        <div className="ticket-bubble customer">
                          <div className="ticket-bubble-label">Siz</div>
                          <p>{req.description}</p>
                          <span className="ticket-bubble-time">{new Date(req.created_at).toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    )}

                    {/* Admin responses thread */}
                    {responses.length > 0 && (
                      <div className="customer-ticket-thread">
                        {responses.map((resp) => (
                          <div key={resp.id} className="ticket-bubble admin">
                            <div className="ticket-bubble-label">Last Frame Studio</div>
                            <p>{resp.message}</p>
                            {resp.photos && resp.photos.length > 0 && (
                              <div className="ticket-bubble-photos">
                                {resp.photos.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="ticket-photo-item">
                                    <img src={url} alt={`Düzenleme ${i + 1}`} loading="lazy" />
                                    <div className="photo-overlay">
                                      <span>Görüntüle</span>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}
                            <span className="ticket-bubble-time">{new Date(resp.created_at).toLocaleString('tr-TR')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Waiting indicator if no response yet */}
                    {responses.length === 0 && (
                      <div className="customer-ticket-waiting">
                        <div className="waiting-dot"></div>
                        <span>Yanıt bekleniyor...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Nothing at all */}
        {allPhotos.length === 0 && editingRequests.length === 0 && !isPendingPhotos && (
          <div className="status-notice empty">
            <p>Henüz yüklenmiş bir fotoğrafınız veya talebiniz bulunmuyor.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function MyPhotosPage() {
  return (
    <Suspense fallback={<div className="my-photos-loading"><div className="loader"></div></div>}>
      <MyPhotosContent />
    </Suspense>
  );
}
