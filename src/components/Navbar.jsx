import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
    const location = useLocation()
    const { user, logout } = useAuth()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        setIsDropdownOpen(false)
        setIsMobileOpen(false)
    }, [location])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const initial = user?.email ? user.email[0].toUpperCase() : 'U'
    const isActive = (path) => location.pathname === path ? 'active' : ''

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container navbar-container">
                <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
                    <span className="logo-icon">🎓</span>
                    <span className="logo-text">Uni<span className="gradient-text">Guide</span></span>
                </Link>

                {/* Mobile Hamburger */}
                <button className="mobile-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                    <span className={`hamburger ${isMobileOpen ? 'open' : ''}`}>
                        <span /><span /><span />
                    </span>
                </button>

                <div className={`navbar-center ${isMobileOpen ? 'mobile-open' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                    {user && (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
                            <Link to="/apply" className={`nav-link ${isActive('/apply')}`}>Find Universities</Link>
                            <Link to="/sop-generator" className={`nav-link ${isActive('/sop-generator')}`}>SOP</Link>
                            <Link to="/applications" className={`nav-link ${isActive('/applications')}`}>Applications</Link>
                        </>
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
                                    <Link to="/dashboard" className="dropdown-item">
                                        <span>📊</span> Dashboard
                                    </Link>
                                    <Link to="/profile" className="dropdown-item">
                                        <span>👤</span> Profile
                                    </Link>
                                    <Link to="/applications" className="dropdown-item">
                                        <span>📂</span> Applications
                                    </Link>
                                    <Link to="/documents" className="dropdown-item">
                                        <span>📋</span> Documents
                                    </Link>
                                    <Link to="/compare" className="dropdown-item">
                                        <span>⚖️</span> Compare
                                    </Link>
                                    <div className="dropdown-divider" />
                                    <button onClick={logout} className="dropdown-item dropdown-logout">
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/login" className="nav-link">Sign In</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm navbar-cta">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
