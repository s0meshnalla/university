import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { applicationApi } from '../services/api'
import { resolveUniversityApplyTarget } from '../utils/universityLinks'
import './ComparePage.css'

function ComparePage() {
    const navigate = useNavigate()
    const [saved, setSaved] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSaved()
        // Check sessionStorage for compare list
        const compareList = JSON.parse(sessionStorage.getItem('compareList') || '[]')
        if (compareList.length > 0) setSelected(compareList)
    }, [])

    useEffect(() => {
        sessionStorage.setItem('compareList', JSON.stringify(selected))
    }, [selected])

    const loadSaved = async () => {
        try {
            const response = await applicationApi.getSavedUniversities()
            setSaved(response.universities || [])
            // If no compare list, auto-select first 2-3 saved
            const compareList = JSON.parse(sessionStorage.getItem('compareList') || '[]')
            if (compareList.length === 0 && response.universities?.length >= 2) {
                const autoSelected = response.universities.slice(0, Math.min(3, response.universities.length)).map(s => s.university_data)
                setSelected(autoSelected)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const toggleSelect = (uniData) => {
        setSelected(prev => {
            const exists = prev.find(u => u.name === uniData.name)
            if (exists) return prev.filter(u => u.name !== uniData.name)
            if (prev.length >= 3) return prev
            return [...prev, uniData]
        })
    }

    const getBarWidth = (value, max) => `${Math.min((value / max) * 100, 100)}%`
    const getBestValue = (key, higher = true) => {
        const values = selected.map(u => u[key]).filter(v => v != null)
        if (values.length === 0) return null
        return higher ? Math.max(...values) : Math.min(...values)
    }

    if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading...</p></div>

    return (
        <div className="compare-page">
            <div className="container">
                <div className="compare-header fade-in">
                    <h1>⚖️ Compare <span className="gradient-text">Universities</span></h1>
                    <p>Select up to 3 universities to compare side by side</p>
                </div>

                {/* University Selector */}
                {saved.length > 0 && (
                    <div className="compare-selector card-glass fade-in stagger-1">
                        <h3>Select from Saved Universities</h3>
                        <div className="selector-chips">
                            {saved.map(s => {
                                const isSelected = selected.find(u => u.name === s.university_data.name)
                                return (
                                    <button
                                        key={s.id}
                                        className={`selector-chip ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleSelect(s.university_data)}
                                        disabled={!isSelected && selected.length >= 3}
                                    >
                                        {isSelected && '✓ '}{s.university_data.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {selected.length === 0 && saved.length === 0 && (
                    <div className="compare-empty card fade-in stagger-1">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📚</span>
                        <h3>No Saved Universities</h3>
                        <p>Save universities from your recommendations to compare them here.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/apply')}>Get Recommendations</button>
                    </div>
                )}

                {/* Comparison Table */}
                {selected.length >= 2 && (
                    <div className="compare-table-wrapper fade-in stagger-2">
                        <div className="compare-table">
                            {/* Header Row */}
                            <div className="compare-row compare-header-row">
                                <div className="compare-label"></div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell header-cell">
                                        <div className="header-cell-top">
                                            <span className="cell-uni-name">{uni.name}</span>
                                            <button
                                                type="button"
                                                className="compare-remove-btn"
                                                onClick={() => toggleSelect(uni)}
                                                aria-label={`Remove ${uni.name} from comparison`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <span className="cell-uni-country">📍 {uni.country}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Program */}
                            <div className="compare-row">
                                <div className="compare-label">🎓 Program</div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell">{uni.program || '—'}</div>
                                ))}
                            </div>

                            {/* Match Score */}
                            <div className="compare-row">
                                <div className="compare-label">🎯 Match Score</div>
                                {selected.map((uni, i) => {
                                    const best = getBestValue('match_score')
                                    return (
                                        <div key={i} className={`compare-cell ${uni.match_score === best ? 'best-cell' : ''}`}>
                                            <div className="cell-bar-container">
                                                <div className="cell-bar" style={{ width: getBarWidth(uni.match_score, 100) }} />
                                            </div>
                                            <span className="cell-value">{uni.match_score}%</span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Ranking */}
                            <div className="compare-row">
                                <div className="compare-label">🏆 Ranking</div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell">{uni.ranking || '—'}</div>
                                ))}
                            </div>

                            {/* Tuition */}
                            <div className="compare-row">
                                <div className="compare-label">💰 Tuition</div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell">{uni.tuition_range || '—'}</div>
                                ))}
                            </div>

                            {/* Deadline */}
                            <div className="compare-row">
                                <div className="compare-label">📅 Deadline</div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell">{uni.deadline || '—'}</div>
                                ))}
                            </div>

                            {/* Requirements */}
                            <div className="compare-row">
                                <div className="compare-label">📋 Requirements</div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell">
                                        {uni.requirements?.length > 0
                                            ? uni.requirements.map((r, j) => <span key={j} className="req-tag">{r}</span>)
                                            : '—'
                                        }
                                    </div>
                                ))}
                            </div>

                            {/* Reason */}
                            <div className="compare-row">
                                <div className="compare-label">💡 Why This School</div>
                                {selected.map((uni, i) => (
                                    <div key={i} className="compare-cell reason-cell">{uni.reason || '—'}</div>
                                ))}
                            </div>

                            {/* Website */}
                            <div className="compare-row">
                                <div className="compare-label">🔗 Apply</div>
                                {selected.map((uni, i) => {
                                    const applyTarget = resolveUniversityApplyTarget(uni)

                                    return (
                                        <div key={i} className="compare-cell">
                                            <a
                                                href={applyTarget.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-accent btn-sm"
                                                title={
                                                    applyTarget.isOfficial
                                                        ? `Open official admissions page for ${uni.name}`
                                                        : `Search official admissions page for ${uni.name}`
                                                }
                                            >
                                                {applyTarget.isOfficial ? 'Apply Now ↗' : 'Find Apply Page ↗'}
                                            </a>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {selected.length === 1 && (
                    <div className="compare-hint card-glass">
                        <p>Select at least <strong>2 universities</strong> to compare.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ComparePage
