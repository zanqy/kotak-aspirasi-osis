# 📬 Kotak Aspirasi Digital OSIS

> **Sistem pengelolaan aspirasi siswa untuk OSIS** — Siswa menyampaikan aspirasi secara anonim, Humas mengelola via dashboard.

---

## ✨ Fitur Utama

- **📝 Kirim Aspirasi Anonim** — Siswa menulis aspirasi tanpa perlu login, dengan opsi menyertakan email untuk menerima kode tiket
- **🔑 Kode Tiket Unik** — Setiap aspirasi mendapat kode `ASP-XXXX` untuk melacak status
- **💬 Chat Dua Arah** — Siswa dan Humas OSIS dapat berbalas pesan dalam thread
- **📊 Dashboard Humas** — Overview statistik, filter & search aspirasi, balas pesan, teruskan ke divisi
- **👥 Manajemen Anggota** — Admin dapat approve/reject/hapus anggota Humas (Google OAuth)
- **📧 Notifikasi Email** — Kode tiket dan notifikasi balasan dikirim via Resend
- **🔐 Multi-metode Auth** — Email/password untuk Admin, Google OAuth untuk Member

---

## 🛠 Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Next.js](https://nextjs.org/) | 14.2.35 | Framework React (App Router) |
| [React](https://react.dev/) | ^18 | Library UI |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |
| [Supabase](https://supabase.com/) | ^2.109.0 | Database, Auth, Realtime |
| [Supabase SSR](https://supabase.com/docs/guides/auth/server-side) | ^0.12.0 | Server-side auth helpers |
| [Resend](https://resend.com/) | ^6.17.1 | Email service |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.1 | Styling |

---

## 🏗️ Struktur Proyek

```
app/                          # Next.js App Router
├── page.tsx                  # Landing page + form aspirasi
├── cek-aspirasi/page.tsx     # Cek status aspirasi (publik)
├── dashboard/
│   ├── login/page.tsx        # Login dashboard
│   ├── page.tsx              # Overview dashboard
│   ├── aspirasi/
│   │   ├── page.tsx          # List aspirasi
│   │   └── [id]/page.tsx     # Detail & chat aspirasi
│   └── anggota/page.tsx      # Manajemen anggota (admin only)
└── api/                      # API Routes
    ├── aspirasi/             # Public API (submit, cek, pesan)
    ├── auth/                 # Login, logout, session, google, callback
    └── dashboard/            # Protected API (aspirasi, anggota)
components/
├── layout/                   # DashboardNav, BottomTabBar
└── ui/                       # Badge, Button, ChatBubble, Dropdown, StatCard, AspirasiItem
lib/                          # Utility, Supabase client, Resend, Auth
supabase/migration.sql        # Database schema & RLS policies
middleware.ts                 # Route protection
```

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
