# PORT-PLAN — membawa halaman asli AKSARA ke Next.js

Halaman asli (`aksara/index.html`, `profil.html`, `kirim.html`) adalah **referensi desain**.
Tugas sekarang: memindahkannya ke React **tanpa mengubah tampilannya**, sambil tetap
memakai login Google + Firestore.

Pendekatan: CSS asli dipakai apa adanya (di-scope), renderer tempelan juga dipakai apa
adanya. React hanya memegang data, auth, dan state.

## Status

### Tahap 1 — Papan mading ✅ (live)
- `app/aksara/legacy-board.css` — 502 baris CSS asli, seluruh selector di-scope ke
  `.aksara-v1` (aman, tidak menabrak Tailwind/KATAKAN).
- `lib/aksara/v1-render.ts` — `makeItem()` disalin apa adanya dari prototype; **18 jenis**
  tempelan ikut (note, kliping, foto, tiket, pita, perangko, amplop, tag, struk, tulis,
  umbul, lampu, lampion, layang, kipas, rantai, balon, badge).
- `components/aksara/Board.tsx` — pan, pinch-zoom, wheel zoom, clamp, tombol ＋ − fit,
  tekstur kertas digambar di runtime, hint papan kosong, folio koran.
- `app/aksara/mading/[boardId]` — kop koran (masthead, edisi, dateline, aturan ganda)
  seperti aslinya, + bar aksi di bawah.

### Tahap 2 — Lembar tempel ✅ (live)
- `components/aksara/ItemSheet.tsx` — ditulis ulang pakai kelas CSS asli
  (`.sheet/.panel/.kinds/.kind/.shapes/.shape/.field/.row/.btn/.advToggle/.livePrev`):
  18 jenis + bentuk per jenis + warna kertas + 10/4/3 model kertas + font + tinta +
  filter foto + selotip + bingkai + stempel + stiker + pin + perataan + bayangan +
  ukuran stiker + highlight + posisi selotip + rasio + Kejutan + Opsi lanjutan.
- Pratinjau live dirakit dari `buildItem()` — kelas 100% sama dengan hasil tempel.
- Ketuk papan kosong → sheet terbuka dengan titik tempel = titik ketuk (asli).
- Rasio foto otomatis dari aspek gambar (asli).

### Tahap 3 — Gestur & menu ✅ (live)
- `components/aksara/ContextMenu.tsx` — struktur asli: slider sudut, ↺/↻ 15°,
  luruskan, besar/kecil/balik, Intip/Lainnya, ubah, pindah, depan/belakang/duplikat,
  hapus. Tanpa emoji. Ghost + anti-tumpah seperti referensi.
- Putar tersimpan ke Firestore (slider + tombol), skala 0,5–1,8, flip polaroid.
- Depan/belakang via field `z` (Board mengurut render).
- Pindah posisi via moveBar + ketuk papan (asli: geser; adaptasi: ketuk-taruh).
- Hapus + undo, modal konfirmasi "kosongkan papan", tombol × di folio.

### Tahap 4 — Profil & Kirim ⏳ belum
- `profil.html`: kartu pelajar + galeri karya (chip filter per jenis, kartu pratinjau,
  lembar detail). Versi React belum punya galeri.
- `kirim.html`: versi React sudah mengikuti desain yang disetujui (cap AKSARA POST,
  kertas robek, amplop terbang) — tinggal dicek detail tipografinya.

## Aturan main
- Jangan "merapikan" CSS asli. Kalau ada yang aneh, bandingkan dengan prototype dulu.
- Semua angka layout (1800×1200 papan, clamp tinggi boardWrap, skala fit 0.94) ikut asli.
- Data tetap dari Firestore; prototype tidak lagi menulis localStorage.
