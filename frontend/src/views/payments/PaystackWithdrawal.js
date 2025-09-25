// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'

// ** Icon Imports
import CashMultiple from 'mdi-material-ui/CashMultiple'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const PaystackWithdrawal = ({ user }) => {
  // ** State
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('paystack')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // ** Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  // ** Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!isAuthenticated() || !token) {
        setStatsLoading(false)
        return
      }

      try {
        setStatsLoading(true)
        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setDashboardStats(data)
        } else {
          setStatsError('Failed to fetch dashboard statistics')
        }
      } catch (error) {
        console.error('Dashboard stats error:', error)
        setStatsError('Network error while fetching dashboard data')
      } finally {
        setStatsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [token, isAuthenticated])

  // ** Use wallet balance and currency from dashboard stats
  const currentBalance = dashboardStats?.user?.wallet_balance !== undefined ? dashboardStats.user.wallet_balance : user?.wallet_balance || 0
  const currentCurrency = dashboardStats?.currency || user?.preferred_currency || 'KES'

  // ** Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !email || !phoneNumber) {
      setMessage('Please fill in all fields')
      setMessageType('error')
      return
    }

    // Validate phone number format (international phone numbers)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      setMessage('Please enter a valid phone number (e.g., +1234567890 or 0712345678)')
      setMessageType('error')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated() || !token) {
      setMessage('Authentication required. Please log in again.')
      setMessageType('error')
      return
    }

    const minWithdrawal = getMinWithdrawal()
    const maxWithdrawal = getMaxWithdrawal()

    if (parseFloat(amount) < minWithdrawal) {
      setMessage(`Minimum withdrawal amount is ${getCurrencySymbol()} ${minWithdrawal}`)
      setMessageType('error')
      return
    }

    if (parseFloat(amount) > currentBalance) {
      setMessage('Insufficient wallet balance')
      setMessageType('error')
      return
    }

    if (parseFloat(amount) > maxWithdrawal) {
      setMessage(`Maximum withdrawal amount is ${getCurrencySymbol()} ${maxWithdrawal.toLocaleString()} per transaction`)
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/payments/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currentCurrency,
          phone: phoneNumber,
          email: email
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Withdrawal request submitted successfully! You will receive an email confirmation.')
        setMessageType('success')
        setAmount('')
        setPhoneNumber('')
        // Update AuthContext with latest user data
        await refreshUser()
        // Refresh user data to update balance
        window.location.reload()
      } else {
        setMessage(data.detail || 'Failed to process withdrawal request')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency = currentCurrency) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getCurrencySymbol = (currency = currentCurrency) => {
    const symbols = {
      'KES': 'KSH',
      'USD': '$',
      'UGX': 'UGX',
      'TZS': 'TZS'
    }
    return symbols[currency] || 'KSH'
  }

  const getMinWithdrawal = () => {
    const limits = {
      'KES': 50,
      'USD': 1.25,
      'UGX': 4500,
      'TZS': 2750
    }
    return limits[currentCurrency] || 50
  }

  const getMaxWithdrawal = () => {
    const limits = {
      'KES': 50000,
      'USD': 1250,
      'UGX': 4500000,
      'TZS': 2750000
    }
    return limits[currentCurrency] || 50000
  }

  const getDailyLimit = () => {
    const limits = {
      'KES': 100000,
      'USD': 2500,
      'UGX': 9000000,
      'TZS': 5500000
    }
    return limits[currentCurrency] || 100000
  }

  const paymentMethods = [
    { value: 'paystack', label: 'Paystack', description: 'Bank transfer or card' },
    { value: 'mpesa', label: 'M-Pesa', description: 'Mobile money' },
    { value: 'paypal', label: 'PayPal', description: 'International payments' },
    { value: 'pesapal', label: 'Pesapal', description: 'Online payments' }
  ]

  // ** Show loading state while fetching dashboard stats
  if (statsLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width={200} height={40} />
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={48} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={150} height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={120} height={32} />
              </Box>
              <Skeleton variant="rectangular" height={1} sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={180} height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={80} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // ** Show error state if dashboard stats failed to load
  if (statsError) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {statsError}
          </Alert>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <CashMultiple sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant='h6'>Withdraw Funds</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Unable to load current balance information. Please refresh the page to try again.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <CashMultiple sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant='h6'>Withdraw Funds</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={`Withdrawal Amount (${currentCurrency})`}
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter amount to withdraw'
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>{getCurrencySymbol(currentCurrency)}</Typography>
                    }}
                    helperText={`Available balance: ${formatCurrency(currentBalance, currentCurrency)}`}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={paymentMethod}
                      label='Payment Method'
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={loading}
                    >
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          <Box>
                            <Typography variant='body1'>{method.label}</Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {method.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email address'
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Phone Number'
                    type='tel'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder='e.g., 254712345678'
                    helperText='Required for M-Pesa and mobile money withdrawals'
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={loading || !amount || !email || !phoneNumber || parseFloat(amount) > currentBalance}
                    startIcon={loading ? <CircularProgress size={20} /> : <CashMultiple />}
                  >
                    {loading ? 'Processing...' : 'Request Withdrawal'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            {message && (
              <Alert
                severity={messageType}
                sx={{ mt: 3 }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Withdrawal Information
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Available Balance
              </Typography>
              <Typography variant='h5' color='primary'>
                {formatCurrency(currentBalance, currentCurrency)}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Withdrawal Limits
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2'>Minimum:</Typography>
                  <Typography variant='body2' color='text.secondary'>{getCurrencySymbol()} {getMinWithdrawal()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2'>Maximum:</Typography>
                  <Typography variant='body2' color='text.secondary'>{getCurrencySymbol()} {getMaxWithdrawal().toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2'>Daily Limit:</Typography>
                  <Typography variant='body2' color='text.secondary'>{getCurrencySymbol()} {getDailyLimit().toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'info.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Processing Time
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Withdrawals are processed within 1-3 business days. You will receive an email confirmation once processed.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <AccountOutline sx={{ mr: 1, mt: 0.5, color: 'warning.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Account Verification
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  For security reasons, large withdrawals may require additional verification. Our team will contact you if needed.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PaystackWithdrawal
