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
| Firebase (Auth + Firestore) | Auth, DB, Realtime |
| Firebase Admin | Server-side SDK (session cookie, Firestore admin) |
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

1. **Login** di `/dashboard/login` → email/password atau Google OAuth (Firebase JS SDK)
2. **Session cookie** dibuat via `POST /api/auth/session` (dari ID token)
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

## 4. Struktur Database (Firestore — 5 Collection)

| Collection | Isi | Catatan |
|-----------|-----|---------|
| `users/{uid}` | Anggota humas (email, role, status) | Doc ID = Firebase Auth UID |
| `aspirasi/{id}` | Data aspirasi siswa | Kode tiket unik, status, email_siswa (opsional) |
| `aspirasi/{id}/pesan/{pid}` | Chat dua arah | Subcollection, pengirim: siswa/humas |
| `notifikasi/{id}` | Log kirim email | tipe: kode_tiket/balasan/aspirasi_baru |
| `aktivitas/{id}` | Log aktivitas humas | aksi + keterangan |

- **Security Rules** di [`firestore.rules`](../firestore.rules) (pengganti RLS)
- **Composite indexes** di [`firestore.indexes.json`](../firestore.indexes.json)

---

## 5. Struktur Folder Inti

```
app/                  # Pages + API Routes (App Router)
├── page.tsx          # Redirect ke /index.html (landing statik)
├── cek-aspirasi/     # Cek status publik (realtime onSnapshot)
├── dashboard/        # Dashboard pages (overview, aspirasi, anggota, login)
└── api/              # API routes (aspirasi/*, auth/*, dashboard/*)

components/
├── layout/           # ClientLayout, DashboardNav, BottomTabBar
├── ui/               # AspirasiItem, Badge, MessageThread, ReplyComposer, StatCard, StatusRail
└── animations/       # MotionProvider, PageTransition

hooks/                # useCountUp, useFirstVisit, usePrefersReducedMotion
lib/                  # firebase.ts, firebase-client.ts, auth-api.ts, resend.ts, utils.ts
firestore.rules
firestore.indexes.json
middleware.ts
```

---

## 6. Poin Penting untuk AI

### Firebase Client

| Konteks | Client | File |
|---------|--------|------|
| API routes (server) | `getAdminDb()` / `getAdminAuth()` (Admin SDK) | [`lib/firebase.ts`](../lib/firebase.ts) |
| Login + realtime (browser) | `getClientAuth()` / `getClientDb()` (Client SDK) | [`lib/firebase-client.ts`](../lib/firebase-client.ts) |

### Auth Flow

1. Login client-side: `signInWithEmailAndPassword` / `signInWithPopup(GoogleAuthProvider)`
2. Kirim `idToken` ke `POST /api/auth/session` → server buat session cookie httpOnly `fb-session`
3. API routes verifikasi via `verifyAuthDashboard()` (Admin SDK `verifySessionCookie`)
4. Logout: `signOut()` client SDK + `POST /api/auth/logout` (clear cookie)

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
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key (client-safe) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID (client-safe) |
| `FIREBASE_PROJECT_ID` | Project ID (server) |
| `FIREBASE_CLIENT_EMAIL` | Service account email (**server-only**) |
| `FIREBASE_PRIVATE_KEY` | Service account private key (**server-only**) |
| `RESEND_API_KEY` | API key Resend |
| `RESEND_FROM_EMAIL` | Email pengirim |
| `NEXT_PUBLIC_APP_URL` | Base URL (untuk link di email) |

### Middleware

- Proteksi `/dashboard/*` → cek keberadaan cookie `fb-session` (Edge-compatible)
- Verifikasi penuh session + role dilakukan di API routes (`verifyAuthDashboard`) dan `/api/auth/session`
- File: [`middleware.ts`](../middleware.ts)

### Auth Helpers

- [`verifyAuth()`](../lib/auth-api.ts) — verifikasi session cookie dari Authorization header/cookie
- [`verifyAuthDashboard()`](../lib/auth-api.ts) — verifikasi + cek status & role di collection `users`

---

> **Butuh detail lebih?** Buka [`docs/README-LENGKAP.md`](README-LENGKAP.md) · **Panduan migrasi**: [`docs/MIGRASI-FIREBASE.md`](MIGRASI-FIREBASE.md)
