// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'

// ** Icons Imports
import MenuUp from 'mdi-material-ui/MenuUp'
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** React Imports
import { useState, useEffect } from 'react'

// ** Context Imports (if needed for auth)
import { useAuth } from '../../contexts/AuthContext' // Assuming AuthContext provides auth token

const TotalEarning = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, token, loading: authLoading } = useAuth() // Get token and loading from AuthContext

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return // Wait for auth to load
      try {
        const authToken = token || localStorage.getItem('token') // Get token from AuthContext or localStorage
        if (!authToken) {
          throw new Error('No authentication token found. Please log in.')
        }
        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.detail === 'Invalid token') {
            throw new Error('Invalid token. Please log in again.')
          }
          throw new Error('Failed to fetch dashboard stats')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, authLoading])

  // Skeleton loading component (only for data-dependent parts)
  const SkeletonLoading = () => (
    <Card>
      <CardHeader
        title='Total Earning'
        titleTypographyProps={{ sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' } }}
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(2.25)} !important` }}>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="text" width={100} height={40} />
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <MenuUp sx={{ fontSize: '1.875rem', verticalAlign: 'middle' }} />
            <Skeleton variant="text" width={50} sx={{ ml: 1 }} />
          </Box>
        </Box>

        <Typography component='p' variant='caption' sx={{ mb: 10 }}>
          Compared to last week
        </Typography>

        {[1, 2, 3].map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: index !== 2 ? 8.5 : 0
            }}
          >
            <Avatar
              variant='rounded'
              sx={{
                mr: 3,
                width: 40,
                height: 40,
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.04)`
              }}
            >
              <img src="/images/cards/logo-zipcar.png" alt="placeholder" height={20} />
            </Avatar>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={150} height={15} />
              </Box>
              <Box sx={{ minWidth: 85 }}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={6} />
              </Box>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  )

  if (loading) {
    return <SkeletonLoading />
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error loading data: {error}</Typography>
        </CardContent>
      </Card>
    )
  }

  // Dynamic data based on API response with random progress values
  const dynamicData = [
    {
      progress: Math.floor(Math.random() * 100),
      imgHeight: 20,
      title: 'Commissions',
      color: 'primary',
      amount: data.analytics.weekly_breakdown.binary_commission || 0,
      subtitle: 'Friends, Family & MDA',
      imgSrc: '/images/cards/logo-zipcar.png'
    },
    {
      progress: Math.floor(Math.random() * 100),
      color: 'info',
      imgHeight: 27,
      title: 'Rewards',
      amount: data.analytics.weekly_breakdown.referral_reward || 0,
      subtitle: 'StreamPay Systems',
      imgSrc: '/images/cards/logo-bitbank.png'
    },
    {
      progress: Math.floor(Math.random() * 100),
      imgHeight: 20,
      title: 'Lotary',
      color: 'secondary',
      amount: data.analytics.weekly_breakdown.spin_and_win || 0,
      subtitle: 'Lotaries',
      imgSrc: '/images/cards/logo-aviato.png'
    }
  ]

  return (
    <Card sx={{
      background: theme => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
      borderRadius: '20px',
      boxShadow: theme => theme.palette.mode === 'dark'
        ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
        : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      animation: 'fadeInUp 0.6s ease-out',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
        transition: 'left 0.5s',
      },
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: theme => theme.palette.mode === 'dark'
          ? '0 30px 60px rgba(0, 123, 255, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
          : '0 30px 60px rgba(0, 123, 255, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
        '&::before': {
          left: '100%',
        }
      },
      '@keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(20px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
    }}>
      <CardHeader
        title='Total Earning'
        titleTypographyProps={{
          sx: {
            lineHeight: '1.6 !important',
            letterSpacing: '0.15px !important',
            fontWeight: 'bold',
            color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50'
          }
        }}
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(2.25)} !important` }}>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
          <Typography variant='h4' sx={{
            fontWeight: 600,
            fontSize: '2.125rem !important',
            color: 'primary.main',
            textShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(25, 118, 210, 0.3)',
            animation: 'glow 2s infinite alternate',
            '@keyframes glow': {
              '0%': { textShadow: '0 0 5px rgba(25, 118, 210, 0.5)' },
              '100%': { textShadow: '0 0 15px rgba(25, 118, 210, 0.8)' },
            },
          }}>
            {data.currency || 'KES'} {data.user.total_earned || 0}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <MenuUp sx={{ 
              fontSize: '1.875rem', 
              verticalAlign: 'middle',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }} />
            <Typography variant='body2' sx={{ 
              fontWeight: 600, 
              color: 'success.main',
              animation: 'glow 2s infinite alternate',
              '@keyframes glow': {
                '0%': { textShadow: '0 0 5px rgba(40, 167, 69, 0.5)' },
                '100%': { textShadow: '0 0 15px rgba(40, 167, 69, 0.8)' },
              },
            }}>
              {data.analytics.weekly_growth_percentage || 0}%
            </Typography>
          </Box>
        </Box>

        <Typography component='p' variant='caption' sx={{ mb: 10, color: 'text.secondary' }}>
          Compared to last week
        </Typography>

        {dynamicData.map((item, index) => {
          return (
            <Box
              key={item.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                ...(index !== dynamicData.length - 1 ? { mb: 8.5 } : {}),
                p: 2,
                borderRadius: '12px',
                background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Avatar
                variant='rounded'
                sx={{
                  mr: 3,
                  width: 40,
                  height: 40,
                  background: item.color === 'primary'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : item.color === 'info'
                    ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
                    : item.color === 'secondary'
                    ? 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
                    : `${item.color}.main`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <img src={item.imgSrc} alt={item.title} height={item.imgHeight} />
              </Avatar>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ mb: 0.5, fontWeight: 600, color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' }}>
                    {item.title}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>{item.subtitle}</Typography>
                </Box>

                <Box sx={{ minWidth: 85, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    {item.amount}
                  </Typography>
                  <LinearProgress
                    color={item.color}
                    value={item.progress}
                    variant='determinate'
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: item.color === 'primary'
                          ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                          : item.color === 'info'
                          ? 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)'
                          : item.color === 'secondary'
                          ? 'linear-gradient(90deg, #9C27B0 0%, #7B1FA2 100%)'
                          : `${item.color}.main`
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default TotalEarning
