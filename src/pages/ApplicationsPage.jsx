import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationApi } from '../services/api'
import './ApplicationsPage.css'

function ApplicationsPage() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await applicationApi.getMyApplications()
                setApplications(response.applications)
            } catch (err) {
                console.error("Error fetching applications:", err)
                setError("Failed to load application history.")
            } finally {
                setLoading(false)
            }
        }
        fetchApplications()
    }, [])

    if (loading) return <div className="loading-spinner">Loading Applications...</div>

    return (
        <div className="applications-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Applications</h1>
                    <p>Track the status of your university applications</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {applications.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📂</div>
                        <h3>No Applications Yet</h3>
                        <p>You haven't applied to any universities yet.</p>
                        <Link to="/apply" className="btn btn-primary">
                            Start Application
                        </Link>
                    </div>
                ) : (
                    <div className="applications-list">
                        {applications.map((app) => (
                            <div key={app.id} className="application-card fade-in">
                                <div className="app-main-info">
                                    <h3>{app.university_name}</h3>
                                    <div className="app-detail">
                                        <span className="icon">🎓</span>
                                        <span>{app.program}</span>
                                    </div>
                                    <div className="app-detail">
                                        <span className="icon">🌍</span>
                                        <span>{app.country}</span>
                                    </div>
                                </div>

                                <div className="app-status-column">
                                    <div className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                                        {app.status}
                                    </div>
                                    <span className="app-date">
                                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ApplicationsPage
