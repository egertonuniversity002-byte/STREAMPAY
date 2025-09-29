// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import WalletOutline from 'mdi-material-ui/WalletOutline'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import CashMultiple from 'mdi-material-ui/CashMultiple'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const PaymentDashboard = ({ user, activeTab, setActiveTab }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [actionLoading, setActionLoading] = useState('')

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch dashboard stats')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('PaymentDashboard: API response received:', data)
          setStats(data)
          // Update AuthContext with latest user data
          await refreshUser()
        } else if (response.status === 401) {
          console.error('Invalid token - authentication required')
          setSnackbar({
            open: true,
            message: 'Authentication required. Please log in again.',
            severity: 'error'
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setSnackbar({
          open: true,
          message: 'Failed to load dashboard data. Please try again.',
          severity: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token, isAuthenticated])

  // ** Debug logging for stats
  useEffect(() => {
    console.log('PaymentDashboard: Stats updated:', stats)
    console.log('PaymentDashboard: Loading state:', loading)
  }, [stats, loading])

  const formatCurrency = (amount, currency = 'TZS') => {
    // Use the currency from stats if available, otherwise default to TZS
    const displayCurrency = stats?.currency || currency

    // For TZS (Tanzanian Shilling), use Tanzania locale
    if (displayCurrency === 'TZS') {
      return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS'
      }).format(amount)
    }

    // For other currencies, use appropriate locale
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: displayCurrency
    }).format(amount)
  }

  // ** Quick Action Handlers
  const handleQuickAction = (action, tabValue = null) => {
    setActionLoading(action)

    try {
      if (tabValue && setActiveTab) {
        // Switch to specific tab using state
        setActiveTab(tabValue)
        setSnackbar({
          open: true,
          message: `Switched to ${action}`,
          severity: 'success'
        })
      } else if (!tabValue) {
        // Navigate to dashboard
        window.location.href = '/'
        setSnackbar({
          open: true,
          message: 'Redirecting to dashboard...',
          severity: 'success'
        })
      } else {
        setSnackbar({
          open: true,
          message: `Unable to switch tabs`,
          severity: 'error'
        })
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
      setSnackbar({
        open: true,
        message: `Failed to ${action.toLowerCase()}`,
        severity: 'error'
      })
    } finally {
      setTimeout(() => setActionLoading(''), 1000)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return <LinearProgress />
  }

  return (
    <Grid container spacing={6}>
      {/* Wallet Balance Card */}
      <Grid item xs={12} md={6} lg={4}>
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
            background: 'linear-gradient(90deg, transparent, rgba(0,123,255,0.2), transparent)',
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
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WalletOutline sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Wallet Balance</Typography>
            </Box>
            <Typography variant='h4' sx={{ mb: 1, fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#00d4ff' : '#007bff' }}>
              {formatCurrency(stats?.user?.wallet_balance || user?.wallet_balance || 0, stats?.currency || 'TZS')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Available for withdrawal
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Earnings Card */}
      <Grid item xs={12} md={6} lg={4}>
        <Card sx={{
          background: theme => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 50%, #fff3e0 100%)',
          borderRadius: '20px',
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(34, 197, 94, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
            : '0 20px 40px rgba(34, 197, 94, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(34,197,94,0.2)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          animation: 'fadeInUp 0.7s ease-out',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 30px 60px rgba(34, 197, 94, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
              : '0 30px 60px rgba(34, 197, 94, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
            '&::before': {
              left: '100%',
            }
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp sx={{ mr: 2, color: 'success.main', fontSize: '2rem' }} />
              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Total Earnings</Typography>
            </Box>
            <Typography variant='h4' sx={{ mb: 1, fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#22c55e' : '#22c55e' }}>
              {formatCurrency(stats?.user?.total_earned || user?.total_earned || 0, stats?.currency || 'TZS')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              All time earnings
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Activation Status Card */}
      <Grid item xs={12}>
        <Card sx={{
          background: theme => !(stats?.user?.is_activated || user?.is_activated)
            ? (theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2d1b1b 0%, #3d2b1f 50%, #4d3b2f 100%)'
                : 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 50%, #ffd54f 100%)')
            : (theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1b2d1b 0%, #2f3d1f 50%, #3f4d2f 100%)'
                : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 50%, #a8d5ba 100%)'),
          borderRadius: '20px',
          boxShadow: theme => !(stats?.user?.is_activated || user?.is_activated)
            ? (theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(255, 193, 7, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                : '0 20px 40px rgba(255, 193, 7, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)')
            : (theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(40, 167, 69, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                : '0 20px 40px rgba(40, 167, 69, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)'),
          border: theme => !(stats?.user?.is_activated || user?.is_activated)
            ? (theme.palette.mode === 'dark' ? '1px solid rgba(255,193,7,0.3)' : '1px solid rgba(255,193,7,0.2)')
            : (theme.palette.mode === 'dark' ? '1px solid rgba(40,167,69,0.3)' : '1px solid rgba(40,167,69,0.2)'),
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          animation: 'fadeInUp 0.8s ease-out',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${!(stats?.user?.is_activated || user?.is_activated) ? 'rgba(255,193,7,0.2)' : 'rgba(40,167,69,0.2)'}, transparent)`,
            transition: 'left 0.5s',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme => !(stats?.user?.is_activated || user?.is_activated)
              ? (theme.palette.mode === 'dark'
                  ? '0 30px 60px rgba(255, 193, 7, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
                  : '0 30px 60px rgba(255, 193, 7, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)')
              : (theme.palette.mode === 'dark'
                  ? '0 30px 60px rgba(40, 167, 69, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
                  : '0 30px 60px rgba(40, 167, 69, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)'),
            '&::before': {
              left: '100%',
            }
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccountOutline sx={{
                mr: 2,
                fontSize: 40,
                color: (stats?.user?.is_activated || user?.is_activated) ? 'success.main' : 'warning.main',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))'
              }} />
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' }}>
                  {(stats?.user?.is_activated || user?.is_activated) ? 'Account Activated' : 'Account Not Activated'}
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {(stats?.user?.is_activated || user?.is_activated)
                    ? 'Your account is fully activated and ready to use'
                    : 'Activate your account to access all features'
                  }
                </Typography>
              </Box>
            </Box>

            {!(stats?.user?.is_activated || user?.is_activated) && (
              <Box sx={{
                bgcolor: 'warning.dark',
                p: 3,
                borderRadius: 2,
                mb: 3,
                border: '1px solid rgba(255,193,7,0.3)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant='h6' sx={{ color: 'warning.contrastText', mb: 2, fontWeight: 'bold' }}>
                  🚀 Activate Your Account
                </Typography>
                <Typography variant='body1' sx={{ color: 'warning.contrastText', mb: 2 }}>
                  To unlock all payment features including withdrawals, transaction history, and advanced options,
                  you need to make a minimum deposit of {formatCurrency(stats?.user?.activation_amount || user?.activation_amount || 500)}.
                </Typography>
                <Typography variant='body2' sx={{ color: 'warning.contrastText' }}>
                  Once activated, you'll have full access to all platform features and benefits.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Chip
                label={(stats?.user?.is_activated || user?.is_activated) ? 'Activated' : 'Not Activated'}
                color={(stats?.user?.is_activated || user?.is_activated) ? 'success' : 'warning'}
                variant='filled'
                size='large'
                sx={{
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease'
                  }
                }}
              />
              {!(stats?.user?.is_activated || user?.is_activated) && (
                <Button
                  variant='contained'
                  color='warning'
                  size='large'
                  onClick={() => setActiveTab && setActiveTab('deposit')}
                  sx={{
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(255,193,7,0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 6px 20px rgba(255,193,7,0.6)'
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)'
                    }
                  }}
                >
                  Make Deposit to Activate
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant='contained'
                  fullWidth
                  startIcon={<CreditCardOutline />}
                  onClick={() => handleQuickAction('Make Deposit', 'deposit')}
                  disabled={actionLoading === 'Make Deposit'}
                >
                  {actionLoading === 'Make Deposit' ? 'Switching...' : 'Make Deposit'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant='outlined'
                  fullWidth
                  startIcon={<CashMultiple />}
                  onClick={() => handleQuickAction('Withdraw Funds', 'withdraw')}
                  disabled={(stats?.user?.wallet_balance || user?.wallet_balance) <= 0 || actionLoading === 'Withdraw Funds'}
                >
                  {actionLoading === 'Withdraw Funds' ? 'Switching...' : 'Withdraw Funds'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant='outlined'
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => handleQuickAction('View History', 'history')}
                  disabled={actionLoading === 'View History'}
                >
                  {actionLoading === 'View History' ? 'Switching...' : 'View History'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant='outlined'
                  fullWidth
                  startIcon={<AccountOutline />}
                  onClick={() => handleQuickAction('Dashboard')}
                  disabled={actionLoading === 'Dashboard'}
                >
                  {actionLoading === 'Dashboard' ? 'Redirecting...' : 'Dashboard'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      {stats?.activity?.transactions && stats.activity.transactions.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Recent Transactions
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {stats.activity.transactions.slice(0, 5).map((transaction, index) => (
                  <Box key={transaction.id || index} sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {transaction.description}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                        </Typography>
                        <Chip
                          label={transaction.status}
                          size='small'
                          color={transaction.status === 'completed' ? 'success' : 'warning'}
                          variant='outlined'
                        />
                      </Box>
                    </Box>
                    {index < stats.activity.transactions.slice(0, 5).length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default PaymentDashboard
