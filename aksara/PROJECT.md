# AKSARA. — Blueprint (baca dulu sebelum lanjut)

Dibuat supaya kita satu visi sebelum bangun keseluruhannya.
Ini bukan spesifikasi final — coret/ubah sesuka hati.

---

## 1. Apa itu AKSARA.

AKSARA. adalah platform digital sekolah yang **berdiri beriringan** dengan
KATAKAN. (kotak aspirasi OSIS), tapi punya identitas sendiri: **mading umum,
profil siswa, dan surat-menyurat antar siswa (bernama/anonim)**.

- KATAKAN. = kotak aspirasi (sudah ada, jangan disentuh).
- AKSARA. = mading digital + surat-menyurat antar siswa.

Nama: dari kata Sanskerta "aksara" (huruf/tulisan). Sejajar dengan KATAKAN.
Vibe: koran pelajar — kertas krem `#F2ECDE`, tinta `#221D15`, aksen merah
`#C03B21`, font `Fraunces / Spectral / IBM Plex Mono`, tulisan tangan
`Caveat / Kalam / Gochi Hand`.

## 2. Status sekarang

- Prototype **UI murni** HTML/CSS/JS, belum backend.
- Data dummy di `localStorage` per browser (belum Firebase).
- Halaman yang sudah jadi (semua di subfolder `aksara/`):
  - `index.html` — papan mading interaktif (koran masthead + kanvas 1400×1400)
  - `contoh.html` — versi papan terisi (demo)
  - `papan.html` — kanvas standalone (lama, tersisih)
  - `profil.html` — kartu pelajar + galeri karya
  - `kirim.html` — meja pos (surat, toggle anonim)
  - `publik.html` — home publik (belum login)
  - `masuk.html` — pintu masuk (nama + kelas)
  - `home-a/b/c/d.html` — 4 konsep home percobaan
- Live: https://zanqy.github.io/kotak-aspirasi-osis/aksara/...

## 3. Papan mading (fitur inti, sudah matang)

- Kanvas 1400×1400, pan & zoom, tempel/gestur, kertas berserak.
- Jenis tempelan: note, kliping, foto, tiket, pita, perangko, amplop, tag,
  struk, tulis, umbul, lampu, lampion, layang, kipas, rantai.
- Tiap tempelan bisa: bentuk, rasio, warna kertas, model kertas, font, tinta,
  stempel, stiker, selotip, bingkai, highlight, pin, bayangan, align, rotasi,
  skala, cermin, edit isi & gaya, undo hapus, duplikat.
- Data: `aksara_papan_v1` (array item; foto via `img:` ref ke `aksara_img_v1`).
- Tombol kosongkan papan pakai modal konfirmasi (bukan 2-tap), supaya tidak
  kepencet.

## 4. Rencana mading ke depan (MULTI-PAPAN)

Ini yang belum dibangun, tapi sudah disepakati arahnya:

- **Mading Umum** — publik, semua siswa bisa lihat & nempel.
- **Mading Kelas** — per kelas, hanya anggota kelas itu.
- **Mading Pribadi** — milik satu siswa (mading "kamarku").

Struktur data yang disiapkan:

- `aksara_papan_umum_v1` (ganti dari `aksara_papan_v1` lama, fallback tetap)
- `aksara_papan_kelas_<kelas>_v1`
- `aksara_papan_pribadi_<uid>_v1`

Home publik = kolase lintas mading (tempelan terbaru dari semua papan, tiap
keping diberi label asal: UMUM/KELAS/PRIBADI).

## 5. Dua home (publik vs member)

- **Home publik** (belum login) = `publik.html` — etalase, intip mading umum,
  ajakan masuk. Tidak bisa nempel/kirim.
- **Home member** (udah login) = belum dibuat. Isinya: sapaan nama, pintasan
  ke tiga mading, info surat masuk, tempelan terbaruku.
- Login = simulasi (nama + kelas, disimpan di HP). Backend nanti.

## 6. Profil

- Kartu pelajar landscape (foto, nama, kelas, badge peran, bio, pita AKSARA).
- Galeri karya: filter per jenis, kartu pratinjau, lembar detail.
- Data: `aksara_profil_v1`.

## 7. Kirim Surat

- Tidak ada kategori — surat ya surat, bebas mau isinya apa.
- Toggle anonim (nama disembunyikan jika dicentang).
- Meja pos: cap AKSARA POST, tulis langsung di kertas bergaris, animasi amplop
  terbang, kartu "Surat meluncur!" + resi.
- Surat **tidak** ditempel ke papan — hanya tercatat di `aksara_kiriman_v1`
  (isi + penerima + pengirim + waktu).
- Nanti: diteruskan ke penerima beneran (butuh backend).

## 8. Urutan bangun selanjutnya (usulan)

1. **Home member** — sapaan + pintasan 3 mading + info surat.
2. **Migrasi data papan** — papan sekarang jadi Mading Umum resmi.
3. **Mading Kelas** — buat + join kelas.
4. **Mading Pribadi** — mading "kamarku".
5. **Login beneran** (Firebase auth NIS) — ganti simulasi.
6. **Moderasi** — hapus/laporkan tempelan & surat.
7. **Backend** — Firebase, storage foto, sinkron antar device.

## 9. Aturan yang sudah dikunci

- Prototype vanilla HTML/CSS/JS + localStorage, belum backend.
- Push ke `zanqy/kotak-aspirasi-osis`, subfolder `aksara/`, link GitHub Pages.
- `index.html` papan = user-LOCKED (jangan diubah tanpa izin).
- Jangan buka/salin/commit file Firebase Admin SDK di `~/Downloads/`.
- Link live pakai cache-buster `?v=N`.

## 10. Yang masih jadi tanda tanya (butuh keputusanmu)

- Nama fitur surat-menyurat tetap "Kirim Surat" atau ganti?
- Mading Pribadi boleh dilihat orang lain kalau diizinkan, atau selalu privat?
- Moderasi: siapa yang jadi moderator (OSIS? guru?).
- Apakah Kirim Surat nanti jadi "amplop nyata" yang bisa dibuka penerima,
  atau tetap cuma log?
- Home publik: kolase lintas mading, atau cuma Mading Umum?

---

Kalau ada bagian yang nggak sesuai visimu, coret di sini sebelum kita lanjut.
Urutannya juga bisa diacak — tinggal bilang mulai dari mana.
