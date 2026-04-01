import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

axios.defaults.baseURL = ''
axios.defaults.withCredentials = true

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((newToken, userData) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`
      setToken(newToken)
    }
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
    }
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common.Authorization
  }, [])

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common.Authorization
    }
  }, [token])

  useEffect(() => {
    const verify = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        setToken(storedToken)
        axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`
        const response = await axios.get('/api/auth/me')
        if (response.data.success) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user))
          setUser(response.data.user)
        } else {
          clearSession()
        }
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [clearSession])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data
        persistSession(newToken, userData)
        toast.success('Успішний вхід!')
        return { success: true }
      }
      return { success: false, message: response.data?.message }
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
      return { success: false, message: response.data?.message }
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
      clearSession()
      toast.success('Ви вийшли з системи')
    }
  }

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const next = { ...prev, ...userData }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearSession,
    persistSession,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
