# 🔧 Instruksi Konversi UI → Next.js — Kotak Aspirasi OSIS

> **Untuk AI/Zoo Code.** Ini instruksi konversi dari file HTML statis (hasil desain sudah difinalkan) ke komponen Next.js App Router + TypeScript + Supabase, sesuai stack yang didefinisikan di `README-LENGKAP.md`. **Ikuti pemetaan di dokumen ini secara eksplisit — jangan improvisasi struktur komponen atau nama file sendiri.**

Sumber HTML yang dikonversi:
- `halaman-siswa-optimized.html` → jadi route `/` (form aspirasi publik)
- `meja-kerja-osis.html` → jadi route `/dashboard/aspirasi` (kelola aspirasi humas)

Baca dulu `README-LENGKAP.md` project ini (struktur folder, skema tabel, Supabase client per konteks) sebelum mulai — jangan asumsikan skema tabel tanpa mengecek.

---

## ⚠️ Keputusan yang Harus Dikonfirmasi ke User Dulu (Jangan Diasumsikan Sendiri)

Sebelum mulai ngoding apa pun, tanyakan 4 hal ini ke user dan tunggu jawabannya. Ini bukan detail kecil — kalau diasumsikan sendiri, hasilnya bisa melenceng dari desain/skema yang sebenarnya dan perlu dirombak ulang.

1. **Angka "trend" di `StatCard`** (contoh: "↑ 8 dari bulan lalu", "↑ 3 butuh perhatian") — ini murni data dummy di desain HTML, TIDAK ADA kolom historis untuk ini di skema Supabase manapun yang disebut README. Tanyakan: apakah trend ini dihilangkan dulu (cukup tampilkan `label` + `value` + `badgeText`), atau mau diimplementasikan beneran (perlu query `COUNT(*)` dengan filter `created_at` periode tertentu)? **Jangan hitung/tampilkan angka trend apa pun sebelum dikonfirmasi.**

2. **Kategori aspirasi — enum tetap atau teks bebas?** Desain hardcode 4 kategori (`akademik`, `fasilitas`, `kegiatan`, `lainnya`). Cek `supabase/migration.sql` — apakah kolom `kategori` di tabel `aspirasi` punya constraint enum, atau varchar/text bebas? Kalau bebas teks, `CategoryTabs` harus generate tab dari `SELECT DISTINCT kategori FROM aspirasi` + tab "Semua", bukan hardcode 4 string dari mock ini. Konfirmasi ke user dulu sebelum membangun `CategoryTabs`.

3. **Sumber "system note" perubahan status** di dalam `MessageThread` (contoh: "Status diubah ke Diproses"). Ada 2 opsi: (a) ambil dari tabel `aktivitas` yang sudah ada di skema untuk log aktivitas humas, atau (b) insert sebagai entry bertipe khusus di tabel `pesan`. Rekomendasi default: **pakai tabel `aktivitas`** karena itu memang fungsinya, dan menghindari perlu nambah kolom "tipe" di tabel `pesan`. Tapi tetap konfirmasi ke user sebelum diimplementasikan, terutama kalau tabel `aktivitas` ternyata scope-nya beda dari yang diasumsikan di sini.

4. **Halaman `/cek-aspirasi` belum punya versi HTML final** — yang ada baru mock visual di `mock-utas-surat.html` (sisi siswa). Sebelum membangun halaman ini (langkah 8 di Bagian 5), konfirmasi ke user apakah mock itu sudah final atau masih ada revisi yang belum sempat dituangkan ke file.

---

## Aturan Umum (berlaku untuk semua langkah di bawah)

1. **Jangan gabungkan/pangkas komponen jadi lebih sedikit file demi "efisiensi".** Ikuti pemisahan komponen sesuai tabel di bawah, walau kelihatan granular. Ini supaya konsisten dengan struktur `components/ui/` yang sudah didefinisikan README.
2. **CSS variables & keyframes dipindah literal**, tidak diterjemahkan ke skala warna Tailwind default (jangan ganti `#E0A526` jadi `amber-500` dari palet Tailwind bawaan — pakai custom theme extend di `tailwind.config` dengan value persis ini).
3. **Jangan reimplement animasi entrance manual (`riseIn`/`unfold`/staggered delay pakai `nth-child`) dengan `useEffect` + `setTimeout` custom.** Project ini sudah punya Framer Motion di stack — gunakan itu untuk entrance animation, dengan easing/durasi yang menyerupai keyframe aslinya (lihat tabel padanan di Bagian 3).
4. **Semua fetch data dari Supabase harus lewat client yang benar sesuai konteksnya** — cek tabel "Supabase Client" di README-LENGKAP.md (`createServiceClient()` untuk public pages & API routes, `createBrowserClient()` untuk dashboard pages, `createServerSupabaseClient()` untuk server SSR). **Jangan asal pilih client tanpa mengecek konteks halaman.**
5. **`email_siswa` tidak boleh pernah muncul di response API atau di-render di komponen manapun.** Kalau ada komponen yang butuh tahu "apakah siswa kasih email atau tidak" (misalnya untuk badge kecil), cukup kirim boolean dari API (`hasEmail: true/false`), jangan kirim value email-nya.
6. Setelah selesai konversi tiap komponen, **jalankan `tsc --noEmit` atau build check** sebelum lanjut ke komponen berikutnya — jangan tunggu sampai semua komponen selesai baru dicek sekaligus.

