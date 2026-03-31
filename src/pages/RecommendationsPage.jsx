import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import UniversityCard from '../components/UniversityCard'
import './RecommendationsPage.css'

function RecommendationsPage() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [recommendations, setRecommendations] = useState(null)
    const [compareList, setCompareList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const storedProfile = sessionStorage.getItem('userProfile')
        const storedRecommendations = sessionStorage.getItem('recommendations')
        const storedCompareList = JSON.parse(sessionStorage.getItem('compareList') || '[]')

        if (!storedProfile || !storedRecommendations) {
            navigate('/apply')
            return
        }

        setProfile(JSON.parse(storedProfile))
        setRecommendations(JSON.parse(storedRecommendations))
        setCompareList(storedCompareList)
        setLoading(false)
    }

    const handleToggleCompare = (university) => {
        setCompareList((prev) => {
            const exists = prev.some((u) => u.name === university.name)
            let updated = prev

            if (exists) {
                updated = prev.filter((u) => u.name !== university.name)
            } else if (prev.length < 3) {
                updated = [...prev, university]
            }

            sessionStorage.setItem('compareList', JSON.stringify(updated))
            return updated
        })
    }

    const openCompare = () => {
        if (compareList.length < 2) return
        navigate('/compare')
    }

    const getScoreClass = (score) => {
        if (score >= 75) return 'excellent'
        if (score >= 50) return 'good'
        return 'needs-work'
    }

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading your recommendations...</p>
            </div>
        )
    }

    return (
        <div className="recommendations-page">
            <div className="container">
                {/* Header */}
                <div className="reco-header">
                    <div className="reco-header-content">
                        <h1>Your University Matches</h1>
                        <p>Based on your profile, here are your personalized recommendations</p>
                    </div>
                    <Link to="/apply" className="btn btn-secondary">
                        Edit Profile
                    </Link>
                </div>

                {/* Score Card */}
                <div className="score-card card-glass">
                    <div className="score-main">
                        <div className={`predicted-score ${getScoreClass(recommendations?.predicted_score || 0)}`}>
                            <span className="score-value">{recommendations?.predicted_score || 0}</span>
                            <span className="score-max">/100</span>
                        </div>
                        <div className="score-info">
                            <h3>Your Predicted Admission Score</h3>
                            <p>This score represents your overall competitiveness for graduate admissions based on your academic profile and test scores.</p>
                        </div>
                    </div>

                    {recommendations?.profile_insights && (
                        <div className="insights-section">
                            <h4>Profile Insights</h4>
                            <div className="insights-grid">
                                {Object.entries(recommendations.profile_insights).map(([key, value]) => (
                                    <div key={key} className="insight-item">
                                        <span className="insight-icon">
                                            {key === 'gpa' ? '📊' : key === 'gre' ? '📝' : '🔬'}
                                        </span>
                                        <span className="insight-text">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recommendations?.insights && (
                        <div className="ai-insights">
                            <span className="ai-badge">🤖 AI Insights</span>
                            <p>{recommendations.insights}</p>
                        </div>
                    )}
                </div>

                {/* Universities Grid */}
                <div className="universities-section">
                    <div className="section-header">
                        <div>
                            <h2>Recommended Universities</h2>
                            <p>{recommendations?.universities?.length || 0} universities matched to your profile</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={openCompare}
                            disabled={compareList.length < 2}
                            title={compareList.length < 2 ? 'Select at least 2 universities to compare' : 'Compare selected universities'}
                        >
                            Compare Selected ({compareList.length}/3)
                        </button>
                    </div>

                    <div className="universities-grid">
                        {recommendations?.universities?.map((university, index) => (
                            <UniversityCard
                                key={index}
                                university={university}
                                onToggleCompare={handleToggleCompare}
                                isCompared={compareList.some((u) => u.name === university.name)}
                            />
                        ))}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="tips-section card">
                    <h3>💡 Application Tips</h3>
                    <ul className="tips-list">
                        <li>Start with your safety schools to gain confidence</li>
                        <li>Tailor your Statement of Purpose for each university</li>
                        <li>Request recommendation letters early - at least 3 weeks before deadline</li>
                        <li>Track all deadlines and requirements in a spreadsheet</li>
                        <li>Prepare your documents digitally for quick applications</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default RecommendationsPage
