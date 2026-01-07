import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
    const location = useLocation()
    const { user, logout } = useAuth()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Close dropdown when location changes
    useEffect(() => {
        setIsDropdownOpen(false)
    }, [location])

    // Get user initial
    const initial = user?.email ? user.email[0].toUpperCase() : 'U'

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🎓</span>
                    <span className="logo-text">Uni<span className="gradient-text">Guide</span></span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    {user && (
                        <Link
                            to="/apply"
                            className={`nav-link ${location.pathname === '/apply' ? 'active' : ''}`}
                        >
                            Apply Now
                        </Link>
                    )}
                </div>

                <div className="navbar-auth">
                    {user ? (
                        <div className="profile-dropdown-container">
                            <button
                                className="profile-avatar-btn"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {initial}
                            </button>

                            {isDropdownOpen && (
                                <div className="profile-dropdown-menu">
                                    <div className="dropdown-user-info">
                                        <span className="dropdown-email" title={user.email}>{user.email}</span>
                                    </div>
                                    <Link to="/profile" className="dropdown-item">
                                        <span>👤</span> Profile
                                    </Link>
                                    <Link to="/applications" className="dropdown-item">
                                        <span>📂</span> My Applications
                                    </Link>
                                    <button onClick={logout} className="dropdown-item">
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/login" className="nav-link">
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-sm navbar-cta">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
