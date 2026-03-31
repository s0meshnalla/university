const OFFICIAL_APPLICATION_URLS = {
    'massachusetts institute of technology': 'https://gradadmissions.mit.edu',
    'stanford university': 'https://gradadmissions.stanford.edu',
    'university of california berkeley': 'https://grad.berkeley.edu',
    'carnegie mellon university': 'https://www.cmu.edu/graduate',
    'university of toronto': 'https://sgs.utoronto.ca',
    'technical university of munich': 'https://www.tum.de/en/studies/application',
    'university of melbourne': 'https://study.unimelb.edu.au',
    'university college london': 'https://www.ucl.ac.uk/prospective-students',
    'harvard university': 'https://gsas.harvard.edu',
    'princeton university': 'https://gradschool.princeton.edu/admissions',
    'yale university': 'https://gsas.yale.edu/admissions',
    'university of cambridge': 'https://www.postgraduate.study.cam.ac.uk',
    'university of oxford': 'https://www.ox.ac.uk/admissions/graduate',
    'eth zurich': 'https://ethz.ch/en/studies/master/application.html',
    'imperial college london': 'https://www.imperial.ac.uk/study/apply',
}

const INVALID_HOST_HINTS = [
    'example.com',
    'actual-admissions-url.edu',
    'localhost',
    '127.0.0.1',
]

const normalizeUniversityName = (name = '') =>
    name
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

const looksLikePlaceholder = (url) => {
    const lower = (url || '').toLowerCase()
    if (!lower || lower === '#' || lower === '/') return true
    return INVALID_HOST_HINTS.some((hint) => lower.includes(hint))
}

const sanitizeHttpUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return null

    let candidate = rawUrl.trim()
    if (!candidate || looksLikePlaceholder(candidate)) return null

    if (candidate.startsWith('www.')) {
        candidate = `https://${candidate}`
    }

    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
        candidate = `https://${candidate}`
    }

    try {
        const parsed = new URL(candidate)
        const protocol = parsed.protocol.toLowerCase()
        if (protocol !== 'http:' && protocol !== 'https:') return null
        if (looksLikePlaceholder(parsed.hostname)) return null
        return parsed.toString()
    } catch {
        return null
    }
}

const buildSearchFallback = (university = {}) => {
    const name = university?.name || 'university'
    const country = university?.country ? ` ${university.country}` : ''
    const query = `${name}${country} official graduate admissions`
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}

export const resolveUniversityApplyTarget = (university = {}) => {
    const providedCandidates = [
        university.apply_url,
        university.application_url,
        university.website,
    ]

    for (const candidate of providedCandidates) {
        const valid = sanitizeHttpUrl(candidate)
        if (valid) {
            return {
                url: valid,
                source: 'provided',
                isOfficial: true,
            }
        }
    }

    const key = normalizeUniversityName(university?.name)
    if (key && OFFICIAL_APPLICATION_URLS[key]) {
        return {
            url: OFFICIAL_APPLICATION_URLS[key],
            source: 'catalog',
            isOfficial: true,
        }
    }

    return {
        url: buildSearchFallback(university),
        source: 'search',
        isOfficial: false,
    }
}
