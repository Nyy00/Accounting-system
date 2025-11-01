# 🌐 Deploy via Website Vercel - Panduan Lengkap

## ✅ Status: Repository sudah di GitHub!

Git sudah terhubung. Sekarang tinggal deploy di website Vercel!

---

## 🚀 LANGKAH-LANGKAH DEPLOY

### Step 1: Push Semua File ke GitHub (jika ada perubahan)

```bash
git add .
git commit -m "Ready for deployment"
git push
```

---

### Step 2: Login ke Vercel Website

1. **Buka browser** → https://vercel.com
2. Klik **"Sign Up"** (jika belum punya akun) atau **"Log In"**
3. Pilih **"Continue with GitHub"**
   - Ini akan otomatis connect dengan GitHub account Anda
4. Klik **"Authorize Vercel"**
5. Selesai login!

---

### Step 3: Import Project dari GitHub

1. Di dashboard Vercel, klik **"Add New..."** (pojok kanan atas)
2. Pilih **"Project"**
3. Klik **"Import Git Repository"**
4. Cari dan pilih repository **"accounting"** (atau nama repo Anda)
5. Klik **"Import"**

---

### Step 4: Configure Project

Vercel akan otomatis detect, tapi **pastikan settings berikut:**

#### Framework Preset
- Pilih: **"Other"**

#### Build and Output Settings
Klik **"Override"** dan isi:

**Root Directory:** (biarkan kosong atau `./`)

**Build Command:**
```
cd client && npm install && npm run build
```

**Output Directory:**
```
client/build
```

**Install Command:**
```
npm install && cd client && npm install
```

#### Environment Variables
Klik **"Environment Variables"** → Klik **"Add"**:

- **Key**: `NODE_ENV`
- **Value**: `production`
- Centang semua: ✓ Production ✓ Preview ✓ Development

Klik **"Save"**

---

### Step 5: Deploy!

1. Scroll ke bawah halaman
2. Klik tombol **"Deploy"** (besar, warna hitam/biru)
3. **Tunggu 2-5 menit** untuk build dan deploy
4. Proses akan terlihat di layar (real-time)

---

## 🎉 SETELAH DEPLOY SELESAI

1. Vercel akan menampilkan **"Congratulations!"**
2. Klik tombol **"Visit"** atau copy URL yang muncul
3. URL akan seperti: `https://accounting-xxxxx.vercel.app`
4. **Website sudah online dan bisa diakses siapa saja!** ✨

---

## 📋 Screenshot Checklist (Visual Guide)

Saat configure di Vercel, pastikan:

```
┌─────────────────────────────────────┐
│ Framework Preset: Other             │
├─────────────────────────────────────┤
│ Root Directory: ./                   │
│ Build Command:                       │
│   cd client && npm install && npm run build
│ Output Directory:                    │
│   client/build                       │
│ Install Command:                     │
│   npm install && cd client && npm install
└─────────────────────────────────────┘
```

---

## 🔄 Update Website di Masa Depan

Setelah deploy pertama, setiap update otomatis:

1. Edit code di lokal
2. Commit & push:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
3. **Vercel otomatis detect dan deploy!** 🚀
   - Setiap push ke GitHub = auto deploy baru

---

## ⚙️ Settings Penting di Vercel Dashboard

Setelah project dibuat, Anda bisa:

### Settings → General
- Lihat deployment logs
- Manage project settings

### Settings → Environment Variables
- Tambah variabel environment jika perlu

### Settings → Domains
- Tambah custom domain (jika punya)

### Deployments Tab
- Lihat semua deployment history
- Rollback ke versi sebelumnya jika perlu

---

## ❓ Troubleshooting

### Error: Build Failed
**Cek:**
1. Build Logs di Vercel (buka deployment yang gagal)
2. Pastikan build command benar
3. Pastikan output directory: `client/build`

### Error: Cannot find module
**Solusi:**
- Pastikan `package.json` ada di root
- Pastikan `client/package.json` ada
- Cek install command sudah benar

### Website tidak muncul
**Solusi:**
1. Cek deployment status (harus "Ready")
2. Klik "Visit" button
3. Cek browser console untuk error

---

## ✅ Checklist Deploy

- [ ] Code sudah di GitHub (sudah ada ✅)
- [ ] Vercel account sudah dibuat
- [ ] GitHub terhubung dengan Vercel
- [ ] Project diimport dari GitHub
- [ ] Build command sudah di-set
- [ ] Output directory: `client/build`
- [ ] Environment variable `NODE_ENV=production`
- [ ] Klik "Deploy"
- [ ] Tunggu hingga selesai
- [ ] Website online! 🎉

---

## 🎯 Quick Start (TL;DR)

1. **Buka** https://vercel.com → Login dengan GitHub
2. **Klik** "Add New" → "Project"
3. **Import** repository Anda
4. **Set** Build Command: `cd client && npm install && npm run build`
5. **Set** Output Directory: `client/build`
6. **Add** Environment: `NODE_ENV=production`
7. **Klik** "Deploy"
8. **Selesai!** Copy URL dan share! 🚀

---

**Website Anda akan online dalam beberapa menit! Selamat! 🎊**

