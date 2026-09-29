@echo off
title KrishiBazar Launcher
echo ======================================================
echo    Starting KrishiBazar (PostgreSQL + Next.js App)
echo ======================================================

echo.
echo [1/2] Starting PostgreSQL Database on port 5433...
start "KrishiBazar-PostgreSQL" cmd /k "npm run db:start"

echo Waiting for database to initialize...
timeout /t 4 /nobreak >nul

echo.
echo [2/2] Starting Next.js Dev Server on port 3000...
start "KrishiBazar-NextJS" cmd /k "npm run dev"

echo.
echo Waiting for server to get ready...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ======================================================
echo KrishiBazar is now running! 
echo Keep both terminal windows open while using the app.
echo ======================================================
pause
