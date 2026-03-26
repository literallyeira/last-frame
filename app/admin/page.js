'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './admin.css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('photos'); // photos, edits, messages, portfolio

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Data State
  const [photoRequests, setPhotoRequests] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // Check auth on load (simple localStorage check for demo)
  useEffect(() => {
    const auth = localStorage.getItem('lf_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
    // Add class to body for dark theme
    document.body.className = 'admin-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    // Veritabanından admin kontrolü
    // Gerçek bir sistemde password hashlenerek karşılaştırılmalı
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password) // Basit kontrol (hash yok demo amaçlı schemas.sql'de düz yazı verdik)
      .single();

    setLoading(false);

    if (error || !data) {
      setLoginError('Kullanıcı adı veya şifre hatalı.');
    } else {
      setIsAuthenticated(true);
      localStorage.setItem('lf_admin_auth', 'true');
      fetchData();
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lf_admin_auth');
  };

  const fetchData = async () => {
    // Fotoğraf Talepleri
    const { data: photos } = await supabase
      .from('photo_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (photos) setPhotoRequests(photos);

    // Düzenleme Talepleri
    const { data: edits } = await supabase
      .from('editing_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (edits) setEditRequests(edits);

    // Mesajlar
    const { data: msgs } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (msgs) setMessages(msgs);

    // Portföy
    const { data: portItems } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (portItems) setPortfolio(portItems);
  };

  // ========== ACTIONS ==========

  // Fotoğraf linki ekle
  const addPhotoLink = async (id, currentPhotos, newLink) => {
    if (!newLink) return;
    const updatedPhotos = [...(currentPhotos || []), newLink];
    
    // Status 'completed' yap if photos added
    await supabase
      .from('photo_requests')
      .update({ photos: updatedPhotos, status: 'completed' })
      .eq('id', id);
    
    fetchData(); // refresh
  };

  // Fotoğraf linki sil
  const removePhotoLink = async (id, currentPhotos, linkToRemove) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      const updatedPhotos = currentPhotos.filter(link => link !== linkToRemove);
      const newStatus = updatedPhotos.length === 0 ? 'pending' : 'completed';
      
      await supabase
        .from('photo_requests')
        .update({ photos: updatedPhotos, status: newStatus })
        .eq('id', id);
        
      fetchData();
    }
  };

  // Düzenleme linki ekle
  const addResultLink = async (id, currentPhotos, newLink) => {
    if (!newLink) return;
    const updatedPhotos = [...(currentPhotos || []), newLink];
    
    await supabase
      .from('editing_requests')
      .update({ result_photos: updatedPhotos, status: 'completed' })
      .eq('id', id);
    
    fetchData(); // refresh
  };

  // Düzenleme linki sil
  const removeResultLink = async (id, currentPhotos, linkToRemove) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      const updatedPhotos = currentPhotos.filter(link => link !== linkToRemove);
      const newStatus = updatedPhotos.length === 0 ? 'pending' : 'completed';
      
      await supabase
        .from('editing_requests')
        .update({ result_photos: updatedPhotos, status: newStatus })
        .eq('id', id);
        
      fetchData();
    }
  };

  // Portföy öğesi ekle
  const addPortfolioItem = async (e) => {
    e.preventDefault();
    const link = e.target.link.value;
    const title = e.target.title.value;
    const category = e.target.category.value;

    if (!link) return;

    await supabase
      .from('portfolio_items')
      .insert([{ image_url: link, title, category }]);
    
    e.target.reset();
    fetchData();
  };

  const deletePortfolioItem = async (id) => {
    if (confirm('Emin misiniz?')) {
      await supabase.from('portfolio_items').delete().eq('id', id);
      fetchData();
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1>Admin Paneli</h1>
          <p>Devam etmek için giriş yapın.</p>

          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label className="admin-label">Kullanıcı Adı</label>
              <input
                className="admin-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Şifre</label>
              <input
                className="admin-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="admin-button" type="submit" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            {loginError && <div className="admin-error">{loginError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', marginBottom: '48px', paddingLeft: '12px' }}>
          <img src="/logo.png" alt="LF Studio Admin" style={{ height: '40px', width: 'auto' }} />
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Fotoğraf Talepleri
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'edits' ? 'active' : ''}`}
            onClick={() => setActiveTab('edits')}
          >
            Düzenleme Talepleri
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Mesajlar
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portföy Yönetimi
          </button>
          <button className="admin-nav-item admin-logout" onClick={handleLogout}>
            Çıkış Yap
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">
            {activeTab === 'photos' && 'Fotoğraf Talepleri'}
            {activeTab === 'edits' && 'Düzenleme Talepleri'}
            {activeTab === 'messages' && 'Gelen Mesajlar'}
            {activeTab === 'portfolio' && 'Portföy Yönetimi'}
          </h1>
        </header>

        <div className="admin-content">
          {/* FOTOĞRAF TALEPLERİ */}
          {activeTab === 'photos' && (
            <div className="admin-list">
              {photoRequests.map((req) => (
                <div key={req.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <div className="admin-card-title">{req.full_name}</div>
                      <div className="admin-card-subtitle">{req.phone} • {new Date(req.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <span className={`admin-badge ${req.status}`}>
                      {req.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
                    </span>
                  </div>

                  {req.photos && req.photos.length > 0 && (
                    <div className="admin-links-list">
                      <div className="admin-label">Yüklenen Fotoğraflar:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                        {req.photos.map((link, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ display: 'block', width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}
                            >
                              <img src={link} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                            <button
                              type="button"
                              onClick={() => removePhotoLink(req.id, req.photos, link)}
                              style={{
                                position: 'absolute', top: -6, right: -6, background: '#D70015', color: '#fff', border: 'none',
                                borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold'
                              }}
                              title="Sil"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form
                    className="admin-actions"
                    style={{ marginTop: '20px' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      addPhotoLink(req.id, req.photos, e.target.link.value);
                      e.target.reset();
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label className="admin-label">Yeni Link Ekle</label>
                      <input name="link" type="url" className="admin-input-small" placeholder="https://" required />
                    </div>
                    <button type="submit" className="admin-button-small success">Ekle</button>
                  </form>
                </div>
              ))}
              {photoRequests.length === 0 && <p style={{ color: '#86868B' }}>Henüz talep yok.</p>}
            </div>
          )}

          {/* DÜZENLEME TALEPLERİ */}
          {activeTab === 'edits' && (
            <div className="admin-list">
              {editRequests.map((req) => (
                <div key={req.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <div className="admin-card-title">{req.full_name} • {req.subject}</div>
                      <div className="admin-card-subtitle">{req.phone} • {new Date(req.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <span className={`admin-badge ${req.status}`}>
                      {req.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
                    </span>
                  </div>

                  {req.description && (
                    <div className="admin-card-content">
                      <div className="admin-label">Açıklama:</div>
                      <div className="admin-card-text">{req.description}</div>
                    </div>
                  )}

                  {req.result_photos && req.result_photos.length > 0 && (
                    <div className="admin-links-list">
                      <div className="admin-label">Sonuç Fotoğrafları:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                        {req.result_photos.map((link, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ display: 'block', width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}
                            >
                              <img src={link} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                            <button
                              type="button"
                              onClick={() => removeResultLink(req.id, req.result_photos, link)}
                              style={{
                                position: 'absolute', top: -6, right: -6, background: '#D70015', color: '#fff', border: 'none',
                                borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold'
                              }}
                              title="Sil"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form
                    className="admin-actions"
                    style={{ marginTop: '20px' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      addResultLink(req.id, req.result_photos, e.target.link.value);
                      e.target.reset();
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label className="admin-label">Düzenlenmiş Fotoğraf Linki Ekle</label>
                      <input name="link" type="url" className="admin-input-small" placeholder="https://" required />
                    </div>
                    <button type="submit" className="admin-button-small success">Ekle</button>
                  </form>
                </div>
              ))}
              {editRequests.length === 0 && <p style={{ color: '#86868B' }}>Henüz talep yok.</p>}
            </div>
          )}

          {/* MESAJLAR */}
          {activeTab === 'messages' && (
            <div className="admin-list">
              {messages.map((msg) => (
                <div key={msg.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <div className="admin-card-title">{msg.full_name}</div>
                      <div className="admin-card-subtitle">{msg.phone} • {new Date(msg.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                  <div className="admin-card-content">
                    <div className="admin-card-text">{msg.message}</div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p style={{ color: '#86868B' }}>Henüz mesaj yok.</p>}
            </div>
          )}

          {/* PORTFÖY */}
          {activeTab === 'portfolio' && (
            <div className="admin-list">
              {/* Ekleme Formu */}
              <div className="admin-card" style={{ border: '1px dashed #0A84FF', background: 'rgba(10, 132, 255, 0.05)' }}>
                <div className="admin-card-title" style={{ marginBottom: '16px' }}>Yeni Portföy Öğesi Ekle</div>
                <form className="admin-actions" onSubmit={addPortfolioItem}>
                  <div style={{ flex: 2 }}>
                    <input name="link" type="url" className="admin-input-small" placeholder="Resim URL (https://...)" required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input name="title" type="text" className="admin-input-small" placeholder="Başlık (Opsiyonel)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input name="category" type="text" className="admin-input-small" placeholder="Kategori (Opsiyonel)" />
                  </div>
                  <button type="submit" className="admin-button-small success" style={{ padding: '10px 24px' }}>Ekle</button>
                </form>
              </div>

              {/* Liste */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
                {portfolio.map((item) => (
                  <div key={item.id} className="admin-card" style={{ padding: '12px' }}>
                    <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                      <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ overflow: 'hidden' }}>
                        <div className="admin-card-title" style={{ fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.title || 'İsimsiz'}</div>
                        <div className="admin-card-subtitle" style={{ fontSize: '12px' }}>{item.category || '-'}</div>
                      </div>
                      <button 
                        onClick={() => deletePortfolioItem(item.id)}
                        className="admin-button-small danger"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
