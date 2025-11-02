# Setup Database untuk Vercel

Website Anda sudah di-deploy ke Vercel, tapi SQLite file-based tidak cocok untuk serverless environment. Berikut adalah solusi yang tersedia:

## ⚠️ Masalah Saat Ini

SQLite di Vercel memiliki masalah:
- Database di `/tmp` **tidak persisten** - akan hilang setelah cold start
- File system di Vercel **read-only** kecuali `/tmp`
- Data Anda akan hilang setiap kali ada deployment baru atau cold start

## ✅ Solusi yang Disarankan

### Opsi 1: Vercel Postgres (TERBAIK - Gratis untuk starter)

1. **Setup Vercel Postgres:**
   - Login ke [Vercel Dashboard](https://vercel.com/dashboard)
   - Pilih project Anda
   - Pergi ke tab **Storage**
   - Klik **Create Database** → Pilih **Postgres**
   - Buat database (nama: `accounting-db` atau sesuai keinginan)

2. **Install dependency:**
   ```bash
   npm install @vercel/postgres
   ```

3. **Environment Variables akan otomatis ditambahkan:**
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

4. **Redeploy aplikasi** - database akan otomatis terhubung!

### Opsi 2: Supabase (Gratis, Mudah)

1. **Buat akun di [Supabase](https://supabase.com)** (gratis)

2. **Buat project baru** dan dapatkan:
   - Project URL
   - Anon Key

3. **Tambahkan Environment Variables di Vercel:**
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Install dependency:**
   ```bash
   npm install @supabase/supabase-js
   ```

### Opsi 3: In-Memory (Sementara - Data Hilang Setelah Cold Start)

Saat ini aplikasi akan menggunakan in-memory database jika tidak ada database eksternal. 
**WARNING:** Data akan hilang setelah cold start atau deployment baru.

## 🚀 Setup Cepat - Vercel Postgres

```bash
# 1. Install package
npm install @vercel/postgres

# 2. Commit dan push
git add .
git commit -m "Add Vercel Postgres support"
git push

# 3. Di Vercel Dashboard:
# - Storage → Create Database → Postgres
# - Environment variables akan otomatis ditambahkan
# - Redeploy
```

## 📝 Catatan

- **Untuk Development Lokal:** SQLite file-based tetap digunakan
- **Untuk Vercel Production:** Gunakan Vercel Postgres atau Supabase
- **In-Memory:** Hanya untuk testing, jangan digunakan untuk production dengan data penting

## 🔧 Troubleshooting

Jika database tidak terhubung:
1. Cek Environment Variables di Vercel Dashboard
2. Pastikan dependency sudah terinstall (`@vercel/postgres` atau `@supabase/supabase-js`)
3. Redeploy aplikasi setelah setup database

---

**Rekomendasi:** Gunakan **Vercel Postgres** karena:
- ✅ Gratis untuk starter plan
- ✅ Terintegrasi langsung dengan Vercel
- ✅ Auto-scaling
- ✅ Backup otomatis
- ✅ Mudah setup (hanya beberapa klik)

