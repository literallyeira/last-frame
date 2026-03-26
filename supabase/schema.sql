-- Last Frame Studio - Supabase Database Schema

-- Fotoğraf Alma Talepleri
CREATE TABLE IF NOT EXISTS photo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
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

-- RLS Policies (herkesin insert yapabilmesi için)
ALTER TABLE photo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE editing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on photo_requests"
  ON photo_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on editing_requests"
  ON editing_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on contact_messages"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);
