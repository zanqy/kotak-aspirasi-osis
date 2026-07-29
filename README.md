# 📬 Kotak Aspirasi Digital OSIS

> **Sistem pengelolaan aspirasi siswa untuk OSIS** — Siswa menyampaikan aspirasi secara anonim, Humas mengelola via dashboard dengan fitur chat real-time.

---

## ✨ Fitur Utama

- **📝 Kirim Aspirasi Anonim** — Siswa menulis aspirasi tanpa perlu login, dengan opsi menyertakan email untuk menerima kode tiket
- **🔑 Kode Tiket Unik** — Setiap aspirasi mendapat kode `ASP-XXXX` untuk melacak status
- **💬 Chat Dua Arah Real-time** — Siswa dan Humas OSIS dapat berbalas pesan dalam thread dengan update live via Supabase Realtime
- **📊 Dashboard Humas** — Overview statistik, filter & search aspirasi, balas pesan, teruskan ke divisi lain
- **👥 Manajemen Anggota** — Admin dapat approve/reject/hapus anggota Humas (Google OAuth)
- **📧 Notifikasi Email** — Kode tiket dan notifikasi balasan dikirim via Resend
- **🔐 Multi-metode Auth** — Email/password untuk Admin, Google OAuth untuk Member
- **🎨 Animasi Cerdas** — Animasi penuh di kunjungan pertama, quick animation setelahnya, plus dukungan reduced motion

---

## 🛠 Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Next.js](https://nextjs.org/) | 14.2.35 | Framework React (App Router) |
| [React](https://react.dev/) | ^18 | Library UI |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |
| [Supabase](https://supabase.com/) | ^2.109.0 | Database (PostgreSQL), Auth, Realtime |
| [Supabase SSR](https://supabase.com/docs/guides/auth/server-side) | ^0.12.0 | Server-side auth helpers |
| [Resend](https://resend.com/) | ^6.17.1 | Email service |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.1 | Styling |
| [Framer Motion](https://www.framer.com/motion/) | ^12.42.2 | Animasi |

---

## 🏗️ Struktur Proyek

```
📦 kotak-aspirasi-osis/
├── middleware.ts              # Proteksi route dashboard & API
├── app/                       # 📁 Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   ├── page.tsx               # 🏠 Landing page + form aspirasi
│   ├── cek-aspirasi/
│   │   └── page.tsx           # 🔍 Cek status aspirasi (publik)
│   ├── dashboard/
│   │   ├── page.tsx           # 📊 Overview dashboard
│   │   ├── login/page.tsx     # 🔐 Login (email + Google OAuth)
│   │   ├── aspirasi/
│   │   │   ├── page.tsx       # 📋 List aspirasi + filter
│   │   │   └── [id]/page.tsx  # 💬 Detail & chat aspirasi
│   │   └── anggota/page.tsx   # 👥 Manajemen anggota (admin only)
│   └── api/                   # ⚡ API Routes
│       ├── aspirasi/          # Public: POST submit, GET by kode, POST pesan
│       ├── auth/              # POST login, GET callback, POST logout, GET session
│       └── dashboard/         # Auth: GET/PATCH aspirasi, POST pesan, kelola anggota
│
├── components/                # 🧩 React Components
│   ├── layout/                # DashboardNav, BottomTabBar, ClientLayout
│   ├── ui/                    # Badge, Button, ChatBubble, Dropdown, StatCard, AspirasiItem
│   └── animations/            # EntranceWrapper, LineDraw, MotionProvider, PageTransition, StaggerContainer, Typewriter
│
├── lib/                       # 📚 Library & Utilities
│   ├── supabase.ts            # createBrowserClient() & createServiceClient()
│   ├── supabase-server.ts     # createServerSupabaseClient() (SSR)
│   ├── auth-api.ts            # verifyAuth() & verifyAuthDashboard()
│   ├── resend.ts              # Kirim email via Resend
│   └── utils.ts               # generateKodeTiket(), formatWaktu(), getInisial()
│
├── hooks/                     # 🪝 Custom Hooks
│   ├── useCountUp.ts          # Animasi angka count-up
│   ├── useFirstVisit.ts       # Deteksi kunjungan pertama via sessionStorage
│   ├── usePrefersReducedMotion.ts  # Deteksi preferensi reduced motion
│   └── useTypewriter.ts       # Efek typewriter
│
├── supabase/
│   └── migration.sql          # Database schema + RLS policies + trigger
│
└── docs/
    └── README-LENGKAP.md      # 📖 Dokumentasi lengkap
```

---

## 🗄️ Database Schema

5 tabel utama di PostgreSQL via Supabase:

| Tabel | Fungsi |
|-------|--------|
| `users` | Anggota Humas OSIS (admin/member) dengan workflow approval |
| `aspirasi` | Aspirasi siswa dengan kode tiket unik & status workflow |
| `pesan` | Chat antara siswa dan humas per aspirasi |
| `notifikasi` | Log pengiriman notifikasi email |
| `aktivitas` | Audit log aktivitas anggota humas |

**Status Workflow Aspirasi:** `menunggu → diproses → dibalas / diteruskan`

---

## 🔐 Keamanan

- **Cookie-based session** — HttpOnly cookies (`sb-access-token`, `sb-refresh-token`, `sb-user-id`)
- **Middleware protection** — Semua route `/dashboard/*` dan `/api/dashboard/*` dilindungi
- **Role-based access** — Halaman anggota cuma bisa diakses admin
- **Status approval** — User baru harus di-approve admin dulu
- **RLS (Row Level Security)** — Aktif di semua tabel
- **Privacy** — Email siswa tidak pernah dikirim ke response API

---

## 🚀 Quick Start

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd kotak-aspirasi-osis
   npm install
   ```

2. **Setup database** — Jalankan [`supabase/migration.sql`](supabase/migration.sql) di SQL Editor Supabase

3. **Konfigurasi env** — Salin `.env.local` dan isi variabel (Supabase URL, keys, Resend API key, dll)

4. **Jalankan**
   ```bash
   npm run dev
   ```

📖 **Dokumentasi lengkap**: [`docs/README-LENGKAP.md`](docs/README-LENGKAP.md)

---

## 📄 Lisensi

Proyek ini bersifat privat untuk kepentingan OSIS.
