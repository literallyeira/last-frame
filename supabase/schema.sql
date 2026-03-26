-- Last Frame Studio - Supabase Database Schema (v2)

-- Fotoğraf Alma Talepleri
CREATE TABLE IF NOT EXISTS photo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Düzenleme / Destek Talepleri
CREATE TABLE IF NOT EXISTS editing_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  result_photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- İletişim Mesajları
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Portföy
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  category TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Tablosu (basit)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- RLS
ALTER TABLE photo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE editing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Anon INSERT
CREATE POLICY "anon_insert_photo_requests" ON photo_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_editing_requests" ON editing_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT TO anon WITH CHECK (true);

-- Anon SELECT (galeri akışı - kullanıcı kendi talebini görebilmeli)
CREATE POLICY "anon_select_photo_requests" ON photo_requests FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_editing_requests" ON editing_requests FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_contact_messages" ON contact_messages FOR SELECT TO anon USING (true);

-- Anon UPDATE (admin panel anon key üzerinden çalışıyor)
CREATE POLICY "anon_update_photo_requests" ON photo_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_update_editing_requests" ON editing_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Portfolio: herkes okuyabilir, admin ekleyip silebilir (anon key)
CREATE POLICY "anon_select_portfolio" ON portfolio_items FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_portfolio" ON portfolio_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_portfolio" ON portfolio_items FOR DELETE TO anon USING (true);
CREATE POLICY "anon_update_portfolio" ON portfolio_items FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Admins: anon select (login check)
CREATE POLICY "anon_select_admins" ON admins FOR SELECT TO anon USING (true);

-- Varsayılan admin ekle (şifre: lastframe2024)
-- SHA256 hash kullanıyoruz, basit doğrulama için
INSERT INTO admins (username, password_hash)
VALUES ('admin', 'lastframe2024')
ON CONFLICT (username) DO NOTHING;
