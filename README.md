# 📬 Kotak Aspirasi Digital OSIS

> **Sistem pengelolaan aspirasi siswa untuk OSIS** — Siswa menyampaikan aspirasi secara anonim, Humas mengelola via dashboard dengan fitur chat real-time.
> **Hosting:** Vercel (free tier) · **Backend:** Firebase (Auth + Firestore)

---

## ✨ Fitur Utama

- **📝 Kirim Aspirasi Anonim** — Siswa menulis aspirasi tanpa perlu login, dengan opsi menyertakan email untuk menerima kode tiket
- **🔑 Kode Tiket Unik** — Setiap aspirasi mendapat kode `ASP-XXXX` untuk melacak status
- **💬 Chat Dua Arah Real-time** — Siswa dan Humas OSIS dapat berbalas pesan dalam thread dengan update live via Firestore realtime
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
| [Firebase](https://firebase.google.com/) | ^12 | Auth (email/Google), Firestore (DB + Realtime) |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) | ^14 | Server-side SDK (session cookie, Firestore admin) |
| [Resend](https://resend.com/) | ^6.17.1 | Email service |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.1 | Styling |
| [Framer Motion](https://www.framer.com/motion/) | ^12.42.2 | Animasi |

---

## 🏗️ Struktur Proyek

```
📦 kotak-aspirasi-osis/
├── middleware.ts              # Proteksi route dashboard (cek cookie session)
├── firebase.json              # Config Firebase (Firestore rules + indexes)
├── firestore.rules            # Security rules Firestore (pengganti RLS)
├── firestore.indexes.json     # Composite indexes Firestore
├── app/                       # 📁 Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   ├── page.tsx               # 🏠 Redirect ke /index.html (landing statik)
│   ├── cek-aspirasi/
│   │   └── page.tsx           # 🔍 Cek status aspirasi (publik, realtime)
│   ├── dashboard/
│   │   ├── page.tsx           # 📊 Overview dashboard
│   │   ├── login/page.tsx     # 🔐 Login (email + Google OAuth via Firebase)
│   │   ├── aspirasi/
│   │   │   ├── page.tsx       # 📋 List aspirasi + filter
│   │   │   └── [id]/page.tsx  # 💬 Detail & chat aspirasi (realtime)
│   │   └── anggota/page.tsx   # 👥 Manajemen anggota (admin only)
│   └── api/                   # ⚡ API Routes
│       ├── aspirasi/          # Public: POST submit, GET by kode, POST pesan
│       ├── auth/              # POST session (buat cookie), POST logout, GET session
│       └── dashboard/         # Auth: GET/PATCH aspirasi, POST pesan, kelola anggota
│
├── components/                # 🧩 React Components
│   ├── layout/                # DashboardNav, BottomTabBar, ClientLayout
│   ├── ui/                    # Badge, MessageThread, ReplyComposer, StatCard, dll
│   └── animations/            # MotionProvider, PageTransition
│
├── lib/                       # 📚 Library & Utilities
│   ├── firebase.ts            # Firebase Admin SDK (server-only)
│   ├── firebase-client.ts     # Firebase Client SDK (browser: login + realtime)
│   ├── auth-api.ts            # verifyAuth() & verifyAuthDashboard()
│   ├── resend.ts              # Kirim email via Resend
│   └── utils.ts               # generateKodeTiket(), formatWaktu(), getInisial()
│
├── hooks/                     # 🪝 Custom Hooks
│   ├── useCountUp.ts          # Animasi angka count-up
│   ├── useFirstVisit.ts       # Deteksi kunjungan pertama via sessionStorage
│   └── usePrefersReducedMotion.ts  # Deteksi preferensi reduced motion
│
└── docs/
    ├── README-LENGKAP.md      # 📖 Dokumentasi lengkap
    └── MIGRASI-FIREBASE.md    # 📖 Panduan migrasi Supabase → Firebase
```

---

## 🗄️ Database (Firestore)

5 collection utama di Firestore (pengganti 5 tabel PostgreSQL):

| Collection | Fungsi |
|------------|--------|
| `users/{uid}` | Anggota Humas OSIS (admin/member) dengan workflow approval. Doc ID = Firebase Auth UID |
| `aspirasi/{id}` | Aspirasi siswa dengan kode tiket unik & status workflow |
| `aspirasi/{id}/pesan/{pid}` | Chat antara siswa dan humas per aspirasi (subcollection) |
| `notifikasi/{id}` | Log pengiriman notifikasi email |
| `aktivitas/{id}` | Audit log aktivitas anggota humas |

**Status Workflow Aspirasi:** `menunggu → diproses → dibalas / diteruskan`

---

## 🔐 Keamanan

- **Session cookie** — HttpOnly cookie `fb-session` (Firebase session cookie, 14 hari)
- **Middleware protection** — Semua route `/dashboard/*` dicek keberadaan cookie session
- **Role-based access** — Halaman anggota cuma bisa diakses admin (diverifikasi di API routes)
- **Status approval** — User baru harus di-approve admin dulu
- **Firestore Security Rules** — Pengganti RLS, di [`firestore.rules`](firestore.rules)
- **Privacy** — Email siswa tidak pernah dikirim ke response API

---

## 🚀 Quick Start

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd kotak-aspirasi-osis
   npm install
   ```

2. **Setup Firebase** — Ikuti [`docs/MIGRASI-FIREBASE.md`](docs/MIGRASI-FIREBASE.md):
   - Buat project Firebase, enable Authentication (Email/Password + Google)
   - Buat Firestore database, deploy rules + indexes
   - Generate service account private key

3. **Konfigurasi env** — Salin `.env.local.example` ke `.env.local` dan isi variabel Firebase + Resend

4. **Buat admin user** — Buat user di Firebase Auth + doc `users/{uid}` (lihat panduan migrasi)

5. **Jalankan**
   ```bash
   npm run dev
   ```

6. **Deploy ke Vercel** — `vercel --prod`, set env vars di dashboard Vercel, tambahkan domain ke Authorized domains Firebase Auth (lihat [`docs/MIGRASI-FIREBASE.md`](docs/MIGRASI-FIREBASE.md))

📖 **Dokumentasi lengkap**: [`docs/README-LENGKAP.md`](docs/README-LENGKAP.md) · **Panduan migrasi**: [`docs/MIGRASI-FIREBASE.md`](docs/MIGRASI-FIREBASE.md)

---

## 📄 Lisensi

Proyek ini bersifat privat untuk kepentingan OSIS.
