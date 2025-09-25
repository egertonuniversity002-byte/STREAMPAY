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
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WalletOutline sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant='h6'>Wallet Balance</Typography>
            </Box>
            <Typography variant='h4' sx={{ mb: 1 }}>
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
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
              <Typography variant='h6'>Total Earnings</Typography>
            </Box>
            <Typography variant='h4' sx={{ mb: 1 }}>
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
          bgcolor: !(stats?.user?.is_activated || user?.is_activated) ? 'warning.light' : 'success.light',
          border: '2px solid',
          borderColor: !(stats?.user?.is_activated || user?.is_activated) ? 'warning.main' : 'success.main'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccountOutline sx={{ mr: 2, fontSize: 40, color: (stats?.user?.is_activated || user?.is_activated) ? 'success.main' : 'warning.main' }} />
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
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
              <Box sx={{ bgcolor: 'warning.dark', p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant='h6' sx={{ color: 'warning.contrastText', mb: 2 }}>
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
              />
              {!(stats?.user?.is_activated || user?.is_activated) && (
                <Button
                  variant='contained'
                  color='warning'
                  size='large'
                  onClick={() => setActiveTab && setActiveTab('deposit')}
                  sx={{ fontWeight: 'bold' }}
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
