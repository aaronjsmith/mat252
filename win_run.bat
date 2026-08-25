@echo off
rem MAT 252 Statistics practice - Windows launcher.
rem Double-click this file. Starts the Vite dev server and opens the site.

setlocal
title MAT252 Practice
cd /d "%~dp0"

set "PORT=5173"
set "URL=http://localhost:%PORT%"

echo == MAT 252 Statistics practice ==

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: Node.js/npm not found.
  echo Install Node.js ^(LTS^) from https://nodejs.org and run this again.
  pause
  exit /b 1
)

curl -sf %URL% >nul 2>nul
if not errorlevel 1 (
  echo Site is already running at %URL% - opening browser.
  start "" %URL%
  exit /b 0
)

if not exist node_modules (
  echo First run - installing dependencies ^(one-time^)...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed - see output above.
    pause
    exit /b 1
  )
)

start "" /min cmd /c "for /l %%i in (1,1,60) do (curl -sf %URL% >nul 2>nul && start \"\" %URL% && exit || timeout /t 1 /nobreak >nul)"

echo Starting dev server at %URL%  (close this window to stop)
call npm run dev -- --port %PORT% --strictPort
pause
