# 📬 Kotak Aspirasi OSIS — Teknologi & Halaman

> Dokumen ringkas: teknologi apa dipakai tiap bagian, halaman apa saja ada, dan bisa apa di situ.

---

## 🛠 Teknologi per Bagian

| Bagian | Teknologi | Fungsi |
|--------|-----------|--------|
| Framework | Next.js 14 (App Router) | Routing, SSR/CSR, API Routes |
| UI Library | React 18 | Komponen antarmuka |
| Bahasa | TypeScript ^5 | Type safety |
| Database + Realtime | Firebase Firestore ^12 | NoSQL DB + realtime subscriptions (onSnapshot) |
| Auth | Firebase Auth ^12 | Email/password + Google OAuth, session cookie |
| Auth Server | Firebase Admin ^14 | Verifikasi session cookie, akses Firestore (server-only) |
| Email | Resend ^6.17 | Kirim kode tiket & notifikasi balasan |
| Styling | Tailwind CSS ^3.4 | Utility-first CSS |
| Animasi | Framer Motion ^12 | Motion & transition |
| Icons | @tabler/icons-react | Icon set |
| CORS | Custom (`lib/cors.ts`) | Handle CORS untuk public API |
| Env | `lib/env.ts` | Validasi & akses environment variables |

---

## 📄 Daftar Halaman & Fungsinya

### 1. `/` — Landing Page (Redirect ke `/index.html`)
- **Teknologi:** Static HTML (`public/index.html`) + EnvelopeForm.tsx
- **Bisa dilakukan:**
  - Kirim aspirasi anonim (isi + kategori opsional + email opsional)
  - Dapat kode tiket `ASP-XXXX`
  - Salin kode & cek status langsung dari halaman ini

### 2. `/cek-aspirasi` — Cek Status Aspirasi
- **Teknologi:** `app/cek-aspirasi/page.tsx`, MessageThread, ReplyComposer, Supabase Realtime
- **Bisa dilakukan:**
  - Masukkan kode tiket → lihat status aspirasi
  - Lihat thread chat antara siswa & humas
  - Balas chat (hanya jika status `dibalas`)

### 3. `/dashboard/login` — Login
- **Teknologi:** `app/dashboard/login/page.tsx`, Google OAuth, email/password
- **Bisa dilakukan:**
  - Login dengan email + password
  - Login dengan Google OAuth
  - Lihat pesan kalau akun masih `pending` approval

### 4. `/dashboard` — Overview Dashboard
- **Teknologi:** `app/dashboard/page.tsx`, StatCard, AspirasiItem, Framer Motion
- **Bisa dilakukan:**
  - Lihat statistik total & status aspirasi (menunggu/diproses/dibalas)
  - Lihat 5 aspirasi terbaru
  - Search & filter berdasarkan kategori
  - Klik aspirasi untuk masuk ke detail

### 5. `/dashboard/aspirasi` — List Aspirasi
- **Teknologi:** `app/dashboard/aspirasi/page.tsx`, CategoryTabs, AspirasiItem
- **Bisa dilakukan:**
  - Lihat semua aspirasi dengan filter status (menunggu/diproses/dibalas/diteruskan)
  - Search berdasarkan kode tiket atau isi
  - Klik salah satu untuk masuk ke detail & chat

### 6. `/dashboard/aspirasi/[id]` — Detail & Chat Aspirasi
- **Teknologi:** `app/dashboard/aspirasi/[id]/page.tsx`, MessageThread, ReplyComposer, StatusRail, Supabase Realtime
- **Bisa dilakukan:**
  - Lihat thread chat lengkap (siswa + humas)
  - Balas pesan siswa
  - Ubah status aspirasi (menunggu → diproses → dibalas/diteruskan)
  - Teruskan aspirasi ke divisi lain (`diteruskan_ke`)
  - Realtime update chat via Supabase channel

### 7. `/dashboard/anggota` — Manajemen Anggota
- **Teknologi:** `app/dashboard/anggota/page.tsx`, Badge, IconCheck/IconX/IconTrash
- **Bisa dilakukan:**
  - Lihat daftar anggota Humas (pending/approved/rejected)
  - Approve/reject anggota (admin only)
  - Hapus anggota (admin only)

