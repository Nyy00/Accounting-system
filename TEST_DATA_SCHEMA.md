# Skema Data Testing untuk Accounting System

File ini berisi skema dan contoh data untuk testing sistem akuntansi.

## 1. Chart of Accounts (COA)

### Aktiva (Assets) - Kode 1-xxx

| Kode | Nama Akun | Kontra |
|------|-----------|--------|
| 1-100 | Kas | - |
| 1-101 | Kas Kecil | - |
| 1-102 | Bank | - |
| 1-200 | Piutang Usaha | - |
| 1-201 | Piutang Lain-lain | - |
| 1-210 | Cadangan Kerugian Piutang | Ya |
| 1-300 | Persediaan Barang Dagang | - |
| 1-400 | Perlengkapan | - |
| 1-500 | Aset Tetap | - |
| 1-501 | Akumulasi Penyusutan | Ya |
| 1-600 | Kendaraan | - |
| 1-601 | Akumulasi Penyusutan Kendaraan | Ya |

### Kewajiban (Liabilities) - Kode 2-xxx

| Kode | Nama Akun | Kontra |
|------|-----------|--------|
| 2-100 | Utang Usaha | - |
| 2-101 | Utang Bank | - |
| 2-200 | Utang Gaji | - |
| 2-300 | Utang Pajak | - |
| 2-400 | Utang Lain-lain | - |

### Ekuitas (Equity) - Kode 3-xxx

| Kode | Nama Akun | Kontra |
|------|-----------|--------|
| 3-101 | Modal Amin | - |
| 3-102 | Modal Fawzi | - |
| 3-200 | Laba Ditahan | - |
| 3-300 | Prive Amin | - |
| 3-301 | Prive Fawzi | - |

### Pendapatan (Revenue) - Kode 4-xxx

| Kode | Nama Akun | Kontra |
|------|-----------|--------|
| 4-100 | Pendapatan Penjualan | - |
| 4-101 | Pendapatan Jasa | - |
| 4-200 | Pendapatan Lain-lain | - |

### Beban (Expenses) - Kode 5-xxx

| Kode | Nama Akun | Kontra |
|------|-----------|--------|
| 5-100 | Beban Gaji | - |
| 5-101 | Beban Listrik | - |
| 5-102 | Beban Air | - |
| 5-200 | Beban Sewa | - |
| 5-201 | Beban Iklan | - |
| 5-300 | Beban Penyusutan | - |
| 5-400 | Beban Lain-lain | - |

---

## 2. Contoh Transaksi (General Journal)

### Transaksi 1: Penerimaan Modal Awal
**Tanggal:** 1 Januari 2024  
**Keterangan:** Penerimaan modal awal dari Amin dan Fawzi

| Akun | Debit | Kredit |
|------|-------|--------|
| 1-100 (Kas) | 60.000.000 | |
| 1-102 (Bank) | 40.000.000 | |
| 3-101 (Modal Amin) | | 60.000.000 |
| 3-102 (Modal Fawzi) | | 40.000.000 |

**Total:** 100.000.000 = 100.000.000 ✓

---

### Transaksi 2: Pembelian Perlengkapan
**Tanggal:** 5 Januari 2024  
**Keterangan:** Pembelian perlengkapan kantor tunai

| Akun | Debit | Kredit |
|------|-------|--------|
| 1-400 (Perlengkapan) | 5.000.000 | |
| 1-100 (Kas) | | 5.000.000 |

**Total:** 5.000.000 = 5.000.000 ✓

---

### Transaksi 3: Pembelian Persediaan
**Tanggal:** 10 Januari 2024  
**Keterangan:** Pembelian persediaan barang dagang secara kredit

| Akun | Debit | Kredit |
|------|-------|--------|
| 1-300 (Persediaan Barang Dagang) | 20.000.000 | |
| 2-100 (Utang Usaha) | | 20.000.000 |

**Total:** 20.000.000 = 20.000.000 ✓

---

### Transaksi 4: Penjualan Tunai
**Tanggal:** 15 Januari 2024  
**Keterangan:** Penjualan barang dagang secara tunai

| Akun | Debit | Kredit |
|------|-------|--------|
| 1-100 (Kas) | 15.000.000 | |
| 4-100 (Pendapatan Penjualan) | | 15.000.000 |
| 5-400 (Beban Lain-lain) | 10.000.000 | |
| 1-300 (Persediaan Barang Dagang) | | 10.000.000 |

**Total:** 25.000.000 = 25.000.000 ✓

---

### Transaksi 5: Penjualan Kredit
**Tanggal:** 20 Januari 2024  
**Keterangan:** Penjualan barang dagang secara kredit

| Akun | Debit | Kredit |
|------|-------|--------|
| 1-200 (Piutang Usaha) | 12.000.000 | |
| 4-100 (Pendapatan Penjualan) | | 12.000.000 |
| 5-400 (Beban Lain-lain) | 8.000.000 | |
| 1-300 (Persediaan Barang Dagang) | | 8.000.000 |

**Total:** 20.000.000 = 20.000.000 ✓

---

### Transaksi 6: Pembayaran Gaji
**Tanggal:** 25 Januari 2024  
**Keterangan:** Pembayaran gaji karyawan

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-100 (Beban Gaji) | 8.000.000 | |
| 1-100 (Kas) | | 5.000.000 |
| 1-102 (Bank) | | 3.000.000 |

**Total:** 8.000.000 = 8.000.000 ✓

---

### Transaksi 7: Pembayaran Beban Operasional
**Tanggal:** 28 Januari 2024  
**Keterangan:** Pembayaran beban listrik dan air

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-101 (Beban Listrik) | 1.500.000 | |
| 5-102 (Beban Air) | 500.000 | |
| 1-102 (Bank) | | 2.000.000 |

**Total:** 2.000.000 = 2.000.000 ✓

---

## 3. Contoh Adjusting Entries (Jurnal Penyesuaian)

### Adjusting Entry 1: Perlengkapan Terpakai
**Tanggal:** 31 Januari 2024  
**Keterangan:** Penyesuaian perlengkapan yang terpakai

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-400 (Beban Lain-lain) | 2.000.000 | |
| 1-400 (Perlengkapan) | | 2.000.000 |

**Total:** 2.000.000 = 2.000.000 ✓

---

### Adjusting Entry 2: Penyusutan Aset Tetap
**Tanggal:** 31 Januari 2024  
**Keterangan:** Penyusutan aset tetap bulan Januari

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-300 (Beban Penyusutan) | 1.000.000 | |
| 1-501 (Akumulasi Penyusutan) | | 1.000.000 |

**Total:** 1.000.000 = 1.000.000 ✓

---

### Adjusting Entry 3: Penyusutan Kendaraan
**Tanggal:** 31 Januari 2024  
**Keterangan:** Penyusutan kendaraan bulan Januari

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-300 (Beban Penyusutan) | 2.000.000 | |
| 1-601 (Akumulasi Penyusutan Kendaraan) | | 2.000.000 |

**Total:** 2.000.000 = 2.000.000 ✓

---

### Adjusting Entry 4: Cadangan Kerugian Piutang
**Tanggal:** 31 Januari 2024  
**Keterangan:** Cadangan kerugian piutang 5% dari piutang usaha

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-400 (Beban Lain-lain) | 600.000 | |
| 1-210 (Cadangan Kerugian Piutang) | | 600.000 |

**Total:** 600.000 = 600.000 ✓

---

### Adjusting Entry 5: Beban Sewa Dibayar di Muka
**Tanggal:** 31 Januari 2024  
**Keterangan:** Penyesuaian beban sewa (jika ada pembayaran di muka)

| Akun | Debit | Kredit |
|------|-------|--------|
| 5-200 (Beban Sewa) | 3.000.000 | |
| 2-400 (Utang Lain-lain) | | 3.000.000 |

