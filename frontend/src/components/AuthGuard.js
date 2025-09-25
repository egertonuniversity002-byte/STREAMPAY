// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** MUI Imports
import { CircularProgress, Box, Alert, Button } from '@mui/material'

const AuthGuard = ({ children, requireAuth = true }) => {
  const { user, loading, isAuthenticated, isActivated, getUserRole, authError, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated()) {
        // Not authenticated, redirect to login
        router.push('/pages/login')
        return
      }

      if (requireAuth && isAuthenticated() && !isActivated()) {
        // Authenticated but not activated, redirect to payments
        router.push('/pages/payments')
        return
      }

      if (requireAuth && isAuthenticated() && isActivated()) {
        // Authenticated and activated, redirect based on role
        const userRole = getUserRole()
        const currentPath = router.pathname

        // Role-based routing
        if (userRole === 'admin' && !currentPath.startsWith('/admin')) {
          router.push('/admin')
          return
        }

        if (userRole === 'user' && currentPath.startsWith('/admin')) {
          router.push('/')
          return
        }
      }
    }
  }, [loading, user, requireAuth, router])

  // Update AuthContext with latest user data on component mount
  useEffect(() => {
    const updateUserData = async () => {
      if (isAuthenticated() && !loading) {
        await refreshUser()
      }
    }

    updateUserData()
  }, [isAuthenticated, loading, refreshUser])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Don't render children if redirecting
  if (requireAuth && !isAuthenticated()) {
    return null
  }

  if (requireAuth && isAuthenticated() && !isActivated()) {
    return null
  }

  return children
}

export default AuthGuard
