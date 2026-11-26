@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js 18 or newer first.& pause & exit /b 1)
start "M1A4A0Z2 Friend Server" cmd /k node friend-server.js
timeout /t 2 >nul
start "" "http://127.0.0.1:8091/"
