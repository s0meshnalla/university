import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import FormPage from './pages/FormPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const ProtectedRoute = () => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)'
    }}>Loading...</div>

    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />

                            {/* Protected Routes */}
                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/apply" element={<FormPage />} />
                                <Route path="/recommendations" element={<RecommendationsPage />} />
                                <Route path="/applications" element={<ApplicationsPage />} />
                            </Route>
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App
