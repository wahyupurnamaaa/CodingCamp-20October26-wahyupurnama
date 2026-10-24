# Rencana Desain Life Dashboard

Status: rancangan awal; belum ada implementasi aplikasi.

Detail implementasi dalam dokumen ini merupakan keputusan desain proyek.
Ketentuan tugas dan pilihan tantangan dijabarkan di `requirements.md`.

## Struktur berkas

```text
index.html
css/
  style.css
js/
  script.js
.kiro/
  steering/
    project.md
  specs/
    life-dashboard/
      requirements.md
      design.md
      tasks.md
```

Gunakan path aset relatif agar website dapat berjalan di subpath GitHub Pages.
Muat `js/script.js` menggunakan `defer`.

## Susunan antarmuka

Header menampilkan sapaan, nama pengguna, tanggal, jam, dan kontrol tema.
Area utama berisi kartu daftar tugas, timer fokus, dan tautan favorit.
Gunakan CSS Grid untuk desktop dan satu kolom pada layar kecil. Semua styling
tetap berada dalam satu berkas CSS; warna tema memakai CSS custom properties.

## Model penyimpanan

Gunakan key `lifeDashboard.v1` berisi JSON:

```json
{
  "tasks": [
    { "id": "task-unique-id", "text": "Contoh tugas", "completed": false }
  ],
  "links": [
    { "id": "link-unique-id", "label": "GitHub", "url": "https://github.com/" }
  ],
  "preferences": { "name": "", "theme": "light" }
}
```

Array awal kosong; data pada contoh hanya ilustrasi. ID harus stabil dan unik.
Validasi bentuk dan tipe data saat membaca penyimpanan. Gunakan `try/catch`
untuk pembacaan, parsing, dan penulisan. Jika penyimpanan gagal, pertahankan
interaksi di memori dan beri tahu pengguna bahwa perubahan belum tersimpan.
Jangan menampilkan klaim tersimpan ketika penulisan gagal.

## Alur aplikasi

1. Baca dan validasi data; gunakan nilai awal untuk bagian yang tidak valid.
2. Terapkan tema, render sapaan, tugas, dan tautan.
3. Pasang event listener untuk formulir dan tombol.
4. Pada perubahan data, validasi input, ubah state, simpan, lalu render area terkait.
5. Perbarui jam serta sapaan secara berkala.

Normalisasi nama tugas dengan `trim()`, penggabungan spasi berulang menjadi
satu spasi, dan `toLowerCase()` untuk perbandingan duplikat.

## Timer

Simpan state timer di memori: `remainingSeconds`, `isRunning`, dan `endTime`.
Saat mulai, hitung waktu berakhir dari `Date.now()` ditambah sisa durasi.
Perbarui tampilan dengan selisih waktu aktual untuk mengurangi pergeseran
akibat throttling tab latar belakang. Saat tombol Berhenti ditekan, hitung
ulang sisa waktu dari `endTime`, simpan di memori, ubah `isRunning` menjadi
`false`, lalu batalkan interval. Sisa detik dihitung dengan
`Math.max(0, Math.ceil((endTime - Date.now()) / 1000))`.

Saat waktu mencapai nol, batalkan interval, ubah `isRunning` menjadi `false`,
tampilkan status selesai, dan nonaktifkan Mulai sampai Reset ditekan.
Reset membatalkan interval, mengosongkan `endTime`, mengubah `isRunning`
menjadi `false`, mengembalikan 1.500 detik, membersihkan status selesai,
dan mengaktifkan Mulai tanpa menjalankan timer otomatis. Saat timer sedang
berjalan, abaikan permintaan Mulai tambahan. Pastikan hanya satu interval
aktif. Reload halaman mengembalikan timer ke 25 menit; penyimpanan
timer lintas reload tidak termasuk kebutuhan brief.

## Keamanan dan aksesibilitas

Render masukan sebagai teks. Validasi URL dengan `new URL()` dan izinkan hanya
`http:` atau `https:`. Gunakan label formulir, tombol semantik, indikator fokus,
dan pesan status yang dapat dibaca pembaca layar. Jangan membuat jam yang
berubah setiap detik menjadi pengumuman `aria-live`.

