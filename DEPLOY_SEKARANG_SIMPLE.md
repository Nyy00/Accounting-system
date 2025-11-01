# ⚡ Deploy Sekarang - 5 Langkah Sederhana

## 📋 Langkah Cepat Deploy ke Vercel Website

### ✅ Yang Sudah Ada:
- ✅ Code sudah di GitHub
- ✅ Build sudah selesai
- ✅ `vercel.json` sudah ada

### 🚀 5 Langkah Deploy:

#### 1️⃣ **Buka Vercel**
https://vercel.com → Login dengan GitHub

#### 2️⃣ **Import Project**
- Klik **"Add New"** → **"Project"**
- Pilih repository **"accounting"** (repo Anda)
- Klik **"Import"**

#### 3️⃣ **Configure** (PENTING!)
Klik **"Override"** dan isi:

```
Build Command:
cd client && npm install && npm run build

Output Directory:
client/build

Install Command:
npm install && cd client && npm install
```

Tambahkan **Environment Variable:**
- Key: `NODE_ENV`
- Value: `production`
- Environment: ✓ Semua (Production, Preview, Development)

#### 4️⃣ **Deploy**
- Scroll bawah → Klik **"Deploy"**
- Tunggu 2-5 menit

#### 5️⃣ **Selesai!** 🎉
- Klik **"Visit"** atau copy URL
- Website online: `https://accounting-xxxxx.vercel.app`

---

## 🔄 Update di Masa Depan

Setiap kali update:
```bash
git add .
git commit -m "Update"
git push
```
→ Vercel otomatis deploy! ✨

---

**Itu saja! Website Anda akan online dalam 5 menit! 🚀**

