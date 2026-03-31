import { useState, useEffect } from 'react'
import { documentApi, applicationApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './DocumentsPage.css'

function DocumentsPage() {
    const toast = useToast()
    const [applications, setApplications] = useState([])
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState(null)
    const [newDocName, setNewDocName] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [appRes, docRes] = await Promise.all([
                applicationApi.getMyApplications(),
                documentApi.getChecklist()
            ])
            setApplications(appRes.applications || [])
            setDocuments(docRes.documents || [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const updateDocStatus = async (docId, newStatus) => {
        try {
            await documentApi.updateDocument(docId, { status: newStatus })
            setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d))
            toast.success(`Document marked as ${newStatus}`)
        } catch (e) { toast.error('Failed to update document') }
    }

    const addCustomDoc = async () => {
        if (!newDocName.trim()) return
        try {
            await documentApi.addDocument({
                application_id: selectedApp,
                document_name: newDocName
            })
            setNewDocName('')
            loadData()
            toast.success('Document added')
        } catch (e) { toast.error('Failed to add document') }
    }

    const deleteDoc = async (docId) => {
        try {
            await documentApi.deleteDocument(docId)
            setDocuments(prev => prev.filter(d => d.id !== docId))
            toast.success('Document removed')
        } catch (e) { toast.error('Failed to remove document') }
    }

    const filteredDocs = selectedApp
        ? documents.filter(d => d.application_id === selectedApp)
        : documents

    const totalDocs = filteredDocs.length
    const completedDocs = filteredDocs.filter(d => d.status === 'ready' || d.status === 'submitted').length
    const progressPct = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

    const statusColors = { pending: 'status-pending', ready: 'status-ready', submitted: 'status-submitted' }
    const statusIcons = { pending: '⏳', ready: '✅', submitted: '📤' }

    if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading documents...</p></div>

    return (
        <div className="documents-page">
            <div className="container">
                <div className="docs-header fade-in">
                    <h1>📋 Document <span className="gradient-text">Tracker</span></h1>
                    <p>Track required documents for each university application</p>
                </div>

                {/* Filter by Application */}
                <div className="docs-filter card-glass fade-in stagger-1">
                    <div className="filter-row">
                        <select
                            className="form-select"
                            value={selectedApp || ''}
                            onChange={(e) => setSelectedApp(e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">All Applications</option>
                            {applications.map(app => (
                                <option key={app.id} value={app.id}>
                                    {app.university_name} — {app.program}
                                </option>
                            ))}
                        </select>
                        <div className="progress-summary">
                            <span className="progress-text">{completedDocs}/{totalDocs} complete</span>
                            <div className="progress-bar" style={{ width: '200px' }}>
                                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className="progress-pct">{progressPct}%</span>
                        </div>
                    </div>
                </div>

                {/* Document List */}
                {filteredDocs.length === 0 ? (
                    <div className="docs-empty card fade-in stagger-2">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📂</span>
                        <h3>No Documents Yet</h3>
                        <p>Apply to universities first, and a document checklist will be auto-generated for each application.</p>
                    </div>
                ) : (
                    <div className="docs-list fade-in stagger-2">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className={`doc-item ${statusColors[doc.status]}`}>
                                <div className="doc-info">
                                    <span className="doc-icon">{statusIcons[doc.status]}</span>
                                    <span className="doc-name">{doc.document_name}</span>
                                </div>
                                <div className="doc-actions">
                                    <div className="status-toggle">
                                        {['pending', 'ready', 'submitted'].map(s => (
                                            <button
                                                key={s}
                                                className={`toggle-btn ${doc.status === s ? 'active' : ''}`}
                                                onClick={() => updateDocStatus(doc.id, s)}
                                                title={s}
                                            >
                                                {statusIcons[s]}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="doc-delete" onClick={() => deleteDoc(doc.id)}>×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Custom Document */}
                <div className="add-doc-section card-glass fade-in stagger-3">
                    <h4>Add Custom Document</h4>
                    <div className="add-doc-row">
                        <input
                            className="form-input"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            placeholder="e.g. Portfolio, Writing Sample..."
                            onKeyDown={(e) => e.key === 'Enter' && addCustomDoc()}
                        />
                        <button className="btn btn-primary" onClick={addCustomDoc}>+ Add</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocumentsPage
