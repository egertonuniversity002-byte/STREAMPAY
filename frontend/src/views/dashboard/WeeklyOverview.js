// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

// ** Icons Imports
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const WeeklyOverview = () => {
  // ** Hook
  const theme = useTheme()

  // ** State
  const [weeklyData, setWeeklyData] = useState([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
  const [weeklyGrowthPercentage, setWeeklyGrowthPercentage] = useState(0.0)
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [copying, setCopying] = useState(false)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true)

        // Check if user is authenticated
        if (!isAuthenticated() || !token) {
          console.error('Authentication required to fetch weekly data')
          setLoading(false)
          return
        }

        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Data received:', data)
          console.log('daily_earnings:', data.analytics?.daily_earnings)
          // Extract daily_earnings from the response and pad to 7 values with zeros if needed
          const dailyEarnings = data.analytics?.daily_earnings || []
          const paddedEarnings = [...dailyEarnings, ...Array(7 - dailyEarnings.length).fill(0.0)].slice(0, 7)
          // Extract weekly_growth_percentage from the response
          const growthPercentage = data.analytics?.weekly_growth_percentage || 0.0
          // Extract referral_code from the user data
          const userReferralCode = data.user?.referral_code || ''
          // Update weekly data with padded daily_earnings
          setWeeklyData(paddedEarnings)
          console.log('Weekly data set to:', paddedEarnings)
          // Update weekly growth percentage
          setWeeklyGrowthPercentage(growthPercentage)
          // Update referral code
          setReferralCode(userReferralCode)
          // Update AuthContext with latest user data
          await refreshUser()
        } else {
          console.error('Response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching weekly data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyData()
  }, [token, isAuthenticated])

  const handleCopyReferralLink = async () => {
    if (!referralCode) return

    setCopying(true)
    const referralLink = `${window.location.origin}/pages/register/?ref=${referralCode}`

    try {
      await navigator.clipboard.writeText(referralLink)
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Failed to copy referral link:', error)
    } finally {
      setTimeout(() => setCopying(false), 1000)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 9,
        distributed: true,
        columnWidth: '40%',
        endingShape: 'rounded',
        startingShape: 'rounded'
      }
    },
    stroke: {
      width: 2,
      colors: [theme.palette.background.paper]
    },
    legend: { show: false },
    grid: {
      strokeDashArray: 7,
      padding: {
        top: -1,
        right: 0,
        left: -12,
        bottom: 5
      }
    },
    dataLabels: { enabled: false },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
      theme.palette.primary.light
    ],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tickPlacement: 'on',
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetX: -17,
        formatter: value => `${value > 999 ? `${(value / 1000).toFixed(0)}` : value}k`
      }
    }
  }

  return (
    <Card sx={{
      background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
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
        title='Weekly Overview'
        titleTypographyProps={{
          sx: {
            lineHeight: '2rem !important',
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
      <CardContent sx={{ '& .apexcharts-xcrosshairs.apexcharts-active': { opacity: 0 } }}>
        <ReactApexcharts type='bar' height={205} options={options} series={[{ data: weeklyData }]} />
        <Box sx={{ mb: 7, display: 'flex', alignItems: 'center' }}>
          <Typography variant='h5' sx={{ mr: 4, color: 'primary.main', fontWeight: 'bold', textShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(25, 118, 210, 0.3)' }}>
            {weeklyGrowthPercentage.toFixed(1)}%
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>Your earnings performance is {weeklyGrowthPercentage.toFixed(1)}% 😎 better compared to last month</Typography>
        </Box>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            fullWidth
            variant='contained'
            onClick={handleCopyReferralLink}
            disabled={copying || !referralCode}
            startIcon={<ContentCopyIcon />}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
              }
            }}
          >
            {copying ? 'Copying...' : 'Copy Referral Link'}
          </Button>
        </motion.div>
      </CardContent>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '0.9rem',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
        >
          🎉 Referral link copied! Share it with friends to earn rewards!
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default WeeklyOverview
