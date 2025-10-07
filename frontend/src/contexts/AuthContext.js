// ** React Imports
import { createContext, useContext, useEffect, useState, useRef } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [authError, setAuthError] = useState(null)
  const router = useRouter()

  // Refs to prevent infinite loops and track refresh attempts
  const refreshIntervalRef = useRef(null)
  const refreshAttemptsRef = useRef(0)
  const maxRefreshAttempts = 3
  const refreshInterval = 300000 // 5 minutes (reduced from 2 minutes)
  const lastRefreshRef = useRef(0) // Track last refresh time

  // Initialize auth state from localStorage/sessionStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser)
          // Extract the user object from stored data (could be nested or direct)
          const userObject = userData.user || userData
          setToken(storedToken)
          setUser(userObject)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh user data when authenticated with retry logic
  useEffect(() => {
    if (!token || loading) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      return
    }

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    const performRefresh = async () => {
      try {
        const response = await fetch('https://official-paypal.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (response.ok) {
          const userData = await response.json()
          // Extract the user object from the response (API returns { success: true, user: {...} })
          const userObject = userData.user || userData
          setUser(userObject)
          setAuthError(null)
          refreshAttemptsRef.current = 0 // Reset attempts on success

          // Update stored user data
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage
          storage.setItem('user', JSON.stringify(userObject))

          // Update AuthContext with latest user data
          await refreshUser()
        } else if (response.status === 401) {
          // Token is invalid, logout user
          console.warn('Token expired or invalid, logging out')
          logout()
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
        setAuthError(`Authentication refresh failed: ${error.message}`)

        // Implement retry logic with exponential backoff
        refreshAttemptsRef.current += 1
        if (refreshAttemptsRef.current >= maxRefreshAttempts) {
          console.warn('Max refresh attempts reached, stopping auto-refresh')
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current)
            refreshIntervalRef.current = null
          }
          // Optionally logout user after max attempts
          // logout()
        }
      }
    }

    // Start the refresh interval
    refreshIntervalRef.current = setInterval(performRefresh, refreshInterval)

    // Perform initial refresh
    performRefresh()

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [token, loading])

  // Refresh user data when tab becomes visible (useful after activation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        refreshUser()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [token])

  // Login function with improved error handling
  const login = async (email, password, rememberMe = false) => {
    setAuthError(null) // Clear any previous errors

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.detail || data.message || 'Login failed'
        setAuthError(errorMessage)
        throw new Error(errorMessage)
      }

      // Store token and user data
      if (data.token && data.user) {
        setToken(data.token)
        setUser(data.user)
        setAuthError(null)

        if (rememberMe) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          sessionStorage.setItem('token', data.token)
          sessionStorage.setItem('user', JSON.stringify(data.user))
        }

        // Reset refresh attempts on successful login
        refreshAttemptsRef.current = 0
      } else {
        throw new Error('Invalid response from server')
      }


















      return { success: true, user: data.user }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred'
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    router.push('/pages/login')
  }

  // Request password reset function
  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch('https://official-paypal.onrender.com/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.detail || data.message || 'Request failed'
        throw new Error(errorMessage)
      }

      return { success: true, message: data.message }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred'
      throw new Error(errorMessage)
    }
  }

  // Verify reset token function
  const verifyResetToken = async (token) => {
    try {
      const response = await fetch(`https://official-paypal.onrender.com/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.detail || data.message || 'Token verification failed'
        throw new Error(errorMessage)
      }

      return { success: true, valid: data.valid, expires_at: data.expires_at, message: data.message }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred'
      throw new Error(errorMessage)
    }
  }

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch('https://official-paypal.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.detail || data.message || 'Password reset failed'
        throw new Error(errorMessage)
      }

      return { success: true, message: data.message, next_step: data.next_step }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred'
      throw new Error(errorMessage)
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user
  }

  // Check if user is activated
  const isActivated = () => {
    if (!user) return false

    // Handle nested user structure from API response
    const userData = user.user || user

    // Handle both boolean and string values
    const isActivatedValue = userData.is_activated
    return isActivatedValue === true || isActivatedValue === 'true' || isActivatedValue === 1
  }

  // Get user role
  const getUserRole = () => {
    if (!user) return 'user'

    // Handle nested user structure from API response
    const userData = user.user || user
    return userData.role || 'user'
  }

  // Debug function to check current auth state
  const debugAuthState = () => {
    console.log('=== AUTH DEBUG INFO ===')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('User:', user)
    console.log('Loading:', loading)
    console.log('Auth Error:', authError)
    console.log('Is Authenticated:', isAuthenticated())
    console.log('Is Activated:', isActivated())
    console.log('User Role:', getUserRole())
    console.log('Stored User Data:', localStorage.getItem('user') || sessionStorage.getItem('user'))
    console.log('======================')
    return {
      hasToken: !!token,
      hasUser: !!user,
      loading,
      authError,
      isAuthenticated: isAuthenticated(),
      isActivated: isActivated(),
      userRole: getUserRole(),
      storedUserData: localStorage.getItem('user') || sessionStorage.getItem('user')
    }
  }

  // Refresh user data with improved error handling and request deduplication
  const refreshUser = async (force = false) => {
    if (!token) return

    // Prevent duplicate requests within 30 seconds unless forced
    const now = Date.now()
    if (!force && now - lastRefreshRef.current < 30000) {
      console.log('Skipping refresh - too soon since last refresh')
      return user
    }

    // Prevent multiple simultaneous requests
    if (refreshUser.isRefreshing) {
      console.log('Refresh already in progress, waiting...')
      return new Promise((resolve) => {
        const checkRefresh = setInterval(() => {
          if (!refreshUser.isRefreshing) {
            clearInterval(checkRefresh)
            resolve(user)
          }
        }, 100)
      })
    }

    refreshUser.isRefreshing = true
    lastRefreshRef.current = now

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (response.ok) {
        const userData = await response.json()
        // Extract the user object from the response (API returns { success: true, user: {...} })
        const userObject = userData.user || userData
        setUser(userObject)
        setAuthError(null)

        // Update stored user data
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage
        storage.setItem('user', JSON.stringify(userObject))

        return userObject
      } else if (response.status === 401) {
        console.warn('Token expired during manual refresh, logging out')
        logout()
        return null
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      setAuthError(`Manual refresh failed: ${error.message}`)
      throw error
    } finally {
      refreshUser.isRefreshing = false
    }
  }

  const value = {
    user,
    token,
    loading,
    authError,
    login,
    logout,
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    isAuthenticated,
    isActivated,
    getUserRole,
    refreshUser,
    debugAuthState
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
