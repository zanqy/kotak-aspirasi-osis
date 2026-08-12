# 📋 Kotak Aspirasi OSIS — Ringkasan Cepat

> **Untuk AI & Developer** — baca ini dulu sebelum ngoding. Versi lengkap: [`README-LENGKAP.md`](README-LENGKAP.md)

---

## 1. Apa Ini?

Web app untuk siswa kirim aspirasi **anonim** ke OSIS (Humas), bisa dilacak via kode tiket `ASP-XXXX`, chat dua arah, dan dashboard admin.

---

## 2. Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Supabase | DB, Auth, Realtime |
| Resend | Email notifikasi |
| Tailwind CSS | Styling |
| Framer Motion | Animasi |

---

## 3. Alur Kerja Utama

### Publik (Siswa)

1. **Kirim aspirasi** di `/` → isi + kategori (opsional) + email (opsional)
2. **Dapat kode tiket** `ASP-XXXX` → tampil di layar + dikirim via email (jika email diisi)
3. **Cek status** di `/cek-aspirasi` → masukkan kode tiket → lihat status + chat thread
4. **Balas chat** → hanya bisa jika status `dibalas` → ketik & kirim

### Dashboard (Humas/Admin)

1. **Login** di `/dashboard/login` → email/password atau Google OAuth
2. **Middleware cek** session → cek status user (`pending`/`approved`/`rejected`) → redirect sesuai
3. **Overview** `/dashboard` → statistik + 5 aspirasi terbaru
4. **Kelola aspirasi** `/dashboard/aspirasi` → filter status, search, klik detail
5. **Detail & balas** `/dashboard/aspirasi/[id]` → chat thread, kirim balasan, teruskan ke divisi
6. **Kelola anggota** `/dashboard/anggota` (admin only) → approve/reject/hapus user

### Status Aspirasi

```
menunggu → diproses → dibalas
                    → diteruskan
```

### Notifikasi Email (Resend)

- **Kode tiket**: dikirim setelah submit (jika email diisi)
- **Balasan**: dikirim setelah humas membalas (jika email ada & sebelumnya terkirim)

---

## 4. Struktur Database (5 Tabel)

| Tabel | Isi | Catatan |
|-------|-----|---------|
| `users` | Anggota humas (email, role, status) | Status: pending/approved/rejected |
| `aspirasi` | Data aspirasi siswa | Kode tiket unik, status, email_siswa (opsional) |
| `pesan` | Chat dua arah | pengirim: siswa/humas |
| `notifikasi` | Log kirim email | tipe: kode_tiket/balasan/aspirasi_baru |
| `aktivitas` | Log aktivitas humas | aksi + keterangan |

- **RLS aktif** di semua tabel
- **Trigger auto `updated_at`** di `users` & `aspirasi`

---

## 5. Struktur Folder Inti

```
app/                  # Pages + API Routes (App Router)
├── page.tsx          # Landing + form aspirasi
├── cek-aspirasi/     # Cek status publik
├── dashboard/        # Dashboard pages (overview, aspirasi, anggota, login)
└── api/              # API routes (aspirasi/*, auth/*, dashboard/*)

components/
├── layout/           # ClientLayout, DashboardNav, BottomTabBar
├── ui/               # AspirasiItem, Badge, Button, ChatBubble, Dropdown, StatCard
└── animations/       # EntranceWrapper, LineDraw, MotionProvider, PageTransition, dll

hooks/                # useCountUp, useFirstVisit, usePrefersReducedMotion, useTypewriter
lib/                  # supabase.ts, supabase-server.ts, resend.ts, auth-api.ts, utils.ts
supabase/migration.sql
middleware.ts
```

---

## 6. Poin Penting untuk AI

### Supabase Client

| Konteks | Client | File |
|---------|--------|------|
| Public pages | `createServiceClient()` (Service Role) | [`lib/supabase.ts`](../lib/supabase.ts) |
| Dashboard pages | `createBrowserClient()` (Browser) | [`lib/supabase.ts`](../lib/supabase.ts) |
| API routes | `createServiceClient()` (Service Role, bypass RLS) | [`lib/supabase.ts`](../lib/supabase.ts) |
| Server SSR | `createServerSupabaseClient()` (@supabase/ssr) | [`lib/supabase-server.ts`](../lib/supabase-server.ts) |

### Privacy

- **Email siswa** (`email_siswa`) **dihapus dari response API** — jangan pernah kirim ke client

### Orientasi Chat

| View | Siswa | Humas |
|------|-------|-------|
| Publik (`/cek-aspirasi`) | **Kanan** (navy) | **Kiri** (putih+border) |
| Dashboard | **Kiri** (putih+border) | **Kanan** (navy) |

### Env Vars Utama

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**server-only**) |
| `RESEND_API_KEY` | API key Resend |
| `RESEND_FROM_EMAIL` | Email pengirim |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Kredensial admin default |
| `NEXT_PUBLIC_APP_URL` | Base URL (untuk link di email) |

### Middleware

- Proteksi semua `/dashboard/*` → cek session + status user + role (untuk `/dashboard/anggota`)
- File: [`middleware.ts`](../middleware.ts)

### Auth Helpers

- [`verifyAuth()`](../lib/auth-api.ts) — verifikasi dari Authorization header/cookie
- [`verifyAuthDashboard()`](../lib/auth-api.ts) — verifikasi + cek status & role di tabel `users`

---

> **Butuh detail lebih?** Buka [`docs/README-LENGKAP.md`](README-LENGKAP.md)
