# AKSARA. — Rencana Migrasi ke Next.js + Firebase

Dibuat sebelum eksekusi. Ini roadmap dari prototype vanilla HTML ke app Next.js
yang sama stack-nya dengan KATAKAN. (Next.js 14 + React + TS + Tailwind + Firebase).

---

## 0. Keputusan yang sudah di-lock

- Stack = **Next.js 14 + React 18 + TypeScript + Tailwind 3 + Firebase 12**
  (sama dengan KATAKAN, satu mental model, satu deploy flow).
- AKSARA jadi **route `/aksara/*`** di app Next.js yang sama (bukan project baru).
- Hosting pindah dari GitHub Pages ke **Vercel** (atau Firebase Hosting) —
  Next.js butuh server. GitHub Pages tetap untuk file statis lama (prototype).
- Data: localStorage → **Firestore** (real-time, sinkron antar device).
- Auth: simulasi (nama+kelas) → **Firebase Auth** (email/password atau NIS).
- Foto: base64 localStorage → **Firebase Storage**.

---

## 1. Struktur folder target

```
app/
  aksara/
    layout.tsx          ← layout AKSARA (font, theme, nav)
    page.tsx            ← home (publik vs member, deteksi login)
    mading/
      page.tsx          ← papan mading interaktif (migrasi dari index.html)
      [id]/page.tsx     ← detail tempelan (opsional)
    profil/
      page.tsx          ← kartu pelajar + galeri karya
    kirim/
      page.tsx          ← meja pos (surat)
    masuk/
      page.tsx          ← login (Firebase Auth)
    daftar/
      page.tsx          ← register
components/
  aksara/
    Board.tsx           ← kanvas papan (pan, zoom, render item)
    ItemCard.tsx        ← satu tempelan
    ItemSheet.tsx       ← form tempel (jenis, bentuk, warna, dll)
    ContextMenu.tsx     ← menu kontekstual (tekan lama)
    LetterDesk.tsx      ← meja pos (surat)
    StudentCard.tsx     ← kartu pelajar
    Gallery.tsx         ← galeri karya
lib/
  aksara/
    types.ts            ← tipe data (Item, Student, Letter, Board)
    board.ts            ← CRUD papan (Firestore)
    storage.ts          ← upload foto (Storage)
    auth.ts             ← helper auth AKSARA
```

---

## 2. Fase migrasi (urutan)

### Fase 1 — Scaffold (1-2 hari) ✅
- [x] Buat route `/aksara` di app Next.js.
- [x] Layout AKSARA: font + theme + nav.
- [x] Home publik: port dari `publik.html` → React component.
- [x] Home member: deteksi login, pintasan 3 papan + info.
- [x] Verifikasi: `npm run dev` jalan, route `/aksara` tampil di localhost.

### Fase 2 — Auth (1-2 hari) ✅
- [x] Firebase Auth: register (nama, kelas, NIS, password) + login.
- [x] Session: onAuthStateChanged → redirect ke /aksara/masuk jika belum login.
- [x] Home member: deteksi login, tampilkan sapaan + pintasan.

### Fase 3 — Papan Mading (3-5 hari) ✅
- [x] Migrasi kanvas: pan, zoom, render item (React + useRef + transform).
- [x] Migrasi form tempel: jenis (9), bentuk, rasio, warna, font, tinta,
      stempel, stiker, bayangan, align, foto upload.
- [x] Migrasi gestur: ketuk, tekan lama, menu kontekstual, edit, undo, duplikat.
- [x] Firestore: collection `boards/{boardId}/items/{itemId}`.
- [x] Real-time: `onSnapshot` → papan update otomatis.
- [ ] Foto: upload ke Storage, simpan URL (bukan base64). (masih base64)
- [ ] Seed data: pindahkan 36 tempelan contoh ke Firestore (sekali jalan).

### Fase 4 — Profil (2-3 hari) 🔄
- [x] Kartu pelajar: nama, kelas, badge peran, bio.
- [x] Edit profil (nama, kelas, bio).
- [ ] Galeri karya: filter per jenis, kartu pratinjau, lembar detail. (belum)
- [x] Firestore: collection `students/{uid}`.

### Fase 5 — Kirim Surat (2-3 hari) ✅
- [x] Meja pos: port dari `kirim.html` → React.
- [ ] Animasi amplop (CSS keyframes, tetap bisa di React). (belum)
- [x] Firestore: collection `letters/{letterId}` (to, from, isi, anonim, waktu).
- [x] Surat tidak ditempel ke papan — hanya tercatat.

### Fase 6 — Multi-Papan (3-5 hari) 🔄
- [x] Mading Umum: papan publik (semua bisa lihat & nempel).
- [x] Mading Pribadi: milik satu siswa (route /aksara/mading/pribadi).
- [ ] Mading Kelas: per kelas, hanya anggota kelas. (belum)
- [x] Home member: pintasan ke 3 papan + info surat masuk.
- [ ] Home publik: kolase lintas mading (tempelan terbaru dari semua papan). (belum)

