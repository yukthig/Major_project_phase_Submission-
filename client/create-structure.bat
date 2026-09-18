@echo off
echo ========================================
echo NeuroVision AI Platform - File Generator
echo ========================================
echo.
echo This script will create all remaining frontend files...
echo.
pause

cd /d "%~dp0src"

:: Create directories
echo Creating directories...
mkdir components\ui 2>nul
mkdir components\layout 2>nul
mkdir pages 2>nul
mkdir store 2>nul
mkdir services 2>nul

echo.
echo Directories created!
echo.
echo Now you need to create the following files manually or use an AI tool:
echo.
echo LAYOUT FILES:
echo - components/layout/Sidebar.tsx
echo - components/layout/MainLayout.tsx
echo.
echo PAGE FILES:
echo - pages/Landing.tsx
echo - pages/Login.tsx
echo - pages/Signup.tsx
echo - pages/Dashboard.tsx
echo - pages/Upload.tsx
echo - pages/Preprocessing.tsx
echo - pages/Segmentation.tsx
echo - pages/Reconstruction.tsx
echo - pages/Results.tsx
echo - pages/Reports.tsx
echo - pages/Admin.tsx
echo - pages/NotFound.tsx
echo.
echo STORE FILES (Already Created):
echo - store/authStore.ts ✓
echo - store/scanStore.ts ✓
echo - store/uiStore.ts ✓
echo.
echo SERVICE FILES (Already Created):
echo - services/api.ts ✓
echo.
echo CORE FILES (Already Created):
echo - App.tsx ✓
echo - main.tsx ✓
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Run: npm install
echo 2. Create remaining page files (I can help you with this!)
echo 3. Run: npm run dev
echo ========================================
echo.
pause
