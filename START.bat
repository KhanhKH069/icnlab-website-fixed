@echo off
echo ====================================
echo   ICN Lab Website - Quick Start
echo ====================================
echo.

echo [1/3] Starting Backend...
cd backend
start "ICN Lab Backend" cmd /k "npm start"
timeout /t 3

echo [2/3] Starting Frontend...
cd ..\frontend
start "ICN Lab Frontend" cmd /k "python -m http.server 3000"
timeout /t 2

echo [3/3] Starting Admin Dashboard...
cd ..\admin
start "ICN Lab Admin" cmd /k "python -m http.server 3001"

echo.
echo ====================================
echo   All services started!
echo ====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3001/login.html
echo.
echo Login: admin@ptit.edu.vn / admin123
echo.
echo Press any key to exit...
pause > nul
