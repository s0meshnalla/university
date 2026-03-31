import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-icon">🎓</span>
                            <span className="logo-text">Uni<span className="gradient-text">Guide</span></span>
                        </Link>
                        <p className="footer-tagline">
                            AI-powered university shortlisting and application management platform for international students.
                        </p>
                        <div className="footer-badge">
                            <span>🤖</span> Powered by AI & Machine Learning
                        </div>
                    </div>

                    <div className="footer-links-group">
                        <h4>Features</h4>
                        <ul>
                            <li><Link to="/apply">University Recommendations</Link></li>
                            <li><Link to="/sop-generator">SOP Generator</Link></li>
                            <li><Link to="/compare">Compare Universities</Link></li>
                            <li><Link to="/documents">Document Tracker</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Account</h4>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/profile">My Profile</Link></li>
                            <li><Link to="/applications">Applications</Link></li>
                            <li><Link to="/login">Sign In</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Technology</h4>
                        <ul>
                            <li><span>React + Vite</span></li>
                            <li><span>FastAPI + PostgreSQL</span></li>
                            <li><span>Random Forest ML</span></li>
                            <li><span>OpenRouter LLM</span></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} UniGuide. Built as an Academic Project.</p>
                    <div className="footer-bottom-links">
                        <span>Made with ❤️ and AI</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
