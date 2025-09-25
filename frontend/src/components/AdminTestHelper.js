// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useState, useEffect } from 'react'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const AdminTestHelper = () => {
  const [user, setUser] = useState(null)
  const [showHelper, setShowHelper] = useState(false)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    // Update AuthContext with latest user data
    refreshUser()
  }, [token, isAuthenticated, refreshUser])

  const makeUserAdmin = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    currentUser.role = 'admin'
    localStorage.setItem('user', JSON.stringify(currentUser))
    setUser(currentUser)
    // Update AuthContext with latest user data
    await refreshUser()
    window.location.reload()
  }

  const makeUserRegular = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    currentUser.role = 'user'
    localStorage.setItem('user', JSON.stringify(currentUser))
    setUser(currentUser)
    // Update AuthContext with latest user data
    await refreshUser()
    window.location.reload()
  }

  const resetUser = async () => {
    localStorage.removeItem('user')
    setUser(null)
    // Update AuthContext with latest user data
    await refreshUser()
    window.location.reload()
  }

  // Show helper only in development or if user is not admin
  if (!showHelper && user?.role === 'admin') {
    return null
  }

  return (
    <Card sx={{ mb: 4, border: '2px solid #ff9800' }}>
      <CardHeader
        title="🔧 Admin Testing Helper"
        subheader="This component helps you test admin functionality"
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Current user: {user ? `${user.email || user.username} (${user.role || 'no role'})` : 'No user logged in'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="warning"
              onClick={makeUserAdmin}
              disabled={user?.role === 'admin'}
            >
              Make Admin (for testing)
            </Button>

            <Button
              variant="outlined"
              color="info"
              onClick={makeUserRegular}
              disabled={user?.role !== 'admin'}
            >
              Make Regular User
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={resetUser}
            >
              Reset User
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary">
            💡 Use this to test admin functionality. In production, user roles should be managed by your backend.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AdminTestHelper
