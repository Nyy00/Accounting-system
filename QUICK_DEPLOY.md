# ⚡ Quick Deploy - Paling Cepat!

## 🎯 Cara Tercepat: Vercel (5 Menit)

### Step 1: Login (Wajib, sekali saja)
```bash
vercel login
```
→ Akan buka browser, login dengan GitHub/GitLab/Email

### Step 2: Deploy
```bash
vercel
```
→ Ikuti prompt, tekan Enter untuk default settings

### Step 3: Production Deploy
```bash
vercel --prod
```

**DONE!** Website online di: `https://your-app.vercel.app` ✨

---

## 🌐 Alternatif: Render.com (Tanpa CLI)

1. **Push ke GitHub** (jika belum):
   ```bash
   git init
   git add .
   git commit -m "Deploy"
   git remote add origin https://github.com/USERNAME/repo.git
   git push -u origin main
   ```

2. **Buka render.com** → Sign Up → New Web Service

3. **Connect GitHub** → Pilih repo

4. **Settings:**
   - Build: `npm install && cd client && npm install && npm run build`
   - Start: `NODE_ENV=production node server/index.js`

5. **Deploy!** Tunggu 5-10 menit

---

**Build sudah selesai, tinggal deploy! 🚀**

