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
import Avatar from '@mui/material/Avatar'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import ArrowBack from 'mdi-material-ui/ArrowLeft'
import PhoneAndroid from 'mdi-material-ui/Cellphone'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const PesapalDeposit = ({ user, onBack }) => {
  // ** Constants
  const minDeposit = 10 // KES 10 minimum for Pesapal
  const maxDeposit = 150000 // KES 150,000 maximum

  // ** State
  const [amount, setAmount] = useState('500')
  const [currency, setCurrency] = useState('KES')
  const [phone, setPhone] = useState(user?.phone || '')
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [paymentMethod, setPaymentMethod] = useState('mobile_money')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  // ** Check for payment status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('status')
    const orderTrackingId = urlParams.get('OrderTrackingId')
    const orderMerchantReference = urlParams.get('OrderMerchantReference')

    if (paymentStatus) {
      if (paymentStatus === 'success' || paymentStatus === 'COMPLETED') {
        setMessage('Payment completed successfully! Your wallet has been credited.')
        setMessageType('success')
        // Refresh user data to show updated balance
        refreshUser()
      } else if (paymentStatus === 'cancelled' || paymentStatus === 'CANCELLED') {
        setMessage('Payment was cancelled. No charges were made to your account.')
        setMessageType('warning')
      } else if (paymentStatus === 'failed' || paymentStatus === 'FAILED') {
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

    if (!amount || !firstName || !lastName || !email || !phone) {
      setMessage('Please fill in all required fields')
      setMessageType('error')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated() || !token) {
      setMessage('Authentication required. Please log in again.')
      setMessageType('error')
      return
    }

    if (parseFloat(amount) < minDeposit) {
      setMessage(`Minimum deposit amount is KES ${minDeposit}`)
      setMessageType('error')
      return
    }

    if (parseFloat(amount) > maxDeposit) {
      setMessage(`Maximum deposit amount is KES ${maxDeposit.toLocaleString()}`)
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/payments/pesapal/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currency,
          phone: phone,
          first_name: firstName,
          last_name: lastName,
          email: email
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Payment initiated successfully! Redirecting to Pesapal...')
        setMessageType('success')

        // Update AuthContext with latest user data
        await refreshUser()

        // Redirect to Pesapal
        if (data.redirect_url) {
          window.location.href = data.redirect_url
        }
      } else {
        // Handle case where data.detail might be an object
        const errorMessage = typeof data.detail === 'string'
          ? data.detail
          : data.message || data.error || 'Failed to initiate payment'
        setMessage(errorMessage)
        setMessageType('error')
      }
    } catch (error) {
      console.error('Pesapal deposit error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8}>
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
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={onBack}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Back
              </Button>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#FFD700',
                  mr: 2
                }}
              >
                🟡
              </Avatar>
              <Box>
                <Typography variant='h6'>Pesapal Deposit</Typography>
                <Typography variant='body2' color='text.secondary'>
                  East Africa's leading payment gateway
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Deposit Amount (KES)'
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter deposit amount'
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>KES</Typography>
                    }}
                    helperText={`Minimum KES 10, Maximum KES ${maxDeposit.toLocaleString()}`}
                    disabled={loading}
                    inputProps={{
                      min: 10,
                      step: 0.01
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='First Name'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder='Enter your first name'
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Last Name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder='Enter your last name'
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
                  <TextField
                    fullWidth
                    label='Phone Number'
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='Enter your phone number (e.g., 2547XXXXXXXX)'
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={loading || !amount || !firstName || !lastName || !email || !phone}
                    startIcon={loading ? <CircularProgress size={20} /> : <PhoneAndroid />}
                    sx={{
                      bgcolor: '#FFD700',
                      color: '#000',
                      '&:hover': {
                        bgcolor: '#E6C200'
                      }
                    }}
                  >
                    {loading ? 'Processing...' : 'Proceed to Pesapal'}
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
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Pesapal Information
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
                <Chip label='M-Pesa' color='primary' variant='outlined' size='small' />
                <Chip label='Airtel Money' color='info' variant='outlined' size='small' />
                <Chip label='Credit Cards' color='success' variant='outlined' size='small' />
                <Chip label='Bank Transfer' color='warning' variant='outlined' size='small' />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'info.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  East African Focus
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Pesapal specializes in East African markets with deep integration of local mobile money services.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'success.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Trusted Platform
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Over 10 years of experience providing secure and reliable payment solutions across East Africa.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PesapalDeposit
