import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/dashboard'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const result = await login(email, password)

        if (result.success) {
            navigate(from, { replace: true })
        } else {
            setError(result.error)
        }
        setIsSubmitting(false)
    }

    return (
        <div className="auth-page">
            {/* Floating particles */}
            <div className="auth-particles">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`particle particle-${i + 1}`} />
                ))}
            </div>

            <div className="auth-container">
                {/* Branding Panel */}
                <div className="auth-branding">
                    <div className="branding-content">
                        <div className="branding-logo">
                            <span className="branding-icon">🎓</span>
                            <span className="branding-title">Uni<span>Guide</span></span>
                        </div>
                        <h2>Your AI-Powered University Advisor</h2>
                        <p>Get personalized university recommendations, AI-written SOPs, and application tracking — all in one place.</p>
                        <div className="branding-features">
                            <div className="brand-feature"><span>🤖</span> AI Recommendations</div>
                            <div className="brand-feature"><span>✍️</span> SOP Generator</div>
                            <div className="brand-feature"><span>📊</span> Score Analytics</div>
                            <div className="brand-feature"><span>📋</span> Document Tracker</div>
                        </div>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="auth-form-panel">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <h1>Welcome Back</h1>
                            <p>Sign in to continue your journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        className="form-input auth-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input auth-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="auth-error">{error}</div>}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><span className="spinner" style={{ width: 20, height: 20 }} /> Signing In...</>
                                ) : (
                                    'Sign In →'
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Don't have an account?{' '}
                            <Link to="/signup">Create one</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
