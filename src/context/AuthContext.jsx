import { createContext, useState, useEffect, useContext } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token)
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout()
                } else {
                    setUser({ email: decoded.sub })
                    // Configure axios default header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                    // Optionally fetch full user details here
                }
            } catch (error) {
                logout()
            }
        }
        setLoading(false)
    }, [token])

    const login = async (email, password) => {
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)

        try {
            const response = await api.post('/auth/token', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const { access_token } = response.data
            localStorage.setItem('token', access_token)
            setToken(access_token)
            return { success: true }
        } catch (error) {
            console.error("Login error:", error)
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            }
        }
    }

    const register = async (email, full_name, password) => {
        try {
            await api.post('/auth/register', {
                email,
                full_name,
                password
            })
            // Auto login after register
            return await login(email, password)
        } catch (error) {
            console.error("Register error:", error)
            return {
                success: false,
                error: error.response?.data?.detail || 'Registration failed'
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        delete api.defaults.headers.common['Authorization']
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
