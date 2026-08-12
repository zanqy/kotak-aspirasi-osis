# 📐 Kotak Aspirasi OSIS — Acuan Desain & Keputusan Produk

> Dokumen ini merangkum keputusan yang sudah diambil soal UI dan arsitektur fitur untuk project "Kotak Aspirasi OSIS", hasil dari sesi desain sebelum masuk implementasi Next.js. Ini pelengkap `README-LENGKAP.md` (spek teknis Next.js/Supabase) — dokumen ini fokus ke **kenapa UI-nya begini** dan **apa yang sudah/belum diputuskan**.

---

## 1. Latar Belakang & Sumber Referensi

Ada 2 referensi HTML awal yang jadi titik tolak:

| Referensi | Tema visual | Peran final |
|---|---|---|
| **Ref 1** | Dark, cinematic, scrollytelling — wax seal, paper object 3D, story mode 540vh | Halaman publik siswa (isi aspirasi) |
| **Ref 2** | Terang, "surat/kertas kraft" — masthead, amplop, jahitan dashed, ticker | Basis desain dashboard humas |

**Keputusan pembagian peran (final):**
- Ref 1 tetap dipakai utuh sebagai **halaman siswa** (form isi aspirasi), karena kesan "berkesan/emosional" cocok untuk momen submit pertama kali.
- Ref 2 **tidak dipakai sebagai landing page**, tapi diracik ulang jadi bahasa desain untuk **dashboard/meja kerja humas** — karena secara fungsi ref 2 (form + tracking langsung di satu halaman) lebih pas untuk workflow kerja pengurus, bukan untuk pengalaman submit siswa.

---

## 2. Prinsip Desain Dashboard: "Meja Kerja Arsip Surat", Bukan Dashboard SaaS Generik

### Kesalahan yang sempat terjadi (penting untuk tidak diulang)

Draf pertama dashboard dibuat dengan refleks template mental "dashboard app" generik: sidebar gelap + stat card kotak polos + table/list biasa. Ini ditolak user karena terasa "AI slop" — gak ada hubungan visual dengan tema surat/kertas yang jadi identitas project ini.

**Pelajaran:** kata "dashboard" adalah deskripsi fungsi, bukan instruksi visual. Setiap komponen fungsional harus dipetakan ke metafora "surat & arsip fisik", bukan ke komponen UI generik.

### Tabel padanan komponen (metafora → implementasi)

| Kebutuhan fungsional | JANGAN (generik) | PAKAI (metafora surat/arsip) |
|---|---|---|
| Ringkasan angka/statistik | Stat card kotak flat | **"Rak stempel"** — tile dengan label+ikon kecil, angka besar (Space Mono), trend indicator (↑/↓), dan cap kecil miring di pojok kanan bawah (bukan lencana bulat besar di atas) |
| Daftar surat masuk | Table row / list generik | **"Amplop"** — item dengan lipatan flap mini di pojok, indikator titik wax untuk status belum-dibuka |
| Filter kategori | Pill tab generik | **"Tab map arsip"** — tab yang menyatu dengan body panel saat aktif, seperti label folder fisik yang "naik" |
| Progress/status | Stepper dashboard generik | **Rel proses** bertitik dengan garis putus-putus horizontal (motif "flow-rail" dari ref 2) |
| Panel detail surat | Card putih polos | **"Surat yang dibuka"** — sheet dengan sudut lipat, garis kertas halus di background teks, stempel ditempel dengan animasi overshoot rotate |

### Signature elements yang wajib dipertahankan konsisten

Elemen dekoratif berikut adalah "ciri khas" tema ini dan harus dipakai berulang di semua halaman baru, bukan cuma sekali:

- **Jahitan dashed border** — `::before` dengan `inset` + `border: dashed`, dipakai di semua card/panel
- **Sudut kertas terlipat** — `::after` triangle border (`border-width: 0 Npx Npx 0`), muncul di pojok kanan atas card
- **Stempel/wax seal** — animasi `stampIn` dengan overshoot rotate (`scale(2) rotate(-14deg)` → settle di `rotate(-6deg)`)
- **Ticker berjalan** (`marquee` keyframe) — dipertahankan di masthead, isi teks disesuaikan konteks (siswa vs humas)
- **Choreography masuk berurutan** — delay staggered 0.1s–0.9s per elemen, bukan muncul serentak

