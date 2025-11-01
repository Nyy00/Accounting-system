@echo off
echo ========================================
echo   Sistem Akuntansi CV ABC
echo   Production Mode - Local Sharing
echo ========================================
echo.
echo Building React app...
cd client
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)
cd ..
echo.
echo Build completed successfully!
echo.
set NODE_ENV=production
echo Starting server...
echo.
echo ========================================
echo   Server running at:
echo   http://localhost:5000
echo.
echo   To share on LAN:
echo   1. Find your IP: ipconfig
echo   2. Share: http://YOUR_IP:5000
echo ========================================
echo.
node server/index.js

