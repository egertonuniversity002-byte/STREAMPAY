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

// ** Icon Imports
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import ArrowBack from 'mdi-material-ui/ArrowLeft'
import PhoneAndroid from 'mdi-material-ui/Cellphone'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const PaystackDeposit = ({ user, onBack }) => {
  // ** State
  const [amount, setAmount] = useState('500')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [transactionId, setTransactionId] = useState('')

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  // ** Check for payment status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('status')
    const reference = urlParams.get('reference')
    const trxref = urlParams.get('trxref')

    if (paymentStatus) {
      if (paymentStatus === 'success') {
        setMessage('Payment completed successfully! Your wallet has been credited.')
        setMessageType('success')
        // Refresh user data to show updated balance
        refreshUser()
      } else if (paymentStatus === 'cancelled') {
        setMessage('Payment was cancelled. No charges were made to your account.')
        setMessageType('warning')
      } else if (paymentStatus === 'failed') {
        setMessage('Payment failed. Please try again or contact support if the issue persists.')
        setMessageType('error')
      }

      // Clean up URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [refreshUser])

  // ** Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !email) {
      setMessage('Please fill in all fields')
      setMessageType('error')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated() || !token) {
      setMessage('Authentication required. Please log in again.')
      setMessageType('error')
      return
    }

    const minDeposit = getMinDeposit()
    const maxDeposit = getMaxDeposit()

    if (parseFloat(amount) < minDeposit) {
      setMessage(`Minimum deposit amount is ${getCurrencySymbol()} ${minDeposit}`)
      setMessageType('error')
      return
    }

    if (parseFloat(amount) > maxDeposit) {
      setMessage(`Maximum deposit amount is ${getCurrencySymbol()} ${maxDeposit.toLocaleString()}`)
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/payments/paystack/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: email
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Payment initiated successfully! Redirecting to Paystack...')
        setMessageType('success')
        setTransactionId(data.transaction_id)

        // Update AuthContext with latest user data
        await refreshUser()

        // Redirect to Paystack
        if (data.authorization_url) {
          window.location.href = data.authorization_url
        }
      } else {
        setMessage(data.detail || 'Failed to initiate payment')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Deposit error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency = user?.preferred_currency || 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getCurrencySymbol = (currency = user?.preferred_currency || 'KES') => {
    const symbols = {
      'KES': 'KSH',
      'USD': '$',
      'UGX': 'UGX',
      'TZS': 'TZS'
    }
    return symbols[currency] || 'KSH'
  }

  const getMinDeposit = () => {
    const currency = user?.preferred_currency || 'KES'
    const limits = {
      'KES': 10,
      'USD': 0.25,
      'UGX': 900,
      'TZS': 550
    }
    return limits[currency] || 10
  }

  const getMaxDeposit = () => {
    const currency = user?.preferred_currency || 'KES'
    const limits = {
      'KES': 150000,
      'USD': 3750,
      'UGX': 13500000,
      'TZS': 8250000
    }
    return limits[currency] || 150000
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {onBack && (
                <Button
                  startIcon={<ArrowBack />}
                  onClick={onBack}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <CreditCardOutline sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant='h6'>Paystack Deposit</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={`Deposit Amount (${user?.preferred_currency || 'KES'})`}
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='500 KSH (Fixed Amount)'
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>{getCurrencySymbol()}</Typography>,
                      readOnly: true
                    }}
                    helperText='Fixed Amount: 500 KSH'
                    disabled={loading}
                  />
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
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={loading || !amount || !email}
                    startIcon={loading ? <CircularProgress size={20} /> : <CreditCardOutline />}
                  >
                    {loading ? 'Processing...' : 'Proceed to Paystack'}
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
              Payment Information
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Current Balance
              </Typography>
              <Typography variant='h5' color='primary'>
                {formatCurrency(user?.wallet_balance || 0)}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Supported Payment Methods
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip label='Paystack' color='primary' variant='outlined' size='small' />
                <Chip label='M-Pesa' color='secondary' variant='outlined' size='small' />
                <Chip label='PayPal' color='info' variant='outlined' size='small' />
                <Chip label='Pesapal' color='success' variant='outlined' size='small' />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'info.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Secure Payment
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'warning.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Processing Time
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Paystack deposits are usually processed instantly. You will receive a confirmation email once the payment is complete.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PaystackDeposit
