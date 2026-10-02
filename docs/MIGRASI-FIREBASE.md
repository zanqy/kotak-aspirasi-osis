# 🔥 Panduan Migrasi Supabase → Firebase

> Dokumen ini menjelaskan cara setup Firebase (Auth + Firestore) untuk aplikasi Kotak Aspirasi OSIS, setelah kode dimigrasi dari Supabase.
> **Hosting:** Vercel (free tier) — Next.js + API routes di Vercel, backend (Auth + Firestore) di Firebase.

---

## 1. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Nama project: misal `kotak-aspirasi-osis` (catat **Project ID**)
3. Matikan Google Analytics (tidak diperlukan)

## 2. Enable Authentication

1. **Build → Authentication → Get started**
2. **Sign-in method**:
   - **Email/Password** → Enable
   - **Google** → Enable, pilih project support email
3. **Settings → Authorized domains**: tambahkan domain produksi (misal `kotak-aspirasi-osis.web.app`) selain `localhost`

## 3. Buat Firestore Database

1. **Build → Firestore Database → Create database**
2. Pilih mode **Production** (bukan test mode)
3. Pilih lokasi terdekat (misal `asia-southeast2` / Jakarta)

## 4. Deploy Security Rules + Indexes

Setelah install Firebase CLI dan login (lihat bagian 8):

```bash
firebase deploy --only firestore
```

Ini akan deploy:
- [`firestore.rules`](../firestore.rules) — security rules (pengganti RLS Supabase)
- [`firestore.indexes.json`](../firestore.indexes.json) — composite indexes

## 5. Ambil Kredensial

### Web API Key (public)
**Project settings → General → Web API Key** → isi ke `NEXT_PUBLIC_FIREBASE_API_KEY`

### Project ID
**Project settings → General → Project ID** → isi ke `NEXT_PUBLIC_FIREBASE_PROJECT_ID` dan `FIREBASE_PROJECT_ID`

### Service Account (server-only)
1. **Project settings → Service accounts**
2. Klik **Generate new private key** → download JSON
3. Dari JSON tersebut ambil:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (simpan dengan literal `\n`, dalam tanda kutip)

## 6. Konfigurasi `.env.local`

```bash
cp .env.local.example .env.local
```

Isi semua variabel sesuai bagian 5 + Resend.

## 7. Buat User Admin

User dashboard **tidak bisa daftar sendiri** — harus dibuat manual (sama seperti Supabase dulu). Dua langkah:

### a. Buat user di Firebase Auth
**Authentication → Users → Add user** (email + password), atau lewat Google login pertama kali.

### b. Buat doc `users/{uid}` di Firestore
Doc ID = **UID user** (dari Firebase Auth). Field:

```json
{
  "email": "admin@example.com",
  "name": "Admin OSIS",
  "avatar_url": null,
  "role": "admin",
  "status": "approved",
  "created_at": "<Timestamp>",
  "updated_at": "<Timestamp>"
}
```

> `role`: `admin` atau `member` · `status`: `pending`, `approved`, atau `rejected`

## 8. Deploy ke Vercel (free tier)

> **Catatan:** Firebase App Hosting butuh Blaze plan (billing). Karena itu hosting dipindah ke
> **Vercel free tier** — Next.js + API routes jalan di Vercel, backend (Auth + Firestore) tetap di Firebase.

### a. Install & login Vercel CLI

```bash
npm install -g vercel
vercel login
```

### b. Deploy

```bash
vercel --prod
```

Ikuti prompt (link ke akun Vercel, project name, dsb). Aplikasi akan tersedia di `https://<project>.vercel.app`.

### c. Set environment variables di Vercel

Set semua env var dari `.env.local` di **Vercel Dashboard → Project → Settings → Environment Variables**
(atau via CLI: `vercel env add`):

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key (public) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID (public) |
| `FIREBASE_PROJECT_ID` | Project ID (server) |
| `FIREBASE_CLIENT_EMAIL` | Service account email (server) |
| `FIREBASE_PRIVATE_KEY` | Service account private key (server) |
| `RESEND_API_KEY` | API key Resend |
| `RESEND_FROM_EMAIL` | Email pengirim |
| `NEXT_PUBLIC_APP_URL` | URL produksi, misal `https://<project>.vercel.app` |

> **PENTING:** `FIREBASE_PRIVATE_KEY` berisi newline — saat set di Vercel, pastikan formatnya
> sama persis dengan `.env.local` (literal `\n` dalam tanda kutip).

### d. Authorized domains di Firebase Auth

**Firebase Console → Authentication → Settings → Authorized domains** — tambahkan domain
`<project>.vercel.app` (selain `localhost`), supaya Google OAuth & session cookie jalan di produksi.

---

## 🔄 Mapping Supabase → Firebase

| Supabase (lama) | Firebase (baru) |
|-----------------|-----------------|
| PostgreSQL (5 tabel) | Firestore (5 collection) |
| `users` tabel | `users/{uid}` (doc ID = Auth UID) |
| `aspirasi` tabel | `aspirasi/{id}` |
| `pesan` tabel | `aspirasi/{id}/pesan/{pid}` (subcollection) |
| `notifikasi` tabel | `notifikasi/{id}` |
| `aktivitas` tabel | `aktivitas/{id}` |
| Supabase Auth (email/Google) | Firebase Auth (email/Google) |
| Cookie `sb-access-token` dkk | Cookie `fb-session` (session cookie) |
| `supabase.auth.getUser()` | `admin.auth().verifySessionCookie()` |
| Supabase Realtime (`postgres_changes`) | Firestore `onSnapshot()` |
| RLS policies | `firestore.rules` |
| `SUPABASE_SERVICE_ROLE_KEY` | `FIREBASE_PRIVATE_KEY` (Admin SDK) |
| `supabase/migration.sql` | `firestore.rules` + `firestore.indexes.json` |

## ⚠️ Catatan Perbedaan Perilaku

1. **Search aspirasi** — Firestore tidak punya `ilike` (substring search). Search dilakukan in-memory setelah fetch. Untuk data sangat besar, pertimbangkan Algolia/Typesense.
2. **Middleware** — Next.js 14 middleware berjalan di Edge runtime, sehingga firebase-admin (Node.js only) tidak bisa dipakai di sana. Middleware hanya cek keberadaan cookie; verifikasi penuh session + role dilakukan di API routes (`verifyAuthDashboard`) dan `/api/auth/session`.
3. **Login** — Login dilakukan client-side via Firebase JS SDK (`signInWithEmailAndPassword` / `signInWithPopup`), lalu ID token dikirim ke `/api/auth/session` untuk membuat session cookie httpOnly.
4. **Email siswa** — `email_siswa` tetap disimpan di doc `aspirasi` dan tidak dikirim ke response API (sama seperti sebelumnya). Firestore rules mengizinkan public read aspirasi (parity dengan RLS lama).