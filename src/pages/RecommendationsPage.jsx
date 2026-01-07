import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { applicationApi } from '../services/api'
import UniversityCard from '../components/UniversityCard'
import './RecommendationsPage.css'

function RecommendationsPage() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [recommendations, setRecommendations] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applyingTo, setApplyingTo] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [applicationResult, setApplicationResult] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const storedProfile = sessionStorage.getItem('userProfile')
        const storedRecommendations = sessionStorage.getItem('recommendations')

        if (!storedProfile || !storedRecommendations) {
            navigate('/apply')
            return
        }

        setProfile(JSON.parse(storedProfile))
        setRecommendations(JSON.parse(storedRecommendations))
        setLoading(false)
    }

    const handleApply = async (university) => {
        setApplyingTo(university.name)
        setShowModal(true)

        const steps = [
            "🔍 Analyzing university application portal...",
            "📝 Mapping profile data to application fields...",
            "📄 Preparing academic transcripts and test scores...",
            "📤 Submitting final application package...",
            "✅ Application successfully submitted!"
        ]

        try {
            // Initial state: Starting
            setApplicationResult({
                university: university,
                processing: true,
                currentStep: 0,
                progress: 10,
                message: steps[0]
            })

            // Step 1: Small delay for "Analysis"
            await new Promise(r => setTimeout(r, 1500))
            setApplicationResult(prev => ({ ...prev, currentStep: 1, progress: 30, message: steps[1] }))

            // Step 2: "Mapping data"
            await new Promise(r => setTimeout(r, 2000))
            setApplicationResult(prev => ({ ...prev, currentStep: 2, progress: 55, message: steps[2] }))

            // Step 3: "Preparing docs"
            await new Promise(r => setTimeout(r, 1800))
            setApplicationResult(prev => ({ ...prev, currentStep: 3, progress: 80, message: steps[3] }))

            // Actual API Call (Hidden in the "Submitting" step)
            const data = {
                university_name: university.name,
                country: university.country,
                program: university.program
            }
            const result = await applicationApi.apply(data)

            // Step 4: Final Success
            await new Promise(r => setTimeout(r, 1500))
            setApplicationResult({
                university: university,
                success: true,
                processing: false,
                message: steps[4],
                tracking_id: result.application_id,
                next_steps: [
                    "Your application is now under official review.",
                    "The university admissions team will verify your credentials.",
                    "Keep an eye on your dashboard for status updates."
                ],
                documents_required: [
                    "Transcript (Submitted)",
                    "Statement of Purpose (Submitted)",
                    "Resume/CV (Submitted)"
                ]
            })
        } catch (error) {
            console.error('Error initiating application:', error)
            const errorMsg = error.response?.data?.detail || 'Failed to apply. Please try again.'

            setApplicationResult({
                university: university,
                success: false,
                processing: false,
                message: errorMsg
            })
        } finally {
            setApplyingTo(null)
        }
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
                        <h2>Recommended Universities</h2>
                        <p>{recommendations?.universities?.length || 0} universities matched to your profile</p>
                    </div>

                    <div className="universities-grid">
                        {recommendations?.universities?.map((university, index) => (
                            <UniversityCard
                                key={index}
                                university={university}
                                onApply={handleApply}
                                isApplying={applyingTo === university.name}
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

            {/* Application Modal */}
            {showModal && applicationResult && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

                        {applicationResult.processing ? (
                            <div className="processing-state">
                                <div className="agent-avatar">🤖</div>
                                <h3>AI Agent is Applying...</h3>
                                <p className="step-message">{applicationResult.message}</p>
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${applicationResult.progress}%` }}
                                    ></div>
                                </div>
                                <p className="processing-subtext">
                                    This usually takes 5-10 seconds as we navigate the university portal.
                                </p>
                            </div>
                        ) : applicationResult.success ? (
                            <div className="success-state">
                                <div className="success-header">
                                    <div className="success-icon">✓</div>
                                    <h2>Application Initiated!</h2>
                                </div>

                                <div className="result-info">
                                    <p>Successfully submitted application for:</p>
                                    <h3>{applicationResult.university.name}</h3>
                                    <div className="tracking-id">
                                        Tracking ID: <span>{applicationResult.tracking_id || 'UNI-7829-X'}</span>
                                    </div>
                                </div>

                                <div className="next-steps-section">
                                    <h3>Next Steps via AI Agent:</h3>
                                    <ul>
                                        {applicationResult.next_steps?.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="docs-submitted">
                                    <h3>Mapped Documents:</h3>
                                    <div className="doc-tags">
                                        {applicationResult.documents_required?.map((doc, i) => (
                                            <span key={i} className="doc-tag">{doc}</span>
                                        ))}
                                    </div>
                                </div>

                                <button className="primary-btn" onClick={() => setShowModal(false)}>
                                    Excellent, Thanks!
                                </button>
                            </div>
                        ) : (
                            <div className="error-state">
                                <div className="error-icon">×</div>
                                <h2>Application Failed</h2>
                                <p>{applicationResult.message}</p>
                                <button className="primary-btn" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecommendationsPage
