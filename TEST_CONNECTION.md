# Test Connection Neon - Step by Step

## Connection String: ✅ BENAR!
Kedua connection string (Neon & Vercel) sudah **SAMA**. Connection sudah benar!

## Test untuk Memastikan Data Tersimpan

### Langkah 1: Tambah Data Baru
1. Buka website aplikasi Anda di Vercel
2. Buka halaman **Chart of Accounts**
3. Klik **"+ Tambah Akun"**
4. Isi:
   - **Kode**: `1-999` (atau kode yang belum ada)
   - **Nama**: `Test Connection Account`
   - **Jenis**: `Aktiva`
5. Klik **"Simpan"**

### Langkah 2: Cek Vercel Logs
1. Buka **Vercel Dashboard** → Project Anda
2. Klik **"Deployments"** → Pilih deployment terbaru
3. Klik **"Logs"** atau **"Function Logs"**
4. Cari log:
   ```
   [addAccount] Inserting account: 1-999, Test Connection Account, asset
   [addAccount] Insert result: { lastInsertRowid: ..., changes: 1 }
   [addAccount] Verified account exists: YES
   ```
5. Jika ada log `Verified account exists: YES` → **Data berhasil disimpan!**

### Langkah 3: Cek di Neon Console
1. Buka **Neon Dashboard** → Project Anda
2. **Pastikan melihat branch `main`**:
   - Lihat di sidebar kiri atau dropdown di atas
   - Default adalah `main`
   - Jika tidak `main`, klik dan pilih `main`
3. Klik **"Database Studio"** atau icon database di sidebar
4. Klik tabel **`chart_of_accounts`**
5. **REFRESH** halaman atau klik icon refresh:
   - Tekan `F5` atau
   - Klik icon refresh di browser atau
   - Klik tombol refresh di Neon console
6. Cek apakah data muncul:
   - Harus ada baris dengan `code = 1-999`
   - `name = Test Connection Account`

### Jika Data Muncul: ✅ SUCCESS!
- Connection string benar
- Data tersimpan dengan benar
- Semuanya bekerja!

### Jika Data TIDAK Muncul:

#### Kemungkinan 1: Branch Berbeda
**Solusi:**
1. Di Neon Dashboard, coba pilih branch lain (jika ada)
2. Cek apakah data muncul di branch lain
3. Jika muncul di branch lain:
   - Update connection string di Vercel untuk menggunakan branch tersebut, ATAU
   - Gunakan branch `main` dan pastikan connection string menggunakan `main`

#### Kemungkinan 2: Console Cache
**Solusi:**
1. **Hard refresh** browser: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
2. Tunggu beberapa detik
3. Refresh lagi

#### Kemungkinan 3: Data Belum Ter-commit
**Solusi:**
1. Cek Vercel logs - pastikan `Verified account exists: YES`
2. Jika `NO`, berarti insert gagal - cek error di logs
3. Coba tambah akun lagi dengan kode berbeda

## Checklist Verifikasi

- [ ] Connection string di Neon = Connection string di Vercel ✅ (sudah benar!)
- [ ] Menambah akun baru di aplikasi
- [ ] Vercel logs menunjukkan `Verified account exists: YES`
- [ ] Neon console melihat branch `main`
- [ ] Refresh Neon console
- [ ] Data muncul di tabel `chart_of_accounts`

Jika semua checklist ✅, berarti connection sudah benar dan berfungsi!

