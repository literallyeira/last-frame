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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name || !phone) {
      router.push('/');
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const [photoData, editingData] = await Promise.all([
          supabase
            .from('photo_requests')
            .select('*')
            .eq('full_name', name)
            .eq('phone', phone)
            .order('created_at', { ascending: false }),
          supabase
            .from('editing_requests')
            .select('*')
            .eq('full_name', name)
            .eq('phone', phone)
            .order('created_at', { ascending: false })
        ]);

        if (photoData.error) throw photoData.error;
        if (editingData.error) throw editingData.error;

        setPhotoRequests(photoData.data || []);
        setEditingRequests(editingData.data || []);
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
  const allEdited = editingRequests.flatMap(r => r.result_photos || []);
  const isPending = photoRequests.some(r => !r.photos?.length) || editingRequests.some(r => !r.result_photos?.length);

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

        {isPending && (
          <div className="status-notice info">
            <p>Bazı talepleriniz hala hazırlanıyor. Tamamlandığında burada görünecektir.</p>
          </div>
        )}

        {allPhotos.length === 0 && allEdited.length === 0 && !isPending && (
          <div className="status-notice empty">
            <p>Henüz yüklenmiş bir fotoğrafınız bulunmuyor.</p>
          </div>
        )}

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

        {/* SECTION: EDITED PHOTOS */}
        {allEdited.length > 0 && (
          <section className="photos-section edited">
            <div className="section-header">
              <h2>Düzenlenmiş Fotoğraflar</h2>
              <span className="count">{allEdited.length} Kare</span>
            </div>
            <div className="my-photos-grid">
              {allEdited.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="photo-item reveal visible">
                  <img src={url} alt={`Düzenleme ${i + 1}`} loading="lazy" />
                  <div className="photo-overlay">
                    <span>Görüntüle</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
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
