import { Link } from 'react-router-dom'

function NotFoundPage() {
    return (
        <div style={{
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
        }}>
            <div style={{ fontSize: '6rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>🌌</div>
            <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                4<span className="gradient-text">0</span>4
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
                Lost in the universe? This page doesn't exist. Let's get you back on track.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/" className="btn btn-primary btn-lg">Go Home 🏠</Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">Dashboard 📊</Link>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    )
}

export default NotFoundPage
