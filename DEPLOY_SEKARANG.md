# 🚀 Panduan Deploy Website - Langkah demi Langkah

## ⚡ Opsi 1: Vercel (Recommended - Paling Mudah)

### Langkah 1: Login ke Vercel
Buka terminal/PowerShell dan jalankan:
```bash
vercel login
```
Ini akan membuka browser untuk login. Pilih salah satu:
- **GitHub** (recommended)
- **GitLab**
- **Bitbucket**
- **Email**

### Langkah 2: Deploy
Setelah login, jalankan:
```bash
vercel
```

Ikuti pertanyaan yang muncul:
1. **Set up and deploy?** → Tekan Enter (Yes)
2. **Which scope?** → Pilih akun Anda
3. **Link to existing project?** → Tekan N (No, create new)
4. **What's your project's name?** → Tekan Enter (atau ketik nama custom)
5. **In which directory is your code located?** → Tekan Enter (./)

**Tunggu beberapa menit...** Deployment akan selesai dan Anda akan mendapat URL!

**URL akan seperti:** `https://accounting-cv-abc.vercel.app`

### Langkah 3: Deploy ke Production
Setelah preview deployment berhasil, deploy ke production:
```bash
vercel --prod
```

**Selesai!** Website sudah online dan bisa diakses siapa saja! 🎉

---

## 🌐 Opsi 2: Render.com (Tanpa Install CLI)

### Langkah 1: Push ke GitHub
Jika belum punya repository:
```bash
# Inisialisasi git
git init
git add .
git commit -m "Initial commit - Accounting System"

# Buat repository di GitHub, lalu:
git remote add origin https://github.com/USERNAME/accounting-system.git
git branch -M main
git push -u origin main
```

### Langkah 2: Deploy di Render
1. Buka [render.com](https://render.com) dan **Sign Up** (gratis)
2. Klik **"New +"** → **"Web Service"**
3. **Connect GitHub** repository Anda
4. Pilih repository `accounting-system`
5. Isi form:
   - **Name**: `accounting-cv-abc`
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install && cd client && npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     NODE_ENV=production node server/index.js
     ```
   - **Plan**: Free (atau pilih yang Anda mau)
6. Klik **"Create Web Service"**
7. Tunggu 5-10 menit untuk build dan deploy
8. Dapatkan URL: `https://accounting-cv-abc.onrender.com`

**Selesai!** 🎉

---

## 💻 Opsi 3: Heroku (Alternatif)

### Langkah 1: Install Heroku CLI
Download dari: https://devcenter.heroku.com/articles/heroku-cli

### Langkah 2: Login
```bash
heroku login
```

### Langkah 3: Create App
```bash
heroku create accounting-cv-abc
```

### Langkah 4: Set Environment
```bash
heroku config:set NODE_ENV=production
```

### Langkah 5: Deploy
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

**URL akan seperti:** `https://accounting-cv-abc.herokuapp.com`

---

## 🔧 Troubleshooting

### Error: Build failed
**Solusi:**
```bash
# Pastikan semua dependencies terinstall
npm run install-all

# Coba build lagi
npm run build
```

### Error: Port already in use
**Solusi:**
```bash
# Cari process yang menggunakan port
netstat -ano | findstr :5000
# Kill process (ganti PID dengan nomor yang ditemukan)
taskkill /PID <PID_NUMBER> /F
```

### Error: Vercel login failed
**Solusi:**
- Pastikan koneksi internet stabil
- Coba `vercel login` lagi
- Atau gunakan opsi Render.com yang lebih mudah

---

## ✅ Checklist Sebelum Deploy

- [x] Build berhasil (`npm run build`)
- [ ] Semua file sudah di-commit ke Git (jika pakai Render/Heroku)
- [ ] Environment variables sudah disiapkan (jika perlu)
- [ ] Test di local production mode dulu:
  ```bash
  # Windows
  start-local.bat
  
  # Test di browser: http://localhost:5000
  ```

---

## 🎯 Rekomendasi

**Untuk pemula:** Gunakan **Render.com** (paling mudah, tanpa CLI)  
**Untuk cepat:** Gunakan **Vercel** (setelah login, sangat cepat)  
**Untuk production serius:** Pilih plan berbayar sesuai kebutuhan

---

## 📝 Catatan Penting

1. **Build sudah selesai** - File build ada di `client/build/`
2. **Port 5000** - Pastikan tidak digunakan aplikasi lain
3. **CORS** - Untuk production, mungkin perlu update CORS settings di `server/index.js`
4. **Environment Variables** - Set `NODE_ENV=production` di hosting

---

**Pilih metode yang paling mudah untuk Anda dan ikuti langkah-langkahnya! 🚀**

