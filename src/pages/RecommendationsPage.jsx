import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import UniversityCard from '../components/UniversityCard'
import { applicationApi, userApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './RecommendationsPage.css'

function RecommendationsPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const [profile, setProfile] = useState(null)
    const [recommendations, setRecommendations] = useState(null)
    const [compareList, setCompareList] = useState([])
    const [savedByName, setSavedByName] = useState({})
    const [savingByName, setSavingByName] = useState({})
    const [applyingByName, setApplyingByName] = useState({})
    const [simulationInputs, setSimulationInputs] = useState({
        gpa: '',
        gre_verbal: '',
        gre_quant: '',
        toefl_score: '',
        work_experience_years: '',
    })
    const [simulationResult, setSimulationResult] = useState(null)
    const [simulationLoading, setSimulationLoading] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const storedProfile = sessionStorage.getItem('userProfile')
        const storedRecommendations = sessionStorage.getItem('recommendations')
        const storedCompareList = JSON.parse(sessionStorage.getItem('compareList') || '[]')

        if (!storedProfile || !storedRecommendations) {
            navigate('/apply')
            return
        }

        const parsedProfile = JSON.parse(storedProfile)
        setProfile(parsedProfile)
        setRecommendations(JSON.parse(storedRecommendations))
        setCompareList(storedCompareList)
        setSimulationInputs({
            gpa: parsedProfile?.academic?.gpa ?? '',
            gre_verbal: parsedProfile?.scores?.gre_verbal ?? '',
            gre_quant: parsedProfile?.scores?.gre_quant ?? '',
            toefl_score: parsedProfile?.scores?.toefl_score ?? '',
            work_experience_years: parsedProfile?.academic?.work_experience_years ?? 0,
        })

        try {
            const response = await applicationApi.getSavedUniversities()
            const mapping = {}
                ; (response.universities || []).forEach((item) => {
                    const name = item.university_data?.name
                    if (name) mapping[name] = item.id
                })
            setSavedByName(mapping)
        } catch (error) {
            // Saved state is optional for this page; continue silently.
        }

        setLoading(false)
    }

    const setItemLoading = (setter, name, value) => {
        setter((prev) => ({ ...prev, [name]: value }))
    }

    const handleAddApplication = async (university) => {
        const name = university.name
        setItemLoading(setApplyingByName, name, true)

        try {
            await applicationApi.apply({
                university_name: university.name,
                country: university.country || 'N/A',
                program: university.program || 'General',
                deadline: university.deadline || null,
                notes: `Added from AI recommendations. Match score: ${university.match_score || 'N/A'}%`,
            })
            toast.success(`Added ${university.name} to Applications`)
        } catch (error) {
            const detail = error?.response?.data?.detail
            if (typeof detail === 'string' && detail.toLowerCase().includes('already applied')) {
                toast.info(`Already added: ${university.name}`)
            } else {
                toast.error(`Could not add ${university.name}`)
            }
        } finally {
            setItemLoading(setApplyingByName, name, false)
        }
    }

    const handleToggleSave = async (university) => {
        const name = university.name
        const savedId = savedByName[name]
        setItemLoading(setSavingByName, name, true)

        try {
            if (savedId) {
                await applicationApi.unsaveUniversity(savedId)
                setSavedByName((prev) => {
                    const next = { ...prev }
                    delete next[name]
                    return next
                })
                toast.success(`Removed ${name} from saved`)
            } else {
                const response = await applicationApi.saveUniversity(university)
                setSavedByName((prev) => ({ ...prev, [name]: response.id }))
                toast.success(`Saved ${name}`)
            }
        } catch (error) {
            toast.error(`Unable to update saved state for ${name}`)
        } finally {
            setItemLoading(setSavingByName, name, false)
        }
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

    const runWhatIfSimulation = async () => {
        setSimulationLoading(true)
        try {
            const payload = {
                gpa: simulationInputs.gpa === '' ? null : Number(simulationInputs.gpa),
                gre_verbal: simulationInputs.gre_verbal === '' ? null : Number(simulationInputs.gre_verbal),
                gre_quant: simulationInputs.gre_quant === '' ? null : Number(simulationInputs.gre_quant),
                toefl_score: simulationInputs.toefl_score === '' ? null : Number(simulationInputs.toefl_score),
                work_experience_years: simulationInputs.work_experience_years === '' ? null : Number(simulationInputs.work_experience_years),
            }
            const response = await userApi.whatIfSimulation(payload)
            setSimulationResult(response)
        } catch (error) {
            toast.error('Could not run simulation. Ensure your profile is complete.')
        } finally {
            setSimulationLoading(false)
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

                <div className="what-if-card card-glass">
                    <div className="what-if-header">
                        <h3>What-if Score Simulator</h3>
                        <p>Adjust key metrics to estimate how your admission score could improve.</p>
                    </div>

                    <div className="what-if-grid">
                        <label>
                            GPA
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={simulationInputs.gpa}
                                onChange={(e) => setSimulationInputs((prev) => ({ ...prev, gpa: e.target.value }))}
                            />
                        </label>
                        <label>
                            GRE Verbal
                            <input
                                type="number"
                                min="130"
                                max="170"
                                value={simulationInputs.gre_verbal}
                                onChange={(e) => setSimulationInputs((prev) => ({ ...prev, gre_verbal: e.target.value }))}
                            />
                        </label>
                        <label>
                            GRE Quant
                            <input
                                type="number"
                                min="130"
                                max="170"
                                value={simulationInputs.gre_quant}
                                onChange={(e) => setSimulationInputs((prev) => ({ ...prev, gre_quant: e.target.value }))}
                            />
                        </label>
                        <label>
                            TOEFL
                            <input
                                type="number"
                                min="0"
                                max="120"
                                value={simulationInputs.toefl_score}
                                onChange={(e) => setSimulationInputs((prev) => ({ ...prev, toefl_score: e.target.value }))}
                            />
                        </label>
                        <label>
                            Work Experience (years)
                            <input
                                type="number"
                                min="0"
                                max="20"
                                value={simulationInputs.work_experience_years}
                                onChange={(e) => setSimulationInputs((prev) => ({ ...prev, work_experience_years: e.target.value }))}
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        onClick={runWhatIfSimulation}
                        disabled={simulationLoading}
                    >
                        {simulationLoading ? 'Running simulation...' : 'Run Simulation'}
                    </button>

                    {simulationResult && (
                        <div className="simulation-result">
                            <div>
                                <span>Current</span>
                                <strong>{simulationResult.baseline_score}</strong>
                            </div>
                            <div>
                                <span>Projected</span>
                                <strong>{simulationResult.projected_score}</strong>
                            </div>
                            <div className={simulationResult.delta >= 0 ? 'delta-up' : 'delta-down'}>
                                <span>Delta</span>
                                <strong>{simulationResult.delta >= 0 ? '+' : ''}{simulationResult.delta}</strong>
                            </div>
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
                                onAddApplication={handleAddApplication}
                                isAddingApplication={!!applyingByName[university.name]}
                                onToggleSave={handleToggleSave}
                                isSaved={!!savedByName[university.name]}
                                isSaveLoading={!!savingByName[university.name]}
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
