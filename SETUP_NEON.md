# 🚀 Setup Neon Database untuk Vercel

## Kenapa Neon?

✅ **Serverless Postgres** - Perfect untuk Vercel  
✅ **Gratis Tier** - Cukup untuk development dan testing  
✅ **Auto-scaling** - Scales otomatis dengan traffic  
✅ **Easy Setup** - Hanya beberapa klik  
✅ **Kompatibel** - Works dengan adapter yang sudah ada

## 📋 Langkah Setup

### 1. Install Neon Package
```bash
npm install @neondatabase/serverless
```

### 2. Setup Database di Neon

1. Buka [Neon Dashboard](https://neon.tech)
2. Sign up / Login (bisa dengan GitHub)
3. Klik **Create Project**
4. Isi:
   - Project name: `accounting-system` (atau nama lain)
   - Database name: `accounting` (default)
   - Region: Pilih yang terdekat (Singapore untuk Indonesia)
5. Klik **Create Project**

### 3. Dapatkan Connection String

Setelah project dibuat:
1. Klik project Anda
2. Di halaman dashboard, cari **Connection String**
3. Copy connection string yang dimulai dengan `postgresql://...`
4. Pilih **Pooled connection** (bukan direct)

### 4. Tambahkan Environment Variables di Vercel

1. Buka **Vercel Dashboard** → Project Anda
2. Pergi ke **Settings** → **Environment Variables**
3. Tambahkan variable baru:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste connection string dari Neon
   - **Environment**: Production, Preview, Development (semua)
4. Klik **Save**

### 5. Install Package (Local)

```bash
npm install @neondatabase/serverless
```

### 6. Deploy ke Vercel

```bash
git add .
git commit -m "Add Neon database support"
git push
```

## ✅ Verify

Setelah deploy, test aplikasi:
- Tambah akun COA → harus muncul
- Refresh → data harus tetap ada
- Semua fitur harus bekerja normal

## 💰 Pricing

**Free Tier:**
- ✅ 0.5 GB storage
- ✅ Unlimited projects
- ✅ Serverless (pay per use)
- ✅ Auto-suspend after 5 minutes inactivity
- ✅ Auto-resume (fast)

Cukup untuk development dan testing! 

Untuk production dengan traffic tinggi, bisa upgrade ke paid plan.

---

**Status**: Ready untuk setup! 🎉

