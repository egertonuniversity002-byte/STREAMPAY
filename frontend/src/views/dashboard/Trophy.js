// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'
import Skeleton from '@mui/material/Skeleton'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

  // ** Context Imports
  import { useAuth } from 'src/contexts/AuthContext'

// Styled component for the triangle shaped background image
const TriangleImg = styled('img')({
  right: 0,
  bottom: 0,
  height: 170,
  position: 'absolute'
})

// Styled component for the trophy image
const TrophyImg = styled('img')({
  right: 36,
  bottom: 20,
  height: 98,
  position: 'absolute'
})

// Styled component for the animated withdraw button
const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s ease-in-out',
    zIndex: 1,
  },
  '&:hover::before': {
    left: '100%',
  },
  '& .MuiButton-label': {
    position: 'relative',
    zIndex: 2,
  },
}))

const Trophy = () => {
  // ** Hook
  const theme = useTheme()
  const router = useRouter()
  const { token, isAuthenticated, refreshUser } = useAuth()
  const imageSrc = theme.palette.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png'

  // ** Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 22) return 'Good evening'
    return 'Hello'
  }

  // ** State
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Debug logging for dashboard data
  useEffect(() => {
    console.log('Dashboard data updated:', dashboardData)
    console.log('Loading state:', loading)
    console.log('Error state:', error)
  }, [dashboardData, loading, error])

// ** Fetch dashboard data with retry logic
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10
    const retryDelay = 3000 // 3 seconds

    const fetchDashboardData = async () => {
      try {
        console.log('Starting API call to fetch dashboard data...')
        setLoading(true)
        setError(null)

        if (!isAuthenticated()) {
          throw new Error('User is not authenticated')
        }
        console.log('User is authenticated, proceeding with API call')

        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('API call successful, data received:', data)
        setDashboardData(data)
        setLoading(false)
        // Update AuthContext with latest user data
        await refreshUser()
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        retryCount++

        if (retryCount < maxRetries) {
          console.log(`Retrying API call (${retryCount}/${maxRetries}) in ${retryDelay}ms...`)
          setTimeout(fetchDashboardData, retryDelay)
        } else {
          console.error('Max retries reached, setting error state')
          setError('Failed to load dashboard data after multiple attempts. Please check your connection and try again.')
          setLoading(false)
          // Set fallback data to prevent component from breaking
          setDashboardData({
            user: { full_name: 'User', is_activated: false, wallet_balance: 0 },
            currency: 'KES'
          })
        }
      }
    }

    fetchDashboardData()

    // Cleanup function to prevent memory leaks
    return () => {
      retryCount = maxRetries // Stop retries on unmount
    }
  }, [])

  // ** Loading skeleton for specific data areas
  const isLoadingData = loading

  // ** Error state
  if (error) {
    return (
      <Card sx={{ position: 'relative' }}>
        <CardContent>
          <Typography variant='h6' color="error">
            Error Loading Dashboard
          </Typography>
          <Typography variant='body2' color="error">
            {error}
          </Typography>
          <Button
            size='small'
            variant='outlined'
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ** Main component with data
  const user = dashboardData?.user || {}
  const currency = dashboardData?.currency || 'KES'

  return (
    <Card sx={{
      position: 'relative',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
      border: '2px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
        pointerEvents: 'none'
      }
    }}>
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
          {getTimeBasedGreeting()} {isLoadingData ? <Skeleton width="120px" sx={{ display: 'inline-block', bgcolor: 'rgba(255,255,255,0.3)' }} /> : <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{user.full_name || 'User'}</span>} 🥳
        </Typography>
        <Typography variant='body2' sx={{ letterSpacing: '0.25px', opacity: 0.9 }}>
          Best referrer of the month, {user.is_activated ? 'Congratulations!!' : 'Activate your account to start earning!'}
        </Typography>
        <Typography variant='h5' sx={{ my: 4, color: '#FFD700', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          {isLoadingData ? (
            <Skeleton width="150px" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          ) : (
            `${currency} ${user.wallet_balance ? user.wallet_balance.toLocaleString() : '0.00'}`
          )}
        </Typography>
        <AnimatedButton
          size='small'
          variant='contained'
          disabled={!user.is_activated || isLoadingData}
          onClick={() => {
            if (user.is_activated) {
              router.push('/pages/payments')
            } else {
              console.log('Account not activated')
            }
          }}
          sx={{
            background: user.is_activated
              ? 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)'
              : 'linear-gradient(45deg, #FF6B35 30%, #E55A2B 90%)',
            color: '#000',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            '&:hover': {
              background: user.is_activated
                ? 'linear-gradient(45deg, #FFE55C 30%, #FFD700 90%)'
                : 'linear-gradient(45deg, #FF8A65 30%, #FF6B35 90%)',
              boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
              transform: 'translateY(-2px)'
            },
            '&:disabled': {
              background: '#666',
              color: '#999'
            }
          }}
        >
          {user.is_activated ? 'Withdraw' : 'Activate Account'}
        </AnimatedButton>
        <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
        <TrophyImg alt='trophy' src='/images/misc/trophy.png' />
      </CardContent>
    </Card>
  )
}

export default Trophy
