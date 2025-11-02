# Cara Mengecek Apakah Connection String Vercel Sesuai dengan Neon Database

## Langkah 1: Dapatkan Connection String dari Neon Dashboard

### Di Neon Dashboard:
1. Buka [Neon Dashboard](https://console.neon.tech)
2. Login dan pilih **Project** Anda
3. **Pastikan Anda melihat branch `main`** (atau branch yang ingin Anda gunakan)
   - Branch biasanya terlihat di sidebar kiri atau di bagian atas
   - Default adalah `main`
4. Klik **"Connection Details"** atau icon **"Connection"** (biasanya di sidebar atau tab)
5. Pilih tab **"Connection strings"**
6. Pilih **"Pooled connection"** (untuk serverless/Vercel)
   - Bukan "Direct connection"
7. **Copy connection string** yang muncul
   - Format: `postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

### Catat Informasi Penting:
- **Endpoint ID**: Bagian `ep-xxx-xxx-pooler` (contoh: `ep-holy-sunset-a1rvukkx-pooler`)
- **Region**: Bagian `region.aws` (contoh: `ap-southeast-1.aws`)
- **Database name**: Biasanya `neondb`
- **Branch**: Pastikan Anda melihat branch yang benar di console

---

## Langkah 2: Cek Connection String di Vercel

### Di Vercel Dashboard:
1. Buka [Vercel Dashboard](https://vercel.com)
2. Login dan pilih **Project** Anda
3. Klik **"Settings"** → **"Environment Variables"**
4. Cari variable **`DATABASE_URL`**
5. Klik **"Edit"** atau lihat nilainya
   - **Jangan copy langsung** jika ada karakter sensitif
   - Anda bisa melihat preview atau click untuk edit

### Catat Informasi Penting:
- **Endpoint ID**: Bagian `ep-xxx-xxx-pooler` di connection string
- **Region**: Bagian `region.aws` di connection string
- **Database name**: Bagian setelah `/` dan sebelum `?`

---

## Langkah 3: Bandingkan Connection String

### Informasi yang Harus Sama:
✅ **Endpoint ID** harus **PERSIS SAMA**
   - Neon: `ep-holy-sunset-a1rvukkx-pooler`
   - Vercel: `ep-holy-sunset-a1rvukkx-pooler`
   - ✅ **HARUS SAMA!**

✅ **Region** harus sama
   - Neon: `ap-southeast-1.aws`
   - Vercel: `ap-southeast-1.aws`
   - ✅ **HARUS SAMA!**

✅ **Database name** biasanya sama (biasanya `neondb`)

### Jika Berbeda:
❌ **Endpoint berbeda** = Connection ke database berbeda!
❌ **Region berbeda** = Connection ke region berbeda!

---

## Langkah 4: Verifikasi dari Log Vercel

Setelah deploy, cek **Vercel logs**:

1. Di Vercel Dashboard → Project Anda
2. Klik **"Deployments"**
3. Pilih deployment terbaru
4. Klik **"Logs"** atau **"Function Logs"**
5. Cari log yang dimulai dengan:
   ```
   🔗 Connecting to Neon database...
   🔌 Endpoint: ep-xxx-xxx-pooler
   🌍 Region: ap-southeast-1.aws
   💾 Database: neondb
   🔗 Connection Type: Pooled
   ```

### Bandingkan dengan Neon:
- **Endpoint** di log harus **SAMA** dengan di Neon Dashboard
- **Region** di log harus **SAMA** dengan di Neon Dashboard
- **Database** di log harus **SAMA** dengan di Neon Dashboard

---

## Langkah 5: Test dengan Menambah Data

### Test Sederhana:
1. **Tambahkan akun** di aplikasi website (misal: kode `1-100`, nama "Test Account")
2. **Cek Vercel logs** - harus ada:
   ```
   [addAccount] Inserting account: 1-100, Test Account, asset
   [addAccount] Verified account exists: YES
   ```
3. **Buka Neon Dashboard** → Pastikan melihat branch yang benar
4. **Refresh** halaman atau klik **"Refresh"** di console
5. **Buka tabel** `chart_of_accounts`
6. **Cek apakah data muncul**:
   - ✅ **Muncul** = Connection string benar!
   - ❌ **Tidak muncul** = Connection string salah atau branch berbeda!

---

## Langkah 6: Update Connection String (Jika Berbeda)

### Jika Endpoint Berbeda:

1. **Copy connection string** dari Neon Dashboard (pastikan branch `main`)
2. **Buka Vercel** → Settings → Environment Variables
3. **Edit** `DATABASE_URL`
4. **Paste** connection string baru dari Neon
5. **Save**
6. **Redeploy** aplikasi:
   - Push commit baru, ATAU
   - Klik **"Redeploy"** di Vercel Dashboard
7. **Test lagi** dengan menambah data
8. **Verifikasi** data muncul di Neon console

---

## Tips Penting

### ✅ DO:
- Pastikan menggunakan **Pooled connection** (bukan Direct)
- Pastikan branch di console sama dengan branch di connection string
- Test dengan menambah data dan verifikasi di console
- Refresh Neon console setelah menambah data

### ❌ DON'T:
- Jangan gunakan Direct connection untuk serverless
- Jangan lupa check branch yang benar
- Jangan copy connection string dari branch yang berbeda
- Jangan lupa redeploy setelah update environment variable

---

## Checklist Verifikasi

Gunakan checklist ini untuk memastikan semuanya benar:

- [ ] Connection string di Vercel menggunakan **Pooled connection**
- [ ] Endpoint ID di Vercel **SAMA** dengan di Neon Dashboard
- [ ] Region di Vercel **SAMA** dengan di Neon Dashboard
- [ ] Database name di Vercel **SAMA** dengan di Neon Dashboard
- [ ] Branch di Neon console **SAMA** dengan branch di connection string
- [ ] Data yang ditambah di aplikasi **MUNCUL** di Neon console
- [ ] Log Vercel menunjukkan endpoint yang benar

Jika semua checklist ✅, berarti connection string sudah benar!

---

## Troubleshooting

### Masalah: Data tidak muncul di console
**Solusi:**
1. Pastikan melihat branch yang benar di console
2. Pastikan connection string menggunakan endpoint yang sama
3. Refresh console atau tunggu beberapa detik
4. Cek Vercel logs untuk memastikan insert berhasil

### Masalah: Endpoint berbeda
**Solusi:**
1. Update `DATABASE_URL` di Vercel dengan connection string dari Neon
2. Pastikan menggunakan Pooled connection untuk branch yang benar
3. Redeploy aplikasi
4. Verifikasi lagi

### Masalah: Error "relation does not exist"
**Solusi:**
1. Pastikan schema initialization berhasil (cek logs)
2. Pastikan menggunakan database yang benar
3. Coba redeploy untuk memicu schema initialization lagi

