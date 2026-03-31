import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// User API
export const userApi = {
    submitProfile: async (profile) => {
        const response = await api.post('/user/profile', profile)
        return response.data
    },
    getProfile: async () => {
        const response = await api.get('/user/profile')
        return response.data
    },
    getRecommendations: async (profile) => {
        const response = await api.post('/user/recommendations', profile)
        return response.data
    },
    getAnalytics: async () => {
        const response = await api.get('/user/analytics')
        return response.data
    },
    getCountries: async () => {
        const response = await api.get('/user/countries')
        return response.data
    },
    getMajors: async () => {
        const response = await api.get('/user/majors')
        return response.data
    }
}

// News API
export const newsApi = {
    getNews: async (countries = null) => {
        const params = countries ? { countries: countries.join(',') } : {}
        const response = await api.get('/news/', { params })
        return response.data
    },
    getCategories: async () => {
        const response = await api.get('/news/categories')
        return response.data
    }
}

// Application API
export const applicationApi = {
    apply: async (data) => {
        const response = await api.post('/applications/', data)
        return response.data
    },
    getMyApplications: async () => {
        const response = await api.get('/applications/')
        return response.data
    },
    updateApplication: async (appId, data) => {
        const response = await api.put(`/applications/${appId}`, data)
        return response.data
    },
    deleteApplication: async (appId) => {
        const response = await api.delete(`/applications/${appId}`)
        return response.data
    },
    // Saved Universities
    saveUniversity: async (universityData) => {
        const response = await api.post('/applications/saved', { university_data: universityData })
        return response.data
    },
    getSavedUniversities: async () => {
        const response = await api.get('/applications/saved')
        return response.data
    },
    unsaveUniversity: async (savedId) => {
        const response = await api.delete(`/applications/saved/${savedId}`)
        return response.data
    }
}

// Chat API
export const chatApi = {
    sendMessage: async (message, sessionId = null) => {
        const response = await api.post('/chat/', { message, session_id: sessionId })
        return response.data
    },
    getHistory: async (sessionId = null) => {
        const params = sessionId ? { session_id: sessionId } : {}
        const response = await api.get('/chat/history', { params })
        return response.data
    },
    clearHistory: async (sessionId = null) => {
        const params = sessionId ? { session_id: sessionId } : {}
        const response = await api.delete('/chat/history', { params })
        return response.data
    }
}

// SOP API
export const sopApi = {
    generate: async (universityName, program, tone = 'balanced', additionalPoints = '') => {
        const response = await api.post('/sop/generate', {
            university_name: universityName,
            program,
            tone,
            additional_points: additionalPoints
        })
        return response.data
    },
    getDrafts: async () => {
        const response = await api.get('/sop/drafts')
        return response.data
    },
    updateDraft: async (draftId, content) => {
        const response = await api.put(`/sop/drafts/${draftId}`, { content })
        return response.data
    },
    deleteDraft: async (draftId) => {
        const response = await api.delete(`/sop/drafts/${draftId}`)
        return response.data
    }
}

// Document API
export const documentApi = {
    getChecklist: async (applicationId = null) => {
        const params = applicationId ? { application_id: applicationId } : {}
        const response = await api.get('/documents/checklist', { params })
        return response.data
    },
    autoGenerate: async (applicationId) => {
        const response = await api.post(`/documents/checklist/auto-generate/${applicationId}`)
        return response.data
    },
    addDocument: async (data) => {
        const response = await api.post('/documents/checklist', data)
        return response.data
    },
    updateDocument: async (docId, data) => {
        const response = await api.put(`/documents/checklist/${docId}`, data)
        return response.data
    },
    deleteDocument: async (docId) => {
        const response = await api.delete(`/documents/checklist/${docId}`)
        return response.data
    }
}

// Dashboard API
export const dashboardApi = {
    getData: async () => {
        const response = await api.get('/dashboard/')
        return response.data
    }
}

// Agent API
export const agentApi = {
    initiateApplication: async (userData, university) => {
        const response = await api.post('/agent/apply', {
            user_data: userData,
            university: university
        })
        return response.data
    },
    getApplicationStatus: async (trackingId) => {
        const response = await api.get(`/agent/status/${trackingId}`)
        return response.data
    },
    getUserApplications: async (email) => {
        const response = await api.get('/agent/applications', {
            params: { email }
        })
        return response.data
    }
}

export default api
