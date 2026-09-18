import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useEffect, lazy, Suspense } from 'react'

// Layouts
import MainLayout from '@/components/layout/MainLayout'

// Pages - Lazy loaded for performance
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Upload = lazy(() => import('@/pages/Upload'))
const Preprocessing = lazy(() => import('@/pages/Preprocessing'))
const Segmentation = lazy(() => import('@/pages/Segmentation'))
const Reconstruction = lazy(() => import('@/pages/Reconstruction'))
const Results = lazy(() => import('@/pages/Results'))
const ProgressionAnalysis = lazy(() => import('@/pages/ProgressionAnalysis'))
const Reports = lazy(() => import('@/pages/Reports'))
const Admin = lazy(() => import('@/pages/Admin'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
  </div>
)

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
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><MainLayout><Upload /></MainLayout></ProtectedRoute>} />
        <Route path="/preprocessing" element={<ProtectedRoute><MainLayout><Preprocessing /></MainLayout></ProtectedRoute>} />
        <Route path="/segmentation" element={<ProtectedRoute><MainLayout><Segmentation /></MainLayout></ProtectedRoute>} />
        <Route path="/reconstruction" element={<ProtectedRoute><MainLayout><Reconstruction /></MainLayout></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><MainLayout><Results /></MainLayout></ProtectedRoute>} />
        <Route path="/progression" element={<ProtectedRoute><MainLayout><ProgressionAnalysis /></MainLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><MainLayout><Admin /></MainLayout></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
