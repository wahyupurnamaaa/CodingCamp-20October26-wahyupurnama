# Kebutuhan Life Dashboard

Sumber: Brief_CCSE_Life Dashboard.docx. Seluruh butir di bawah merupakan
rencana dan kriteria penerimaan, bukan pernyataan fitur sudah selesai.

Fitur wajib dan pilihan tantangan berasal dari brief. Detail seperti batas jam
sapaan, bahasa antarmuka, tambah/hapus tautan, persistensi preferensi, lebar
layar minimum, dan perilaku timer di bawah adalah keputusan desain proyek
untuk memperjelas implementasi, bukan ketentuan eksplisit penyelenggara.

## 1. Sapaan, waktu, dan tanggal

- Halaman menampilkan jam dan tanggal sesuai waktu lokal perangkat.
- Jam diperbarui otomatis tanpa memuat ulang halaman.
- Sapaan mengikuti waktu: pagi pukul 05.00–10.59, siang 11.00–14.59,
  sore 15.00–17.59, dan malam 18.00–04.59.
- Batas waktu sapaan tersebut adalah keputusan desain untuk proyek ini.

## 2. Timer fokus

- Nilai awal adalah 25:00.
- Tombol Mulai menjalankan hitung mundur dan tidak membuat timer ganda
  ketika ditekan berulang kali.
- Tombol Berhenti menjeda waktu; Mulai melanjutkan sisa waktu.
- Tombol Reset menghentikan timer dan mengembalikan nilai ke 25:00.
- Pada 00:00 timer berhenti, tidak menjadi negatif, dan menampilkan status selesai.
- Setelah sesi selesai, tombol Mulai dinonaktifkan sampai pengguna menekan
  Reset. Reset mengembalikan 25:00 dan mengaktifkan Mulai tanpa menjalankan
  timer otomatis. Ini adalah keputusan desain proyek.

## 3. Daftar tugas

- Pengguna dapat menambah, mengedit, menandai selesai/belum selesai,
  dan menghapus tugas.
- Nama tugas kosong atau hanya spasi ditolak dengan pesan yang jelas.
- Setiap perubahan disimpan ke Local Storage dan dipulihkan setelah reload.
- Daftar kosong menampilkan pesan yang membantu pengguna memulai.

## 4. Tautan favorit

- Pengguna dapat menambahkan nama dan URL tautan favorit serta menghapusnya.
- Tautan ditampilkan sebagai kontrol yang membuka website tujuan.
- Nama kosong dan URL selain HTTP/HTTPS ditolak.
- Data tautan disimpan di Local Storage dan dipulihkan setelah reload.
- Jika membuka tab baru, tautan menggunakan `rel="noopener noreferrer"`.

## 5. Tiga tantangan pilihan

### Tema terang/gelap

- Pengguna dapat beralih tema dan pilihannya bertahan setelah reload.
- Teks, tombol, dan indikator fokus tetap terbaca pada kedua tema.

### Nama sapaan kustom

- Pengguna dapat menyimpan nama yang digunakan dalam sapaan.
- Nama dipangkas dari spasi di awal/akhir dan disimpan di Local Storage.
- Nama kosong menghasilkan sapaan umum.

### Pencegahan tugas duplikat

- Penambahan dan pengeditan menolak nama tugas yang sudah ada setelah
  normalisasi spasi dan huruf kecil.
- Pemeriksaan mencakup tugas aktif maupun selesai; saat mengedit, tugas
  itu sendiri dikecualikan dari perbandingan.
- Penolakan menampilkan pesan tanpa mengubah tugas yang sudah tersimpan.

## 6. Kualitas dan pengumpulan

- Gunakan HTML, satu berkas CSS di `css/`, dan satu berkas JavaScript di `js/`.
- Tidak menggunakan framework, backend, atau penyimpanan server.
- Halaman responsif pada perangkat seluler dan desktop, tanpa scroll
  horizontal pada lebar 320 piksel.
- Interaksi berjalan lancar dan tidak membutuhkan setup kompleks.
- Setup pengujian otomatis tidak diwajibkan; lakukan pemeriksaan manual.
- Source code termasuk folder `.kiro` tersedia di GitHub, dan website
  dipublikasikan melalui GitHub Pages.
- Pengumpulan Paperform mencakup AWS Builder ID, URL repository, dan URL website.