### Design tokens (dipakai identik di semua halaman)

```css
--paper: #F1E9D8; --paper-deep: #E7DCC4; --card: #FBF7EE;
--ink: #2B2620; --ink-soft: #6B5F4C; --ink-faint: #A69A80;
--seal: #E0A526; --seal-deep: #B5810E; --line: #D8CBA9;
--ok: #4F7942; --warn: #B5541E;
```
Font: **Fraunces** (heading/serif), **Inter** (body), **Space Mono** (kode tiket, angka, label teknis).

---

## 3. Optimasi Performa Halaman Siswa (Ref 1)

Halaman siswa (scrollytelling) awalnya berat karena beberapa pola JS yang tidak efisien. Sudah diperbaiki, dicatat di sini supaya tidak ter-regresi kalau di-porting ke React:

| Masalah asli | Perbaikan |
|---|---|
| Scroll listener panggil `updateScroll()` langsung tiap event | Throttle via 1 flag + `requestAnimationFrame`, maksimal 1x per frame |
| `idleTiltTick` — rAF loop jalan selamanya tanpa syarat | Auto-stop begitu tilt sudah dekat target; "bangun" lagi saat ada `pointermove` baru |
| Motes (partikel debu) — jumlah banyak, jalan terus | Dikurangi (26→16 desktop, 14→8 mobile) + `IntersectionObserver` supaya pause total saat section tidak terlihat |
| Whisper text — rAF loop tanpa henti | Sama seperti motes, pakai `IntersectionObserver` |
| Cursor ring — rAF loop tanpa henti | Auto-stop saat ring sudah "nyampe" posisi mouse |
| Noise overlay (`feTurbulence` + `mix-blend-mode`) — mahal untuk GPU | Dimatikan di layar ≤768px lewat media query |

**Prinsip umum untuk halaman baru bertema serupa:** setiap `requestAnimationFrame` loop harus punya kondisi berhenti (idle detection) dan/atau terikat `IntersectionObserver`, jangan biarkan jalan tanpa syarat selama tab terbuka.

---

## 4. Fitur Chat Dua Arah — SUDAH DIIMPLEMENTASIKAN

README-LENGKAP.md menyebutkan alur chat dua arah antara siswa dan humas (status `dibalas` membuka kemampuan siswa untuk membalas). Fitur ini **sudah menjadi bagian tetap dari UI**, bukan opsional — sudah digabungkan ke panel detail dashboard (`meja-kerja-osis.html`), menggantikan kolom "catatan balasan" tunggal yang sebelumnya cuma satu arah.

### Bentuk UI: "utas surat berbalas", BUKAN chat bubble app (WhatsApp/Telegram style)

Alasan: alur di README sendiri sudah membatasi ini bukan chat real-time bebas (siswa cuma bisa balas kalau status = `dibalas`), jadi polanya lebih dekat ke "surat-menyurat berbalas", bukan sesi obrolan berkelanjutan. Membungkusnya sebagai chat app generik akan terasa asing dari tema kertas/surat yang sudah dibangun.

### Spesifikasi konkret (sudah diterapkan di kedua sisi UI)

- Setiap pesan = 1 entri dalam list vertikal kronologis, dipisah garis dashed tipis — bukan bubble kiri/kanan
- Pembeda pengirim: label kecil ("Kamu" vs "Humas OSIS" di sisi siswa; "Siswa (anonim)" vs "Kamu (Humas)" di sisi humas) dengan titik warna kecil, bukan warna bubble berbeda
- Balasan humas dikasih latar `--paper-deep` + garis aksen kiri `--seal` supaya sedikit menonjol tanpa jadi bubble mencolok
- **System note** di tengah utas untuk perubahan status ("Status diubah ke Diproses") — penting supaya siswa paham progres tanpa harus baca ulang semua histori
- **Kotak balas siswa terkunci kondisional**: hanya aktif kalau status = `dibalas`. Kalau belum, ganti jadi pesan pasif ("Menunggu balasan dari OSIS — kamu bisa membalas begitu humas merespons suratmu"), BUKAN input abu-abu ter-disable tanpa penjelasan
- **Sisi humas berbeda dari sisi siswa**: humas selalu bisa balas kapan saja (tidak terkunci status), dan dropdown ubah status + label kategori tetap ada di atas utas dalam panel yang sama
- Utas scrollable (`max-height` + `overflow-y: auto`) supaya panel tidak melar tak terbatas kalau percakapan panjang

