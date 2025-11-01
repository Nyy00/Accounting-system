# Panduan Cepat Memulai

## Langkah 1: Install Dependencies

Jalankan perintah berikut di terminal (dari folder root `accounting`):

```bash
npm install
cd client
npm install
cd ..
```

Atau gunakan script yang sudah disediakan:
```bash
npm run install-all
```

## Langkah 2: Jalankan Aplikasi

Jalankan backend dan frontend bersamaan:
```bash
npm run dev
```

Ini akan:
- Menjalankan server backend di `http://localhost:5000`
- Menjalankan aplikasi React di `http://localhost:3000`

Aplikasi akan otomatis terbuka di browser.

## Langkah 3: Menggunakan Aplikasi

1. Aplikasi akan menampilkan **Header** dengan logo CV ABC dan judul laporan
2. Gunakan **Navigasi** di atas untuk berpindah antar laporan:
   - **S1** - Jurnal Umum
   - **S2** - Buku Besar  
   - **S3** - Neraca Saldo
   - **S4** - Neraca Saldo Setelah Penyesuaian
   - **S5** - Laporan Laba Rugi
   - **S6** - Laporan Posisi Keuangan
   - **S7** - Laporan Perubahan Ekuitas

## Fitur Rumus

Semua laporan menggunakan perhitungan otomatis:
- **Total** dihitung secara otomatis
- **Rumus** ditampilkan di bawah setiap laporan
- Cell dengan rumus ditandai dengan background kuning

## Data yang Sudah Tersedia

Aplikasi sudah berisi semua transaksi CV ABC untuk bulan Januari 2024:
- Setoran modal
- Pembelian aset
- Pendapatan jasa
- Jurnal penyesuaian lengkap

## Troubleshooting

Jika terjadi error:
1. Pastikan port 5000 dan 3000 tidak digunakan aplikasi lain
2. Pastikan Node.js terinstall (minimal versi 14)
3. Hapus `node_modules` dan install ulang:
   ```bash
   rm -rf node_modules client/node_modules
   npm run install-all
   ```

