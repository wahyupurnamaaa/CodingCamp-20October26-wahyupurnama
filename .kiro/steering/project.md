---
inclusion: always
---

# Panduan Life Dashboard

Dokumen ini disusun manual berdasarkan Brief_CCSE_Life Dashboard.docx untuk
memandu pengembangan. Dokumen ini bukan catatan sesi atau bukti penggunaan Kiro.

## Tujuan

Buat dashboard harian sederhana berisi sapaan, waktu dan tanggal, timer fokus,
daftar tugas, serta tautan favorit.

## Batasan pengembangan

- Gunakan HTML, CSS, dan JavaScript vanilla tanpa framework atau backend.
- Letakkan tepat satu berkas CSS di `css/style.css` dan satu berkas JavaScript
  di `js/script.js`. Gunakan `index.html` sebagai halaman utama.
- Simpan data hanya di browser menggunakan Local Storage.
- Gunakan antarmuka berbahasa Indonesia yang bersih, responsif, dan mudah dibaca.
  Bahasa Indonesia adalah pilihan desain proyek, bukan kewajiban dari brief.
- Pastikan aplikasi berjalan di Chrome, Firefox, Edge, dan Safari modern.
- Hindari dependensi dan langkah instalasi yang tidak diperlukan.
- Gunakan elemen HTML semantik, label input, fokus keyboard yang terlihat,
  serta tombol yang dapat diakses dengan keyboard.
- Tampilkan teks masukan pengguna menggunakan `textContent`, bukan `innerHTML`.
- Validasi tautan favorit agar hanya memakai protokol HTTP atau HTTPS.
- Tangani data Local Storage yang rusak atau tidak tersedia tanpa membuat
  aplikasi berhenti bekerja.

## Lingkup

Fitur wajib: sapaan sesuai waktu, jam dan tanggal, timer fokus awal 25 menit
dengan mulai/berhenti/reset, CRUD tugas beserta status selesai dan penyimpanan,
serta tautan favorit yang tersimpan.

Tiga tantangan yang dipilih: tema terang/gelap, nama sapaan kustom, dan
pencegahan tugas duplikat. Pilihan ini adalah rencana awal yang dapat diubah.

## Dokumentasi dan pengumpulan

- Ikuti kebutuhan di `.kiro/specs/life-dashboard/requirements.md`.
- Perbarui checklist hanya setelah pekerjaan benar-benar selesai dan diperiksa.
- Gunakan GitHub Desktop sesuai brief, push source code termasuk `.kiro`, lalu
  publikasikan menggunakan GitHub Pages.
- Ikuti format nama repository di brief dan gunakan tanggal awal batch,
  bukan tanggal selesai tugas. Format tertulis adalah
  `CodingCamp-[batch date (ddmmmyy)]-[participantname]`, sedangkan contoh
  memakai `CodingCamp- 24August26-yamaroni`. Keduanya tidak konsisten pada
  penulisan bulan dan spasi. Jangan menganggap salah satunya telah dikonfirmasi;
  periksa instruksi terbaru penyelenggara sebelum menentukan nama repository.
  Perbedaan ini tidak menghalangi implementasi aplikasi lokal.
- Kirim AWS Builder ID, URL repository, dan URL website melalui Paperform.
- Jangan simpan kredensial atau informasi akun pribadi di repository publik.

