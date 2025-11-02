# Cara Memperbaiki Branch Mismatch di Neon

## Masalah
Log menunjukkan database **kosong** (0 accounts), tetapi aplikasi mengatakan "Account already exists". Ini berarti:
- Data ada di database lain (branch berbeda)
- Connection string menunjuk ke database yang berbeda dengan yang dilihat di console

## Langkah Perbaikan

### 1. Cek Connection String di Vercel
1. Buka **Vercel Dashboard** → Project Anda
2. **Settings** → **Environment Variables**
3. Cek nilai `DATABASE_URL`
4. Copy connection string tersebut

### 2. Cek Connection String di Neon Dashboard
1. Buka **Neon Dashboard** → Project Anda
2. Pastikan Anda melihat **branch `main`** (default)
3. Klik **Connection Details** atau **Settings**
4. Cari **Connection strings**
5. Pilih **Pooled connection** (untuk serverless)
6. Copy connection string untuk branch **`main`**

### 3. Bandingkan Connection String

**Format connection string:**
```
postgresql://user:pass@ep-xxx-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Periksa:**
- Bagian `ep-xxx-xxx-pooler` - ini adalah endpoint ID
- Bagian setelah `/` - ini adalah database name (biasanya `neondb`)
- **PENTING**: Endpoint ID harus sama dengan yang terlihat di Neon Dashboard untuk branch yang Anda lihat

### 4. Update Connection String di Vercel

Jika connection string berbeda:
1. **Hapus** `DATABASE_URL` yang lama di Vercel
2. **Tambah** `DATABASE_URL` baru dengan connection string dari Neon Dashboard (branch `main`)
3. **Redeploy** aplikasi

### 5. Verifikasi

Setelah redeploy, cek Vercel logs:
```
🔌 Endpoint: ep-xxx-xxx-pooler
💾 Database: neondb
```

Lalu:
1. **Tambah akun** di aplikasi
2. **Refresh Neon console** (pastikan melihat branch `main`)
3. **Cek tabel** `chart_of_accounts` - data harus muncul!

## Alternative: Lihat Branch yang Benar

Jika tidak yakin branch mana yang digunakan:
1. Di Neon Dashboard, coba **pilih branch lain** (jika ada)
2. Lihat apakah data muncul di branch lain
3. Jika data muncul di branch tertentu, **update Vercel** untuk menggunakan branch tersebut

## Catatan Penting

- **Pooled connection** biasanya digunakan untuk production (serverless)
- **Direct connection** biasanya untuk development
- **Setiap branch memiliki database terpisah**
- **Connection string harus sesuai dengan branch yang dilihat di console**

