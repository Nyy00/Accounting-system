# 📘 Panduan Deploy via Website Vercel - Step by Step

## 🎯 Cara Termudah: Deploy dari Web Browser

### ✅ Yang Sudah Siap:
- ✅ Build sudah selesai (`client/build/`)
- ✅ `vercel.json` sudah ada
- ✅ Semua dependencies terinstall

### ⏳ Yang Perlu Dilakukan:
1. Push code ke GitHub
2. Login ke Vercel website
3. Import project
4. Deploy!

---

## 📝 LANGKAH 1: Push ke GitHub

### A. Inisialisasi Git (jika belum)
Buka PowerShell di folder project (`c:\accounting`):

```bash
git init
git add .
git commit -m "Initial commit - Sistem Akuntansi CV ABC"
```

### B. Buat Repository di GitHub
1. Buka: https://github.com/new
2. Repository name: `accounting-cv-abc`
3. Description: `Sistem Akuntansi CV ABC - Laporan Keuangan`
4. Public atau Private (pilih salah satu)
5. **JANGAN** centang "Add a README file"
6. Klik **"Create repository"**

### C. Push Code
Di PowerShell, jalankan (ganti `USERNAME` dengan username GitHub Anda):

```bash
git remote add origin https://github.com/USERNAME/accounting-cv-abc.git
git branch -M main
git push -u origin main
```

**Masukkan username & password GitHub** (atau token jika 2FA aktif)

---

## 🌐 LANGKAH 2: Deploy di Vercel Website

### A. Login/Buat Akun Vercel
1. Buka: https://vercel.com
2. Klik **"Sign Up"** (jika belum punya akun)
3. Pilih **"Continue with GitHub"** (paling mudah)
4. Authorize Vercel → Klik **"Authorize Vercel"**

### B. Import Project
1. Di dashboard Vercel, klik **"Add New..."** → **"Project"**
2. Pilih **"Import Git Repository"**
3. Klik repository **"accounting-cv-abc"**
4. Klik **"Import"**

### C. Configure Project Settings

**Framework Preset:**
- Pilih: **"Other"**

**Override Settings:**
Klik **"Override"** dan isi:

- **Build Command**: 
  ```
  cd client && npm install && npm run build
  ```
- **Output Directory**: 
  ```
  client/build
  ```
- **Install Command**: 
  ```
  npm install && cd client && npm install
  ```

**Environment Variables:**
Klik **"Environment Variables"** → Tambahkan:
- Name: `NODE_ENV`
- Value: `production`
- Environment: ✓ Production ✓ Preview ✓ Development

### D. Deploy!
1. Scroll ke bawah, klik **"Deploy"**
2. Tunggu 2-5 menit
3. **Selesai!** 🎉

---

## 🎊 Website Sudah Online!

Setelah deploy selesai:
1. Klik project di dashboard
2. Copy URL yang muncul (misal: `https://accounting-cv-abc.vercel.app`)
3. Buka URL di browser
4. **Website sudah live!** ✨

---

## 🔄 Update Website (Setelah Deploy Pertama)

Setiap kali update code:
1. Edit code
2. Commit & push ke GitHub:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
3. **Vercel akan otomatis deploy!** (auto deployment)

---

## ❓ FAQ

**Q: Harus pakai GitHub?**  
A: Ya, untuk deploy via website Vercel, code harus di GitHub/GitLab/Bitbucket

**Q: Apakah gratis?**  
A: Ya! Vercel free tier cukup untuk website ini

**Q: Bagaimana update website?**  
A: Push ke GitHub, Vercel akan otomatis deploy ulang

**Q: Bisa pakai domain sendiri?**  
A: Ya, di Settings → Domains bisa tambahkan custom domain

---

## 🆘 Butuh Bantuan?

Jika ada error:
1. Cek **Deployment Logs** di Vercel dashboard
2. Pastikan build command dan output directory benar
3. Pastikan `vercel.json` ada di root folder
4. Coba deploy ulang

---

**Selamat! Website Anda akan online dalam beberapa menit! 🚀**

