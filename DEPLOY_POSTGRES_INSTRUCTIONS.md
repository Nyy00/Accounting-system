# 🚀 Instruksi Deploy dengan Vercel Postgres

## ✅ Yang Sudah Disiapkan

1. ✅ Postgres adapter sudah dibuat
2. ✅ Database schema sudah siap
3. ✅ Package `@vercel/postgres` sudah ditambahkan
4. ✅ Route handlers sudah diupdate untuk async

## 📋 Langkah-langkah Deployment

### 1. Install Dependencies Lokal
```bash
npm install @vercel/postgres
```

### 2. Setup Vercel Postgres Database

1. Buka **Vercel Dashboard** → Project Anda
2. Pergi ke tab **Storage**
3. Klik **Create Database**
4. Pilih **Postgres**
5. Pilih plan (Free tier cukup)
6. Klik **Create**

**Environment variables akan otomatis ditambahkan:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 3. Commit dan Push

```bash
git add .
git commit -m "Add Vercel Postgres support"
git push
```

### 4. Verify Deployment

Setelah deploy, cek logs di Vercel:
- Harus ada: `✅ Using Vercel Postgres`
- Harus ada: `✅ Vercel Postgres initialized`

### 5. Test Aplikasi

1. Buka website yang sudah di-deploy
2. Tambah akun COA → harus langsung muncul
3. Refresh halaman → data harus tetap ada ✅

## 🔧 Jika Ada Masalah

### Error "Module not found: @vercel/postgres"
```bash
# Install di root directory
npm install @vercel/postgres
git add package.json package-lock.json
git commit -m "Add postgres package"
git push
```

### Database tidak terhubung
1. Cek Environment Variables di Vercel Dashboard
2. Pastikan semua 3 variables ada:
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL  
   - POSTGRES_URL_NON_POOLING
3. Redeploy

### Schema tidak terbuat
- Schema akan dibuat otomatis saat pertama kali API dipanggil
- Tidak perlu setup manual

## ✅ Setelah Setup

**Keuntungan:**
- ✅ Data persisten (tidak hilang setelah cold start)
- ✅ Real-time sync bekerja sempurna
- ✅ Bisa diakses dari mana saja
- ✅ Auto-scaling

**Development Lokal:**
- Tetap menggunakan SQLite file-based
- Tidak perlu setup Postgres lokal

---

**Status**: Ready untuk deploy! 🎉

