-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE aspirasi_status AS ENUM ('menunggu', 'diproses', 'dibalas', 'diteruskan');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_email_type AS ENUM ('terkirim', 'gagal', 'tidak_ada');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pengirim_type AS ENUM ('siswa', 'humas');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notifikasi_tipe AS ENUM ('kode_tiket', 'balasan', 'aspirasi_baru');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_kirim_type AS ENUM ('sukses', 'gagal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aspirasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_tiket text NOT NULL UNIQUE,
  isi text NOT NULL,
  kategori text,
  email_siswa text,
  status_email text NOT NULL DEFAULT 'tidak_ada' CHECK (status_email IN ('terkirim', 'gagal', 'tidak_ada')),
  status text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'dibalas', 'diteruskan')),
  diteruskan_ke text,
  ditangani_oleh uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pesan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirasi_id uuid NOT NULL REFERENCES aspirasi(id) ON DELETE CASCADE,
  isi text NOT NULL,
  pengirim text NOT NULL CHECK (pengirim IN ('siswa', 'humas')),
  user_id uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirasi_id uuid NOT NULL REFERENCES aspirasi(id) ON DELETE CASCADE,
  tipe text NOT NULL CHECK (tipe IN ('kode_tiket', 'balasan', 'aspirasi_baru')),
  tujuan text NOT NULL,
  status_kirim text NOT NULL DEFAULT 'sukses' CHECK (status_kirim IN ('sukses', 'gagal')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aktivitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  aksi text NOT NULL,
  aspirasi_id uuid REFERENCES aspirasi(id),
  keterangan text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_aspirasi_kode_tiket ON aspirasi(kode_tiket);
CREATE INDEX IF NOT EXISTS idx_aspirasi_status ON aspirasi(status);
CREATE INDEX IF NOT EXISTS idx_aspirasi_created_at ON aspirasi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pesan_aspirasi_id ON pesan(aspirasi_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_aktivitas_user_id ON aktivitas(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspirasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesan ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktivitas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access
CREATE POLICY "Public insert aspirasi" ON aspirasi FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public select aspirasi by kode" ON aspirasi FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert pesan" ON pesan FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public select pesan" ON pesan FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies for authenticated users (dashboard)
CREATE POLICY "Auth select aspirasi" ON aspirasi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update aspirasi" ON aspirasi FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert pesan" ON pesan FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth select pesan" ON pesan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth select users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update users" ON users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete users" ON users FOR DELETE TO authenticated USING (true);
CREATE POLICY "Auth select notifikasi" ON notifikasi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert notifikasi" ON notifikasi FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth select aktivitas" ON aktivitas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert aktivitas" ON aktivitas FOR INSERT TO authenticated WITH CHECK (true);

-- Setup auto-update for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_aspirasi_updated_at
  BEFORE UPDATE ON aspirasi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();