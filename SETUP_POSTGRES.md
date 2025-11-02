# Setup Vercel Postgres untuk Accounting System

## 🚀 Langkah Setup Cepat

### 1. Install Package
```bash
npm install @vercel/postgres
```

### 2. Setup Database di Vercel Dashboard

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **accounting-system** Anda
3. Pergi ke tab **Storage**
4. Klik **Create Database**
5. Pilih **Postgres**
6. Pilih plan (Free tier cukup untuk testing)
7. Klik **Create**

### 3. Environment Variables

Environment variables akan **otomatis** ditambahkan oleh Vercel:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`  
- `POSTGRES_URL_NON_POOLING`

### 4. Commit dan Deploy

```bash
git add .
git commit -m "Add Vercel Postgres support"
git push
```

Vercel akan otomatis:
- ✅ Detect environment variables
- ✅ Connect ke database
- ✅ Initialize schema (table akan dibuat otomatis)

### 5. Verify

Setelah deploy, cek logs di Vercel Dashboard:
- Harus ada log: `✅ Using Vercel Postgres`
- Harus ada log: `✅ Vercel Postgres initialized`

## 📊 Database Schema

Tables yang akan dibuat otomatis:
- `chart_of_accounts` - Chart of Accounts
- `transactions` - Transaksi utama
- `transaction_entries` - Entri transaksi (double-entry)
- `adjusting_entries` - Jurnal penyesuaian
- `adjusting_entry_entries` - Entri jurnal penyesuaian
- `metadata` - Metadata laporan

## ✅ Keuntungan Vercel Postgres

1. **Data Persisten** - Data tidak hilang setelah cold start
2. **Auto-scaling** - Automatically scales dengan traffic
3. **Backup Otomatis** - Daily backups
4. **High Availability** - 99.9% uptime
5. **Gratis untuk Development** - Free tier cukup untuk testing

## 🔧 Troubleshooting

### Database tidak terhubung?
1. Cek Environment Variables di Vercel Dashboard
2. Pastikan `@vercel/postgres` sudah terinstall
3. Redeploy aplikasi

### Schema tidak terbuat?
- Schema akan dibuat otomatis saat pertama kali API dipanggil
- Cek logs untuk error messages

### Error "Module not found"?
```bash
npm install @vercel/postgres
npm install  # di root
```

## 📝 Catatan

- **Local Development**: Masih menggunakan SQLite file-based
- **Vercel Production**: Menggunakan Vercel Postgres
- **Migration**: Data lama perlu di-migrate manual (jika ada)

---

**Status**: ✅ Ready untuk digunakan!

