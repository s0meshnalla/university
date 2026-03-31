import './UniversityCard.css'

function UniversityCard({ university, onToggleCompare, isCompared = false }) {
    const getMatchColor = (score) => {
        if (score >= 80) return 'high'
        if (score >= 60) return 'medium'
        return 'low'
    }

    const getMatchLabel = (score) => {
        if (score >= 80) return 'Safety'
        if (score >= 60) return 'Match'
        return 'Reach'
    }

    return (
        <div className="university-card card">
            <div className="university-card-header">
                <div className="university-info">
                    <h3 className="university-name">{university.name}</h3>
                    <p className="university-country">📍 {university.country}</p>
                </div>
                <div className={`score-circle score-${getMatchColor(university.match_score)}`}>
                    {university.match_score}%
                </div>
            </div>

            <div className="university-program">
                <span className="program-label">Program:</span>
                <span className="program-name">{university.program}</span>
            </div>

            <div className="university-details">
                {university.ranking && (
                    <div className="detail-item">
                        <span className="detail-icon">🏆</span>
                        <span>{university.ranking}</span>
                    </div>
                )}
                {university.tuition_range && (
                    <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span>{university.tuition_range}</span>
                    </div>
                )}
                {university.deadline && (
                    <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span>{university.deadline}</span>
                    </div>
                )}
            </div>

            <p className="university-reason">{university.reason}</p>

            {university.requirements && university.requirements.length > 0 && (
                <div className="university-requirements">
                    <span className="requirements-label">Requirements:</span>
                    <div className="requirements-list">
                        {university.requirements.slice(0, 4).map((req, index) => (
                            <span key={index} className="requirement-tag">{req}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="university-card-footer">
                <span className={`match-badge badge-${getMatchColor(university.match_score)}`}>
                    {getMatchLabel(university.match_score)} School
                </span>
                <div className="university-card-actions">
                    {onToggleCompare && (
                        <button
                            type="button"
                            className={`btn btn-sm compare-btn ${isCompared ? 'compare-btn-active' : ''}`}
                            onClick={() => onToggleCompare(university)}
                        >
                            {isCompared ? 'Compared ✓' : 'Compare'}
                        </button>
                    )}
                    <a
                        href={university.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-accent btn-sm apply-link"
                    >
                        Apply Now ↗
                    </a>
                </div>
            </div>
        </div>
    )
}

export default UniversityCard
