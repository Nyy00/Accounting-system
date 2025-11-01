@echo off
echo ========================================
echo   DEPLOY WEBSITE - Sistem Akuntansi CV ABC
echo ========================================
echo.
echo Step 1: Checking Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI tidak ditemukan. Menginstall...
    npm install -g vercel
    if errorlevel 1 (
        echo ERROR: Gagal install Vercel CLI
        pause
        exit /b 1
    )
)
echo.
echo Step 2: Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.
echo Build completed!
echo.
echo ========================================
echo   LANGKAH SELANJUTNYA:
echo ========================================
echo.
echo 1. Login ke Vercel (jika belum):
echo    vercel login
echo.
echo 2. Deploy:
echo    vercel
echo.
echo 3. Deploy ke production:
echo    vercel --prod
echo.
echo ========================================
echo   ATAU GUNAKAN RENDER.COM (Lebih Mudah)
echo ========================================
echo.
echo 1. Buka: https://render.com
echo 2. Sign Up / Login
echo 3. New Web Service
echo 4. Connect GitHub
echo 5. Pilih repository
echo 6. Build Command: npm install ^&^& cd client ^&^& npm install ^&^& npm run build
echo 7. Start Command: NODE_ENV=production node server/index.js
echo 8. Deploy!
echo.
pause

