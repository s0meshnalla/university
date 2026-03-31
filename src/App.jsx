import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIChatWidget from './components/AIChatWidget'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import FormPage from './pages/FormPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import SOPGeneratorPage from './pages/SOPGeneratorPage'
import ComparePage from './pages/ComparePage'
import DocumentsPage from './pages/DocumentsPage'
import NotFoundPage from './pages/NotFoundPage'

function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth()
    if (isLoading) return <div className="loading-overlay"><div className="spinner" /></div>
    return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/apply" element={<ProtectedRoute><FormPage /></ProtectedRoute>} />
                    <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
                    <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
                    <Route path="/sop-generator" element={<ProtectedRoute><SOPGeneratorPage /></ProtectedRoute>} />
                    <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
                    <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
            <AIChatWidget />
        </>
    )
}

function App() {
    return (
        <Router>
            <ToastProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ToastProvider>
        </Router>
    )
}

export default App
