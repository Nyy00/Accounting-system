# ⚡ Quick Setup Neon - 5 Menit

## Langkah Cepat

### 1️⃣ Install Package
```bash
npm install @neondatabase/serverless
```

### 2️⃣ Buat Database di Neon
1. Buka: https://neon.tech
2. Sign up dengan GitHub (lebih cepat)
3. Klik **Create Project**
4. Isi:
   - **Name**: `accounting-system`
   - **Region**: `Southeast Asia (Singapore)` ← Pilih ini untuk Indonesia
5. Klik **Create Project**

### 3️⃣ Copy Connection String
Setelah project dibuat:
1. Di dashboard, cari **Connection String**
2. Pilih tab **Pooled connection** (bukan Direct)
3. Klik **Copy** (string yang dimulai dengan `postgresql://...`)

**Contoh format:**
```
postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
```

### 4️⃣ Tambahkan di Vercel
1. Buka **Vercel Dashboard** → Project Anda
2. **Settings** → **Environment Variables**
3. Klik **Add New**
4. Isi:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste connection string dari Neon
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. **Save**

### 5️⃣ Deploy
```bash
git add .
git commit -m "Setup Neon database"
git push
```

### 6️⃣ Verify
Setelah deploy selesai:
1. Buka website yang sudah di-deploy
2. Cek logs di Vercel → harus ada: `✅ Using Neon Serverless Postgres`
3. Test:
   - Tambah akun COA → harus langsung muncul ✅
   - Refresh halaman → data harus tetap ada ✅

## 🎉 Selesai!

Database Neon sudah aktif dan data akan tersimpan permanen!

---

**Troubleshooting:**
- Error "Module not found"? → Pastikan `npm install @neondatabase/serverless` sudah dijalankan
- Database tidak terhubung? → Cek `DATABASE_URL` di Vercel Environment Variables
- Schema tidak terbuat? → Akan dibuat otomatis saat pertama kali API dipanggil