### Fase 7 — Moderasi & Polish (2-3 hari)
- [ ] Lapor/hapus tempelan & surat.
- [ ] Role: OSIS moderator, guru.
- [ ] Responsive: pastikan HP 390px lancar.
- [ ] Performance: lazy load, image optimization, Firestore pagination.

---

## 3. Data schema (Firestore)

### `students/{uid}`
```ts
{
  nama: string,
  kelas: string,
  role: "siswa" | "osis" | "guru" | "admin",
  bio: string,
  fotoUrl: string,
  createdAt: Timestamp,
}
```

### `boards/{boardId}`
```ts
{
  nama: string,        // "Mading Umum", "Kelas XI-1", "Pribadi Za"
  tipe: "umum" | "kelas" | "pribadi",
  kelas: string | null,  // untuk tipe kelas
  owner: string | null,  // uid untuk tipe pribadi
  createdAt: Timestamp,
}
```

### `boards/{boardId}/items/{itemId}`
```ts
{
  kind: string,        // note, clip, polaroid, tiket, pita, ...
  shape: string,
  x: number, y: number, rot: number, scale: number,
  text: string,
  name: string,
  color: string,
  paper: string, font: string, ink: string,
  filter: string, frame: string, tape: string, tapePos: string,
  sticker: string, sp: string, sg: string,
  stamp: string, shadow: string, align: string,
  pin: string, pinPos: string, highlight: string,
  image: string | null,   // Storage URL
  ratio: string,
  at: Timestamp,
  createdBy: string,      // uid
}
```

### `letters/{letterId}`
```ts
{
  to: string,
  from: string,
  fromUid: string | null,   // null jika anonim
  isi: string,
  anonim: boolean,
  createdAt: Timestamp,
}
```

---

## 4. Yang bisa dipertahankan dari prototype

| Dari prototype (vanilla) | Ke Next.js |
|---|---|
| CSS (warna, font, layout) | Tailwind classes + globals.css |
| Animasi (amplop terbang, cap TERKIRIM) | CSS keyframes (tetap bisa di React) |
| Gestur (pan, zoom, ketuk, tekan lama) | useRef + event handlers |
| Form tempel (semua opsi) | React component dengan state |
| Data schema localStorage | Mapping ke Firestore (struktur sama) |
| 36 tempelan contoh | Seed script ke Firestore |
| Gambar SVG (cap pos, dll) | Tetap SVG, inline di JSX |

---

## 5. Yang berubah total

| Aspek | Prototype | Next.js |
|---|---|---|
| Routing | File HTML terpisah | App Router (`/aksara/mading`) |
| State | Variabel global IIFE | React state + hooks |
| Data | localStorage | Firestore (real-time) |
| Auth | Simulasi (nama+kelas) | Firebase Auth |
| Foto | base64 di localStorage | Firebase Storage URL |
| Deploy | git push → GitHub Pages | Vercel (auto deploy on push) |
| Cache | `?v=N` manual | Vercel handles caching |

---

## 6. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Rewrite besar, lama | Fase per fase, setiap fase bisa di-test |
| Kehilangan fitur saat migrasi | Checklist per fase, bandingkan dengan prototype |
| Firestore cost | Free tier cukup untuk sekolah (50k read/day) |
| Performance (papan 1400×1400) | Virtualize, lazy render, Web Worker untuk pan/zoom |
| Foto Storage cost | Compress client-side sebelum upload, max 1MB |

---

## 7. Keputusan (sudah di-lock)

1. **Deploy target**: Vercel (auto-deploy on push).
2. **Auth method**: NIS-based, nanti bisa dihubungkan ke email.
3. **Mading Pribadi**: fleksibel — bisa privat, bisa dipublish.
4. **Moderasi**: OSIS jadi moderator.
5. **Kirim Surat**: jadi amplop nyata yang bisa dibuka penerima.

---

## 8. Estimasi total

- Fase 1-2 (scaffold + auth): 2-4 hari
- Fase 3 (papan mading): 3-5 hari
- Fase 4-5 (profil + kirim): 4-6 hari
- Fase 6-7 (multi-papan + polish): 5-8 hari
- **Total: ~2-4 minggu** kerja santai.

---

## 9. Langkah pertama (kalau "go")

1. `npx create-next-app` sudah ada → tinggal buat folder `app/aksara/`.
2. Buat `app/aksara/layout.tsx` dengan font + theme AKSARA.
3. Buat `app/aksara/page.tsx` (home publik, port dari `publik.html`).
4. Test di localhost:3000/aksara.
5. Commit + push → Vercel auto-deploy.

---

Kalau ada yang perlu diubah di plan ini, bilang sebelum "go".
