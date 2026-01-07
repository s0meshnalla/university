import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../services/api'
import api from '../services/api'
import './FormPage.css' // Reusing styles

const STEPS = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Academic Background', icon: '🎓' },
    { id: 3, title: 'Test Scores', icon: '📝' }
]

const COUNTRIES = [
    { code: 'USA', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'Canada', name: 'Canada' },
    { code: 'Germany', name: 'Germany' },
    { code: 'Australia', name: 'Australia' },
    { code: 'France', name: 'France' },
    { code: 'Netherlands', name: 'Netherlands' },
    { code: 'Singapore', name: 'Singapore' },
    { code: 'Ireland', name: 'Ireland' },
    { code: 'Sweden', name: 'Sweden' }
]

const MAJORS = [
    'Computer Science', 'Data Science', 'Artificial Intelligence',
    'Machine Learning', 'Software Engineering', 'Electrical Engineering',
    'Mechanical Engineering', 'Business Administration', 'Finance',
    'Economics', 'Biotechnology', 'Biomedical Engineering',
    'Civil Engineering', 'Chemical Engineering', 'Physics',
    'Mathematics', 'Statistics', 'Psychology', 'Public Health'
]

function ProfilePage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        // Personal Info
        full_name: '',
        email: '',
        nationality: '',
        target_countries: [],

        // Academic Info
        current_degree: 'bachelors',
        target_degree: 'masters',
        university_name: '',
        major: '',
        gpa: '',
        gpa_scale: '10',
        graduation_year: '2024',
        work_experience_years: '0',
        research_papers: '0',

        // Test Scores
        gre_verbal: '',
        gre_quant: '',
        gre_awa: '',
        toefl_score: '',
        ielts_score: '',
        gmat_score: '',

        // Additional
        additional_info: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/profile')
                if (response.data.exists && response.data.profile_data) {
                    const data = response.data.profile_data
                    setFormData({
                        // Flatten the nested structure for the form
                        ...data.personal,
                        ...data.academic,
                        ...data.scores,
                        additional_info: data.additional_info || '',
                        // Handle type conversions if needed
                        gpa: data.academic.gpa.toString(),
                        gpa_scale: data.academic.gpa_scale.toString(),
                        graduation_year: data.academic.graduation_year.toString(),
                        work_experience_years: (data.academic.work_experience_years || 0).toString(),
                        research_papers: (data.academic.research_papers || 0).toString(),

                        gre_verbal: data.scores.gre_verbal?.toString() || '',
                        gre_quant: data.scores.gre_quant?.toString() || '',
                        gre_awa: data.scores.gre_awa?.toString() || '',
                        toefl_score: data.scores.toefl_score?.toString() || '',
                        ielts_score: data.scores.ielts_score?.toString() || '',
                        gmat_score: data.scores.gmat_score?.toString() || '',
                    })
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }))
        }
    }

    const toggleCountry = (code) => {
        setFormData(prev => ({
            ...prev,
            target_countries: prev.target_countries.includes(code)
                ? prev.target_countries.filter(c => c !== code)
                : [...prev.target_countries, code]
        }))
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.full_name.trim()) newErrors.full_name = 'Name is required'
            if (!formData.email.trim()) newErrors.email = 'Email is required'
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
            if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required'
            if (formData.target_countries.length === 0) newErrors.target_countries = 'Select at least one country'
        }

        if (step === 2) {
            if (!formData.university_name.trim()) newErrors.university_name = 'University is required'
            if (!formData.major.trim()) newErrors.major = 'Major is required'
            if (!formData.gpa) newErrors.gpa = 'GPA is required'
            else if (parseFloat(formData.gpa) > parseFloat(formData.gpa_scale)) {
                newErrors.gpa = 'GPA cannot exceed scale'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3))
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSave = async () => {
        if (!validateStep(currentStep)) return

        setIsSubmitting(true)

        try {
            const profile = {
                personal: {
                    full_name: formData.full_name,
                    email: formData.email,
                    nationality: formData.nationality,
                    target_countries: formData.target_countries
                },
                academic: {
                    current_degree: formData.current_degree,
                    target_degree: formData.target_degree,
                    university_name: formData.university_name,
                    major: formData.major,
                    gpa: parseFloat(formData.gpa),
                    gpa_scale: parseFloat(formData.gpa_scale),
                    graduation_year: parseInt(formData.graduation_year),
                    work_experience_years: parseInt(formData.work_experience_years) || 0,
                    research_papers: parseInt(formData.research_papers) || 0
                },
                scores: {
                    gre_verbal: formData.gre_verbal ? parseInt(formData.gre_verbal) : null,
                    gre_quant: formData.gre_quant ? parseInt(formData.gre_quant) : null,
                    gre_awa: formData.gre_awa ? parseFloat(formData.gre_awa) : null,
                    toefl_score: formData.toefl_score ? parseInt(formData.toefl_score) : null,
                    ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
                    gmat_score: formData.gmat_score ? parseInt(formData.gmat_score) : null
                },
                additional_info: formData.additional_info || null
            }

            await userApi.submitProfile(profile)
            alert('Profile saved successfully!')
            navigate('/apply') // Redirect to apply after saving

        } catch (error) {
            console.error('Error saving profile:', error)
            setErrors({ submit: 'Failed to save profile. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const progress = (currentStep / 3) * 100

    if (loading) return <div className="loading-spinner">Loading Profile...</div>

    return (
        <div className="form-page">
            <div className="container">
                <div className="form-wrapper">
                    {/* Header */}
                    <div className="form-header">
                        <h1>Your Profile</h1>
                        <p>Manage your academic details and scores</p>
                    </div>

                    {/* Progress */}
                    <div className="form-progress">
                        <div className="progress-steps">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
                                >
                                    <div className="step-circle">
                                        {currentStep > step.id ? '✓' : step.icon}
                                    </div>
                                    <span className="step-label">{step.title}</span>
                                </div>
                            ))}
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="form-content card">
                        {/* Step 1: Personal Info */}
                        {currentStep === 1 && (
                            <div className="form-step fade-in">
                                <h2>Personal Information</h2>
                                <p className="step-desc">Basic details about you</p>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.full_name ? 'error' : ''}`}
                                            value={formData.full_name}
                                            onChange={(e) => updateField('full_name', e.target.value)}
                                        />
                                        {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            className={`form-input ${errors.email ? 'error' : ''}`}
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                        />
                                        {errors.email && <span className="form-error">{errors.email}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Nationality *</label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.nationality ? 'error' : ''}`}
                                            value={formData.nationality}
                                            onChange={(e) => updateField('nationality', e.target.value)}
                                        />
                                        {errors.nationality && <span className="form-error">{errors.nationality}</span>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Preferred Countries (Default)</label>
                                    <div className="country-grid">
                                        {COUNTRIES.map((country) => (
                                            <button
                                                key={country.code}
                                                type="button"
                                                className={`country-chip ${formData.target_countries.includes(country.code) ? 'selected' : ''}`}
                                                onClick={() => toggleCountry(country.code)}
                                            >
                                                {country.name}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="form-hint">You can change these when applying</p>
                                    {errors.target_countries && <span className="form-error">{errors.target_countries}</span>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Academic Info */}
                        {currentStep === 2 && (
                            <div className="form-step fade-in">
                                <h2>Academic Background</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Current Degree</label>
                                        <select
                                            className="form-select"
                                            value={formData.current_degree}
                                            onChange={(e) => updateField('current_degree', e.target.value)}
                                        >
                                            <option value="bachelors">Bachelor's Degree</option>
                                            <option value="masters">Master's Degree</option>
                                            <option value="phd">PhD</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">University Name *</label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.university_name ? 'error' : ''}`}
                                            value={formData.university_name}
                                            onChange={(e) => updateField('university_name', e.target.value)}
                                        />
                                        {errors.university_name && <span className="form-error">{errors.university_name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Major *</label>
                                        <select
                                            className={`form-select ${errors.major ? 'error' : ''}`}
                                            value={formData.major}
                                            onChange={(e) => updateField('major', e.target.value)}
                                        >
                                            <option value="">Select Major</option>
                                            {MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        {errors.major && <span className="form-error">{errors.major}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GPA *</label>
                                        <div className="gpa-input-group">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className={`form-input ${errors.gpa ? 'error' : ''}`}
                                                value={formData.gpa}
                                                onChange={(e) => updateField('gpa', e.target.value)}
                                            />
                                            <span className="gpa-separator">/</span>
                                            <select
                                                className="form-select gpa-scale"
                                                value={formData.gpa_scale}
                                                onChange={(e) => updateField('gpa_scale', e.target.value)}
                                            >
                                                <option value="10">10</option>
                                                <option value="4">4</option>
                                            </select>
                                        </div>
                                        {errors.gpa && <span className="form-error">{errors.gpa}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Grad Year</label>
                                        <select
                                            className="form-select"
                                            value={formData.graduation_year}
                                            onChange={(e) => updateField('graduation_year', e.target.value)}
                                        >
                                            {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Test Scores */}
                        {currentStep === 3 && (
                            <div className="form-step fade-in">
                                <h2>Test Scores</h2>
                                <div className="score-section">
                                    <h3>GRE</h3>
                                    <div className="form-grid form-grid-3">
                                        <div className="form-group">
                                            <label className="form-label">Verbal</label>
                                            <input type="number" className="form-input" value={formData.gre_verbal} onChange={(e) => updateField('gre_verbal', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Quant</label>
                                            <input type="number" className="form-input" value={formData.gre_quant} onChange={(e) => updateField('gre_quant', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">AWA</label>
                                            <input type="number" step="0.5" className="form-input" value={formData.gre_awa} onChange={(e) => updateField('gre_awa', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="score-section">
                                    <h3>English Proficiency</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">TOEFL</label>
                                            <input type="number" className="form-input" value={formData.toefl_score} onChange={(e) => updateField('toefl_score', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">IELTS</label>
                                            <input type="number" step="0.5" className="form-input" value={formData.ielts_score} onChange={(e) => updateField('ielts_score', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                {errors.submit && <div className="form-error-box">{errors.submit}</div>}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="form-navigation">
                            {currentStep > 1 && (
                                <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                                    ← Back
                                </button>
                            )}
                            <div className="nav-spacer"></div>
                            {currentStep < 3 ? (
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Continue →
                                </button>
                            ) : (
                                <button type="button" className="btn btn-accent btn-lg" onClick={handleSave} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
