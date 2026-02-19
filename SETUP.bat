@echo off
echo ====================================
echo   ICN Lab Website - First Time Setup
echo ====================================
echo.

echo [Step 1/2] Installing dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [Step 2/2] Seeding database...
node scripts\seed.js
if errorlevel 1 (
    echo ERROR: Database seed failed!
    echo Make sure MongoDB is running!
    pause
    exit /b 1
)

echo.
echo ====================================
echo   Setup Complete!
echo ====================================
echo.
echo You can now run START.bat to launch all services
echo.
echo Press any key to exit...
pause > nul