**Total:** 3.000.000 = 3.000.000 ✓

---

## 4. Ringkasan Data Testing

### Jumlah Akun per Kategori:
- **Aktiva:** 12 akun
- **Kewajiban:** 5 akun
- **Ekuitas:** 5 akun
- **Pendapatan:** 3 akun
- **Beban:** 7 akun
- **Total:** 32 akun

### Jumlah Transaksi:
- **Transaksi Regular:** 7 transaksi
- **Adjusting Entries:** 5 penyesuaian
- **Total:** 12 entri

---

## 5. Cara Menggunakan Data Testing Ini

### Langkah 1: Tambahkan Chart of Accounts
Tambahkan semua akun dari section 1 secara berurutan:
1. Mulai dengan Aktiva (1-100 sampai 1-601)
2. Lanjut Kewajiban (2-100 sampai 2-400)
3. Ekuitas (3-101 sampai 3-301)
4. Pendapatan (4-100 sampai 4-200)
5. Beban (5-100 sampai 5-400)

### Langkah 2: Tambahkan Transaksi
Tambahkan transaksi dari section 2 secara berurutan:
1. Transaksi 1: Penerimaan Modal
2. Transaksi 2: Pembelian Perlengkapan
3. Transaksi 3: Pembelian Persediaan
... dan seterusnya

### Langkah 3: Tambahkan Adjusting Entries
Setelah semua transaksi, tambahkan adjusting entries dari section 3:
1. Adjusting Entry 1: Perlengkapan Terpakai
2. Adjusting Entry 2: Penyusutan Aset Tetap
... dan seterusnya

### Langkah 4: Verifikasi Reports
Setelah semua data ditambahkan, cek:
1. **General Journal** - Semua transaksi terdaftar
2. **General Ledger** - Semua akun terlihat
3. **Trial Balance** - Debit = Credit
4. **Adjusted Trial Balance** - Setelah penyesuaian
5. **Income Statement** - Laba/Rugi
6. **Financial Position** - Neraca
7. **Changes in Equity** - Perubahan Ekuitas

---

## 6. Hasil yang Diharapkan

### Trial Balance (Setelah Adjusting Entries):
- **Total Debit:** Sesuai dengan semua entri
- **Total Credit:** Sama dengan Total Debit (seimbang)

### Income Statement:
- **Total Pendapatan:** 27.000.000 (dari penjualan)
- **Total Beban:** ~18.100.000 (gaji + operasional + penyesuaian)
- **Laba/Rugi:** ~8.900.000

### Financial Position:
- **Total Aktiva:** Total semua aktiva setelah penyesuaian
- **Total Kewajiban:** Total semua kewajiban
- **Total Ekuitas:** Modal awal + Laba/Rugi
- **Balance:** Aktiva = Kewajiban + Ekuitas

---

## 7. Catatan Penting

1. **Double Entry:** Pastikan setiap transaksi memiliki Debit = Credit
2. **Akun Kontra:** Gunakan checkbox "Akun Kontra" untuk akun seperti:
   - Akumulasi Penyusutan
   - Cadangan Kerugian Piutang
3. **Tanggal:** Gunakan tanggal yang konsisten (Januari 2024)
4. **Nilai:** Pastikan nilai dalam format yang benar (tanpa titik/koma untuk ribuan)

---

## 8. Data Testing Sederhana (Quick Test)

Jika ingin testing cepat dengan data minimal:

### Minimal COA:
- 1-100 (Kas)
- 1-102 (Bank)
- 3-101 (Modal Amin)
- 3-102 (Modal Fawzi)
- 4-100 (Pendapatan Penjualan)
- 5-100 (Beban Gaji)

### Minimal Transaksi:
1. Penerimaan Modal: Kas (100.000.000) → Modal (100.000.000)
2. Penjualan: Kas (50.000.000) → Pendapatan (50.000.000)
3. Beban: Beban Gaji (10.000.000) → Kas (10.000.000)

Ini cukup untuk testing basic functionality.

