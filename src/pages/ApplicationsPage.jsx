import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './ApplicationsPage.css'

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Accepted', 'Rejected', 'Withdrawn']
const STATUS_ICONS = {
    'Applied': '📤', 'Under Review': '🔍',
    'Accepted': '🎉', 'Rejected': '❌', 'Withdrawn': '↩️'
}

function ApplicationsPage() {
    const toast = useToast()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [expandedApp, setExpandedApp] = useState(null)

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            const response = await applicationApi.getMyApplications()
            setApplications(response.applications || [])
        } catch (err) {
            toast.error('Failed to load applications.')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (appId, newStatus) => {
        try {
            await applicationApi.updateApplication(appId, { status: newStatus })
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
            toast.success(`Status updated to ${newStatus}`)
        } catch (e) { toast.error('Failed to update status') }
    }

    const deleteApp = async (appId) => {
        try {
            await applicationApi.deleteApplication(appId)
            setApplications(prev => prev.filter(a => a.id !== appId))
            toast.success('Application removed')
        } catch (e) { toast.error('Failed to delete application') }
    }

    const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter)

    // Stats
    const stats = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = applications.filter(a => a.status === s).length
        return acc
    }, {})

    if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading applications...</p></div>

    return (
        <div className="applications-page">
            <div className="container">
                <div className="apps-header fade-in">
                    <div>
                        <h1>📊 My <span className="gradient-text">Applications</span></h1>
                        <p>Track and manage your university applications</p>
                    </div>
                    <Link to="/apply" className="btn btn-primary">+ New Application</Link>
                </div>

                {/* Status Pipeline */}
                <div className="pipeline-overview card-glass fade-in stagger-1">
                    {STATUS_OPTIONS.slice(0, 4).map(status => (
                        <button
                            key={status}
                            className={`pipeline-item ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(filter === status ? 'All' : status)}
                        >
                            <span className="pipeline-icon">{STATUS_ICONS[status]}</span>
                            <span className="pipeline-count">{stats[status] || 0}</span>
                            <span className="pipeline-label">{status}</span>
                        </button>
                    ))}
                </div>

                {/* Filter pills */}
                <div className="filter-pills fade-in stagger-1">
                    <button
                        className={`filter-pill ${filter === 'All' ? 'active' : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All ({applications.length})
                    </button>
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            className={`filter-pill ${filter === s ? 'active' : ''}`}
                            onClick={() => setFilter(s)}
                        >
                            {STATUS_ICONS[s]} {s} ({stats[s] || 0})
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                {filtered.length === 0 ? (
                    <div className="empty-state card fade-in stagger-2">
                        <div className="empty-icon">📂</div>
                        <h3>{filter === 'All' ? 'No Applications Yet' : `No ${filter} Applications`}</h3>
                        <p>
                            {filter === 'All'
                                ? "You haven't applied to any universities yet."
                                : `No applications with status "${filter}".`}
                        </p>
                        {filter === 'All' && (
                            <Link to="/apply" className="btn btn-primary">Start Application</Link>
                        )}
                    </div>
                ) : (
                    <div className="apps-list fade-in stagger-2">
                        {filtered.map(app => (
                            <div key={app.id} className="app-card">
                                <div className="app-card-main" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                                    <div className="app-info-section">
                                        <h3 className="app-uni-name">{app.university_name}</h3>
                                        <div className="app-meta">
                                            <span>🎓 {app.program}</span>
                                            <span>🌍 {app.country}</span>
                                            {app.deadline && <span>📅 {app.deadline}</span>}
                                        </div>
                                    </div>
                                    <div className="app-right-section">
                                        <div className={`app-status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                                            {STATUS_ICONS[app.status]} {app.status}
                                        </div>
                                        {app.document_progress && (
                                            <div className="app-doc-progress">
                                                <div className="mini-progress-bar">
                                                    <div className="mini-progress-fill" style={{ width: `${app.document_progress.percentage}%` }} />
                                                </div>
                                                <span className="mini-progress-text">Docs: {app.document_progress.percentage}%</span>
                                            </div>
                                        )}
                                        <span className="app-date">{new Date(app.applied_at).toLocaleDateString()}</span>
                                        <span className="expand-indicator">{expandedApp === app.id ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {expandedApp === app.id && (
                                    <div className="app-expanded">
                                        <div className="expanded-section">
                                            <h4>Update Status</h4>
                                            <div className="status-buttons">
                                                {STATUS_OPTIONS.map(s => (
                                                    <button
                                                        key={s}
                                                        className={`status-btn ${app.status === s ? 'current' : ''}`}
                                                        onClick={() => updateStatus(app.id, s)}
                                                    >
                                                        {STATUS_ICONS[s]} {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="expanded-actions">
                                            <Link to="/documents" className="btn btn-secondary btn-sm">📋 Documents</Link>
                                            <Link to="/sop-generator" className="btn btn-secondary btn-sm">✍️ Generate SOP</Link>
                                            <button className="btn btn-sm app-delete-btn" onClick={() => deleteApp(app.id)}>🗑️ Remove</button>
                                        </div>

                                        {app.notes && <div className="app-notes"><strong>Notes:</strong> {app.notes}</div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ApplicationsPage
