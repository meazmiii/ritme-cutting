# Ritme — Teman cutting kamu

Ritme adalah prototipe aplikasi diet cutting yang berdiri sendiri, terpisah dari PortoSite maupun aplikasi olahraga. Fokusnya adalah kebiasaan makan, katalog makanan Indonesia, target harian pilihan pengguna, tren berat badan, dan check-in mingguan.

## Coba Ritme

Buka aplikasi di [meazmiii.github.io/ritme-cutting](https://meazmiii.github.io/ritme-cutting/). Di Android, buka lewat Chrome lalu pilih **Install app** atau **Tambahkan ke layar utama** dari menu browser. Di iPhone, buka lewat Safari, tekan **Bagikan**, lalu **Add to Home Screen**.

## Menjalankan

Buka `index.html` di browser modern untuk mencoba secara lokal. Untuk memasang ke home screen dan menggunakan cache offline, buka alamat GitHub Pages dengan HTTPS di browser HP lalu pilih **Install app** atau **Add to Home Screen**.

## Fitur prototipe

- Profil sederhana dengan nama panggilan dan target kalori/protein yang dapat diubah.
- Jurnal cepat dengan checklist makanan umum Indonesia, jumlah porsi yang bisa ditambah/dikurangi, dan estimasi kalori/protein otomatis.
- Satu tombol untuk mencatat beberapa pilihan makanan sekaligus; makanan yang tidak ada bisa ditambahkan lewat mode manual.
- Catatan berat dan grafik tren dari maksimal tujuh entri terakhir.
- Check-in mingguan energi dan rasa lapar, dengan catatan opsional.
- Data tersimpan di penyimpanan lokal browser (`localStorage`).
- Bisa dipasang sebagai PWA dan app shell tersedia offline setelah kunjungan pertama.
- Tata letak responsif untuk desktop dan ponsel.

Setiap push ke branch `main` menerbitkan situs ke GitHub Pages lewat GitHub Actions. Data profil dan jurnal disimpan hanya di browser yang digunakan dan belum disinkronkan ke akun atau server. Nilai gizi katalog adalah perkiraan; ukuran porsi dan cara memasak bisa mengubah hasilnya. Target bawaan hanya contoh, bukan rekomendasi medis.
