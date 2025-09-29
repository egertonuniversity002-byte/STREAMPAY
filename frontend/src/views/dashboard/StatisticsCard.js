// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import { useState, useEffect } from 'react'

// ** Icons Imports
import TrendingUp from 'mdi-material-ui/TrendingUp'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import CellphoneLink from 'mdi-material-ui/CellphoneLink'
import AccountOutline from 'mdi-material-ui/AccountOutline'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const StatisticsCard = () => {
  // ** State
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  // ** Fetch dashboard data with retry logic
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10
    const retryDelay = 3000 // 3 seconds

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if user is authenticated
        if (!isAuthenticated() || !token) {
          console.error('Authentication required to fetch dashboard data')
          setLoading(false)
          return
        }

        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Invalid token - authentication required')
            setError('Authentication required. Please log in again.')
          } else {
            throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
          }
          return
        }

        const data = await response.json()
        setDashboardData(data)
        setLoading(false)
        // Update AuthContext with latest user data
        await refreshUser()
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        retryCount++

        if (retryCount < maxRetries) {
          console.log(`Retrying API call (${retryCount}/${maxRetries})...`)
          setTimeout(fetchDashboardData, retryDelay)
        } else {
          console.error('Max retries reached, still showing skeleton loading')
          // Keep showing skeleton loading even after max retries
          setTimeout(fetchDashboardData, retryDelay)
        }
      }
    }

    fetchDashboardData()

    // Cleanup function to prevent memory leaks
    return () => {
      retryCount = maxRetries // Stop retries on unmount
    }
  }, [token, isAuthenticated])

  // ** Dynamic data from API
  const user = dashboardData?.user || {}
  const analytics = dashboardData?.analytics || {}
  const currency = dashboardData?.currency || 'UGX'

  const salesData = [
    {
      stats: user.referral_count || 0,
      title: 'Total Referrals',
      color: 'primary',
      icon: <TrendingUp sx={{ fontSize: '1.75rem' }} />
    },
    {
      stats: `${currency} ${user.total_withdrawn ? user.total_withdrawn.toLocaleString() : '0.00'}`,
      title: 'Total Withdrawn',
      color: 'success',
      icon: <AccountOutline sx={{ fontSize: '1.75rem' }} />
    },
    {
      stats: `${currency} ${user.task_earnings ? user.task_earnings.toLocaleString() : '0.00'}`,
      title: 'Tasks Earnings',
      color: 'warning',
      icon: <CellphoneLink sx={{ fontSize: '1.75rem' }} />
    },
    {
      stats: `${currency} ${user.activation_expense ? user.activation_expense.toLocaleString() : '0.00'}`,
      title: 'Activation Expense',
      color: 'info',
      icon: <CurrencyUsd sx={{ fontSize: '1.75rem' }} />
    }
  ]

  const renderStats = () => {
    if (loading) {
      return salesData.map((item, index) => (
        <Grid item xs={12} sm={3} key={index}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={44} height={44} sx={{ mr: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={80} height={30} />
            </Box>
          </Box>
        </Grid>
      ))
    }

    return salesData.map((item, index) => {
      // Determine color based on value and type
      const getValueColor = (stats, title) => {
        // Extract numeric value from currency strings or use direct number
        const numericValue = typeof stats === 'number' ? stats : parseFloat(stats.replace(/[^0-9.-]/g, ''))
        return numericValue > 0 ? 'success.main' : 'error.main'
      }

      // Get advice text for zero values
      const getAdviceText = (stats, title) => {
        const numericValue = typeof stats === 'number' ? stats : parseFloat(stats.replace(/[^0-9.-]/g, ''))
        if (numericValue === 0) {
          switch (title) {
            case 'Total Referrals':
              return ' 👥 Start referring friends to grow your network!'
            case 'Total Withdrawn':
              return ' 💰 Start withdrawing to see earnings!'
            case 'Tasks Earnings':
              return ' 📱 Complete tasks to earn money!'
            case 'Activation Expense':
              return ' ⚡ Activate to unlock features!'
            default:
              return null
          }
        }
        return null
      }

      const valueColor = getValueColor(item.stats, item.title)
      const adviceText = getAdviceText(item.stats, item.title)

      const isPositive = valueColor === 'success.main'
      const getAvatarGradient = (title) => {
        switch (title) {
          case 'Total Referrals':
            return 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
          case 'Total Withdrawn':
            return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
          case 'Tasks Earnings':
            return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
          case 'Activation Expense':
            return 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)'
          default:
            return `${item.color}.main`
        }
      }

      return (
        <Grid item xs={12} sm={3} key={index}>
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              variant='rounded'
              sx={{
                mr: 3,
                width: 44,
                height: 44,
                boxShadow: isPositive ? '0 0 20px rgba(40, 167, 69, 0.5)' : '0 4px 15px rgba(0,0,0,0.2)',
                color: 'common.white',
                background: getAvatarGradient(item.title),
                animation: isPositive ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(40, 167, 69, 0.5)' },
                  '50%': { transform: 'scale(1.1)', boxShadow: '0 0 30px rgba(40, 167, 69, 0.8)' },
                  '100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(40, 167, 69, 0.5)' },
                },
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              {item.icon}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='caption' sx={{ color: theme => theme.palette.mode === 'dark' ? '#bbb' : '#666', fontWeight: 500 }}>
                {item.title}
              </Typography>
              <Typography variant='h6' sx={{
                color: valueColor,
                fontWeight: 'bold',
                animation: isPositive ? 'glow 2s infinite alternate' : 'none',
                '@keyframes glow': {
                  '0%': { textShadow: '0 0 5px rgba(40, 167, 69, 0.5)' },
                  '100%': { textShadow: '0 0 15px rgba(40, 167, 69, 0.8)' },
                },
              }}>
                {item.stats}
              </Typography>
              {adviceText && (
                <Typography variant='caption' sx={{ color: 'warning.main', fontSize: '0.7rem', mt: 0.5, fontStyle: 'italic' }}>
                  {adviceText}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      )
    })
  }

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
        title='Statistics Card'
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
        subheader={
          <Typography variant='body2'>
            <Box component='span' sx={{ fontWeight: 600, color: (analytics.weekly_growth_percentage || 0) > 0 ? 'success.main' : 'error.main' }}>
              Total {analytics.weekly_growth_percentage || 0}% growth
            </Box>
            { (analytics.weekly_growth_percentage || 0) === 0 && (
              <Box component='span' sx={{ fontWeight: 500, color: 'warning.main', ml: 1 }}>
                💡 Tip: Invite friends to boost your growth!
              </Box>
            )}
            😎 this month
          </Typography>
        }
        titleTypographyProps={{
          sx: {
            mb: 2.5,
            lineHeight: '2rem !important',
            letterSpacing: '0.15px !important',
            fontWeight: 'bold',
            color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50'
          }
        }}
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(3)} !important` }}>
        <Grid container spacing={[5, 0]}>
          {renderStats()}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
