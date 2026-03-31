import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

function SignupPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const toast = useToast()

    const { register } = useAuth()
    const navigate = useNavigate()

    // Password strength
    const getStrength = () => {
        if (!password) return { level: 0, label: '', color: '' }
        let score = 0
        if (password.length >= 6) score++
        if (password.length >= 10) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 1) return { level: 20, label: 'Weak', color: '#ef4444' }
        if (score <= 2) return { level: 40, label: 'Fair', color: '#f97316' }
        if (score <= 3) return { level: 60, label: 'Good', color: '#eab308' }
        if (score <= 4) return { level: 80, label: 'Strong', color: '#22c55e' }
        return { level: 100, label: 'Excellent', color: '#06b6d4' }
    }

    const strength = getStrength()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const result = await register(email, fullName, password)

        if (result.success) {
            toast.success('Account created! Welcome to UniGuide 🎉')
            navigate('/dashboard')
        } else {
            setError(result.error)
        }
        setIsSubmitting(false)
    }

    return (
        <div className="auth-page">
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
                        <h2>Start Your Journey Today</h2>
                        <p>Join thousands of students who've found their dream university using AI-powered recommendations.</p>
                        <div className="branding-stats">
                            <div className="brand-stat">
                                <span className="stat-num">500+</span>
                                <span className="stat-desc">Universities</span>
                            </div>
                            <div className="brand-stat">
                                <span className="stat-num">95%</span>
                                <span className="stat-desc">Accuracy</span>
                            </div>
                            <div className="brand-stat">
                                <span className="stat-num">AI</span>
                                <span className="stat-desc">Powered</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="auth-form-panel">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <h1>Create Account</h1>
                            <p>Start your university shortlisting journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">👤</span>
                                    <input
                                        type="text"
                                        className="form-input auth-input"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

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
                                        placeholder="Min. 6 characters"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {password && (
                                    <div className="password-strength">
                                        <div className="strength-bar">
                                            <div
                                                className="strength-fill"
                                                style={{ width: `${strength.level}%`, background: strength.color }}
                                            />
                                        </div>
                                        <span className="strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {error && <div className="auth-error">{error}</div>}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><span className="spinner" style={{ width: 20, height: 20 }} /> Creating Account...</>
                                ) : (
                                    'Create Account →'
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
