import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

function DashboardPage() {
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const response = await dashboardApi.getData()
            setData(response)
        } catch (error) {
            console.error('Dashboard error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner" />
                <p>Loading your dashboard...</p>
            </div>
        )
    }

    const score = data?.predicted_score || 0
    const breakdown = data?.score_breakdown || {}
    const appStats = data?.application_stats || { total: 0, by_status: {} }
    const completeness = data?.profile_completeness || 0
    const timeline = data?.status_timeline || {}
    const upcomingDeadlines = data?.upcoming_deadlines || []
    const actionRecommendations = data?.action_recommendations || []
    const maxTimelineValue = Math.max(1, ...Object.values(timeline))

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Banner */}
                <div className="welcome-banner fade-in">
                    <div className="welcome-content">
                        <h1>Welcome back, <span className="gradient-text">{data?.user?.full_name || 'Student'}</span> 👋</h1>
                        <p>Here's your university application overview</p>
                    </div>
                    <div className="welcome-actions">
                        <Link to="/apply" className="btn btn-primary">New Search 🔍</Link>
                        <Link to="/sop-generator" className="btn btn-secondary">Write SOP ✍️</Link>
                    </div>
                </div>

                {!data?.profile_exists ? (
                    <div className="no-profile-card card fade-in stagger-1">
                        <div className="no-profile-icon">📋</div>
                        <h2>Complete Your Profile</h2>
                        <p>Set up your academic profile to get AI-powered university recommendations and admission score predictions.</p>
                        <Link to="/profile" className="btn btn-accent btn-lg">Create Profile →</Link>
                    </div>
                ) : (
                    <div className="dashboard-grid fade-in stagger-1">
                        {/* Score Ring Card */}
                        <div className="score-ring-card card-glass">
                            <h3>Admission Score</h3>
                            <div className="score-ring-container">
                                <svg className="score-ring" viewBox="0 0 120 120">
                                    <circle className="score-ring-bg" cx="60" cy="60" r="52" />
                                    <circle
                                        className="score-ring-fill"
                                        cx="60" cy="60" r="52"
                                        style={{
                                            strokeDasharray: `${(score / 100) * 327} 327`,
                                        }}
                                    />
                                </svg>
                                <div className="score-ring-value">
                                    <span className="score-number">{Math.round(score)}</span>
                                    <span className="score-label">/100</span>
                                </div>
                            </div>
                            <div className={`score-tier tier-${score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'}`}>
                                {score >= 80 ? '🌟 Strong Profile' : score >= 60 ? '💪 Competitive' : '📈 Developing'}
                            </div>
                            <Link to="/apply" className="btn btn-accent btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
                                Find Universities →
                            </Link>
                        </div>

                        {/* Score Breakdown */}
                        <div className="breakdown-card card-glass">
                            <h3>Score Breakdown</h3>
                            <div className="breakdown-bars">
                                {Object.entries(breakdown).map(([key, value]) => {
                                    const labels = {
                                        gpa: 'GPA', gre_verbal: 'GRE Verbal', gre_quant: 'GRE Quant',
                                        english: 'English', research: 'Research', work_experience: 'Experience'
                                    }
                                    return (
                                        <div key={key} className="breakdown-item">
                                            <div className="breakdown-header">
                                                <span className="breakdown-label">{labels[key] || key}</span>
                                                <span className="breakdown-value">{value}%</span>
                                            </div>
                                            <div className="breakdown-bar">
                                                <div
                                                    className={`breakdown-fill ${value >= 75 ? 'fill-high' : value >= 50 ? 'fill-mid' : 'fill-low'}`}
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Link to="/profile" className="edit-profile-link">Edit Profile →</Link>
                        </div>

                        {/* Applications Pipeline */}
                        <div className="pipeline-card card-glass">
                            <div className="pipeline-header">
                                <h3>Applications</h3>
                                <Link to="/applications" className="view-all-link">View All →</Link>
                            </div>
                            {appStats.total === 0 ? (
                                <div className="empty-pipeline">
                                    <span className="empty-icon">📭</span>
                                    <p>No applications yet</p>
                                    <Link to="/apply" className="btn btn-primary btn-sm">Start Applying</Link>
                                </div>
                            ) : (
                                <>
                                    <div className="pipeline-stats">
                                        {['Applied', 'Under Review', 'Accepted', 'Rejected'].map(status => (
                                            <div key={status} className={`pipeline-stat stat-${status.toLowerCase().replace(' ', '-')}`}>
                                                <span className="stat-count">{appStats.by_status[status] || 0}</span>
                                                <span className="stat-label">{status}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="recent-apps">
                                        {data?.recent_applications?.slice(0, 3).map(app => (
                                            <div key={app.id} className="recent-app-item">
                                                <div className="app-info">
                                                    <span className="app-uni">{app.university_name}</span>
                                                    <span className="app-program">{app.program}</span>
                                                </div>
                                                <span className={`status-dot status-${app.status.toLowerCase().replace(' ', '-')}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Status Timeline */}
                        <div className="timeline-card card-glass">
                            <h3>Status Movement Timeline</h3>
                            <div className="timeline-bars">
                                {['Applied', 'Under Review', 'Accepted', 'Rejected', 'Withdrawn'].map((status) => {
                                    const value = timeline[status] || 0
                                    return (
                                        <div key={status} className="timeline-row">
                                            <span className="timeline-status">{status}</span>
                                            <div className="timeline-bar-wrap">
                                                <div className="timeline-bar" style={{ width: `${(value / maxTimelineValue) * 100}%` }} />
                                            </div>
                                            <span className="timeline-value">{value}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <p className="timeline-note">Shows total status transitions recorded across your applications.</p>
                        </div>

                        {/* Deadlines & Recommendations */}
                        <div className="insights-card card-glass">
                            <h3>Priority Inbox</h3>
                            {upcomingDeadlines.length > 0 ? (
                                <div className="deadline-list">
                                    {upcomingDeadlines.slice(0, 4).map((item) => (
                                        <div key={item.application_id} className={`deadline-item ${item.days_left < 0 ? 'overdue' : item.days_left <= 7 ? 'urgent' : ''}`}>
                                            <div>
                                                <span className="deadline-uni">{item.university_name}</span>
                                                <span className="deadline-program">{item.program}</span>
                                            </div>
                                            <span className="deadline-days">{item.days_left < 0 ? `${Math.abs(item.days_left)}d overdue` : `${item.days_left}d left`}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-saved">No urgent deadlines in the next 3 weeks.</p>
                            )}

                            {actionRecommendations.length > 0 && (
                                <div className="next-actions">
                                    <h4>Next Best Actions</h4>
                                    <ul>
                                        {actionRecommendations.slice(0, 3).map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-card card-glass">
                            <h3>Quick Actions</h3>
                            <div className="actions-grid">
                                <Link to="/apply" className="action-item">
                                    <span className="action-icon">🔍</span>
                                    <span>Find Universities</span>
                                </Link>
                                <Link to="/sop-generator" className="action-item">
                                    <span className="action-icon">✍️</span>
                                    <span>Generate SOP</span>
                                </Link>
                                <Link to="/documents" className="action-item">
                                    <span className="action-icon">📋</span>
                                    <span>Documents</span>
                                </Link>
                                <Link to="/compare" className="action-item">
                                    <span className="action-icon">⚖️</span>
                                    <span>Compare</span>
                                </Link>
                                <Link to="/applications" className="action-item">
                                    <span className="action-icon">📊</span>
                                    <span>Applications</span>
                                </Link>
                                <Link to="/profile" className="action-item">
                                    <span className="action-icon">👤</span>
                                    <span>Edit Profile</span>
                                </Link>
                            </div>
                        </div>

                        {/* Profile Completeness */}
                        <div className="completeness-card card-glass">
                            <h3>Profile Completeness</h3>
                            <div className="completeness-ring-container">
                                <svg className="completeness-ring" viewBox="0 0 100 100">
                                    <circle className="comp-ring-bg" cx="50" cy="50" r="42" />
                                    <circle
                                        className="comp-ring-fill"
                                        cx="50" cy="50" r="42"
                                        style={{ strokeDasharray: `${(completeness / 100) * 264} 264` }}
                                    />
                                </svg>
                                <div className="comp-ring-value">{completeness}%</div>
                            </div>
                            {completeness < 100 && (
                                <Link to="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                                    Complete Profile
                                </Link>
                            )}
                        </div>

                        {/* Saved Universities */}
                        <div className="saved-card card-glass">
                            <div className="saved-header">
                                <h3>Saved Universities</h3>
                                <span className="saved-count">{data?.saved_count || 0}</span>
                            </div>
                            {data?.saved_universities?.length > 0 ? (
                                <div className="saved-list">
                                    {data.saved_universities.slice(0, 4).map(s => (
                                        <div key={s.id} className="saved-item">
                                            <span className="saved-name">{s.university_data?.name}</span>
                                            <span className="saved-country">{s.university_data?.country}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-saved">No saved universities yet. Save them from your recommendations!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardPage
