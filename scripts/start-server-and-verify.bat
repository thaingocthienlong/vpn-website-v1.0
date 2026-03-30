@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "PORT=3000"
set "URL=http://127.0.0.1:%PORT%/"
for %%I in ("%~dp0..") do set "WORKDIR=%%~fI"
set "LOG_FILE=%WORKDIR%\dev-server.log"
set "ERR_FILE=%WORKDIR%\dev-server.err"

echo [1/3] Checking for existing Next.js dev server processes...
set "FOUND_PID="
set "LAST_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":%PORT%.*LISTENING"') do (
  if not "!LAST_PID!"=="%%p" (
    set "FOUND_PID=%%p"
    set "LAST_PID=%%p"
    echo     Found PID %%p. Stopping it first...
    taskkill /PID %%p /T /F >nul 2>&1
  )
)

if defined FOUND_PID (
  timeout /t 2 /nobreak >nul
  echo     Previous server stopped.
) else (
  echo     No existing server found on port %PORT%.
)

echo [2/3] Starting Next.js dev server with webpack...
if exist "%LOG_FILE%" del /f /q "%LOG_FILE%" >nul 2>&1
if exist "%ERR_FILE%" del /f /q "%ERR_FILE%" >nul 2>&1

pushd "%WORKDIR%"
start "next-dev-webpack" /b cmd /c "npx next dev --webpack > dev-server.log 2> dev-server.err"
popd

echo [3/3] Confirming browser access with Playwright (auto-retry until ready)...
node -e "const { chromium } = require('playwright'); const url = process.argv[1]; (async () => { const deadline = Date.now() + 180000; let lastError = 'unknown'; while (Date.now() < deadline) { let browser; try { browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }); const title = await page.title(); if (response && response.status() < 400) { console.log('Playwright OK:', response.status(), '-', title); await browser.close(); process.exit(0); } lastError = 'HTTP status ' + (response ? response.status() : 'no response'); } catch (err) { lastError = err && err.message ? err.message : String(err); } finally { if (browser) await browser.close().catch(() => {}); } await new Promise((resolve) => setTimeout(resolve, 2000)); } throw new Error(lastError); })().catch((err) => { console.error('Playwright verification failed:', err.message); process.exit(1); });" "%URL%"
if errorlevel 1 (
  echo     --- Last 40 lines of dev-server.log ---
  powershell -NoProfile -Command "if(Test-Path '%LOG_FILE%'){Get-Content '%LOG_FILE%' -Tail 40}"
  echo     --- Last 40 lines of dev-server.err ---
  powershell -NoProfile -Command "if(Test-Path '%ERR_FILE%'){Get-Content '%ERR_FILE%' -Tail 40}"
  exit /b 1
)

echo.
echo Done. Server is running and Playwright confirmed access at %URL%
exit /b 0
