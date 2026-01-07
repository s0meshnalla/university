import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// User API
export const userApi = {
    submitProfile: async (profile) => {
        const response = await api.post('/user/profile', profile)
        return response.data
    },

    getRecommendations: async (profile) => {
        const response = await api.post('/user/recommendations', profile)
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
        const response = await api.post('/applications/', data) // Trailing slash might matter based on backend
        return response.data
    },

    getMyApplications: async () => {
        const response = await api.get('/applications/')
        return response.data
    }
}

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

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
