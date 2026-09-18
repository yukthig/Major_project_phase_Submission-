#!/usr/bin/env node

/**
 * NeuroVision AI Platform - Frontend File Generator
 * This script generates all necessary frontend files for the complete application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

// Helper function to create directory
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
};

// Helper function to write file
const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log(`✓ Created: ${filePath}`);
};

console.log('\n🚀 Generating NeuroVision AI Platform Frontend Files...\n');

// Create main entry files
writeFile(path.join(srcDir, 'main.tsx'), `
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
`);

writeFile(path.join(srcDir, 'App.tsx'), `
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useEffect } from 'react'

// Layouts
import MainLayout from '@/components/layout/MainLayout'

// Pages
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Upload from '@/pages/Upload'
import Preprocessing from '@/pages/Preprocessing'
import Segmentation from '@/pages/Segmentation'
import Reconstruction from '@/pages/Reconstruction'
import Results from '@/pages/Results'
import Reports from '@/pages/Reports'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function App() {
  const { checkAuth } = useAuthStore()
  const { darkMode } = useUIStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><MainLayout><Upload /></MainLayout></ProtectedRoute>} />
      <Route path="/preprocessing" element={<ProtectedRoute><MainLayout><Preprocessing /></MainLayout></ProtectedRoute>} />
      <Route path="/segmentation" element={<ProtectedRoute><MainLayout><Segmentation /></MainLayout></ProtectedRoute>} />
      <Route path="/reconstruction" element={<ProtectedRoute><MainLayout><Reconstruction /></MainLayout></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><MainLayout><Results /></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><MainLayout><Admin /></MainLayout></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
`);

console.log('\n✅ Core files created successfully!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('\n🎉 The complete application structure is ready!');
