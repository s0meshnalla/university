import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { newsApi } from '../services/api'
import NewsCard from '../components/NewsCard'
import './HomePage.css'

function HomePage() {
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNews()
    }, [])

    const fetchNews = async () => {
        try {
            const response = await newsApi.getNews()
            setNews(response.articles || [])
        } catch (error) {
            console.error('Error fetching news:', error)
            // Use mock data on error
            setNews([
                {
                    id: 1,
                    title: "US Universities Extend Application Deadlines for International Students",
                    description: "Several top US universities have announced extended deadlines for Fall 2026 applications, providing more time for international students affected by visa delays.",
                    source: "Education Weekly",
                    url: "#",
                    image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
                    published_at: new Date().toISOString(),
                    category: "Admissions"
                },
                {
                    id: 2,
                    title: "New UK Graduate Visa Rules: What Students Need to Know",
                    description: "The UK government has announced updates to the Graduate Route visa, affecting post-study work opportunities for international students.",
                    source: "Global Education News",
                    url: "#",
                    image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
                    published_at: new Date().toISOString(),
                    category: "Immigration & Policy"
                },
                {
                    id: 3,
                    title: "QS World University Rankings 2026: Major Shifts in Top 100",
                    description: "The latest QS rankings show significant movements among top universities, with several Asian institutions climbing higher.",
                    source: "University News Today",
                    url: "#",
                    image_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
                    published_at: new Date().toISOString(),
                    category: "Rankings"
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title fade-in">
                            Your AI-Powered Path to
                            <span className="gradient-text"> Dream University</span>
                        </h1>
                        <p className="hero-subtitle fade-in stagger-1">
                            Get personalized university recommendations based on your profile,
                            scores, and preferences. Our AI analyzes thousands of data points
                            to find your perfect match.
                        </p>
                        <div className="hero-cta fade-in stagger-2">
                            <Link to="/apply" className="btn btn-primary btn-lg">
                                Start Your Journey
                                <span className="btn-arrow">→</span>
                            </Link>
                            <a href="#how-it-works" className="btn btn-secondary btn-lg">
                                Learn More
                            </a>
                        </div>
                        <div className="hero-stats fade-in stagger-3">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Universities</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Countries</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">AI</span>
                                <span className="stat-label">Powered</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual fade-in stagger-2">
                        <div className="hero-card hero-card-1">
                            <span className="hero-card-icon">🎓</span>
                            <span className="hero-card-text">Stanford</span>
                            <span className="hero-card-score">92%</span>
                        </div>
                        <div className="hero-card hero-card-2">
                            <span className="hero-card-icon">🏛️</span>
                            <span className="hero-card-text">MIT</span>
                            <span className="hero-card-score">87%</span>
                        </div>
                        <div className="hero-card hero-card-3">
                            <span className="hero-card-icon">📚</span>
                            <span className="hero-card-text">Oxford</span>
                            <span className="hero-card-score">85%</span>
                        </div>
                    </div>
                </div>
                <div className="hero-bg-gradient"></div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="how-it-works">
                <div className="container">
                    <h2 className="section-title text-center">How It Works</h2>
                    <p className="section-subtitle text-center">
                        Three simple steps to find your ideal university
                    </p>

                    <div className="steps-grid">
                        <div className="step-card card">
                            <div className="step-number">01</div>
                            <div className="step-icon">📝</div>
                            <h3 className="step-title">Complete Your Profile</h3>
                            <p className="step-description">
                                Enter your academic background, test scores, and preferences.
                                Our form guides you through every detail.
                            </p>
                        </div>

                        <div className="step-card card">
                            <div className="step-number">02</div>
                            <div className="step-icon">🤖</div>
                            <h3 className="step-title">AI Analysis</h3>
                            <p className="step-description">
                                Our ML model predicts your admission score, while Gemini AI
                                curates personalized university recommendations.
                            </p>
                        </div>

                        <div className="step-card card">
                            <div className="step-number">03</div>
                            <div className="step-icon">🚀</div>
                            <h3 className="step-title">Apply with Confidence</h3>
                            <p className="step-description">
                                Review your matches, get insights on each university,
                                and start your application journey with our AI assistant.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🎯</div>
                            <h4>Personalized Matching</h4>
                            <p>AI-driven recommendations based on your unique profile</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h4>Score Prediction</h4>
                            <p>ML model predicts your admission probability</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🌍</div>
                            <h4>Global Coverage</h4>
                            <p>Universities from USA, UK, Canada, Germany & more</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h4>Instant Results</h4>
                            <p>Get recommendations in seconds, not days</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="news-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Latest Education News</h2>
                            <p className="section-subtitle">
                                Stay updated with the latest in university admissions and policies
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading latest news...</p>
                        </div>
                    ) : (
                        <div className="news-grid grid grid-cols-3">
                            {news.slice(0, 6).map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card card-glass">
                        <h2>Ready to Find Your Dream University?</h2>
                        <p>Join thousands of students who found their perfect match with UniGuide</p>
                        <Link to="/apply" className="btn btn-accent btn-lg">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
