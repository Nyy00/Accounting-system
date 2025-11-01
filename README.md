# Sistem Akuntansi CV ABC

Aplikasi web untuk membuat laporan akuntansi lengkap (S1-S7) berdasarkan data transaksi CV ABC bulan Januari 2024.

## Fitur

- **S1 - Jurnal Umum**: Pencatatan semua transaksi dalam bentuk jurnal
- **S2 - Buku Besar**: Buku besar untuk setiap akun dengan saldo berjalan
- **S3 - Neraca Saldo**: Daftar saldo sebelum penyesuaian
- **S4 - Neraca Saldo Setelah Penyesuaian**: Daftar saldo setelah jurnal penyesuaian
- **S5 - Laporan Laba Rugi**: Laporan pendapatan dan beban
- **S6 - Laporan Posisi Keuangan**: Neraca (Aktiva, Kewajiban, Ekuitas)
- **S7 - Laporan Perubahan Ekuitas**: Perubahan ekuitas selama periode

## Teknologi

- **Backend**: Node.js dengan Express
- **Frontend**: React
- **Styling**: CSS dengan desain modern dan responsif

## Instalasi

1. Install dependencies untuk backend dan frontend:
```bash
npm run install-all
```

Atau install secara terpisah:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

## Menjalankan Aplikasi

### Mode Development (Backend + Frontend bersamaan)
```bash
npm run dev
```

Atau jalankan secara terpisah:

### Backend Server
```bash
npm run server
```
Server akan berjalan di `http://localhost:5000`

### Frontend Client
```bash
npm run client
```
Aplikasi akan terbuka di `http://localhost:3000`

## Struktur Proyek

```
accounting/
├── server/
│   ├── index.js              # Entry point server
│   ├── routes/
│   │   └── accounting.js     # API routes untuk data akuntansi
│   └── services/
│       └── accountingService.js  # Business logic dan perhitungan
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js     # Header dengan logo CV ABC
│   │   │   ├── Navigation.js # Navigasi antar laporan
│   │   │   └── reports/      # Komponen untuk setiap laporan
│   │   └── App.js            # Komponen utama
│   └── package.json
└── package.json
```

## Data Transaksi

Aplikasi ini sudah berisi data transaksi CV ABC untuk bulan Januari 2024:

1. Setoran modal awal (Amin: Rp60 juta, Fawzi: Rp40 juta)
2. Pembayaran sewa kantor 1 tahun (Rp24 juta)
3. Pembelian mobil (Rp200 juta, uang muka Rp40 juta, utang Rp160 juta)
4. Pembelian perlengkapan kantor (Rp10 juta)
5. Pengambilan kas kecil (Rp1 juta)
6. Pendapatan jasa konsultasi (Rp30 juta total)

Plus jurnal penyesuaian untuk:
- Gaji pegawai belum dicatat (Rp10 juta)
- Tagihan listrik, air, internet (Rp5 juta)
- Depresiasi kendaraan (Rp1,6 juta)
- Pemakaian perlengkapan (Rp2 juta)
- Beban sewa untuk Januari (Rp2 juta)

## Fitur Rumus

Semua laporan menggunakan perhitungan otomatis dengan rumus Excel-like:
- Total Debit = Total Kredit (Neraca Saldo)
- Laba/Rugi = Pendapatan - Beban
- Aktiva = Kewajiban + Ekuitas
- Ekuitas Akhir = Ekuitas Awal + Laba/Rugi

## Catatan

- Format mata uang menggunakan Rupiah (Rp)
- Semua angka ditampilkan dengan format Indonesia
- Tabel menggunakan styling mirip Excel dengan highlight untuk baris total
- Cell dengan rumus ditandai dengan background kuning

## Lisensi

ISC

