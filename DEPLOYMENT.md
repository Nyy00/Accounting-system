# Panduan Deployment - Sistem Akuntansi CV ABC

Berikut adalah beberapa cara untuk membagikan website ini ke orang lain:

## 🚀 Opsi 1: Deploy ke Vercel (Recommended - Gratis & Mudah)

Vercel sangat cocok untuk aplikasi React + Node.js.

### Langkah-langkah:

1. **Build aplikasi terlebih dahulu:**
   ```bash
   npm run build
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Login ke Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel
   ```

5. **Setup Environment Variables di Vercel Dashboard:**
   - `NODE_ENV=production`
   - `PORT=5000` (atau biarkan default)

**Atau** deploy langsung dari GitHub:
- Push code ke GitHub
- Import project di vercel.com
- Vercel akan otomatis detect dan deploy

**Keuntungan:**
- ✅ Gratis
- ✅ Auto HTTPS
- ✅ Auto deployment dari GitHub
- ✅ CDN global
- ✅ Mudah digunakan

---

## 🌐 Opsi 2: Deploy ke Render.com (Gratis)

1. **Buat akun di render.com**
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Settings:**
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `NODE_ENV=production node server/index.js`
   - Environment: `Node`
   - Auto-Deploy: `Yes`

**Keuntungan:**
- ✅ Gratis tier tersedia
- ✅ Auto HTTPS
- ✅ Mudah setup

---

## 💻 Opsi 3: Deploy ke Heroku (Gratis Tier Terbatas)

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   heroku create accounting-cv-abc
   ```

4. **Set environment:**
   ```bash
   heroku config:set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

**Keuntungan:**
- ✅ Gratis (dengan limit)
- ✅ Auto HTTPS
- ✅ Add-ons tersedia

---

## 🏠 Opsi 4: Share di Jaringan Lokal (LAN)

Untuk membagikan di jaringan lokal (kantor/sekolah):

1. **Build aplikasi:**
   ```bash
   npm run build
   ```

2. **Set environment untuk production:**
   ```bash
   # Windows PowerShell
   $env:NODE_ENV="production"
   npm start
   
   # Atau buat file start-local.bat
   ```

3. **Dapatkan IP address komputer Anda:**
   ```bash
   ipconfig
   # Cari IPv4 Address (misal: 192.168.1.100)
   ```

4. **Akses dari komputer lain di jaringan yang sama:**
   - URL: `http://192.168.1.100:5000`

**Note:** Pastikan firewall mengizinkan koneksi ke port 5000.

---

## 🌍 Opsi 5: Deploy ke Netlify (Frontend) + Backend Terpisah

### Frontend (Netlify):
1. Build: `cd client && npm run build`
2. Deploy folder `client/build` ke Netlify
3. Setup environment variable `REACT_APP_API_URL`

### Backend (Render/Heroku):
- Deploy backend ke Render atau Heroku
- Update API URL di frontend

---

## 📦 Opsi 6: Build & Distribute sebagai File

Untuk distribusi sebagai aplikasi standalone:

1. **Build aplikasi:**
   ```bash
   npm run build
   ```

2. **Package sebagai ZIP:**
   - Zip seluruh folder `client/build` dan `server`
   - Berikan instruksi instalasi

3. **Instruksi untuk user:**
   ```bash
   npm install
   NODE_ENV=production npm start
   ```

---

## ⚙️ Konfigurasi untuk Production

Pastikan untuk:

1. **Set NODE_ENV=production:**
   ```bash
   # Windows
   set NODE_ENV=production
   
   # Linux/Mac
   export NODE_ENV=production
   ```

2. **Update CORS jika perlu** (untuk domain tertentu):
   ```javascript
   // server/index.js
   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

3. **Gunakan environment variables untuk sensitive data**

---

## 🔗 Quick Start - Vercel (Paling Mudah)

**Langkah tercepat:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build
npm run build

# 3. Deploy
vercel

# 4. Follow the prompts
# 5. Dapatkan URL publik seperti: https://accounting-cv-abc.vercel.app
```

**Selesai!** Website sudah bisa diakses oleh siapa saja.

---

## 📝 Checklist Sebelum Deploy

- [ ] Build aplikasi berhasil (`npm run build`)
- [ ] Test di local production mode
- [ ] Environment variables sudah di-set
- [ ] CORS sudah dikonfigurasi jika perlu
- [ ] GitHub repository sudah updated (jika pakai auto-deploy)
- [ ] Domain sudah disiapkan (opsional)

---

## ❓ Troubleshooting

**Build Error?**
- Pastikan semua dependencies terinstall: `npm run install-all`
- Hapus `node_modules` dan install ulang

**CORS Error?**
- Update CORS di `server/index.js` untuk mengizinkan domain production

**Port Error?**
- Gunakan environment variable `PORT` untuk set port production

---

**Pilih metode yang paling sesuai dengan kebutuhan Anda!**

