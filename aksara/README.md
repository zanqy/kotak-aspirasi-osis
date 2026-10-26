# AKSARA. — peta halaman

Papan mading siswa, berdiri beriringan dengan **KATAKAN.** (kotak aspirasi OSIS).
Semua masih UI murni (HTML/CSS/JS + localStorage), belum ada backend.

## Status

| Halaman | File | Status |
|---|---|---|
| Mading umum | `index.html` | **DIKUNCI** — jangan diubah tanpa izin |
| Mading berisi (demo) | `contoh.html` | contoh isi, untuk pembanding |
| Profil siswa | `profil.html` | belum dibuat |
| Kirim surat | `kirim.html` | belum dibuat |
| Baca surat | `surat.html` | belum dibuat |
| Moderasi | `moderasi.html` | belum dibuat |

## Aturan visual (jangan dilanggar)

- Kertas krem `#F2ECDE`, tinta `#221D15`, aksen merah `#C03B21`
- Font: `Fraunces` (judul), `Spectral` (isi), `IBM Plex Mono` (label), `Caveat` (tulisan tangan)
- Nada koran: masthead, edisi, dateline, folio, drop cap, iklan baris
- Mobile-first: 1 kolom di bawah 860px, tanpa scroll horizontal
- Grid pakai `minmax(0,1fr)` — jangan `1fr` polos, bikin kolom meledak karena teks `nowrap`

## Keadaan kosong

- Papan kosong: label `PAPAN` + satu kalimat + satu tombol. Tanpa kotak placeholder.
- Tombol melayang (FAB) disembunyikan saat kosong, muncul lagi kalau sudah ada kiriman.

## Data

- `localStorage` key: `aksara_kiriman_v1`
- Bentuk: `{ nama, kelas, tipe: "kiriman"|"kutipan"|"iklan", isi, at }`
- Rencana backend: Firebase — koleksi `students`, `profiles`, `letters`, `reports`; auth NIS