### Keputusan struktural: TIDAK dipisah jadi halaman/route sendiri

Utas ditampilkan menyatu dalam panel detail yang sama dengan info status & kontrol lainnya (bukan route terpisah seperti `/cek-aspirasi/[kode]/chat`).

Alasan tidak dipisah:
- Volume pesan per tiket kemungkinan kecil (2-4 pesan, bukan chat berkelanjutan) berdasarkan alur status yang dibatasi
- Siswa yang cuma mau cek status cepat tidak perlu klik ekstra untuk buka halaman lain
- Next.js routing tambahan untuk kasus yang secara volume kecil dianggap prematur

**Catatan untuk revisit nanti:** kalau di produksi ternyata volume chat per tiket jadi besar (banyak bolak-balik), itu sinyal valid untuk pisah jadi halaman sendiri.

### Implementasi di sisi dashboard (sudah jadi, di `meja-kerja-osis.html`)

- Data percakapan disimpan per `letter.id` di object `threads` (sementara masih dummy/in-memory — perlu disambungkan ke tabel `pesan` sesuai skema README saat porting ke Next.js)
- Fungsi `buildThread(letterId)` merender ulang seluruh utas tiap kali surat dibuka atau ada balasan baru
- Klik "Segel & simpan perubahan" sekarang melakukan 2 hal sekaligus: update status DAN, kalau textarea balasan diisi, menambah entri baru ke `threads` lalu re-render utas dan mengosongkan textarea

### Implementasi di sisi siswa (`/cek-aspirasi`) — mock sudah ada, belum digabung ke halaman siswa final

Mock-up visual sisi siswa (kartu tiket + utas + form balas dengan kondisi terkunci) ada di `mock-utas-surat.html`. Ini **masih perlu digabungkan** ke halaman `/cek-aspirasi` (belum ada di `halaman-siswa-optimized.html` karena halaman itu murni untuk submit aspirasi, bukan tracking — `/cek-aspirasi` adalah halaman terpisah yang belum dibuat versi HTML-nya).

---

## 5. Yang Masih Perlu Diputuskan / Belum Disentuh

Daftar ini murni pengingat, bukan berarti harus segera dikerjakan:

- **Auth & role** (`pending/approved/rejected`, admin-only untuk `/dashboard/anggota`) — belum ada representasi UI-nya sama sekali di desain HTML yang sudah dibuat.
- **Notifikasi email** (Resend) — trigger dari sisi UI (misal badge "email terkirim" di dashboard) belum dirancang.
- **Konversi HTML statis → komponen React/TSX** untuk Next.js App Router — desain HTML/CSS yang sudah ada perlu dipecah jadi komponen (mengacu ke `components/ui/`, `components/animations/` sesuai struktur folder di README) sebelum bisa disambungkan ke Supabase. Ini pekerjaan terpisah dari desain visual yang sudah selesai di sesi ini.
- **Privacy rule**: `email_siswa` tidak boleh pernah dikirim ke client dari API — perlu dipastikan komponen chat/tracking manapun yang dibuat nanti tidak menampilkan field ini di response.

---

## 6. File Terkait dari Sesi Ini

| File | Isi |
|---|---|
| `halaman-siswa-optimized.html` | Ref 1 (scrollytelling) dengan optimasi performa — untuk submit aspirasi, BELUM termasuk utas percakapan (itu ada di halaman `/cek-aspirasi` terpisah) |
| `meja-kerja-osis.html` | Dashboard humas final, tema "meja kerja arsip surat", **sudah termasuk utas percakapan dua arah** di panel detail |
| `mock-utas-surat.html` | Referensi visual utas percakapan sisi siswa (untuk `/cek-aspirasi`, belum digabung ke file HTML final) — sisi humasnya sudah digabung ke `meja-kerja-osis.html` |
| `html-reference-remix/SKILL.md` | Skill workflow untuk menganalisis referensi HTML sebelum bikin turunan halaman baru — supaya proses ekstraksi bahasa desain ini bisa diulang secara konsisten di sesi lain |