---

## Bagian 1 — Setup Token Desain (kerjakan pertama, sebelum komponen apa pun)

### 1a. Tailwind config

Tambahkan ke `tailwind.config.ts` (bagian `theme.extend.colors`):

```ts
colors: {
  paper: '#F1E9D8',
  'paper-deep': '#E7DCC4',
  card: '#FBF7EE',
  ink: '#2B2620',
  'ink-soft': '#6B5F4C',
  'ink-faint': '#A69A80',
  seal: '#E0A526',
  'seal-deep': '#B5810E',
  line: '#D8CBA9',
  ok: '#4F7942',
  warn: '#B5541E',
},
boxShadow: {
  paper: '0 1px 0 rgba(43,38,32,0.05), 0 18px 40px -20px rgba(43,38,32,0.35)',
  lift: '0 1px 0 rgba(43,38,32,0.06), 0 28px 60px -24px rgba(43,38,32,0.45)',
}
```

### 1b. Font setup

Gunakan `next/font/google` untuk load Fraunces, Inter, Space Mono (bukan `<link>` tag manual seperti di HTML asli). Definisikan di `app/layout.tsx`, assign ke CSS variable (`--font-fraunces`, `--font-inter`, `--font-space-mono`), lalu pakai di Tailwind config sebagai `fontFamily.serif`/`sans`/`mono`.

### 1c. Global CSS (signature elements sebagai utility/component classes)

Di `app/globals.css`, buat class reusable untuk elemen dekoratif yang berulang di banyak komponen (supaya tidak copy-paste inline style di tiap komponen):

```css
/* Jahitan dashed - dipakai di semua card/panel bertema kertas */
.paper-stitch::before {
  content: '';
  position: absolute;
  inset: 9px;
  border: 1.5px dashed theme('colors.line');
  border-radius: 2px;
  pointer-events: none;
}

/* Sudut kertas terlipat - dipakai di pojok kanan atas card */
.paper-fold::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 0 28px 28px 0;
  border-color: transparent theme('colors.paper-deep') transparent transparent;
  filter: drop-shadow(-2px 2px 3px rgba(43,38,32,0.10));
}
```

Referensi lengkap semua `@keyframes` (`riseIn`, `riseInSm`, `unfold`, `stampIn`, `floatSlow`, `marquee`, `shake`, `pinDrop`) ada di `<style>` block file `meja-kerja-osis.html` — pindahkan definisi keyframe-nya persis, tapi **penggunaannya di komponen React sebaiknya lewat Framer Motion**, bukan CSS animation langsung (lihat Bagian 3).

---

## Bagian 2 — Pemetaan Komponen: Dashboard Humas (`meja-kerja-osis.html` → `/dashboard/aspirasi`)

Ini pemetaan wajib — nama komponen di kolom kanan HARUS dipakai sebagai nama file di `components/ui/`, kecuali sudah ada nama lain yang didefinisikan README (cek dulu, jangan duplikat kalau nama itu sudah dipakai untuk komponen lain).

