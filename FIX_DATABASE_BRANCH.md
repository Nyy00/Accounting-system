# Fix Database Branch Mismatch

## Masalah
Data ada di database (error "already exists"), tapi tidak terlihat di Neon console karena:
- **Neon Console melihat branch `main`**
- **Vercel deploy dari branch `dev` dan menggunakan connection string untuk branch `dev`**

Di Neon, setiap branch memiliki database yang **terpisah**. Jadi data di branch `dev` tidak akan terlihat jika console melihat branch `main`.

## Solusi

### Opsi 1: Gunakan Branch `main` (Recommended)
1. Buka **Neon Dashboard** → Project Anda
2. Pastikan Anda melihat branch **main**
3. Buka **Settings** → **Connection string**
4. Copy **Pooled connection** string untuk branch **main**
5. Buka **Vercel Dashboard** → Project Anda → **Settings** → **Environment Variables**
6. Update `DATABASE_URL` dengan connection string dari branch **main**
7. **Redeploy** aplikasi

### Opsi 2: Gunakan Branch `dev` di Neon Console
1. Buka **Neon Dashboard** → Project Anda
2. Pilih branch **dev** di sidebar kiri (jika ada)
3. Lihat data di branch `dev`
4. **Pastikan** connection string di Vercel menggunakan branch `dev`

### Cara Cek Branch yang Digunakan

Setelah deploy, cek Vercel logs. Anda akan melihat:
```
🌿 Branch: main
```
atau
```
🌿 Branch: dev
```

Ini akan menunjukkan branch mana yang digunakan oleh aplikasi.

## Cara Verifikasi

1. **Cek Vercel Logs:**
   - Deploy aplikasi
   - Cek logs - akan ada log `🌿 Branch: ...`
   - Pastikan ini sesuai dengan branch yang Anda lihat di Neon console

2. **Cek Connection String:**
   - Format: `postgresql://user:pass@BRANCH-NAME.region.aws.neon.tech/dbname`
   - Bagian `BRANCH-NAME` harus sama dengan branch di Neon console

## Rekomendasi

**Gunakan branch `main`** untuk production:
- Update `DATABASE_URL` di Vercel dengan connection string dari branch `main`
- View data di Neon console dengan memilih branch `main`
- Semua data akan konsisten

