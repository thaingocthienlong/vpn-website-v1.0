@echo off
echo Starting Chrome with Remote Debugging enabled...
echo.
echo IMPORTANT: Please ensure all other Chrome instances are CLOSED before running this,
echo or use a unique user data directory (which this script does).
echo.

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set USER_DATA_DIR=%~dp0..\.chrome-remote-profile

if not exist %CHROME_PATH% (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

if not exist %CHROME_PATH% (
    echo Chrome executable not found at default locations.
    echo Please edit this script to set the correct path to chrome.exe.
    pause
    exit /b 1
)

echo Chrome Path: %CHROME_PATH%
echo User Data Dir: %USER_DATA_DIR%
echo Debug Port: 9222
echo.

start "" %CHROME_PATH% --remote-debugging-port=9222 --user-data-dir="%USER_DATA_DIR%" --remote-allow-origins=* about:blank

echo.
echo Chrome closed.
