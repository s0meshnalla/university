import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userApi } from '../services/api'
import api from '../services/api'
import { ALL_COUNTRIES, POPULAR_COUNTRIES, COUNTRY_ALIASES } from '../utils/countries'
import CustomSelect from '../components/CustomSelect'
import './FormPage.css'

const normalizeCountryValue = (value) => {
    if (!value || typeof value !== 'string') return ''
    return value.trim().replace(/\s+/g, ' ')
}

const normalizeLoadedCountries = (countries = []) => {
    return countries
        .map((country) => COUNTRY_ALIASES[country] || country)
        .map(normalizeCountryValue)
        .filter(Boolean)
}

const MAJORS = [
    'Computer Science', 'Data Science', 'Artificial Intelligence',
    'Machine Learning', 'Software Engineering', 'Electrical Engineering',
    'Mechanical Engineering', 'Business Administration', 'Finance',
    'Economics', 'Biotechnology', 'Biomedical Engineering',
    'Civil Engineering', 'Chemical Engineering', 'Physics',
    'Mathematics', 'Statistics', 'Psychology', 'Public Health'
]

function FormPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState({})
    const [profileExists, setProfileExists] = useState(false)
    const [existingProfile, setExistingProfile] = useState(null)
    const [countryInput, setCountryInput] = useState('')
    const [isCountryInputFocused, setIsCountryInputFocused] = useState(false)

    // Only these fields are needed for specific application
    const [formData, setFormData] = useState({
        target_countries: [],
        target_degree: 'masters',
        major: '',
        additional_info: ''
    })

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const response = await api.get('/user/profile')
                if (response.data.exists && response.data.profile_data) {
                    setProfileExists(true)
                    setExistingProfile(response.data.profile_data)

                    // Pre-fill some defaults from profile if available
                    const saved = response.data.profile_data
                    setFormData(prev => ({
                        ...prev,
                        target_countries: normalizeLoadedCountries(saved.personal.target_countries || []),
                        target_degree: saved.academic.target_degree || 'masters',
                        major: saved.academic.major || ''
                    }))
                } else {
                    setProfileExists(false)
                }
            } catch (error) {
                console.error("Error checking profile:", error)
            } finally {
                setLoading(false)
            }
        }
        checkProfile()
    }, [])

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }))
        }
    }

    const hasCountry = (countryName, list) => {
        const key = normalizeCountryValue(countryName).toLowerCase()
        return list.some((item) => normalizeCountryValue(item).toLowerCase() === key)
    }

    const toggleCountry = (countryName) => {
        const normalized = normalizeCountryValue(countryName)
        if (!normalized) return

        setFormData(prev => ({
            ...prev,
            target_countries: hasCountry(normalized, prev.target_countries)
                ? prev.target_countries.filter((country) => normalizeCountryValue(country).toLowerCase() !== normalized.toLowerCase())
                : [...prev.target_countries, normalized]
        }))
    }

    const addCountryValue = (value) => {
        const normalized = normalizeCountryValue(value)
        if (!normalized) return

        setFormData((prev) => {
            if (hasCountry(normalized, prev.target_countries)) return prev
            return {
                ...prev,
                target_countries: [...prev.target_countries, normalized],
            }
        })
        setCountryInput('')

        if (errors.target_countries) {
            setErrors((prev) => ({ ...prev, target_countries: null }))
        }
    }

    const handleAddCountry = () => addCountryValue(countryInput)

    const handleCountrySuggestionClick = (country) => {
        addCountryValue(country)
        setIsCountryInputFocused(false)
    }

    const countrySuggestions = ALL_COUNTRIES
        .filter((country) => {
            const input = normalizeCountryValue(countryInput).toLowerCase()
            if (!input) return false
            return country.toLowerCase().includes(input) && !hasCountry(country, formData.target_countries)
        })
        .slice(0, 8)

    const validate = () => {
        const newErrors = {}
        if (formData.target_countries.length === 0) newErrors.target_countries = 'Select at least one country'
        if (!formData.major) newErrors.major = 'Major is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        setIsSubmitting(true)

        try {
            // merge existing profile with current application preferences
            const fullProfile = {
                ...existingProfile,
                personal: {
                    ...existingProfile.personal,
                    target_countries: formData.target_countries
                },
                academic: {
                    ...existingProfile.academic,
                    target_degree: formData.target_degree,
                    major: formData.major
                },
                additional_info: formData.additional_info // Specific note for this application
            }

            const response = await userApi.getRecommendations(fullProfile)

            // Store in session and navigate
            sessionStorage.setItem('userProfile', JSON.stringify(fullProfile))
            sessionStorage.setItem('recommendations', JSON.stringify(response))
            navigate('/recommendations')

        } catch (error) {
            console.error('Error getting recommendations:', error)
            setErrors({ submit: 'Failed to get recommendations. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="loading-spinner">Loading...</div>

    if (!profileExists) {
        return (
            <div className="form-page">
                <div className="container">
                    <div className="card text-center" style={{ padding: '3rem' }}>
                        <h2>Profile Required</h2>
                        <p style={{ margin: '1rem 0 2rem', color: 'var(--text-secondary)' }}>
                            To get personalized recommendations, you first need to complete your profile with your academic background and test scores.
                        </p>
                        <Link to="/profile" className="btn btn-primary btn-lg">
                            Create Profile First
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="form-page">
            <div className="container">
                <div className="form-wrapper">
                    <div className="form-header">
                        <h1>Start Application</h1>
                        <p>Customize your preferences for this search</p>
                    </div>

                    <div className="form-content card">
                        {/* Profile Summary Widget */}
                        <div className="profile-summary-widget">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Using Profile: {existingProfile.personal.full_name}</h3>
                            <div className="summary-tags">
                                <span className="tag">GPA: {existingProfile.academic.gpa}</span>
                                <span className="tag">Last University: {existingProfile.academic.university_name}</span>
                            </div>
                            <Link to="/profile" className="edit-link" style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>
                                Edit Profile Details
                            </Link>
                        </div>

                        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

                        <div className="form-step fade-in">
                            <h2>Application Preferences</h2>

                            <div className="form-group">
                                <label className="form-label">Target Countries *</label>
                                <div className="country-entry-row">
                                    <div className="country-autocomplete-wrapper">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={countryInput}
                                            placeholder="Add any country (e.g., Japan, Switzerland)"
                                            onFocus={() => setIsCountryInputFocused(true)}
                                            onBlur={() => setTimeout(() => setIsCountryInputFocused(false), 120)}
                                            onChange={(e) => setCountryInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleAddCountry()
                                                }
                                            }}
                                        />
                                        {isCountryInputFocused && countrySuggestions.length > 0 && (
                                            <div className="country-suggestions-panel" role="listbox" aria-label="Country suggestions">
                                                {countrySuggestions.map((country) => (
                                                    <button
                                                        key={country}
                                                        type="button"
                                                        className="country-suggestion-item"
                                                        onClick={() => handleCountrySuggestionClick(country)}
                                                    >
                                                        {country}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCountry}>
                                        Add
                                    </button>
                                </div>
                                <div className="country-grid">
                                    {POPULAR_COUNTRIES.map((country) => (
                                        <button
                                            key={country}
                                            type="button"
                                            className={`country-chip ${hasCountry(country, formData.target_countries) ? 'selected' : ''}`}
                                            onClick={() => toggleCountry(country)}
                                        >
                                            {country}
                                        </button>
                                    ))}
                                </div>
                                <div className="selected-country-chips">
                                    {formData.target_countries.map((country) => (
                                        <button
                                            key={country}
                                            type="button"
                                            className="country-chip selected"
                                            onClick={() => toggleCountry(country)}
                                            title="Click to remove"
                                        >
                                            {country} ✕
                                        </button>
                                    ))}
                                </div>
                                {errors.target_countries && <span className="form-error">{errors.target_countries}</span>}
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Target Degree</label>
                                    <CustomSelect
                                        className="form-select"
                                        value={formData.target_degree}
                                        onChange={(value) => updateField('target_degree', value)}
                                        options={[
                                            { value: 'masters', label: "Master's Degree" },
                                            { value: 'phd', label: 'PhD' },
                                            { value: 'mba', label: 'MBA' },
                                        ]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Intended Major *</label>
                                    <CustomSelect
                                        className={`form-select ${errors.major ? 'error' : ''}`}
                                        value={formData.major}
                                        onChange={(value) => updateField('major', value)}
                                        placeholder="Select your major"
                                        options={[
                                            { value: '', label: 'Select your major', disabled: true },
                                            ...MAJORS.map((major) => ({ value: major, label: major })),
                                        ]}
                                    />
                                    {errors.major && <span className="form-error">{errors.major}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Additional Requirements/Notes</label>
                                <textarea
                                    className="form-input form-textarea"
                                    rows="4"
                                    placeholder="Specific focus area, scholarship needs, public vs private, etc."
                                    value={formData.additional_info}
                                    onChange={(e) => updateField('additional_info', e.target.value)}
                                ></textarea>
                            </div>

                            {errors.submit && <div className="form-error-box">{errors.submit}</div>}

                            <button
                                type="button"
                                className="btn btn-accent btn-lg"
                                style={{ width: '100%', marginTop: '1rem' }}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                        Generating Recommendations...
                                    </>
                                ) : (
                                    'Find Universities 🚀'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormPage
