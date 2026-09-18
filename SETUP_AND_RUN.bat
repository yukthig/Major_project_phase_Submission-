@ECHO OFF
ECHO ========================================
ECHO NEUROVISION AI PLATFORM - SETUP SCRIPT
ECHO ========================================
ECHO.
ECHO This script will help you set up and run the application
ECHO.
PAUSE

ECHO.
ECHO Step 1: Installing Backend Dependencies...
CD /D "%~dp0server"
CALL npm install

ECHO.
ECHO Step 2: Installing Frontend Dependencies...
CD /D "%~dp0client"
CALL npm install

ECHO.
ECHO ========================================
ECHO INSTALLATION COMPLETE!
ECHO ========================================
ECHO.
ECHO Next Steps:
ECHO.
ECHO 1. Start MongoDB (if using local)
ECHO    Command: mongod
ECHO.
ECHO 2. Seed the database
ECHO    CD server
ECHO    npm run seed
ECHO.
ECHO 3. Start Backend Server
ECHO    CD server
ECHO    npm run dev
ECHO.
ECHO 4. Start Frontend (NEW terminal)
ECHO    CD client
ECHO    npm run dev
ECHO.
ECHO 5. Open browser: http://localhost:3000
ECHO.
ECHO Demo Credentials:
ECHO Admin: admin@neurovision.com / admin123
ECHO User: sarah@neurovision.com / user123
ECHO.
PAUSE
