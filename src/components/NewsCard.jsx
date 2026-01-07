import './NewsCard.css'

function NewsCard({ article }) {
    const getCategoryColor = (category) => {
        const colors = {
            'Admissions': 'primary',
            'Immigration & Policy': 'accent',
            'Rankings': 'success',
            'Financial Aid': 'warning',
            'General': 'primary'
        }
        return colors[category] || 'primary'
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <article className="news-card card">
            {article.image_url && (
                <div className="news-card-image">
                    <img
                        src={article.image_url}
                        alt={article.title}
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                </div>
            )}
            <div className="news-card-content">
                <div className="news-card-meta">
                    <span className={`badge badge-${getCategoryColor(article.category)}`}>
                        {article.category}
                    </span>
                    <span className="news-card-date">{formatDate(article.published_at)}</span>
                </div>
                <h3 className="news-card-title">{article.title}</h3>
                <p className="news-card-description">{article.description}</p>
                <div className="news-card-footer">
                    <span className="news-card-source">{article.source}</span>
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-card-link"
                    >
                        Read more →
                    </a>
                </div>
            </div>
        </article>
    )
}

export default NewsCard