| Elemen HTML (class/id) | Jadi komponen | Props/data yang dibutuhkan | Sumber data Supabase |
|---|---|---|---|
| `.stamp-tile` × 4 (`#stampRack`) | `<StatCard variant="total\|baru\|proses\|selesai" />` | `label`, `value`, `trend` (opsional), `badgeText`, `isActive`, `onClick` | `COUNT(*)` dari tabel `aspirasi` per kondisi status — hitung di server component atau API route, jangan hitung di client dari array besar |
| `.folder-tabs` (`#folderTabs`) | `<CategoryTabs />` | `categories: {key, label, count}[]`, `activeCategory`, `onChange` | Kategori aspirasi — cek dulu apakah field `kategori` di tabel `aspirasi` punya enum tetap atau bebas teks; sesuaikan daftar tab dengan nilai aktual di DB, jangan hardcode 4 kategori dari mock |
| `.envelope-item` (di dalam `#envelopeList`) | `<AspirasiItem />` | `id`, `code` (kode tiket), `category`, `excerpt`, `status`, `date`, `isUnread`, `isSelected`, `onClick` | Query tabel `aspirasi`, join/lookup status terakhir. **Jangan select `email_siswa`** di query ini sama sekali |
| `#deskPanel` isi (`.letter-sheet` saat surat dibuka) | `<AspirasiDetailPanel />` | `aspirasi: Aspirasi` (tanpa field email), `onStatusChange`, `onSaveNote` | Detail 1 row dari tabel `aspirasi` by `id`, plus riwayat dari tabel `pesan` kalau chat dua arah sudah dikerjakan (lihat catatan di Bagian 4) |
| `.process-rail` (di dalam detail panel) | `<StatusRail currentStatus={...} />` | `currentStatus: 'menunggu' \| 'diproses' \| 'dibalas' \| 'diteruskan'` | — (murni presentational, terima status dari parent) |
| `#deskEmpty` (state kosong) | Bagian dari `<AspirasiDetailPanel />` sendiri (render kondisional `if (!selectedId)`), BUKAN komponen terpisah | — | — |
| `.toast` (`#toast`) | Cek dulu apakah project sudah punya toast library/komponen global (banyak Next.js project pakai `sonner` atau serupa) — **jangan bikin toast custom baru** kalau sudah ada. Kalau belum ada, baru bikin `<Toast />` sesuai style ini | `title`, `description` | — |
| Search input (`#searchInput`) | Bagian dari halaman `/dashboard/aspirasi/page.tsx` langsung (client component wrapper), state di-lift ke situ, bukan komponen `AspirasiItem`/`StatCard` | `searchQuery`, `onSearchChange` | — |

### Catatan penting untuk `StatCard`

Di HTML asli, angka `trend` (↑ 8, ↑ 3, dst) adalah **data dummy hardcode**. README tidak menyebutkan ada tracking historis/perbandingan "bulan lalu" di skema tabel manapun. **Jangan asumsikan ada kolom untuk ini.** Dua opsi:
- Opsi A: Hilangkan `trend` dari `StatCard` untuk versi pertama (cukup tampilkan `label` + `value` + `badgeText`), sampai ada keputusan mau tracking historis atau tidak.
- Opsi B: Kalau tetap mau ditampilkan, hitung `trend` sederhana dari `COUNT(*)` dengan filter `created_at` dalam 7/30 hari terakhir vs sebelumnya — **tapi ini keputusan produk yang belum diambil, jangan diam-diam diimplementasikan. Tanyakan ke user dulu sebelum ngoding bagian ini.**

### Catatan untuk filter kategori

HTML asli hardcode 4 kategori (`akademik`, `fasilitas`, `kegiatan`, `lainnya`). **Cek dulu ke migration SQL (`supabase/migration.sql`) apakah kategori ini enum tetap di DB atau cuma teks bebas.** Kalau bebas teks, `CategoryTabs` sebaiknya generate tab dari `SELECT DISTINCT kategori FROM aspirasi` plus tab "Semua", bukan hardcode 4 string dari mock ini.

---

## Bagian 3 — Padanan Animasi (CSS keyframe asli → Framer Motion)

| CSS keyframe asli | Framer Motion equivalent |
|---|---|
| `riseInSm` (translateY 12px, delay bertahap per elemen) | `<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6, delay:N}} />` — nilai `delay` ikuti urutan staggered yang sama seperti di CSS asli (masthead 0.1s, ticker 0.25s, dst — lihat komentar di `meja-kerja-osis.html`) |
| `.stamp-tile` staggered delay (`nth-child`) | Bungkus list `StatCard` dengan `<motion.div>` per item, atau pakai `staggerChildren` di parent `variants` — lebih idiomatic React daripada `nth-child` |
| `unfold` (perspective + rotateX, dipakai di detail panel) | `<motion.div initial={{opacity:0, rotateX:-8, y:24, scale:0.98}} animate={{opacity:1, rotateX:0, y:0, scale:1}} transition={{duration:0.7, ease:[0.22,1,0.36,1]}} />` |
| `stampIn` (overshoot rotate untuk stempel) | `<motion.div initial={{scale:2, rotate:-14, opacity:0}} animate={{scale:1, rotate:-6, opacity:1}} transition={{duration:0.55, ease:[0.34,1.56,0.64,1]}} />` — ini easing "overshoot" (bounce-like), pertahankan cubic-bezier persis ini supaya efeknya sama |
| `marquee` (ticker berjalan) | Ini murni CSS `animation: marquee 34s linear infinite` — **tidak perlu diubah ke Framer Motion**, biarkan CSS keyframe biasa karena tidak ada trigger React state, cukup jalan terus |

---

## Bagian 4 — Chat Dua Arah (Sudah Jadi Fitur Wajib, Bukan Opsional)

Fitur ini **sudah diimplementasikan di sisi dashboard** (`meja-kerja-osis.html`, panel detail sekarang berisi utas percakapan penuh, bukan cuma satu kolom catatan balasan) dan **wajib ikut dikonversi** — bukan fitur yang bisa ditunda.

Tambahan pemetaan komponen untuk Bagian 2 (dashboard):

| Elemen HTML (class/id) | Jadi komponen | Props/data yang dibutuhkan | Sumber data Supabase |
|---|---|---|---|
| `.thread-block` / `.thread-body` (utas percakapan di dalam `AspirasiDetailPanel`) | `<MessageThread />` | `messages: {role, time, text}[]`, `aspirasiId` | Tabel `pesan`, filter by `aspirasi_id`, urut `created_at` ascending. Field `pengirim` (siswa/humas) menentukan styling role |
| Textarea balas (`#replyBox` di dalam desk panel) | `<ReplyComposer role="humas" />` | `onSubmit(text)`, `disabled` (untuk sisi siswa, terkunci kalau status ≠ `dibalas`) | Insert row baru ke tabel `pesan` |
| System note ("Status diubah ke...") | Bagian dari `<MessageThread />`, render kondisional di antara pesan kalau ada perubahan status tercatat | — | Bisa dari tabel `aktivitas` (log aktivitas humas) kalau mau tampil akurat sesuai waktu perubahan, atau cukup insert log status change ke tabel `pesan` sebagai tipe khusus — **cek dulu skema, jangan asumsikan mana yang dipakai tanpa konfirmasi** |

Untuk sisi siswa (`/cek-aspirasi`), acuan visualnya ada di `mock-utas-surat.html` (belum digabung ke file HTML final, tapi styling & strukturnya identik dengan yang sudah jadi di sisi humas — pakai class CSS yang sama, jangan bikin ulang).

Spesifikasi detail (kotak balas terkunci kondisional, kenapa bukan chat bubble app, kenapa tidak dipisah jadi route sendiri) ada lengkap di `acuan-desain-kotak-aspirasi.md` Bagian 4 — baca itu dulu sebelum implementasi, supaya bentuk UI-nya tidak diimprovisasi ulang dari nol.

---

## Bagian 5 — Urutan Kerja yang Disarankan

Jangan konversi semua sekaligus. Urutan yang disarankan:

1. Setup token desain (Bagian 1) — sekali jadi, dipakai semua komponen berikutnya
2. `StatCard` (paling sederhana, tanpa interaksi kompleks) — build + tes render dengan data dummy dulu sebelum sambung Supabase
3. `CategoryTabs` — sambungkan ke query kategori aktual dari DB
4. `AspirasiItem` + list container — sambungkan ke query tabel `aspirasi`, pastikan `email_siswa` tidak ter-select
5. `AspirasiDetailPanel` + `StatusRail` — sambungkan klik dari `AspirasiItem` ke detail, implementasikan update status (tulis ke Supabase)
6. `MessageThread` + `ReplyComposer` di dalam `AspirasiDetailPanel` — sambungkan ke tabel `pesan`, pastikan insert pesan baru ikut update `updated_at` di tabel `aspirasi` kalau memang perlu (cek trigger di migration.sql)
7. Baru setelah semua di atas jalan dan dicek user, lanjut ke halaman siswa (`/`) dari `halaman-siswa-optimized.html`
8. Halaman `/cek-aspirasi` (belum ada versi HTML final) — bangun berdasarkan `mock-utas-surat.html` sisi siswa, pastikan kotak balas terkunci kondisional sesuai status

**Setiap selesai 1 langkah, tunjukkan hasilnya ke user dulu sebelum lanjut ke langkah berikutnya** — jangan build semua komponen sekaligus lalu baru direview di akhir, supaya kalau ada yang melenceng dari desain aslinya, ketahuan lebih awal dan tidak perlu rombak banyak sekaligus.
