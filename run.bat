@echo off
title D.S SHINDE GAS AGENCY - Starter
echo ========================================================
echo   Starting D.S SHINDE GAS AGENCY Portal ^& Backend...
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend Server (Port 5000)...
start "DS Gas - Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/3] Starting Frontend Server (Port 3000)...
start "DS Gas - Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Opening Website in Browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================================
echo   Website running at: http://localhost:3000
echo   Backend API at:     http://localhost:5000
echo ========================================================
