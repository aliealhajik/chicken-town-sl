@echo off
title Chicken Town SL Server
cd /d "%~dp0"
echo Starting Chicken Town SL local web server...
start http://localhost:5000/
start http://localhost:5000/admin.html
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
