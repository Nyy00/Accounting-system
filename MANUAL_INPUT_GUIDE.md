# Panduan Input Manual Sistem Akuntansi

## Fitur Baru: Input Manual Transaksi dan Jurnal Penyesuaian

Sekarang Anda dapat menginput transaksi manual untuk mengerjakan tugas-tugas akuntansi!

## Cara Menggunakan

### 1. Jurnal Umum (S1)

1. Buka halaman **S1 - Jurnal Umum**
2. Klik tombol **"+ Tambah Transaksi"**
3. Isi form:
   - **Tanggal**: Pilih tanggal transaksi
   - **Keterangan**: Deskripsi transaksi
   - **Akun**: Pilih akun dari dropdown
   - **Debit/Kredit**: Isi salah satu (Debit ATAU Kredit)
4. Klik **"+ Tambah Akun"** jika transaksi melibatkan lebih dari 2 akun
5. Pastikan **Total Debit = Total Kredit** (muncul di bawah form)
6. Klik **"Simpan"**

**Catatan:**
- Minimal 2 akun dalam setiap transaksi
- Debit dan Kredit harus seimbang
- Sistem akan memvalidasi secara otomatis

### 2. Mengedit Transaksi

1. Klik tombol **"Edit"** pada transaksi yang ingin diedit
2. Ubah data yang diperlukan
3. Klik **"Simpan"**

### 3. Menghapus Transaksi

1. Klik tombol **"Hapus"** pada transaksi yang ingin dihapus
2. Konfirmasi penghapusan

### 4. Jurnal Penyesuaian (S4)

1. Buka halaman **S4 - Neraca Saldo Setelah Penyesuaian**
2. Klik **"Kelola Jurnal Penyesuaian"**
3. Klik **"+ Tambah Jurnal Penyesuaian"**
4. Isi form sama seperti Jurnal Umum
5. Klik **"Simpan"**

### 5. Lihat Laporan Otomatis

Setelah input transaksi, semua laporan akan **terupdate otomatis**:
- S1: Jurnal Umum
- S2: Buku Besar (General Ledger)
- S3: Neraca Saldo
- S4: Neraca Saldo Setelah Penyesuaian
- S5: Laporan Laba Rugi
- S6: Laporan Posisi Keuangan
- S7: Laporan Perubahan Ekuitas

## Alur Kerja Rekomendasi

1. **Input Jurnal Umum** (S1)
   - Masukkan semua transaksi bulanan
   - Contoh: setoran modal, pembelian, pendapatan, dll

2. **Periksa Buku Besar** (S2)
   - Review posting ke masing-masing akun

3. **Periksa Neraca Saldo** (S3)
   - Pastikan Debit = Kredit

4. **Input Jurnal Penyesuaian** (S4)
   - Masukkan adjusting entries
   - Contoh: akrual, depresiasi, dll

5. **Lihat Neraca Saldo Setelah Penyesuaian** (S4)
   - Pastikan masih seimbang

6. **Generate Laporan Keuangan** (S5, S6, S7)

## Tips

✅ **DO:**
- Selalu pastikan Debit = Kredit sebelum menyimpan
- Gunakan deskripsi yang jelas untuk keterangan
- Periksa ulang angka sebelum menyimpan

❌ **DON'T:**
- Jangan input angka yang tidak seimbang
- Jangan hapus transaksi tanpa pertimbangan (akan mempengaruhi semua laporan)
- Jangan skip validasi sistem

## Contoh Transaksi

### Transaksi 1: Setoran Modal
- **Tanggal**: 01/01/2024
- **Keterangan**: Setoran modal awal oleh Bapak Amin dan Fawzi
- **Akun**:
  - Bank (Debit): Rp 100.000.000
  - Modal Amin (Kredit): Rp 60.000.000
  - Modal Fawzi (Kredit): Rp 40.000.000

### Transaksi 2: Pembayaran Sewa
- **Tanggal**: 01/01/2024
- **Keterangan**: Membayar sewa kantor untuk 1 tahun
- **Akun**:
  - Sewa dibayar dimuka (Debit): Rp 24.000.000
  - Bank (Kredit): Rp 24.000.000

## Troubleshooting

**Error: "Transaksi tidak seimbang"**
- Periksa jumlah debit dan kredit
- Pastikan tidak ada angka yang salah ketik
- Kalkulator otomatis akan membantu menunjukkan selisih

**Error: "Minimal harus ada 2 akun"**
- Klik "+ Tambah Akun" untuk menambah akun

**Laporan tidak update?**
- Refresh halaman
- Pastikan server berjalan dengan baik
- Periksa console browser untuk error

## Teknis

### API Endpoints

**Transactions:**
- `GET /api/accounting/transactions` - Ambil semua transaksi
- `POST /api/accounting/transactions` - Tambah transaksi baru
- `PUT /api/accounting/transactions/:id` - Update transaksi
- `DELETE /api/accounting/transactions/:id` - Hapus transaksi

**Adjusting Entries:**
- `GET /api/accounting/adjusting-entries` - Ambil semua adjusting entries
- `POST /api/accounting/adjusting-entries` - Tambah adjusting entry baru
- `PUT /api/accounting/adjusting-entries/:id` - Update adjusting entry
- `DELETE /api/accounting/adjusting-entries/:id` - Hapus adjusting entry

### Validasi

Sistem memvalidasi:
1. Tiap transaksi harus punya minimal 2 akun
2. Debit harus sama dengan Kredit
3. Semua field wajib diisi

### Storage

Saat ini menggunakan **in-memory storage** (data tersimpan di RAM server).
- Data akan hilang saat server restart
- Untuk produksi, pertimbangkan database (PostgreSQL, MySQL, dll)

---

**Selamat menggunakan!** 🎉

Jika ada pertanyaan, silakan lihat README.md atau buka issue di repository.

