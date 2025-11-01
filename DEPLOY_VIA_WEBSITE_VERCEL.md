# 🌐 Deploy via Website Vercel - Tanpa CLI

## 🎯 Cara Paling Mudah: Deploy dari Website Vercel

### 📋 Prasyarat
1. **Akun Vercel** (gratis) - https://vercel.com
2. **GitHub Account** (gratis) - https://github.com
3. **Code sudah di GitHub** (akan kita buat)

---

## 🚀 Langkah-Langkah Deploy

### Step 1: Push Code ke GitHub

#### 1.1. Inisialisasi Git (jika belum)
Buka PowerShell di folder `c:\accounting` dan jalankan:

```bash
git init
git add .
git commit -m "Initial commit - Accounting System CV ABC"
```

#### 1.2. Buat Repository di GitHub
1. Buka https://github.com
2. Klik **"+"** di pojok kanan atas → **"New repository"**
3. Isi:
   - **Repository name**: `accounting-cv-abc` (atau nama lain)
   - **Description**: Sistem Akuntansi CV ABC
   - **Visibility**: Public (gratis) atau Private (jika mau)
   - **JANGAN** centang "Initialize with README"
4. Klik **"Create repository"**

#### 1.3. Push Code ke GitHub
Di PowerShell, jalankan (ganti USERNAME dengan username GitHub Anda):

```bash
git remote add origin https://github.com/USERNAME/accounting-cv-abc.git
git branch -M main
git push -u origin main
```

**Atau** jika GitHub menampilkan instruksi berbeda, ikuti instruksi yang muncul di halaman repository baru.

---

### Step 2: Deploy di Vercel Website

#### 2.1. Login ke Vercel
1. Buka https://vercel.com
2. Klik **"Sign Up"** atau **"Log In"**
3. Pilih **"Continue with GitHub"** (paling mudah)
4. Authorize Vercel untuk akses GitHub

#### 2.2. Import Project
1. Di dashboard Vercel, klik **"Add New..."** → **"Project"**
2. Klik **"Import Git Repository"**
3. Pilih repository **"accounting-cv-abc"** (yang baru dibuat)
4. Klik **"Import"**

#### 2.3. Configure Project

Vercel akan otomatis detect settings, tapi pastikan:

**Framework Preset:**
- Pilih **"Other"** atau **"Node.js"**

**Build and Output Settings:**
- **Root Directory**: `./` (default)
- **Build Command**: 
  ```
  cd client && npm install && npm run build
  ```
- **Output Directory**: `client/build`
- **Install Command**: 
  ```
  npm install && cd client && npm install
  ```

**Environment Variables:**
- Klik **"Environment Variables"**
- Tambahkan:
  - Key: `NODE_ENV`
  - Value: `production`
  - Environment: Production, Preview, Development (centang semua)

#### 2.4. Deploy!
1. Klik **"Deploy"**
2. Tunggu 2-5 menit untuk build dan deploy
3. **Selesai!** 🎉

---

### Step 3: Akses Website

Setelah deploy selesai:
1. Klik project di dashboard Vercel
2. Anda akan melihat **"Visit"** atau URL website
3. URL akan seperti: `https://accounting-cv-abc.vercel.app`
4. **Website sudah online dan bisa diakses siapa saja!** ✨

---

## ⚙️ Konfigurasi Tambahan (Opsional)

### Custom Domain
1. Di project dashboard → **Settings** → **Domains**
2. Tambahkan domain custom jika punya
3. Ikuti instruksi untuk setup DNS

### Environment Variables
Jika perlu environment variables lain:
1. **Settings** → **Environment Variables**
2. Tambahkan variabel yang diperlukan

---

## 🔧 Troubleshooting

### Error: Build failed
**Solusi:**
1. Cek **Build Logs** di Vercel dashboard
2. Pastikan `package.json` dan `client/package.json` ada
3. Pastikan `vercel.json` sudah benar
4. Coba deploy ulang

### Error: Cannot find module
**Solusi:**
- Pastikan semua dependencies ada di `package.json`
- Cek build logs untuk detail error

### Error: Routes not working
**Solusi:**
- Pastikan `vercel.json` sudah ada dan benar
- Pastikan build output directory: `client/build`

---

## ✅ Checklist Sebelum Deploy

- [ ] Code sudah di GitHub
- [ ] Vercel account sudah dibuat
- [ ] GitHub terhubung dengan Vercel
- [ ] `vercel.json` sudah ada (sudah ada ✅)
- [ ] `package.json` ada dependencies lengkap (sudah ada ✅)
- [ ] Build berhasil di local (`npm run build`) (sudah berhasil ✅)

---

## 📝 Catatan Penting

1. **Vercel Gratis** memberikan:
   - 100GB bandwidth per bulan
   - Unlimited requests
   - Auto HTTPS
   - Auto deployments dari GitHub

2. **Auto Deploy**: Setiap push ke GitHub akan auto deploy ke Vercel!

3. **Preview Deployments**: Setiap branch akan dapat preview URL sendiri

4. **Production URL**: Branch `main` akan deploy ke production URL

---

## 🎉 Setelah Deploy Berhasil

Website Anda akan:
- ✅ Online 24/7
- ✅ HTTPS otomatis
- ✅ CDN global (cepat di seluruh dunia)
- ✅ Auto deploy setiap update (push ke GitHub)
- ✅ Bisa diakses siapa saja

**Selamat! Website Anda sudah live! 🚀**

