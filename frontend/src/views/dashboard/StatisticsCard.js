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

      return (
        <Grid item xs={12} sm={3} key={index}>
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              variant='rounded'
              sx={{
                mr: 3,
                width: 44,
                height: 44,
                boxShadow: 3,
                color: 'common.white',
                backgroundColor: `${item.color}.main`
              }}
            >
              {item.icon}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='caption'>{item.title}</Typography>
              <Typography variant='h6' sx={{ color: valueColor }}>
                {item.stats}
              </Typography>
              {adviceText && (
                <Typography variant='caption' sx={{ color: 'warning.main', fontSize: '0.7rem', mt: 0.5 }}>
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
      background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '16px',
      boxShadow: theme => theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.7)' : '0 15px 35px rgba(0,0,0,0.1)',
      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 25px 50px rgba(0,0,0,0.9)' : '0 25px 50px rgba(0,0,0,0.15)'
      }
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
