// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** MUI Imports
import { CircularProgress, Box } from '@mui/material'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const router = useRouter()

  // Handle SSR case where context might not be available
  try {
    const { user, loading, isAuthenticated, isActivated, getUserRole } = useAuth()

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
      return null // Will redirect to payments in useEffect
    }

    return children
  } catch (error) {
    // Handle SSR case where context is not available
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
}

export default ProtectedRoute
