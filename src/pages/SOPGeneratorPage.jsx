import { useState, useEffect } from 'react'
import { sopApi, applicationApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './SOPGeneratorPage.css'

function SOPGeneratorPage() {
    const toast = useToast()
    const [university, setUniversity] = useState('')
    const [program, setProgram] = useState('')
    const [tone, setTone] = useState('balanced')
    const [additionalPoints, setAdditionalPoints] = useState('')
    const [generating, setGenerating] = useState(false)
    const [currentDraft, setCurrentDraft] = useState(null)
    const [drafts, setDrafts] = useState([])
    const [showDrafts, setShowDrafts] = useState(false)
    const [savedUniversities, setSavedUniversities] = useState([])

    useEffect(() => {
        loadDrafts()
        loadSavedUniversities()
    }, [])

    const loadDrafts = async () => {
        try {
            const response = await sopApi.getDrafts()
            setDrafts(response.drafts || [])
        } catch (e) { console.error('Error loading drafts:', e) }
    }

    const loadSavedUniversities = async () => {
        try {
            const response = await applicationApi.getSavedUniversities()
            setSavedUniversities(response.universities || [])
        } catch (e) { console.error(e) }
    }

    const handleGenerate = async () => {
        if (!university.trim() || !program.trim()) {
            toast.warning('Please enter university name and program.')
            return
        }
        setGenerating(true)
        try {
            const response = await sopApi.generate(university, program, tone, additionalPoints)
            setCurrentDraft(response.draft)
            toast.success('SOP draft generated successfully!')
            loadDrafts()
        } catch (error) {
            toast.error('Failed to generate SOP. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    const handleSaveDraft = async () => {
        if (!currentDraft) return
        try {
            await sopApi.updateDraft(currentDraft.id, currentDraft.content)
            toast.success('Draft saved!')
            loadDrafts()
        } catch (e) {
            toast.error('Failed to save draft.')
        }
    }

    const handleDeleteDraft = async (id) => {
        try {
            await sopApi.deleteDraft(id)
            toast.success('Draft deleted.')
            if (currentDraft?.id === id) setCurrentDraft(null)
            loadDrafts()
        } catch (e) { toast.error('Failed to delete draft.') }
    }

    const copyToClipboard = () => {
        if (currentDraft?.content) {
            navigator.clipboard.writeText(currentDraft.content)
            toast.success('Copied to clipboard!')
        }
    }

    const wordCount = currentDraft?.content?.split(/\s+/).filter(Boolean).length || 0

    return (
        <div className="sop-page">
            <div className="container">
                <div className="sop-header fade-in">
                    <h1>✍️ SOP <span className="gradient-text">Generator</span></h1>
                    <p>Generate AI-powered Statement of Purpose drafts tailored to your profile</p>
                </div>

                <div className="sop-layout">
                    {/* Input Panel */}
                    <div className="sop-input-panel card-glass fade-in stagger-1">
                        <h3>Configuration</h3>

                        {savedUniversities.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Quick Select (from saved)</label>
                                <select
                                    className="form-select"
                                    onChange={(e) => {
                                        const uni = savedUniversities.find(s => s.id === parseInt(e.target.value))
                                        if (uni) {
                                            setUniversity(uni.university_data.name || '')
                                            setProgram(uni.university_data.program || '')
                                        }
                                    }}
                                    defaultValue=""
                                >
                                    <option value="">Select saved university...</option>
                                    {savedUniversities.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.university_data.name} — {s.university_data.program}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">University Name *</label>
                            <input
                                className="form-input"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                placeholder="e.g. Stanford University"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Program *</label>
                            <input
                                className="form-input"
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                                placeholder="e.g. MS in Computer Science"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Writing Tone</label>
                            <div className="tone-options">
                                {['academic', 'personal', 'balanced'].map(t => (
                                    <button
                                        key={t}
                                        className={`tone-btn ${tone === t ? 'active' : ''}`}
                                        onClick={() => setTone(t)}
                                    >
                                        {t === 'academic' ? '🎓' : t === 'personal' ? '💭' : '⚖️'} {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Additional Points (optional)</label>
                            <textarea
                                className="form-input form-textarea"
                                rows={3}
                                value={additionalPoints}
                                onChange={(e) => setAdditionalPoints(e.target.value)}
                                placeholder="Research interests, specific professors, career goals..."
                            />
                        </div>

                        <button
                            className="btn btn-accent btn-lg"
                            style={{ width: '100%' }}
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? (
                                <><span className="spinner" style={{ width: 20, height: 20 }} /> Generating...</>
                            ) : (
                                '🚀 Generate SOP'
                            )}
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '0.75rem' }}
                            onClick={() => setShowDrafts(!showDrafts)}
                        >
                            📂 My Drafts ({drafts.length})
                        </button>

                        {showDrafts && drafts.length > 0 && (
                            <div className="drafts-list">
                                {drafts.map(d => (
                                    <div key={d.id} className="draft-item" onClick={() => setCurrentDraft(d)}>
                                        <div className="draft-info">
                                            <span className="draft-uni">{d.university_name}</span>
                                            <span className="draft-meta">v{d.version} · {d.tone}</span>
                                        </div>
                                        <button className="draft-delete" onClick={(e) => { e.stopPropagation(); handleDeleteDraft(d.id) }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Output Panel */}
                    <div className="sop-output-panel card-glass fade-in stagger-2">
                        {currentDraft ? (
                            <>
                                <div className="output-header">
                                    <div>
                                        <h3>{currentDraft.university_name}</h3>
                                        <span className="output-meta">{currentDraft.program} · {currentDraft.tone} tone · v{currentDraft.version}</span>
                                    </div>
                                    <div className="output-actions">
                                        <span className="word-count">{wordCount} words</span>
                                        <button className="btn btn-sm btn-secondary" onClick={copyToClipboard}>📋 Copy</button>
                                        <button className="btn btn-sm btn-primary" onClick={handleSaveDraft}>💾 Save</button>
                                    </div>
                                </div>
                                <textarea
                                    className="sop-textarea"
                                    value={currentDraft.content}
                                    onChange={(e) => setCurrentDraft({ ...currentDraft, content: e.target.value })}
                                />
                            </>
                        ) : (
                            <div className="output-empty">
                                <span className="output-empty-icon">📝</span>
                                <h3>Your SOP will appear here</h3>
                                <p>Configure your preferences and click "Generate SOP" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SOPGeneratorPage
