import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import CustomSelect from '../components/CustomSelect'
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
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('recent')
    const [expandedApp, setExpandedApp] = useState(null)
    const [noteDrafts, setNoteDrafts] = useState({})
    const [savingNotes, setSavingNotes] = useState({})

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

    const parseDeadline = (deadline) => {
        if (!deadline) return null
        const parsed = new Date(deadline)
        return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    const getDeadlineMeta = (app) => {
        const deadlineDate = parseDeadline(app.deadline)
        if (!deadlineDate) {
            return { label: 'No deadline', tone: 'muted', daysLeft: Number.POSITIVE_INFINITY }
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const due = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate())
        const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysLeft < 0) {
            return { label: `${Math.abs(daysLeft)}d overdue`, tone: 'critical', daysLeft }
        }
        if (daysLeft <= 7) {
            return { label: `${daysLeft}d left`, tone: 'urgent', daysLeft }
        }
        if (daysLeft <= 21) {
            return { label: `${daysLeft}d left`, tone: 'soon', daysLeft }
        }
        return { label: `${daysLeft}d left`, tone: 'on-track', daysLeft }
    }

    const saveNotes = async (appId) => {
        const app = applications.find((item) => item.id === appId)
        if (!app) return

        const draft = (noteDrafts[appId] ?? app.notes ?? '').trim()
        const normalizedCurrent = (app.notes ?? '').trim()
        if (draft === normalizedCurrent) return

        setSavingNotes((prev) => ({ ...prev, [appId]: true }))
        try {
            await applicationApi.updateApplication(appId, { notes: draft || null })
            setApplications((prev) => prev.map((item) => (
                item.id === appId ? { ...item, notes: draft || null } : item
            )))
            toast.success('Notes updated')
        } catch (error) {
            toast.error('Failed to update notes')
        } finally {
            setSavingNotes((prev) => ({ ...prev, [appId]: false }))
        }
    }

    const filtered = (filter === 'All' ? applications : applications.filter(a => a.status === filter))
        .filter((app) => {
            const query = searchTerm.trim().toLowerCase()
            if (!query) return true
            const haystack = `${app.university_name} ${app.program} ${app.country}`.toLowerCase()
            return haystack.includes(query)
        })
        .sort((a, b) => {
            if (sortBy === 'oldest') {
                return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
            }
            if (sortBy === 'deadline') {
                return getDeadlineMeta(a).daysLeft - getDeadlineMeta(b).daysLeft
            }
            if (sortBy === 'status') {
                return a.status.localeCompare(b.status)
            }
            return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        })

    // Stats
    const stats = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = applications.filter(a => a.status === s).length
        return acc
    }, {})

    const deadlineStats = applications.reduce((acc, app) => {
        const meta = getDeadlineMeta(app)
        if (meta.tone === 'critical') acc.overdue += 1
        if (meta.tone === 'urgent') acc.thisWeek += 1
        if (meta.tone === 'soon') acc.next3Weeks += 1
        return acc
    }, { overdue: 0, thisWeek: 0, next3Weeks: 0 })

    const notifications = [
        ...applications
            .filter((app) => getDeadlineMeta(app).tone === 'critical')
            .slice(0, 3)
            .map((app) => ({
                id: `deadline-${app.id}`,
                tone: 'critical',
                message: `${app.university_name}: deadline overdue`,
            })),
        ...applications
            .filter((app) => (app.document_progress?.percentage ?? 0) < 50)
            .slice(0, 3)
            .map((app) => ({
                id: `docs-${app.id}`,
                tone: 'info',
                message: `${app.university_name}: documents only ${app.document_progress?.percentage ?? 0}% ready`,
            })),
    ]

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

                <div className="apps-controls fade-in stagger-1">
                    <input
                        className="apps-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by university, program, or country"
                    />
                    <CustomSelect
                        className="apps-sort"
                        value={sortBy}
                        onChange={(value) => setSortBy(value)}
                        options={[
                            { value: 'recent', label: 'Sort: Most Recent' },
                            { value: 'oldest', label: 'Sort: Oldest First' },
                            { value: 'deadline', label: 'Sort: Deadline Priority' },
                            { value: 'status', label: 'Sort: Status' },
                        ]}
                    />
                </div>

                <div className="deadline-stats-strip fade-in stagger-1">
                    <div className="deadline-stat-item overdue">
                        <span className="deadline-stat-label">Overdue</span>
                        <span className="deadline-stat-value">{deadlineStats.overdue}</span>
                    </div>
                    <div className="deadline-stat-item urgent">
                        <span className="deadline-stat-label">Due This Week</span>
                        <span className="deadline-stat-value">{deadlineStats.thisWeek}</span>
                    </div>
                    <div className="deadline-stat-item soon">
                        <span className="deadline-stat-label">Due In 3 Weeks</span>
                        <span className="deadline-stat-value">{deadlineStats.next3Weeks}</span>
                    </div>
                </div>

                {notifications.length > 0 && (
                    <div className="apps-alerts card-glass fade-in stagger-1">
                        <h3>Action Alerts</h3>
                        <div className="alerts-list">
                            {notifications.map((item) => (
                                <div key={item.id} className={`alert-item alert-${item.tone}`}>
                                    {item.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            (() => {
                                const deadlineMeta = getDeadlineMeta(app)
                                return (
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
                                                <div className={`deadline-chip deadline-${deadlineMeta.tone}`}>{deadlineMeta.label}</div>
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

                                                {Array.isArray(app.timeline) && app.timeline.length > 0 && (
                                                    <div className="app-timeline">
                                                        <h4>Timeline</h4>
                                                        <div className="timeline-list">
                                                            {app.timeline.map((event) => (
                                                                <div key={event.id} className="timeline-item">
                                                                    <span className="timeline-dot" />
                                                                    <div className="timeline-content">
                                                                        <div className="timeline-main">
                                                                            {event.from_status && event.to_status
                                                                                ? `${event.from_status} -> ${event.to_status}`
                                                                                : (event.note || event.event_type)}
                                                                        </div>
                                                                        <div className="timeline-time">{new Date(event.created_at).toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="app-notes-editor">
                                                    <label htmlFor={`notes-${app.id}`}>Notes</label>
                                                    <textarea
                                                        id={`notes-${app.id}`}
                                                        rows={3}
                                                        value={noteDrafts[app.id] ?? app.notes ?? ''}
                                                        onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [app.id]: e.target.value }))}
                                                        placeholder="Add interviewer details, portal links, scholarship notes, and next steps..."
                                                    />
                                                    <div className="notes-actions">
                                                        <button
                                                            className="btn btn-sm btn-accent"
                                                            onClick={() => saveNotes(app.id)}
                                                            disabled={!!savingNotes[app.id]}
                                                        >
                                                            {savingNotes[app.id] ? 'Saving...' : 'Save Notes'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ApplicationsPage
