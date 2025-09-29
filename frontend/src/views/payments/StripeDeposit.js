// ** React Imports
import { useState } from 'react'

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

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const StripeDeposit = ({ user, onBack }) => {
  // ** State
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

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

    const minDeposit = 1 // $1 minimum for Stripe
    const maxDeposit = 50000 // $50,000 maximum

    if (parseFloat(amount) < minDeposit) {
      setMessage(`Minimum deposit amount is $${minDeposit}`)
      setMessageType('error')
      return
    }

    if (parseFloat(amount) > maxDeposit) {
      setMessage(`Maximum deposit amount is $${maxDeposit.toLocaleString()}`)
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/payments/stripe/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: email,
          currency: 'USD',
          payment_method: paymentMethod
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Payment initiated successfully! Redirecting to Stripe...')
        setMessageType('success')

        // Update AuthContext with latest user data
        await refreshUser()

        // Redirect to Stripe Checkout
        if (data.checkout_url) {
          window.location.href = data.checkout_url
        }
      } else {
        setMessage(data.detail || 'Failed to initiate payment')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Stripe deposit error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
                  bgcolor: '#635BFF',
                  mr: 2
                }}
              >
                🟣
              </Avatar>
              <Box>
                <Typography variant='h6'>Stripe Deposit</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Accept payments with Stripe's powerful platform
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Deposit Amount (USD)'
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter amount (min: $1, max: $50,000)'
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                    }}
                    helperText='Minimum: $1, Maximum: $50,000'
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
                  <FormControl component='fieldset'>
                    <Typography variant='subtitle1' sx={{ mb: 2 }}>
                      Payment Method
                    </Typography>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <FormControlLabel
                        value='card'
                        control={<Radio />}
                        label='Credit/Debit Card'
                        disabled={loading}
                      />
                      <FormControlLabel
                        value='alipay'
                        control={<Radio />}
                        label='Alipay'
                        disabled={loading}
                      />
                      <FormControlLabel
                        value='sepa_debit'
                        control={<Radio />}
                        label='SEPA Direct Debit'
                        disabled={loading}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={loading || !amount || !email}
                    startIcon={loading ? <CircularProgress size={20} /> : <CreditCardOutline />}
                    sx={{
                      bgcolor: '#635BFF',
                      '&:hover': {
                        bgcolor: '#5A52E8'
                      }
                    }}
                  >
                    {loading ? 'Processing...' : 'Proceed to Stripe'}
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
              Stripe Information
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
                <Chip label='Credit Cards' color='primary' variant='outlined' size='small' />
                <Chip label='Debit Cards' color='info' variant='outlined' size='small' />
                <Chip label='Alipay' color='success' variant='outlined' size='small' />
                <Chip label='SEPA Direct Debit' color='warning' variant='outlined' size='small' />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'info.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Global Reach
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Accept payments from customers worldwide with support for 135+ currencies and local payment methods.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'success.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Advanced Security
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Stripe uses machine learning to detect and prevent fraud while keeping legitimate payments flowing smoothly.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StripeDeposit