---

## ⚡ API Routes

| Route | Method | Akses | Fungsi |
|-------|--------|-------|--------|
| `/api/aspirasi` | POST | Publik | Submit aspirasi baru |
| `/api/aspirasi/[kode]` | GET | Publik | Cek status by kode tiket |
| `/api/aspirasi/[kode]/pesan` | POST | Publik | Kirim pesan balasan (siswa) |
| `/api/auth/session` | POST | Publik | Buat session cookie dari ID token (setelah login client-side) |
| `/api/auth/session` | GET | Auth | Cek session aktif |
| `/api/auth/logout` | POST | Auth | Logout (clear session cookie) |
| `/api/dashboard/aspirasi` | GET | Auth | List aspirasi + filter/search |
| `/api/dashboard/aspirasi/[id]` | GET/PATCH | Auth | Detail & update status aspirasi |
| `/api/dashboard/aspirasi/[id]/pesan` | POST | Auth | Kirim balasan humas |
| `/api/dashboard/anggota` | GET | Auth Admin | List anggota |
| `/api/dashboard/anggota/[id]` | PATCH/DELETE | Auth Admin | Approve/reject/hapus anggota |

> **Catatan:** Login email/password & Google OAuth dilakukan **client-side** via Firebase JS SDK
> (`signInWithEmailAndPassword` / `signInWithPopup`), lalu ID token dikirim ke `POST /api/auth/session`
> untuk membuat session cookie httpOnly. Route `/api/auth/login`, `/api/auth/login/google`, dan
> `/api/auth/callback` sudah dihapus.

---

## 🧩 Komponen Utama

| Komponen | Lokasi | Fungsi |
|----------|--------|--------|
| ClientLayout | `components/layout/ClientLayout.tsx` | Wrapper animasi global |
| DashboardNav | `components/layout/DashboardNav.tsx` | Navbar dashboard + logout |
| BottomTabBar | `components/layout/BottomTabBar.tsx` | Navigasi bawah dashboard |
| MessageThread | `components/ui/MessageThread.tsx` | Tampilan chat + system notes |
| ReplyComposer | `components/ui/ReplyComposer.tsx` | Input balasan chat |
| AspirasiItem | `components/ui/AspirasiItem.tsx` | Card list aspirasi |
| StatCard | `components/ui/StatCard.tsx` | Card statistik overview |
| StatusRail | `components/ui/StatusRail.tsx` | Visual status workflow |
| Badge | `components/ui/Badge.tsx` | Badge status/kategori |
| CategoryTabs | `components/ui/CategoryTabs.tsx` | Tab filter kategori |
| AspirasiDetailPanel | `components/ui/AspirasiDetailPanel.tsx` | Panel detail samping |
| Dropdown | `components/ui/Dropdown.tsx` | Dropdown menu |
| ChatBubble | `components/ui/ChatBubble.tsx` | Bubble chat |

---

## 🪝 Custom Hooks

| Hook | File | Fungsi |
|------|------|--------|
| `useCountUp` | `hooks/useCountUp.ts` | Animasi angka count-up |
| `useFirstVisit` | `hooks/useFirstVisit.ts` | Deteksi kunjungan pertama (sessionStorage) |
| `usePrefersReducedMotion` | `hooks/usePrefersReducedMotion.ts` | Deteksi preferensi reduced motion |
| `useTypewriter` | `hooks/useTypewriter.ts` | Efek typewriter |

---

## 🔐 Proteksi Route

- **`middleware.ts`** — Melindungi `/dashboard/*` (cek keberadaan cookie `fb-session`)
- Verifikasi penuh session + role user (`approved` status) dilakukan di API routes via `verifyAuthDashboard()` dan `/api/auth/session`
- **Catatan:** Next.js 14 middleware berjalan di Edge runtime, sedangkan firebase-admin hanya bisa jalan di Node.js — karena itu verifikasi penuh dipindah ke API routes
- Firebase Admin SDK (private key) hanya dipakai di server (API routes)
