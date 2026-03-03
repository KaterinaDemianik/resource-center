import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'
axios.defaults.withCredentials = true

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(Cookies.get('token'))

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = Cookies.get('token')
      if (savedToken) {
        try {
          setToken(savedToken)
          const response = await axios.get('/api/auth/me')
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            // Token is invalid, remove it
            Cookies.remove('token')
            setToken(null)
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          Cookies.remove('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data
        
        // Save token to cookie (expires in 7 days)
        Cookies.set('token', newToken, { expires: 7 })
        setToken(newToken)
        setUser(userData)
        
        toast.success('Успішний вхід!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Помилка входу'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      
      if (response.data.success) {
        toast.success('Реєстрація успішна! Перевірте електронну пошту для підтвердження.')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Помилка реєстрації'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of server response
      Cookies.remove('token')
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
      toast.success('Ви вийшли з системи')
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
