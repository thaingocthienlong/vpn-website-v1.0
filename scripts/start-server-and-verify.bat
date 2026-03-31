@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "OPEN_FIREWALL=0"
set "FIREWALL_ELEVATED_RETRY=0"
for %%A in (%*) do (
  if /I "%%~A"=="--open-firewall" set "OPEN_FIREWALL=1"
  if /I "%%~A"=="--firewall-elevated" set "FIREWALL_ELEVATED_RETRY=1"
)

net session >nul 2>&1
if errorlevel 1 (
  set "IS_ADMIN=0"
) else (
  set "IS_ADMIN=1"
)

if "%OPEN_FIREWALL%"=="1" (
  if "%IS_ADMIN%"=="0" (
    if "%FIREWALL_ELEVATED_RETRY%"=="1" (
      echo Firewall mode requested, but admin elevation was not granted.
      exit /b 1
    )
    echo Requesting Administrator permission to manage firewall rule...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -ArgumentList '--open-firewall --firewall-elevated' -Verb RunAs"
    if errorlevel 1 (
      echo UAC prompt was cancelled. Exiting without changing firewall.
      exit /b 1
    )
    exit /b 0
  )
)

set "HOST=0.0.0.0"
set "PORT=3000"
set "URL=http://127.0.0.1:%PORT%/"
for %%I in ("%~dp0..") do set "WORKDIR=%%~fI"
set "LOG_FILE=%WORKDIR%\dev-server.log"
set "ERR_FILE=%WORKDIR%\dev-server.err"
set "LAN_IP="
for /f "tokens=4" %%i in ('route print -4 ^| findstr /R /C:"^[ ]*0\.0\.0\.0[ ]*0\.0\.0\.0"') do (
  set "LAN_IP=%%i"
  goto :lan_ip_found
)
:lan_ip_found

echo [1/4] Checking for existing Next.js dev server processes...
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

echo [2/4] Firewall mode check...
if "%OPEN_FIREWALL%"=="1" (
  echo     Ensuring local firewall allows TCP %PORT%...
  netsh advfirewall firewall show rule name="NextJS Dev %PORT%" >nul 2>&1
  if errorlevel 1 (
    netsh advfirewall firewall add rule name="NextJS Dev %PORT%" dir=in action=allow protocol=TCP localport=%PORT% >nul 2>&1
    if errorlevel 1 (
      echo     Could not create firewall rule automatically. It likely needs Administrator rights.
      echo     If LAN devices still cannot connect, run as admin:
      echo       netsh advfirewall firewall add rule name^="NextJS Dev %PORT%^" dir^=in action^=allow protocol^=TCP localport^=%PORT%
    ) else (
      echo     Firewall rule created: NextJS Dev %PORT%
    )
  ) else (
    echo     Firewall rule already exists: NextJS Dev %PORT%
  )
) else (
  echo     Skipped. Use --open-firewall to allow incoming LAN traffic on TCP %PORT%.
)

echo [3/4] Starting Next.js dev server with webpack...
if exist "%LOG_FILE%" del /f /q "%LOG_FILE%" >nul 2>&1
if exist "%ERR_FILE%" del /f /q "%ERR_FILE%" >nul 2>&1

pushd "%WORKDIR%"
start "next-dev-webpack" /b cmd /c "npx next dev --webpack --hostname %HOST% --port %PORT% > dev-server.log 2> dev-server.err"
popd

echo [4/4] Confirming browser access with Playwright (auto-retry until ready)...
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
if defined LAN_IP (
  echo LAN access URL: http://%LAN_IP%:%PORT%/
  echo If other devices still cannot connect, make sure they are on the same Wi-Fi and AP isolation is disabled.
) else (
  echo LAN IP auto-detection failed. Check your adapter IP and use http://YOUR_IP:%PORT%/
)
exit /b 0
