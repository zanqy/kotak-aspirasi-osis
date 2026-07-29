# 📋 Kotak Aspirasi OSIS — Dokumentasi Lengkap

> **Versi:** 0.1.0
> **Stack:** Next.js 14 + Supabase + Resend + Framer Motion
> **Tujuan:** Sistem pengelolaan aspirasi siswa untuk OSIS (Humas)

---

## 📑 Daftar Isi

- [📋 Kotak Aspirasi OSIS — Dokumentasi Lengkap](#-kotak-aspirasi-osis--dokumentasi-lengkap)
  - [📑 Daftar Isi](#-daftar-isi)
  - [1. Gambaran Umum](#1-gambaran-umum)
  - [2. Tech Stack](#2-tech-stack)
  - [3. Arsitektur Aplikasi](#3-arsitektur-aplikasi)
    - [3.1 Struktur Folder Lengkap](#31-struktur-folder-lengkap)
  - [4. Struktur Database](#4-struktur-database)
    - [4.1 Tabel `users`](#41-tabel-users)
    - [4.2 Tabel `aspirasi`](#42-tabel-aspirasi)
    - [4.3 Tabel `pesan`](#43-tabel-pesan)
    - [4.4 Tabel `notifikasi`](#44-tabel-notifikasi)
    - [4.5 Tabel `aktivitas`](#45-tabel-aktivitas)
    - [4.6 Enum Types](#46-enum-types)
    - [4.7 Indexes](#47-indexes)
    - [4.8 Row Level Security (RLS)](#48-row-level-security-rls)
    - [4.9 Trigger Auto `updated_at`](#49-trigger-auto-updated_at)
  - [5. Fitur \& Alur Bisnis](#5-fitur--alur-bisnis)
    - [5.1 Publik: Kirim Aspirasi](#51-publik-kirim-aspirasi)
    - [5.2 Publik: Cek Status Aspirasi](#52-publik-cek-status-aspirasi)
    - [5.3 Publik: Kirim Pesan Balasan (Siswa)](#53-publik-kirim-pesan-balasan-siswa)
    - [5.4 Dashboard: Login \& Autentikasi](#54-dashboard-login--autentikasi)
    - [5.5 Dashboard: Overview](#55-dashboard-overview)
    - [5.6 Dashboard: Kelola Aspirasi](#56-dashboard-kelola-aspirasi)
    - [5.7 Dashboard: Detail \& Balas Aspirasi](#57-dashboard-detail--balas-aspirasi)
    - [5.8 Dashboard: Kelola Anggota](#58-dashboard-kelola-anggota)
  - [6. API Endpoints](#6-api-endpoints)
    - [6.1 Public API](#61-public-api)
    - [6.2 Dashboard API (Authenticated)](#62-dashboard-api-authenticated)
  - [7. Alur Notifikasi Email](#7-alur-notifikasi-email)
  - [8. Komponen UI](#8-komponen-ui)
    - [8.1 Layout Components](#81-layout-components)
    - [8.2 UI Components](#82-ui-components)
  - [9. Utility Functions](#9-utility-functions)
  - [9a. Custom Hooks](#9a-custom-hooks)
  - [9b. Komponen Animasi](#9b-komponen-animasi)
  - [10. Middleware \& Proteksi Route](#10-middleware--proteksi-route)
  - [11. Environment Variables](#11-environment-variables)
  - [12. Cara Setup \& Instalasi](#12-cara-setup--instalasi)
  - [13. Cara Pakai](#13-cara-pakai)
    - [13.1 Untuk Siswa](#131-untuk-siswa)
    - [13.2 Untuk Humas OSIS](#132-untuk-humas-osis)
    - [13.3 Untuk Admin](#133-untuk-admin)
  - [14. Desain Sistem](#14-desain-sistem)
  - [15. Catatan Keamanan](#15-catatan-keamanan)
  - [16. Catatan Teknis & Saran Improvement](#16-catatan-teknis--saran-improvement)

---

## 1. Gambaran Umum

**Kotak Aspirasi OSIS** adalah aplikasi berbasis web yang memungkinkan siswa menyampaikan aspirasi, kritik, saran, atau masukan kepada OSIS secara **anonim** dan **mudah dilacak**. Aplikasi ini dikembangkan menggunakan Next.js 14 dengan App Router, Supabase sebagai backend-as-a-service, dan Resend untuk pengiriman email.

**Fitur Utama:**
- 📝 Siswa dapat mengirim aspirasi secara anonim (opsional menyertakan email)
- 🔑 Mendapatkan kode tiket unik untuk melacak status aspirasi
- 💬 Sistem chat dua arah antara siswa dan Humas OSIS
- 📊 Dashboard admin untuk mengelola aspirasi, membalas, meneruskan ke divisi lain
- 👥 Manajemen anggota Humas OSIS (approval akses)
- 📧 Notifikasi email otomatis (kode tiket + notifikasi balasan)
- 🔐 Autentikasi via email/password dan Google OAuth

---

## 2. Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Next.js](https://nextjs.org/) | 14.2.35 | Framework React (App Router) |
| [React](https://react.dev/) | ^18 | Library UI |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |
| [Supabase](https://supabase.com/) | ^2.109.0 | Database, Auth, Realtime |
| [Supabase SSR](https://supabase.com/docs/guides/auth/server-side) | ^0.12.0 | Server-side auth helpers & cookies |
| [Resend](https://resend.com/) | ^6.17.1 | Email service |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.1 | Styling |
| [Framer Motion](https://www.framer.com/motion/) | ^12.42.2 | Animasi |
| [ESLint](https://eslint.org/) | ^8 | Linting |

---

## 3. Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │   Public Pages       │  │   Dashboard Pages             │  │
│  │   - / (Home)         │  │   - /dashboard (Overview)     │  │
│  │   - /cek-aspirasi    │  │   - /dashboard/aspirasi       │  │
│  │                      │  │   - /dashboard/aspirasi/[id]  │  │
│  │                      │  │   - /dashboard/anggota        │  │
│  │                      │  │   - /dashboard/login          │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API Routes (Next.js)                     │    │
│  │  /api/aspirasi/*          /api/dashboard/*            │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                           │                      │
└───────────┼───────────────────────────┼──────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL   │  │  Auth        │  │  Storage (RLS)   │  │
│  │  - users      │  │  - Email/PW  │  │                  │  │
│  │  - aspirasi   │  │  - Google    │  │                  │  │
│  │  - pesan      │  │  OAuth       │  │                  │  │
│  │  - notifikasi │  └──────────────┘  └──────────────────┘  │
│  │  - aktivitas  │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Resend (Email)                            │
│  - Kirim kode tiket ke siswa                                 │
│  - Kirim notifikasi balasan ke siswa                         │
└─────────────────────────────────────────────────────────────┘
```

**Client-Server Flow:**
- Public pages menggunakan **Service Role Client** (`createServiceClient()`) untuk akses langsung ke database tanpa autentikasi pengguna
- Dashboard pages menggunakan **Browser Client** (`createBrowserClient()`) untuk autentikasi dan realtime subscription
- API Routes menggunakan **Service Role Client** untuk bypass RLS (karena autentikasi sudah ditangani di middleware/auth-api)
- Server-side helper: [`lib/supabase-server.ts`](lib/supabase-server.ts) menyediakan `createServerSupabaseClient()` menggunakan `@supabase/ssr` untuk konteks server yang membutuhkan cookie handling
- Middleware menangani proteksi route dashboard dan pengecekan status user

### 3.1 Struktur Folder Lengkap

```
📦 kotak-aspirasi-osis/
├── .eslintrc.json                    # Konfigurasi ESLint
├── .gitignore                        # Git ignore rules
├── middleware.ts                     # Proteksi route dashboard & API
├── next.config.mjs                   # Konfigurasi Next.js
├── package.json                      # Dependencies & scripts
├── package-lock.json
├── postcss.config.mjs                # Konfigurasi PostCSS (Tailwind)
├── tailwind.config.ts                # Konfigurasi Tailwind CSS
├── tsconfig.json                     # Konfigurasi TypeScript
│
├── README.md                         # README utama project
│
├── app/                              # 📁 Next.js App Router
│   ├── favicon.ico
│   ├── globals.css                   # Global styles + Tailwind
│   ├── layout.tsx                    # Root layout (html, body, metadata)
│   ├── page.tsx                      # 🏠 Landing page + form aspirasi publik
│   │
│   ├── cek-aspirasi/
│   │   └── page.tsx                  # 🔍 Cek status aspirasi (publik)
│   │
│   ├── dashboard/
│   │   ├── page.tsx                  # 📊 Overview dashboard
│   │   ├── login/
│   │   │   └── page.tsx              # 🔐 Halaman login (email + Google)
│   │   ├── aspirasi/
│   │   │   ├── page.tsx              # 📋 List semua aspirasi
│   │   │   └── [id]/
│   │   │       └── page.tsx          # 💬 Detail & chat aspirasi
│   │   └── anggota/
│   │       └── page.tsx              # 👥 Manajemen anggota (admin only)
│   │
│   ├── fonts/
│   │   ├── GeistVF.woff              # Font Geist (Variable)
│   │   └── GeistMonoVF.woff          # Font Geist Mono (Variable)
│   │
│   └── api/                          # ⚡ API Routes
│       ├── aspirasi/
│       │   ├── route.ts              # POST — Submit aspirasi baru
│       │   └── [kode]/
│       │       ├── route.ts          # GET — Detail aspirasi by kode tiket
│       │       └── pesan/
│       │           └── route.ts      # POST — Kirim pesan dari siswa
│       │
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts          # POST — Login email/password
│       │   ├── login/google/
│       │   │   └── route.ts          # POST — Login Google OAuth
│       │   ├── callback/
│       │   │   └── route.ts          # GET — OAuth callback (set cookies)
│       │   ├── logout/
│       │   │   └── route.ts          # POST — Logout (clear cookies)
│       │   └── session/
│       │       └── route.ts          # GET — Cek session user
│       │
│       └── dashboard/
│           ├── aspirasi/
│           │   ├── route.ts          # GET — List aspirasi (filter, search)
│           │   └── [id]/
│           │       ├── route.ts      # GET — Detail aspirasi by id
│           │       │                 # PATCH — Update aspirasi
│           │       └── pesan/
│           │           └── route.ts  # POST — Kirim balasan dari humas
│           │
│           └── anggota/
│               ├── route.ts          # GET — List anggota
│               └── [id]/
│                   └── route.ts      # PATCH — Approve/reject anggota
│                                     # DELETE — Hapus anggota
│
├── components/                       # 🧩 React Components
│   ├── layout/
│   │   ├── ClientLayout.tsx          # Client wrapper (MotionProvider + PageTransition)
│   │   ├── DashboardNav.tsx          # Top nav bar dashboard (title, back, avatar)
│   │   └── BottomTabBar.tsx          # Bottom tab bar (Overview, Aspirasi, Anggota)
│   ├── ui/
│   │   ├── AspirasiItem.tsx          # Item daftar aspirasi
│   │   ├── Badge.tsx                 # Badge status (7 varian warna)
│   │   ├── Button.tsx                # Tombol (4 variant: primary, secondary, success, danger)
│   │   ├── ChatBubble.tsx            # Bubble chat (kiri/kanan)
│   │   ├── Dropdown.tsx              # Custom dropdown (bukan native select)
│   │   └── StatCard.tsx              # Kartu statistik (4 varian warna)
│   └── animations/                   # 🎬 Komponen Animasi
│       ├── EntranceWrapper.tsx       # Wrapper animasi masuk (scale + fade)
│       ├── LineDraw.tsx              # Animasi garis SVG yang menggambar sendiri
│       ├── MotionProvider.tsx        # Context provider untuk preferensi animasi
│       ├── PageTransition.tsx        # Transisi halaman horizontal slide
│       ├── StaggerContainer.tsx      # Container dengan stagger animation untuk children
│       └── Typewriter.tsx            # Efek typewriter mengetik teks
│
├── hooks/                            # 🪝 Custom React Hooks
│   ├── useCountUp.ts                 # Animasi angka count-up (0 → target)
│   ├── useFirstVisit.ts             # Deteksi kunjungan pertama via sessionStorage
│   ├── usePrefersReducedMotion.ts   # Deteksi preferensi reduced motion user
│   └── useTypewriter.ts             # Hook untuk efek typewriter
│
├── lib/                              # 📚 Library & Utilities
│   ├── auth-api.ts                   # verifyAuth() & verifyAuthDashboard()
│   ├── resend.ts                     # Resend client & kirimEmail()
│   ├── supabase-server.ts            # createServerSupabaseClient() — @supabase/ssr
│   ├── supabase.ts                   # createBrowserClient() & createServiceClient()
│   └── utils.ts                      # generateKodeTiket(), formatWaktu(), getInisial(), getAnimationMode()
│
├── supabase/
│   └── migration.sql                 # Database schema: tabel, enum, index, RLS, trigger
│
└── docs/
    └── README-LENGKAP.md             # 📖 Dokumentasi lengkap ini
```

---

## 4. Struktur Database

Database menggunakan **PostgreSQL** via Supabase dengan **Row Level Security (RLS)**.

### 4.1 Tabel `users`

Menyimpan data anggota Humas OSIS yang terdaftar.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid PK` | Primary key, default `gen_random_uuid()` |
| `email` | `text NOT NULL UNIQUE` | Email pengguna |
| `name` | `text` | Nama lengkap |
| `avatar_url` | `text` | URL foto profil (dari Google) |
| `role` | `text` | Role: `'admin'` atau `'member'` (default: `'member'`) |
| `status` | `text` | Status: `'pending'`, `'approved'`, atau `'rejected'` (default: `'pending'`) |
| `created_at` | `timestamptz` | Waktu dibuat (default: `now()`) |
| `updated_at` | `timestamptz` | Waktu diupdate (auto via trigger) |

**Relasi:** Tidak ada foreign key ke auth.users (pendaftaran via trigger atau manual).

### 4.2 Tabel `aspirasi`

Menyimpan data aspirasi yang dikirim siswa.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid PK` | Primary key |
| `kode_tiket` | `text NOT NULL UNIQUE` | Kode unik format `ASP-XXXX` |
| `isi` | `text NOT NULL` | Isi aspirasi |
| `kategori` | `text` | Kategori aspirasi (opsional) |
| `email_siswa` | `text` | Email siswa untuk notifikasi (opsional) |
| `status_email` | `text` | Status pengiriman email: `'terkirim'`, `'gagal'`, `'tidak_ada'` (default: `'tidak_ada'`) |
| `status` | `text` | Status aspirasi: `'menunggu'`, `'diproses'`, `'dibalas'`, `'diteruskan'` (default: `'menunggu'`) |
| `diteruskan_ke` | `text` | Nama divisi tujuan jika diteruskan |
| `ditangani_oleh` | `uuid FK → users.id` | User yang menangani aspirasi |
| `created_at` | `timestamptz` | Waktu dibuat (default: `now()`) |
| `updated_at` | `timestamptz` | Waktu diupdate (auto via trigger) |

### 4.3 Tabel `pesan`

Menyimpan pesan/balasan dalam percakapan aspirasi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid PK` | Primary key |
| `aspirasi_id` | `uuid NOT NULL FK → aspirasi(id) ON DELETE CASCADE` | Relasi ke aspirasi |
| `isi` | `text NOT NULL` | Isi pesan |
| `pengirim` | `text` | Jenis pengirim: `'siswa'` atau `'humas'` |
| `user_id` | `uuid FK → users(id)` | User humas yang mengirim (NULL jika dari siswa) |
| `created_at` | `timestamptz` | Waktu dibuat (default: `now()`) |

### 4.4 Tabel `notifikasi`

Mencatat riwayat pengiriman notifikasi email.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid PK` | Primary key |
| `aspirasi_id` | `uuid NOT NULL FK → aspirasi(id) ON DELETE CASCADE` | Relasi ke aspirasi |
| `tipe` | `text` | Tipe notifikasi: `'kode_tiket'`, `'balasan'`, `'aspirasi_baru'` |
| `tujuan` | `text NOT NULL` | Alamat email tujuan |
| `status_kirim` | `text` | Status: `'sukses'` atau `'gagal'` (default: `'sukses'`) |
| `created_at` | `timestamptz` | Waktu dibuat (default: `now()`) |

### 4.5 Tabel `aktivitas`

Mencatat log aktivitas yang dilakukan user di dashboard.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid PK` | Primary key |
| `user_id` | `uuid NOT NULL FK → users(id)` | User yang melakukan aksi |
| `aksi` | `text NOT NULL` | Deskripsi aksi (contoh: `'Mengirim balasan'`) |
| `aspirasi_id` | `uuid FK → aspirasi(id)` | Aspirasi terkait (opsional) |
| `keterangan` | `text` | Detail tambahan (opsional) |
| `created_at` | `timestamptz` | Waktu dibuat (default: `now()`) |

### 4.6 Enum Types

```sql
user_role       → ENUM ('admin', 'member')
user_status     → ENUM ('pending', 'approved', 'rejected')
aspirasi_status → ENUM ('menunggu', 'diproses', 'dibalas', 'diteruskan')
status_email_type → ENUM ('terkirim', 'gagal', 'tidak_ada')
pengirim_type   → ENUM ('siswa', 'humas')
notifikasi_tipe → ENUM ('kode_tiket', 'balasan', 'aspirasi_baru')
status_kirim_type → ENUM ('sukses', 'gagal')
```

> **Catatan:** Enum digunakan sebagai referensi, namun di tabel menggunakan tipe `text` dengan `CHECK` constraint.

### 4.7 Indexes

| Index | Tabel | Kolom | Tujuan |
|-------|-------|-------|--------|
| `idx_aspirasi_kode_tiket` | aspirasi | kode_tiket | Pencarian cepat berdasarkan kode tiket |
| `idx_aspirasi_status` | aspirasi | status | Filter berdasarkan status |
| `idx_aspirasi_created_at` | aspirasi | created_at DESC | Urutan waktu terbaru |
| `idx_pesan_aspirasi_id` | pesan | aspirasi_id | JOIN dengan aspirasi |
| `idx_users_status` | users | status | Filter user by status |
| `idx_aktivitas_user_id` | aktivitas | user_id | JOIN aktivitas dengan user |

### 4.8 Row Level Security (RLS)

**Public Access (anon, authenticated):**
- `aspirasi`: INSERT bebas, SELECT hanya by kode_tiket
- `pesan`: INSERT bebas, SELECT bebas

**Authenticated Access (dashboard):**
- `aspirasi`: SELECT semua, UPDATE semua
- `pesan`: INSERT, SELECT
- `users`: SELECT, UPDATE, DELETE
- `notifikasi`: SELECT, INSERT
- `aktivitas`: SELECT, INSERT

### 4.9 Trigger Auto `updated_at`

Fungsi `update_updated_at()` secara otomatis mengisi `updated_at = now()` setiap kali baris diupdate pada tabel `users` dan `aspirasi`.

---

## 5. Fitur & Alur Bisnis

### 5.1 Publik: Kirim Aspirasi

**File:** [`app/page.tsx`](app/page.tsx), [`app/api/aspirasi/route.ts`](app/api/aspirasi/route.ts)

**Alur:**
1. Siswa membuka halaman utama (`/`)
2. Memilih kategori (opsional) via custom dropdown
3. Menulis isi aspirasi di textarea
4. Mengisi email (opsional — hanya untuk menerima kode tiket via email, tidak disimpan untuk identifikasi)
5. Sistem menghasilkan kode tiket unik format `ASP-XXXX` (inkremental berdasarkan total aspirasi)
6. Data aspirasi disimpan ke database dengan status `menunggu`
7. **Jika email diisi:**
   - Sistem mengirim email berisi kode tiket melalui Resend
   - Status email dicatat (`terkirim` / `gagal`)
   - Notifikasi dicatat di tabel `notifikasi`
8. Halaman menampilkan kode tiket dengan opsi salin dan cek status

**Validasi:**
- Isi aspirasi wajib diisi (tidak boleh kosong)
- Email tidak divalidasi format (hanya opsional, dikirim via Resend)
- Kategori opsional — bisa dikosongkan

**State setelah submit:**
- Halaman berganti ke tampilan konfirmasi dengan kode tiket
- Tombol "Salin Kode" (copy to clipboard) dan "Cek Status Aspirasi →"

**Kode Tiket Generation:**
```typescript
// lib/utils.ts
generateKodeTiket(total: number): string
// Output: "ASP-2847" (padding 4 digit)
```

### 5.2 Publik: Cek Status Aspirasi

**File:** [`app/cek-aspirasi/page.tsx`](app/cek-aspirasi/page.tsx), [`app/api/aspirasi/[kode]/route.ts`](app/api/aspirasi/[kode]/route.ts)

**4 State yang dihandle:**

1. **State 1 — Input kode:** Input kode tiket dengan letter-spacing lebar + tombol "Cek Status"
2. **State 2 — Loading:** Skeleton loading animation saat fetch data
3. **State 3 — Error / Tidak ditemukan:** Input border merah (`#fff0f0` / `#f5b8b8`), pesan error, tombol "Coba Lagi"
4. **State 4 — Data ditemukan:** Menampilkan meta (status, waktu, kategori) + chat thread

**Alur:**
1. Siswa membuka `/cek-aspirasi` (dengan atau tanpa parameter `?kode=ASP-XXXX`)
2. Memasukkan kode tiket (otomatis di-uppercase, case-insensitive)
3. Sistem mencari aspirasi berdasarkan kode tiket
4. **Jika ditemukan:**
   - Menampilkan informasi: status (badge), waktu kirim, kategori
   - Menampilkan chat thread dengan bubble:
     - **Pesan siswa** → gelembung kanan, navy `#49769f`, label "Kamu"
     - **Balasan Humas** → gelembung kiri, putih + border, label "Humas OSIS"
   - Jika status `dibalas`, input area aktif untuk membalas
   - **Realtime subscription:** Update pesan dan status baru muncul otomatis tanpa refresh
5. **Jika tidak ditemukan:**
   - Input border merah dengan background `#fff0f0`
   - Pesan error: "Kode tiket tidak ditemukan. Pastikan kode yang kamu masukkan benar."
   - Tombol "Coba Lagi" untuk mereset

**Keamanan:** Email siswa (`email_siswa`) tidak disertakan dalam response API (di-delete sebelum dikirim).

### 5.3 Publik: Kirim Pesan Balasan (Siswa)

**File:** [`app/api/aspirasi/[kode]/pesan/route.ts`](app/api/aspirasi/[kode]/pesan/route.ts)

**Alur:**
1. Hanya bisa dilakukan jika status aspirasi adalah `dibalas`
2. Siswa mengetik pesan dan mengirim
3. Pesan disimpan dengan `pengirim = 'siswa'` dan `user_id = null`
4. Pesan muncul di chat tanpa refresh halaman

### 5.4 Dashboard: Login & Autentikasi

**File:** [`app/dashboard/login/page.tsx`](app/dashboard/login/page.tsx), [`middleware.ts`](middleware.ts)

**Alur Login:**
1. User membuka `/dashboard/login`
2. **Metode 1 — Email/Password:**
   - Input email dan password
   - `supabase.auth.signInWithPassword()`
3. **Metode 2 — Google OAuth:**
   - Klik tombol "Masuk dengan Google"
   - `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - Redirect ke `/dashboard` setelah berhasil

**Alur Middleware (proteksi route):**
1. Setiap akses ke `/dashboard/*` dicek session
2. **Jika tidak ada session** → redirect ke `/dashboard/login`
3. **Jika ada session:**
   - Cek user di tabel `users`
   - Jika `status = 'pending'` → redirect ke login dengan `?status=pending`
   - Jika `status = 'rejected'` → redirect ke login dengan `?status=rejected`
   - Jika `status = 'approved'` → lanjut
4. **Akses ke `/dashboard/anggota`** hanya untuk role `admin`

### 5.5 Dashboard: Overview

**File:** [`app/dashboard/page.tsx`](app/dashboard/page.tsx)

**Fitur:**
- Statistik: Total aspirasi, Belum dibalas, Sudah dibalas, Diteruskan
- Daftar 5 aspirasi terbaru
- Navigasi bottom tab bar (Overview, Aspirasi, Anggota)

### 5.6 Dashboard: Kelola Aspirasi

**File:** [`app/dashboard/aspirasi/page.tsx`](app/dashboard/aspirasi/page.tsx), [`app/api/dashboard/aspirasi/route.ts`](app/api/dashboard/aspirasi/route.ts)

**Fitur:**
- **Filter berdasarkan status:** Semua, Menunggu, Diproses, Dibalas, Diteruskan
- **Pencarian:** Berdasarkan kode tiket atau isi aspirasi
- Daftar aspirasi dengan badge status dan kategori

### 5.7 Dashboard: Detail & Balas Aspirasi

**File:** [`app/dashboard/aspirasi/[id]/page.tsx`](app/dashboard/aspirasi/[id]/page.tsx), [`app/api/dashboard/aspirasi/[id]/route.ts`](app/api/dashboard/aspirasi/[id]/route.ts), [`app/api/dashboard/aspirasi/[id]/pesan/route.ts`](app/api/dashboard/aspirasi/[id]/pesan/route.ts)

**Alur Detail:**
1. Menampilkan informasi aspirasi: kode tiket + badge status, kategori, waktu masuk, penangan, penerusan
2. Menampilkan chat thread dengan urutan:
   - **Pesan siswa** → gelembung kiri, putih + border, label "Anonim"
   - **Balasan Humas** → gelembung kanan, navy `#49769f`, label nama anggota yang membalas
   - Perbedaan orientasi dengan halaman publik (di publik: siswa=kanan, humas=kiri)
3. **Membalas:**
   - Input teks + tombol kirim dengan placeholder "Balas sebagai Humas OSIS..."
   - Pesan disimpan dengan `pengirim = 'humas'` dan `user_id` dari session
   - Status aspirasi otomatis berubah menjadi `dibalas` jika sebelumnya `menunggu` atau `diproses`
   - **Jika email siswa ada & status_email terkirim:** Kirim notifikasi email balasan via Resend
   - Aktivitas dicatat di tabel `aktivitas`
   - **Realtime subscription:** Pesan baru dan update status muncul otomatis
4. **Meneruskan ke divisi lain:**
   - Tombol "Teruskan ke divisi lain →" meng-expand input field
   - Input nama divisi + simpan
   - Status berubah menjadi `diteruskan`
   - Field `diteruskan_ke` diisi dengan nama divisi

**Catatan Chat Orientation:**
| View | Pengirim | Posisi | Style |
|------|----------|--------|-------|
| Publik (`/cek-aspirasi`) | Siswa (Kamu) | Kanan | Navy, teks putih |
| Publik (`/cek-aspirasi`) | Humas OSIS | Kiri | Putih + border |
| Dashboard | Siswa (Anonim) | Kiri | Putih + border |
| Dashboard | Humas (nama anggota) | Kanan | Navy, teks putih |

### 5.8 Dashboard: Kelola Anggota

**File:** [`app/dashboard/anggota/page.tsx`](app/dashboard/anggota/page.tsx), [`app/api/dashboard/anggota/route.ts`](app/api/dashboard/anggota/route.ts), [`app/api/dashboard/anggota/[id]/route.ts`](app/api/dashboard/anggota/[id]/route.ts)

**Fitur (khusus admin):**
- Melihat daftar anggota Humas OSIS
- **Permintaan Akses:** User yang baru mendaftar dengan status `pending` dapat di-*approve* atau *reject*
- **Anggota Aktif:** Menampilkan member dengan status `approved`
- **Hapus Anggota:** Menghapus user dari tabel (non-admin, bukan diri sendiri)

---

## 6. API Endpoints

### 6.1 Public API

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | [`/api/aspirasi`](app/api/aspirasi/route.ts) | Mengirim aspirasi baru | ❌ Tidak |
| `GET` | `/api/aspirasi/[kode]` | Mendapatkan detail aspirasi by kode tiket | ❌ Tidak |
| `POST` | `/api/aspirasi/[kode]/pesan` | Mengirim pesan balasan (dari siswa) | ❌ Tidak |

### 6.2 Dashboard API (Authenticated)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | [`/api/dashboard/aspirasi`](app/api/dashboard/aspirasi/route.ts) | Daftar aspirasi (dengan filter & search) | ✅ Session |
| `GET` | `/api/dashboard/aspirasi/[id]` | Detail aspirasi + pesan | ✅ Session |
| `PATCH` | `/api/dashboard/aspirasi/[id]` | Update aspirasi (status, kategori, dll) | ✅ Session |
| `POST` | `/api/dashboard/aspirasi/[id]/pesan` | Kirim balasan (dari humas) + update status | ✅ Session |
| `GET` | [`/api/dashboard/anggota`](app/api/dashboard/anggota/route.ts) | Daftar semua user | ✅ Session |
| `PATCH` | `/api/dashboard/anggota/[id]` | Update status user (approve/reject) | ✅ Session |
| `DELETE` | `/api/dashboard/anggota/[id]` | Hapus user | ✅ Session |

---

## 7. Alur Notifikasi Email

Notifikasi email dikirim menggunakan **Resend** ([`lib/resend.ts`](lib/resend.ts)).

**Skenario 1: Kirim Kode Tiket**
- **Trigger:** Setelah aspirasi berhasil disimpan (jika email diisi)
- **Tujuan:** Email siswa
- **Template:** Informasi kode tiket + link cek status
- **Catatan:** Status pengiriman dicatat di `aspirasi.status_email` dan tabel `notifikasi`

**Skenario 2: Kirim Notifikasi Balasan**
- **Trigger:** Setelah humas mengirim balasan (jika email siswa ada & sebelumnya terkirim)
- **Tujuan:** Email siswa
- **Template:** Pemberitahuan balasan baru + link lihat balasan
- **Catatan:** Dicatat di tabel `notifikasi` dengan tipe `'balasan'`

**Service:** [`lib/resend.ts`](lib/resend.ts)
```typescript
kirimEmail(to: string, subject: string, html: string): Promise<boolean>
```

---

## 8. Komponen UI

### 8.1 Layout Components

| Komponen | File | Fungsi |
|----------|------|--------|
| `DashboardNav` | [`components/layout/DashboardNav.tsx`](components/layout/DashboardNav.tsx) | Top navigation bar untuk dashboard (title, subtitle, back button, avatar) |
| `BottomTabBar` | [`components/layout/BottomTabBar.tsx`](components/layout/BottomTabBar.tsx) | Bottom tab bar navigasi (Overview, Aspirasi, Anggota) |

### 8.2 UI Components

| Komponen | File | Props | Fungsi |
|----------|------|-------|--------|
| `Badge` | [`components/ui/Badge.tsx`](components/ui/Badge.tsx) | `status` | Menampilkan badge status dengan warna sesuai tipe |
| `Button` | [`components/ui/Button.tsx`](components/ui/Button.tsx) | `variant: 'primary' \| 'secondary' \| 'success' \| 'danger'`, `children`, `onClick`, `disabled` | Tombol dengan 4 varian style: primary (biru solid), secondary (outline), success (hijau), danger (merah) |
| `Dropdown` | [`components/ui/Dropdown.tsx`](components/ui/Dropdown.tsx) | `options: string[]`, `value`, `onChange`, `placeholder` | Custom dropdown (bukan native select) dengan animasi arrow rotate, click-outside close, dan centang pada item terpilih |
| `ChatBubble` | [`components/ui/ChatBubble.tsx`](components/ui/ChatBubble.tsx) | `isi`, `pengirim`, `label`, `waktu` | Bubble chat untuk tampilan percakapan |
| `StatCard` | [`components/ui/StatCard.tsx`](components/ui/StatCard.tsx) | `number`, `label`, `color?: 'default' \| 'yellow' \| 'green' \| 'purple'` | Kartu statistik dengan 4 varian warna (default navy, yellow, green, purple) |
| `AspirasiItem` | [`components/ui/AspirasiItem.tsx`](components/ui/AspirasiItem.tsx) | `kode`, `waktu`, `preview`, `status`, `kategori`, `onClick` | Item daftar aspirasi |

---

## 9. Utility Functions

### lib/utils.ts

**File:** [`lib/utils.ts`](lib/utils.ts)

| Fungsi | Deskripsi |
|--------|-----------|
| `generateKodeTiket(total)` | Menghasilkan kode tiket format `ASP-XXXX` (4 digit zero-padded) berdasarkan jumlah total aspirasi |
| `formatWaktu(date)` | Memformat waktu relatif (Baru saja, X menit lalu, X jam lalu, X hari lalu, atau tanggal lengkap) |
| `getInisial(name)` | Mengambil inisial dari nama (contoh: "John Doe" → "JD"), fallback "?" jika kosong |
| `getAnimationMode()` | Mengecek sessionStorage untuk menentukan mode animasi: `'full'` (first visit) atau `'quick'` (navigasi) |

### lib/supabase.ts

**File:** [`lib/supabase.ts`](lib/supabase.ts)

| Fungsi | Deskripsi |
|--------|-----------|
| `createBrowserClient()` | Membuat Supabase client untuk browser (anon key, session persist, auto-refresh token) — singleton |
| `createServiceClient()` | Membuat Supabase client untuk server (service role key, tanpa session, tanpa auto-refresh) |

### lib/supabase-server.ts

**File:** [`lib/supabase-server.ts`](lib/supabase-server.ts)

| Fungsi | Deskripsi |
|--------|-----------|
| `createServerSupabaseClient()` | Membuat Supabase client menggunakan `@supabase/ssr` untuk server-side rendering — cookie getter/setter no-op (sesuai konteks) |

### lib/resend.ts

**File:** [`lib/resend.ts`](lib/resend.ts)

| Fungsi | Deskripsi |
|--------|-----------|
| `getResendClient()` | Membuat Resend client instance |
| `kirimEmail(to, subject, html)` | Mengirim email via Resend, mengembalikan `boolean` sukses/gagal |

### lib/auth-api.ts

**File:** [`lib/auth-api.ts`](lib/auth-api.ts)

| Fungsi | Deskripsi |
|--------|-----------|
| `verifyAuth(request)` | Memverifikasi autentikasi dari request (Authorization header atau cookie), mengembalikan user ID & email atau error response |
| `verifyAuthDashboard(request, allowedRoles?)` | Verifikasi auth + cek status & role user di tabel `users`. Optional filter role (`'admin'` / `'member'`) |

---

## 9a. Custom Hooks

### hooks/useFirstVisit.ts

**File:** [`hooks/useFirstVisit.ts`](hooks/useFirstVisit.ts)

Mendeteksi apakah user pertama kali mengunjungi halaman tertentu dalam session ini. Menggunakan `sessionStorage` dengan key yang bisa dikustomisasi.

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `storageKey` | `string` | Key sessionStorage (default: `'hasVisited'`) |

**Return:** `boolean` — `true` jika first visit, `false` jika sudah pernah.

**Cara pakai:**
```typescript
const isFirstVisit = useFirstVisit("hasVisitedLanding");
const shouldAnimate = isFirstVisit && !reducedMotion;
```

### hooks/usePrefersReducedMotion.ts

**File:** [`hooks/usePrefersReducedMotion.ts`](hooks/usePrefersReducedMotion.ts)

Mendeteksi preferensi user terhadap animasi berkurang (aksesibilitas) via CSS media query `prefers-reduced-motion`.

**Return:** `boolean` — `true` jika user memilih reduced motion.

### hooks/useCountUp.ts

**File:** [`hooks/useCountUp.ts`](hooks/useCountUp.ts)

Animasi angka yang naik dari 0 ke target dalam durasi tertentu. Dipakai di komponen [`StatCard`](components/ui/StatCard.tsx).

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `target` | `number` | Angka target akhir |
| `duration` | `number` | Durasi animasi dalam ms (default: 800) |
| `animate` | `boolean` | Trigger untuk memulai animasi |

**Return:** `number` — Angka yang teranimasi (berubah secara progresif).

### hooks/useTypewriter.ts

**File:** [`hooks/useTypewriter.ts`](hooks/useTypewriter.ts)

Hook untuk efek typewriter — menampilkan teks karakter per karakter.

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `text` | `string` | Teks yang akan diketik |
| `speed` | `number` | Kecepatan dalam ms per karakter |

**Return:** `string` — Teks yang sudah diketik sejauh ini.

---

## 9b. Komponen Animasi

Semua komponen animasi ada di folder [`components/animations/`](components/animations/).

| Komponen | File | Fungsi |
|----------|------|--------|
| `MotionProvider` | [`components/animations/MotionProvider.tsx`](components/animations/MotionProvider.tsx) | Context provider yang membungkus aplikasi. Menyediakan konfigurasi Framer Motion global (reduced motion, dll) |
| `PageTransition` | [`components/animations/PageTransition.tsx`](components/animations/PageTransition.tsx) | Animasi transisi antar halaman dengan efek horizontal slide (kiri/kanan). Dibungkus di [`ClientLayout`](components/layout/ClientLayout.tsx) |
| `EntranceWrapper` | [`components/animations/EntranceWrapper.tsx`](components/animations/EntranceWrapper.tsx) | Wrapper untuk animasi masuk elemen (scale + fade). Juga mengekspor `springScaleVariants` untuk digunakan di komponen lain |
| `StaggerContainer` | [`components/animations/StaggerContainer.tsx`](components/animations/StaggerContainer.tsx) | Container yang men-stagger animasi children-nya. Juga mengekspor `staggerItemVariants` untuk digunakan di item individual |
| `Typewriter` | [`components/animations/Typewriter.tsx`](components/animations/Typewriter.tsx) | Komponen efek typewriter — menampilkan teks dengan efek mengetik. Menerima props `text`, `speed`, dan `onComplete` callback |
| `LineDraw` | [`components/animations/LineDraw.tsx`](components/animations/LineDraw.tsx) | Animasi garis SVG yang menggambar dirinya sendiri (path length animation). Digunakan sebagai dekorasi di halaman landing |

**Sistem Animasi Cerdas:**
- **First visit:** Animasi penuh (typewriter, line draw, stagger, entrance) — dideteksi via [`useFirstVisit`](hooks/useFirstVisit.ts) yang menyimpan flag di `sessionStorage`
- **Navigasi selanjutnya:** Animasi quick (tanpa delay besar, tanpa typewriter/line draw)
- **Reduced motion:** Semua animasi di-skip jika user mengaktifkan `prefers-reduced-motion` — dideteksi via [`usePrefersReducedMotion`](hooks/usePrefersReducedMotion.ts)

---

## 10. Middleware & Proteksi Route

**File:** [`middleware.ts`](middleware.ts)

Middleware dijalankan pada setiap request ke `/dashboard/:path*`.

**Alur Proteksi:**
```
Request ke /dashboard/*
         │
         ▼
   Cek session via Supabase Auth
         │
         ├── Tidak ada session
         │      └── Redirect ke /dashboard/login
         │
         └── Ada session
                │
                ▼
          Cek user di tabel `users`
                │
                ├── User tidak ditemukam OR status = 'pending'
                │      └── Redirect ke /dashboard/login?status=pending
                │
                ├── status = 'rejected'
                │      └── Redirect ke /dashboard/login?status=rejected
                │
                └── status = 'approved'
                       │
                       ▼
                 Cek jika akses /dashboard/anggota
                       │
                       ├── role ≠ 'admin'
                       │      └── Redirect ke /dashboard
                       │
                       └── role = 'admin'
                              └── Lanjut
```

---

## 11. Environment Variables

**File:** [`.env.local`](.env.local)

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase (server-only) | `eyJhbGci...` |
| `RESEND_API_KEY` | API Key Resend untuk kirim email | `re_xxx` |
| `RESEND_FROM_EMAIL` | Alamat email pengirim | `onboarding@resend.dev` |
| `ADMIN_EMAIL` | Email admin default | `admin@example.com` |
| `ADMIN_PASSWORD` | Password admin default | `password` |
| `NEXT_PUBLIC_APP_URL` | URL aplikasi (untuk link di email) | `http://localhost:3000` |

---

## 12. Cara Setup & Instalasi

### Prasyarat
- Node.js 18+
- npm / yarn / pnpm
- Akun Supabase (free tier)
- Akun Resend (free tier)

### Langkah Instalasi

1. **Clone repositori**
   ```bash
   git clone <repo-url>
   cd kotak-aspirasi-osis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase**
   - Buat project baru di [supabase.com](https://supabase.com)
   - Jalankan migration SQL dari [`supabase/migration.sql`](supabase/migration.sql) di SQL Editor Supabase
   - Catat URL dan anon key

4. **Setup Resend**
   - Daftar di [resend.com](https://resend.com)
   - Buat API Key

5. **Konfigurasi Environment**
   ```bash
   cp .env.local.example .env.local
   ```
   Isi semua variabel sesuai petunjuk di [Bagian 11](#11-environment-variables)

6. **Setup Autentikasi Supabase**
   - Di dashboard Supabase → Authentication → Providers
   - **Email/Password:** Enable (default)
   - **Google:** Enable, masukkan Client ID dan Client Secret dari Google Cloud Console
   - Redirect URL: `http://localhost:3000/auth/callback`

7. **Create Admin User (opsional)**
   ```sql
   -- Di SQL Editor Supabase
   INSERT INTO users (email, name, role, status)
   VALUES ('admin@example.com', 'Admin', 'admin', 'approved');
   ```

8. **Jalankan development server**
   ```bash
   npm run dev
   ```

9. Buka [http://localhost:3000](http://localhost:3000)

---

## 13. Cara Pakai

### 13.1 Untuk Siswa

**Mengirim Aspirasi:**
1. Buka halaman utama aplikasi
2. (Opsional) Pilih kategori aspirasi
3. Tulis isi aspirasi di kolom yang tersedia
4. (Opsional) Masukkan email untuk menerima kode tiket
5. Klik "Kirim Aspirasi"
6. **Simpan kode tiket** yang muncul (contoh: `ASP-2847`)
7. Kamu bisa salin kode atau langsung cek status

**Cek Status Aspirasi:**
1. Klik "Sudah kirim? Cek status →" atau buka `/cek-aspirasi`
2. Masukkan kode tiket
3. Lihat status terkini:
   - 🟦 **Menunggu** — Belum diproses
   - 🟨 **Diproses** — Sedang ditinjau
   - 🟩 **Dibalas** — Sudah dijawab, kamu bisa membalas
   - 🟪 **Diteruskan** — Diteruskan ke divisi terkait
4. Jika status **Dibalas**, kamu bisa mengetik balasan di kolom yang tersedia

### 13.2 Untuk Humas OSIS

**Login Dashboard:**
1. Buka `/dashboard/login`
2. Login menggunakan Email/Password atau Google
3. Admin harus menyetujui akunmu terlebih dahulu

**Mengelola Aspirasi:**
1. Di halaman Overview, lihat statistik dan aspirasi terbaru
2. Buka tab "Aspirasi" untuk melihat semua aspirasi
3. Gunakan filter status atau pencarian untuk mencari
4. Klik aspirasi untuk melihat detail

**Membalas Aspirasi:**
1. Buka detail aspirasi
2. Lihat chat thread berisi aspirasi siswa
3. Ketik balasan di kolom "Balas sebagai Humas OSIS..."
4. Klik Kirim
5. Status aspirasi otomatis berubah menjadi "Dibalas"
6. Siswa akan mendapat notifikasi email (jika mereka menyertakan email)

**Meneruskan Aspirasi:**
1. Di halaman detail aspirasi, klik "Teruskan ke divisi lain →"
2. Masukkan nama divisi tujuan
3. Klik Simpan
4. Status berubah menjadi "Diteruskan"

### 13.3 Untuk Admin

Semua fitur Humas +:

**Mengelola Anggota:**
1. Buka tab "Anggota" di dashboard
2. **Permintaan Akses:** Lihat user yang mendaftar, klik "Izinkan" atau "Tolak"
3. **Anggota Aktif:** Lihat semua anggota yang sudah disetujui
4. **Hapus Anggota:** Klik "Hapus" untuk menghapus anggota (tidak bisa hapus admin atau diri sendiri)

---

## 14. Desain Sistem

### Vibe
- Soft & friendly — bersih, rounded, tidak overwhelming
- Whitespace cukup, elemen purposeful
- Mobile-first (max-width `480px`)

### Color Palette

| Warna | Hex | Penggunaan |
|-------|-----|------------|
| Navy | `#49769f` | Header, badges utama, teks utama, chat bubble kanan |
| Ocean | `#4e8ea2` | Link, tombol sekunder |
| Teal | `#6ea2b3` | Subtext, label, placeholder |
| Sky | `#7bbde8` | Tombol primary, aksen, centang dropdown |
| White | `#ffffff` | Background utama |
| Blue Tint | `#f4f9fc` | Background form, chat area, stat card default |
| Light Blue | `#c8dde8` | Border default, garis pemisah |
| Dark | `#1a3d47` | Teks utama |
| Header Text | `#a8d4e8` | Teks header, icon nav |
| Muted | `#a8c8d4` | Teks tersier, tab tidak aktif |
| Green | `#1a7a4a` | Success, "Dibalas" |
| Green Light | `#f0fbf6` | Background success |
| Green Border | `#a8e8c4` | Border success |
| Yellow | `#9a7000` | Warning, "Diproses", "Pending" |
| Yellow Light | `#fff9ec` | Background warning |
| Yellow Border | `#ffe9a0` | Border warning |
| Purple | `#6a3fa0` | "Diteruskan" |
| Purple Light | `#f5f0fc` | Background diteruskan |
| Purple Border | `#d4b8f0` | Border diteruskan |
| Red Text | `#c0392b` | Error, danger, "Tolak", "Hapus" |
| Red Light | `#fff0f0` | Background error input |
| Red Border | `#f5b8b8` | Border error |

### Typography

- **Font:** System UI stack (system-ui, -apple-system, sans-serif), dengan Geist dari Next.js Font
- **Scale:**
  - Header besar (Hero): `26px`
  - Kode tiket (konfirmasi): `28px` monospace `tracking-[0.1em]`
  - Judul halaman (dashboard): `15px`
  - Angka stat card: `26px` semibold
  - Teks normal: `13px` – `14px`
  - Teks kecil: `11px` – `12px`

### Layout

- **Max width konten:** `480px` (mobile-first), di-center dengan `mx-auto`
- **Border radius:**
  - Card utama (login): `20px`
  - Input, button, dropdown: `14px`
  - Chat bubble: `18px 18px 4px 18px` (kanan), `18px 18px 18px 4px` (kiri)
  - Badge: `9999px` (pill)
  - Avatar: `50%` (circle)
  - Tombol kecil: `8px` – `12px`
- **Shadow:** `0 4px 20px rgba(73,118,159,0.12)` (dropdown)

### Status Badge Colors

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Menunggu | `#eaf4f8` | `#4e8ea2` | `#c8dde8` |
| Diproses | `#fff9ec` | `#9a7000` | `#ffe9a0` |
| Dibalas | `#f0fbf6` | `#1a7a4a` | `#a8e8c4` |
| Diteruskan | `#f5f0fc` | `#6a3fa0` | `#d4b8f0` |
| Pending | `#fff9ec` | `#9a7000` | `#ffe9a0` |
| Admin | `#49769f` | `white` | — (solid) |
| Member | `#eaf4f8` | `#4e8ea2` | — (solid) |

---

## 15. Catatan Keamanan

1. **Service Role Key** hanya digunakan di server-side API routes dan tidak pernah terekspos ke client
2. **Email siswa** (`email_siswa`) tidak pernah dikirim ke client API (dihapus sebelum response)
3. **Middleware** memproteksi semua route dashboard dan melakukan pengecekan status user
4. **RLS (Row Level Security)** aktif di semua tabel:
   - Public hanya bisa INSERT aspirasi dan SELECT berdasarkan kode tiket
   - Hanya user authenticated yang bisa mengakses data dashboard
5. **Kode tiket** menggunakan format sederhana (inkremental) — tidak dirancang sebagai kode kriptografis
6. **Rate limiting** tidak diterapkan di version ini (perlu dipertimbangkan untuk produksi)
7. **Environment variables** berisi credential sensitif — jangan commit ke repositori publik

---

## 16. Catatan Teknis & Saran Improvement

### Observasi Arsitektur

1. **Kode tiket sequential** — `ASP-{counter}` berdasarkan total count aspirasi. Rentan collision kalau ada penghapusan data, tapi untuk skala sekolah masih aman. Saran: gunakan kombinasi timestamp + random string.

2. **Service Role Key dipake di semua API** — Semua API routes menggunakan `SUPABASE_SERVICE_ROLE_KEY` yang bypass RLS. Idealnya pake anon key + andalkan RLS policies aja biar lebih aman dan sesuai prinsip least privilege.

3. **Belum ada pagination** — [`List aspirasi`](app/dashboard/aspirasi/page.tsx) ngambil semua data tanpa limit. Bakal bermasalah kalau data udah banyak (1000+). Saran: tambah `limit` dan `offset` parameter di API.

4. **Rate limiting** — Belum ada proteksi terhadap spam submit aspirasi. Saran: tambah rate limiting di API publik atau minimal throttle di client.

### Performa

5. **Realtime subscriptions** — Dua channel terpisah per aspirasi (pesan + status). Untuk skala besar, pertimbangkan filter yang lebih ketat atau gunakan single channel dengan event type.

6. **Cookie-based auth** — Session cuma 1 jam (Max-Age=3600). Ini udah cukup baik, tapi perlu handle refresh token secara eksplisit di middleware.

### UX

7. **Animasi cerdas** — Sistem deteksi first visit via `sessionStorage` + dukungan `prefers-reduced-motion` udah sangat baik untuk aksesibilitas.

8. **Mobile-first** — Semua halaman dibatasi `max-w-[480px]`. Ini bagus untuk konsistensi, tapi perlu dipertimbangkan untuk adaptasi tablet/desktop.

### Keamanan

9. **Email siswa dihapus dari response** — Privacy-aware, email cuma dipake kirim notifikasi sekali. Ini praktik yang baik.

10. **Anonimitas terjaga** — Siswa ga perlu login, cukup kode tiket. Pastikan kode tiket cukup panjang/random untuk mencegah brute force.

---

> **Catatan:** Dokumentasi ini mencakup seluruh kodebase per Juli 2026. Beberapa detail mungkin berubah seiring perkembangan aplikasi.
