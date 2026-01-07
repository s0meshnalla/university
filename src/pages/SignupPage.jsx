import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './FormPage.css' // Reuse form styles

function SignupPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const result = await register(email, fullName, password)

        if (result.success) {
            navigate('/')
        } else {
            setError(result.error)
        }
        setIsSubmitting(false)
    }

    return (
        <div className="form-page">
            <div className="container">
                <div className="form-wrapper" style={{ maxWidth: '400px' }}>
                    <div className="form-header">
                        <h1>Create Account</h1>
                        <p>Start your university shortlisting journey</p>
                    </div>

                    <div className="form-content card">
                        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Choose a strong password"
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <div className="form-error-box">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isSubmitting}
                                style={{ marginTop: 'var(--space-4)' }}
                            >
                                {isSubmitting ? 'Create Account' : 'Sign Up'}
                            </button>
                        </form>

                        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--primary-400)' }}>
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
