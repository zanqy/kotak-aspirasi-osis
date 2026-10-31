# PORT-PLAN — membawa halaman asli AKSARA ke Next.js

Halaman asli (`aksara/index.html`, `profil.html`, `kirim.html`) adalah **referensi desain**.
Tugas sekarang: memindahkannya ke React **tanpa mengubah tampilannya**, sambil tetap
memakai login Google + Firestore.

Pendekatan: CSS asli dipakai apa adanya (di-scope), renderer tempelan juga dipakai apa
adanya. React hanya memegang data, auth, dan state.

## Status

### Tahap 1 — Papan mading ✅
- `app/aksara/legacy-board.css` — 502 baris CSS asli, seluruh selector di-scope ke
  `.aksara-v1` (aman, tidak menabrak Tailwind/KATAKAN).
- `lib/aksara/v1-render.ts` — `makeItem()` disalin apa adanya dari prototype; **18 jenis**
  tempelan ikut (note, kliping, foto, tiket, pita, perangko, amplop, tag, struk, tulis,
  umbul, lampu, lampion, layang, kipas, rantai, balon, badge).
- `components/aksara/Board.tsx` — pan, pinch-zoom, wheel zoom, clamp, tombol ＋ − fit,
  tekstur kertas digambar di runtime, hint papan kosong, folio koran.
- `app/aksara/mading/[boardId]` — kop koran (masthead, edisi, dateline, aturan ganda)
  seperti aslinya, + bar aksi di bawah.

### Tahap 2 — Lembar tempel (sheet) ⏳ belum
Sheet React sekarang baru 9 jenis dan tidak punya pemilih bentuk/kertas/selotip/bingkai/
highlight/pin/bayangan. Yang harus dibawa dari prototype:
- 18 jenis + pemilih bentuk per jenis (`SHAPES`)
- 10 model kertas note, 4 kliping, 3 tiket (`PAPERS`)
- 6 warna selotip + 4 posisi selotip (`TAPES`, `TAPE_POS`)
- 5 bingkai foto (`FRAMES`), 3 rasio + auto-rasio dari foto
- 5 highlight, 14 stempel, 18 stiker, 5 warna pin + posisi
- pratinjau langsung (live preview) di dalam sheet

### Tahap 3 — Gestur & menu ⏳ belum
- ketuk papan kosong → langsung buka sheet di titik itu (ini UX asli)
- menu tekan-lama: pindah, putar, ke depan/belakang, duplikat, hapus + undo
  (di React `onFront`/`onBack` masih no-op)
- modal konfirmasi "kosongkan papan" (bukan 2-tap)

### Tahap 4 — Profil & Kirim ⏳ belum
- `profil.html`: kartu pelajar + galeri karya (chip filter per jenis, kartu pratinjau,
  lembar detail). Versi React belum punya galeri.
- `kirim.html`: versi React sudah mengikuti desain yang disetujui (cap AKSARA POST,
  kertas robek, amplop terbang) — tinggal dicek detail tipografinya.

## Aturan main
- Jangan "merapikan" CSS asli. Kalau ada yang aneh, bandingkan dengan prototype dulu.
- Semua angka layout (1800×1200 papan, clamp tinggi boardWrap, skala fit 0.94) ikut asli.
- Data tetap dari Firestore; prototype tidak lagi menulis localStorage.
