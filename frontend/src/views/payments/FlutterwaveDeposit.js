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
import PhoneAndroid from 'mdi-material-ui/Cellphone'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const FlutterwaveDeposit = ({ user, onBack }) => {
  // ** State
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [paymentMethod, setPaymentMethod] = useState('mobile_money')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  // ** Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || !email) {
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

    const minDeposit = 100 // ₦100 minimum for Flutterwave
    const maxDeposit = 10000000 // ₦10,000,000 maximum

    if (parseFloat(amount) < minDeposit) {
      setMessage(`Minimum deposit amount is ₦${minDeposit}`)
      setMessageType('error')
      return
    }

    if (parseFloat(amount) > maxDeposit) {
      setMessage(`Maximum deposit amount is ₦${maxDeposit.toLocaleString()}`)
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/payments/flutterwave/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: email,
          phone: phone,
          currency: 'NGN',
          payment_method: paymentMethod
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Payment initiated successfully! Redirecting to Flutterwave...')
        setMessageType('success')

        // Update AuthContext with latest user data
        await refreshUser()

        // Redirect to Flutterwave
        if (data.payment_link) {
          window.location.href = data.payment_link
        }
      } else {
        setMessage(data.detail || 'Failed to initiate payment')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Flutterwave deposit error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
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
                  bgcolor: '#F5A623',
                  mr: 2
                }}
              >
                🟠
              </Avatar>
              <Box>
                <Typography variant='h6'>Flutterwave Deposit</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Africa's most trusted payment technology
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Deposit Amount (NGN)'
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter amount (min: ₦100, max: ₦10,000,000)'
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>
                    }}
                    helperText='Minimum: ₦100, Maximum: ₦10,000,000'
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
                    placeholder='Enter your phone number'
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
                        value='mobile_money'
                        control={<Radio />}
                        label='Mobile Money'
                        disabled={loading}
                      />
                      <FormControlLabel
                        value='card'
                        control={<Radio />}
                        label='Credit/Debit Card'
                        disabled={loading}
                      />
                      <FormControlLabel
                        value='bank_transfer'
                        control={<Radio />}
                        label='Bank Transfer'
                        disabled={loading}
                      />
                      <FormControlLabel
                        value='ussd'
                        control={<Radio />}
                        label='USSD'
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
                    startIcon={loading ? <CircularProgress size={20} /> : <PhoneAndroid />}
                    sx={{
                      bgcolor: '#F5A623',
                      '&:hover': {
                        bgcolor: '#E8951E'
                      }
                    }}
                  >
                    {loading ? 'Processing...' : 'Proceed to Flutterwave'}
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
              Flutterwave Information
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
                <Chip label='Mobile Money' color='primary' variant='outlined' size='small' />
                <Chip label='Credit Cards' color='info' variant='outlined' size='small' />
                <Chip label='Bank Transfer' color='success' variant='outlined' size='small' />
                <Chip label='USSD' color='warning' variant='outlined' size='small' />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'info.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  African Focus
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Flutterwave specializes in African markets with support for local payment methods and currencies.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InformationOutline sx={{ mr: 1, mt: 0.5, color: 'success.main', fontSize: 20 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Fast & Reliable
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Experience lightning-fast payment processing with 99.9% uptime and instant transaction confirmations.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default FlutterwaveDeposit
