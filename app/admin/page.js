'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import './admin.css';

const DEFAULT_RESPONSE_TEMPLATE = `Merhabalar, düzenleme istediğiniz fotoğrafınız hazır. "123 456 78" numaralı banka hesabına $2.000 gönderdikten sonra ulaşabilirsiniz.`;
const PAGE_SIZE = 10;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // States
  const [photoRequests, setPhotoRequests] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [editResponses, setEditResponses] = useState({});
  const [messages, setMessages] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // Pagination & Counts
  const [photoPage, setPhotoPage] = useState(1);
  const [editPage, setEditPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  
  const [photoCount, setPhotoCount] = useState(0);
  const [editCount, setEditCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchActiveTab = useCallback(async () => {
    if (!isAuthenticated) return;

    if (activeTab === 'photos') {
      let q = supabase.from('photo_requests').select('*', { count: 'exact' });
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (searchQuery) q = q.ilike('full_name', `%${searchQuery}%`);
      const { data, count } = await q.order('created_at', { ascending: false })
        .range((photoPage - 1) * PAGE_SIZE, photoPage * PAGE_SIZE - 1);
      setPhotoRequests(data || []);
      setPhotoCount(count || 0);
    } 
    else if (activeTab === 'edits') {
      let q = supabase.from('editing_requests').select('*', { count: 'exact' });
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (searchQuery) q = q.ilike('full_name', `%${searchQuery}%`);
      const { data, count } = await q.order('created_at', { ascending: false })
        .range((editPage - 1) * PAGE_SIZE, editPage * PAGE_SIZE - 1);
      setEditRequests(data || []);
      setEditCount(count || 0);

      // Fetch responses for these editing requests
      if (data && data.length > 0) {
        const ids = data.map(d => d.id);
        const { data: responses } = await supabase.from('editing_responses')
          .select('*').in('editing_request_id', ids).order('created_at', { ascending: true });
        if (responses) {
          const grouped = {};
          responses.forEach(r => {
            if (!grouped[r.editing_request_id]) grouped[r.editing_request_id] = [];
            grouped[r.editing_request_id].push(r);
          });
          setEditResponses(grouped);
        }
      } else {
        setEditResponses({});
      }
    } 
    else if (activeTab === 'messages') {
      let q = supabase.from('contact_messages').select('*', { count: 'exact' });
      if (searchQuery) q = q.ilike('full_name', `%${searchQuery}%`);
      const { data, count } = await q.order('created_at', { ascending: false })
        .range((messagePage - 1) * PAGE_SIZE, messagePage * PAGE_SIZE - 1);
      setMessages(data || []);
      setMessageCount(count || 0);
    } 
    else if (activeTab === 'portfolio') {
      const { data } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
      if (data) setPortfolio(data);
    }
  }, [isAuthenticated, activeTab, photoPage, editPage, messagePage, statusFilter, searchQuery]);

  useEffect(() => {
    const auth = localStorage.getItem('lf_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    document.body.className = 'admin-body';
    return () => { document.body.className = ''; };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveTab();
    }
  }, [fetchActiveTab, isAuthenticated, activeTab, photoPage, editPage, messagePage, statusFilter, searchQuery]);

  // Reset page and filters when tab changes
  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setPhotoPage(1);
    setEditPage(1);
    setMessagePage(1);
  }, [activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    const { data, error } = await supabase
      .from('admins').select('*')
      .eq('username', username).eq('password_hash', password).single();
    setLoading(false);
    if (error || !data) { setLoginError('Kullanıcı adı veya şifre hatalı.'); }
    else { setIsAuthenticated(true); localStorage.setItem('lf_admin_auth', 'true'); }
  };

  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem('lf_admin_auth'); };

  // Actions
  const addPhotoLink = async (id, currentPhotos, newLink) => {
    if (!newLink) return;
    const updatedPhotos = [...(currentPhotos || []), newLink];
    await supabase.from('photo_requests').update({ photos: updatedPhotos, status: 'completed' }).eq('id', id);
    fetchActiveTab();
  };

  const removePhotoLink = async (id, currentPhotos, linkToRemove) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      const updatedPhotos = currentPhotos.filter(link => link !== linkToRemove);
      await supabase.from('photo_requests').update({ photos: updatedPhotos, status: updatedPhotos.length === 0 ? 'pending' : 'completed' }).eq('id', id);
      fetchActiveTab();
    }
  };

  const deleteRecord = async (table, id) => {
    if (confirm('Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      await supabase.from(table).delete().eq('id', id);
      fetchActiveTab();
    }
  };

  const sendEditingResponse = async (editingRequestId, message, photoLinks) => {
    if (!message.trim()) return;
    const photos = photoLinks.filter(l => l.trim() !== '');
    await supabase.from('editing_responses').insert([{ editing_request_id: editingRequestId, message: message.trim(), photos }]);
    await supabase.from('editing_requests').update({ status: 'completed' }).eq('id', editingRequestId);
    fetchActiveTab();
  };

  const addPortfolioItem = async (e) => {
    e.preventDefault();
    const link = e.target.link.value;
    const title = e.target.title.value;
    const category = e.target.category.value;
    if (!link) return;
    await supabase.from('portfolio_items').insert([{ image_url: link, title, category }]);
    e.target.reset();
    fetchActiveTab();
  };

  const deletePortfolioItem = async (id) => {
    if (confirm('Emin misiniz?')) {
      await supabase.from('portfolio_items').delete().eq('id', id);
      fetchActiveTab();
    }
  };

  const renderPagination = (page, setPage, count) => {
    const totalPages = Math.ceil(count / PAGE_SIZE) || 1;
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
        <button className="admin-button-small" disabled={page === 1} onClick={() => setPage(page - 1)}>Önceki</button>
        <span style={{ fontSize: '14px', color: '#86868B' }}>Sayfa {page} / {totalPages}</span>
        <button className="admin-button-small" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sonraki</button>
      </div>
    );
  };

  const renderFilters = (showStatusFilter = true) => (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <input 
        type="text" 
        className="admin-input" 
        style={{ flex: 1, padding: '10px', fontSize: '14px' }}
        placeholder="İsim ile ara..." 
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setPhotoPage(1); setEditPage(1); setMessagePage(1); }}
      />
      {showStatusFilter && (
        <select 
          className="admin-input" 
          style={{ width: '200px', padding: '10px', fontSize: '14px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPhotoPage(1); setEditPage(1); }}
        >
          <option value="all">Tümü</option>
          <option value="pending">Bekleyenler</option>
          <option value="completed">Tamamlananlar</option>
        </select>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1>Admin Paneli</h1>
          <p>Devam etmek için giriş yapın.</p>
          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label className="admin-label">Kullanıcı Adı</label>
              <input className="admin-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Şifre</label>
              <input className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
      <aside className="admin-sidebar">
        <div className="admin-brand">LF Studio Admin</div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>Fotoğraf Talepleri</button>
          <button className={`admin-nav-item ${activeTab === 'edits' ? 'active' : ''}`} onClick={() => setActiveTab('edits')}>Düzenleme Talepleri</button>
          <button className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>Mesajlar</button>
          <button className={`admin-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>Portföy Yönetimi</button>
          <button className="admin-nav-item admin-logout" onClick={handleLogout}>Çıkış Yap</button>
        </nav>
      </aside>

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
              {renderFilters(true)}
              {photoRequests.map((req) => (
                <div key={req.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <div className="admin-card-title">{req.full_name}</div>
                      <div className="admin-card-subtitle">{req.phone} • {new Date(req.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`admin-badge ${req.status}`}>{req.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}</span>
                      <button onClick={() => deleteRecord('photo_requests', req.id)} className="admin-button-small danger">Sil</button>
                    </div>
                  </div>
                  {req.photos && req.photos.length > 0 && (
                    <div className="admin-links-list">
                      <div className="admin-label">Yüklenen Fotoğraflar:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                        {req.photos.map((link, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <a href={link} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              <img src={link} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                            <button type="button" onClick={() => removePhotoLink(req.id, req.photos, link)}
                              style={{ position: 'absolute', top: -6, right: -6, background: '#D70015', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' }} title="Sil">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <form className="admin-actions" style={{ marginTop: '20px' }}
                    onSubmit={(e) => { e.preventDefault(); addPhotoLink(req.id, req.photos, e.target.link.value); e.target.reset(); }}>
                    <div style={{ flex: 1 }}>
                      <label className="admin-label">Yeni Link Ekle</label>
                      <input name="link" type="url" className="admin-input-small" placeholder="https://" required />
                    </div>
                    <button type="submit" className="admin-button-small success">Ekle</button>
                  </form>
                </div>
              ))}
              {photoRequests.length === 0 && <p style={{ color: '#86868B' }}>Henüz talep yok.</p>}
              {renderPagination(photoPage, setPhotoPage, photoCount)}
            </div>
          )}

          {/* DÜZENLEME TALEPLERİ — TICKET SYSTEM */}
          {activeTab === 'edits' && (
            <div className="admin-list">
              {renderFilters(true)}
              {editRequests.map((req) => (
                <EditingTicketCard
                  key={req.id}
                  request={req}
                  responses={editResponses[req.id] || []}
                  onSendResponse={sendEditingResponse}
                  onDelete={() => deleteRecord('editing_requests', req.id)}
                  defaultTemplate={DEFAULT_RESPONSE_TEMPLATE}
                />
              ))}
              {editRequests.length === 0 && <p style={{ color: '#86868B' }}>Henüz talep yok.</p>}
              {renderPagination(editPage, setEditPage, editCount)}
            </div>
          )}

          {/* MESAJLAR */}
          {activeTab === 'messages' && (
            <div className="admin-list">
              {renderFilters(false)}
              {messages.map((msg) => (
                <div key={msg.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <div className="admin-card-title">{msg.full_name}</div>
                      <div className="admin-card-subtitle">{msg.phone} • {new Date(msg.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <button onClick={() => deleteRecord('contact_messages', msg.id)} className="admin-button-small danger">Sil</button>
                  </div>
                  <div className="admin-card-content">
                    <div className="admin-card-text">{msg.message}</div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p style={{ color: '#86868B' }}>Henüz mesaj yok.</p>}
              {renderPagination(messagePage, setMessagePage, messageCount)}
            </div>
          )}

          {/* PORTFÖY */}
          {activeTab === 'portfolio' && (
            <div className="admin-list">
              <div className="admin-card" style={{ border: '1px dashed #0A84FF', background: 'rgba(10, 132, 255, 0.05)' }}>
                <div className="admin-card-title" style={{ marginBottom: '16px' }}>Yeni Portföy Öğesi Ekle</div>
                <form className="admin-actions" onSubmit={addPortfolioItem}>
                  <div style={{ flex: 2 }}><input name="link" type="url" className="admin-input-small" placeholder="Resim URL (https://...)" required /></div>
                  <div style={{ flex: 1 }}><input name="title" type="text" className="admin-input-small" placeholder="Başlık (Opsiyonel)" /></div>
                  <div style={{ flex: 1 }}><input name="category" type="text" className="admin-input-small" placeholder="Kategori (Opsiyonel)" /></div>
                  <button type="submit" className="admin-button-small success" style={{ padding: '10px 24px' }}>Ekle</button>
                </form>
              </div>
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
                      <button onClick={() => deletePortfolioItem(item.id)} className="admin-button-small danger">Sil</button>
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

// ========== EDITING TICKET CARD COMPONENT ==========
function EditingTicketCard({ request, responses, onSendResponse, onDelete, defaultTemplate }) {
  const [responseMsg, setResponseMsg] = useState(defaultTemplate);
  const [photoLink, setPhotoLink] = useState('');
  const [photoLinks, setPhotoLinks] = useState([]);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const addPhotoToList = () => {
    if (photoLink.trim()) { setPhotoLinks([...photoLinks, photoLink.trim()]); setPhotoLink(''); }
  };
  const removePhotoFromList = (index) => { setPhotoLinks(photoLinks.filter((_, i) => i !== index)); };

  const handleSend = async () => {
    if (!responseMsg.trim()) return;
    setSending(true);
    await onSendResponse(request.id, responseMsg, photoLinks);
    setResponseMsg(defaultTemplate);
    setPhotoLinks([]);
    setSending(false);
  };

  return (
    <div className="admin-card ticket-card">
      <div className="admin-card-header" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div>
          <div className="admin-card-title">{request.full_name} • {request.subject}</div>
          <div className="admin-card-subtitle">{request.phone} • {new Date(request.created_at).toLocaleDateString('tr-TR')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`admin-badge ${request.status}`}>{request.status === 'pending' ? 'Bekliyor' : 'Yanıtlandı'}</span>
          {responses.length > 0 && (
            <span className="admin-badge" style={{ background: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF' }}>{responses.length} yanıt</span>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="admin-button-small danger">Sil</button>
          <span style={{ fontSize: '18px', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </div>
      </div>

      {request.description && (
        <div className="ticket-customer-msg">
          <div className="ticket-msg-label">Müşteri Mesajı:</div>
          <div className="admin-card-text">{request.description}</div>
        </div>
      )}

      {expanded && (
        <div className="ticket-thread" onClick={(e) => e.stopPropagation()}>
          {responses.length > 0 && (
            <div className="ticket-responses">
              {responses.map((resp) => (
                <div key={resp.id} className="ticket-response-item">
                  <div className="ticket-response-header">
                    <span className="ticket-response-sender">Admin</span>
                    <span className="ticket-response-date">{new Date(resp.created_at).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="ticket-response-body">{resp.message}</div>
                  {resp.photos && resp.photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                      {resp.photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer"
                          style={{ display: 'block', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="ticket-reply-form">
            <div className="ticket-reply-label">Yanıt Gönder</div>
            <textarea className="admin-textarea" value={responseMsg} onChange={(e) => setResponseMsg(e.target.value)} rows={4} placeholder="Mesajınızı yazın..." />
            {photoLinks.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
                {photoLinks.map((link, i) => (
                  <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <img src={link} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                    <button type="button" onClick={() => removePhotoFromList(i)}
                      style={{ position: 'absolute', top: -4, right: -4, background: '#D70015', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="admin-actions" style={{ marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <input type="url" className="admin-input-small" placeholder="Fotoğraf linki ekle (https://...)" value={photoLink}
                  onChange={(e) => setPhotoLink(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhotoToList(); } }} />
              </div>
              <button type="button" className="admin-button-small" onClick={addPhotoToList}>+ Fotoğraf</button>
            </div>
            <button className="admin-button-small success" style={{ marginTop: '16px', padding: '10px 32px', fontSize: '14px' }}
              onClick={handleSend} disabled={sending || !responseMsg.trim()}>
              {sending ? 'Gönderiliyor...' : 'Yanıt Gönder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
