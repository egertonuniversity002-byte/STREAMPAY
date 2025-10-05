import { useState, useEffect, Fragment } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' },
  background: theme => theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
  borderRadius: '20px',
  boxShadow: theme => theme.palette.mode === 'dark'
    ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
    : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
}))

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const preferredCurrencies = [
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
  { value: 'TZS', label: 'Tanzanian Shilling (TZS)' }
]

const RegisterPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const [values, setValues] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    referral_code: '',
    preferred_currency: 'KES',
    password: '',
    showPassword: false,
    agreePolicy: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Auto-fill referral code from URL query param if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const referral = urlParams.get('referral') || urlParams.get('fef') || urlParams.get('ref')
    if (referral) {
      setValues(prev => ({ ...prev, referral_code: referral }))
    }
  }, [])

  const handleChange = prop => event => {
    if (prop === 'agreePolicy') {
      setValues({ ...values, [prop]: event.target.checked })
    } else {
      setValues({ ...values, [prop]: event.target.value })
    }
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const validateForm = () => {
    if (!values.username.trim()) {
      setError('Username is required')
      return false
    }
    if (!values.full_name.trim()) {
      setError('Full name is required')
      return false
    }
    if (!values.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!values.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!values.password) {
      setError('Password is required')
      return false
    }
    if (!values.agreePolicy) {
      setError('You must agree to the privacy policy and terms')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const trimmedUsername = values.username.trim()
      const trimmedFullName = values.full_name.trim()
      const trimmedEmail = values.email.trim()
      const trimmedPhone = values.phone.trim()
      const trimmedReferralCode = values.referral_code.trim()
      const trimmedPassword = values.password.trim()

      const response = await fetch('https://official-paypal.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
          full_name: trimmedFullName,
          phone: trimmedPhone,
          referral_code: trimmedReferralCode || undefined,
          role: 'user',
          preferred_currency: values.preferred_currency
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Registration failed')
        setLoading(false)
        return
      }

      setSuccess('Registration successful! Please check your email for activation instructions.')
      setLoading(false)

      // Redirect based on activation status and role
      if (data.is_activated === false) {
        setTimeout(() => {
          router.push('/pages/payments')
        }, 2000)
      } else if (data.role === 'admin') {
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              width={35}
              height={29}
              version='1.1'
              viewBox='0 0 30 23'
              xmlns='http://www.w3.org/2000/svg'
              xmlnsXlink='http://www.w3.org/1999/xlink'
            >
              <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                <g id='Artboard' transform='translate(-95.000000, -51.000000)'>
                  <g id='logo' transform='translate(95.000000, 50.000000)'>
                    <path
                      id='Combined-Shape'
                      fill={theme.palette.primary.main}
                      d='M30,21.3918362 C30,21.7535219 29.9019196,22.1084381 29.7162004,22.4188007 C29.1490236,23.366632 27.9208668,23.6752135 26.9730355,23.1080366 L26.9730355,23.1080366 L23.714971,21.1584295 C23.1114106,20.7972624 22.7419355,20.1455972 22.7419355,19.4422291 L22.7419355,19.4422291 L22.741,12.7425689 L15,17.1774194 L7.258,12.7425689 L7.25806452,19.4422291 C7.25806452,20.1455972 6.88858935,20.7972624 6.28502902,21.1584295 L3.0269645,23.1080366 C2.07913318,23.6752135 0.850976404,23.366632 0.283799571,22.4188007 C0.0980803893,22.1084381 2.0190442e-15,21.7535219 0,21.3918362 L0,3.58469444 L0.00548573643,3.43543209 L0.00548573643,3.43543209 L0,3.5715689 C3.0881846e-16,2.4669994 0.8954305,1.5715689 2,1.5715689 C2.36889529,1.5715689 2.73060353,1.67359571 3.04512412,1.86636639 L15,9.19354839 L26.9548759,1.86636639 C27.2693965,1.67359571 27.6311047,1.5715689 28,1.5715689 C29.1045695,1.5715689 30,2.4669994 30,3.5715689 L30,3.5715689 Z'
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='0 8.58870968 7.25806452 12.7505183 7.25806452 16.8305646'
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='0 8.58870968 7.25806452 12.6445567 7.25806452 15.1370162'
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='22.7419355 8.58870968 30 12.7417372 30 16.9537453'
                      transform='translate(26.370968, 12.771227) scale(-1, 1) translate(-26.370968, -12.771227) '
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='22.7419355 8.58870968 30 12.6409734 30 15.2601969'
                      transform='translate(26.370968, 11.924453) scale(-1, 1) translate(-26.370968, -11.924453) '
                    />
                    <path
                      id='Rectangle'
                      fillOpacity='0.15'
                      fill={theme.palette.common.white}
                      d='M3.04512412,1.86636639 L15,9.19354839 L15,9.19354839 L15,17.1774194 L0,8.58649679 L0,3.5715689 C3.0881846e-16,2.4669994 0.8954305,1.5715689 2,1.5715689 C2.36889529,1.5715689 2.73060353,1.67359571 3.04512412,1.86636639 Z'
                    />
                    <path
                      id='Rectangle'
                      fillOpacity='0.35'
                      fill={theme.palette.common.white}
                      transform='translate(22.500000, 8.588710) scale(-1, 1) translate(-22.500000, -8.588710) '
                      d='M18.0451241,1.86636639 L30,9.19354839 L30,9.19354839 L30,17.1774194 L15,8.58649679 L15,3.5715689 C15,2.4669994 15.8954305,1.5715689 17,1.5715689 C17.3688953,1.5715689 17.7306035,1.67359571 18.0451241,1.86636639 Z'
                    />
                  </g>
                </g>
              </g>
            </svg>
            <Typography
              variant='h6'
              sx={{
                ml: 3,
                lineHeight: 1,
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '1.5rem !important'
              }}
            >
              {themeConfig.templateName}
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Adventure starts here 🚀
            </Typography>
            <Typography variant='body2'>Make your app management easy and fun!</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={handleSubmit}>
            <TextField
              autoFocus
              fullWidth
              id='username'
              label='Username'
              value={values.username}
              onChange={handleChange('username')}
              sx={{
                marginBottom: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.2)' : '0 4px 15px rgba(0,123,255,0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 0 3px rgba(255,215,0,0.3)' : '0 0 0 3px rgba(0,123,255,0.3)',
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.5)' : 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                  fontWeight: 600,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                },
              }}
            />
            <TextField
              fullWidth
              label='Full Name'
              id='full_name'
              value={values.full_name}
              onChange={handleChange('full_name')}
              sx={{
                marginBottom: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.2)' : '0 4px 15px rgba(0,123,255,0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 0 3px rgba(255,215,0,0.3)' : '0 0 0 3px rgba(0,123,255,0.3)',
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.5)' : 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                  fontWeight: 600,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                },
              }}
            />
            <TextField
              fullWidth
              type='email'
              label='Email'
              id='email'
              value={values.email}
              onChange={handleChange('email')}
              sx={{
                marginBottom: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.2)' : '0 4px 15px rgba(0,123,255,0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 0 3px rgba(255,215,0,0.3)' : '0 0 0 3px rgba(0,123,255,0.3)',
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.5)' : 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                  fontWeight: 600,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                },
              }}
            />
            <TextField
              fullWidth
              label='Phone'
              id='phone'
              value={values.phone}
              onChange={handleChange('phone')}
              sx={{
                marginBottom: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.2)' : '0 4px 15px rgba(0,123,255,0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 0 3px rgba(255,215,0,0.3)' : '0 0 0 3px rgba(0,123,255,0.3)',
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.5)' : 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                  fontWeight: 600,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                },
              }}
              placeholder='07xxxxxxxx or 2547xxxxxxxx'
            />
            <TextField
              fullWidth
              label='Referral Code'
              id='referral_code'
              value={values.referral_code}
              disabled
              sx={{
                marginBottom: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                  opacity: 0.7,
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                  fontWeight: 600,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                },
              }}
            />
            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel id='preferred-currency-label'>Preferred Currency</InputLabel>
              <Select
                labelId='preferred-currency-label'
                id='preferred_currency'
                value={values.preferred_currency}
                label='Preferred Currency'
                onChange={handleChange('preferred_currency')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.2)' : '0 4px 15px rgba(0,123,255,0.2)',
                    },
                    '&.Mui-focused': {
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 0 3px rgba(255,215,0,0.3)' : '0 0 0 3px rgba(0,123,255,0.3)',
                      borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.5)' : 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                    fontWeight: 600,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                  },
                  '& .MuiSelect-select': {
                    padding: '15px 14px',
                  },
                }}
              >
                {preferredCurrencies.map(currency => (
                  <MenuItem key={currency.value} value={currency.value} sx={{ fontWeight: 500 }}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-register-password'>Password</InputLabel>
              <OutlinedInput
                label='Password'
                value={values.password}
                id='auth-register-password'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      aria-label='toggle password visibility'
                      sx={{
                        color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,123,255,0.7)',
                        '&:hover': {
                          color: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.8)' : 'primary.main',
                        }
                      }}
                    >
                      {values.showPassword ? <EyeOutline fontSize='small' /> : <EyeOffOutline fontSize='small' />}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,123,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.2)' : '0 4px 15px rgba(0,123,255,0.2)',
                    },
                    '&.Mui-focused': {
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 0 3px rgba(255,215,0,0.3)' : '0 0 0 3px rgba(0,123,255,0.3)',
                      borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.5)' : 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                    fontWeight: 600,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.3)',
                  },
                }}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox checked={values.agreePolicy} onChange={handleChange('agreePolicy')} />}
              label={
                <Fragment>
                  <span>I agree to </span>
                  <Link href='/' passHref>
                    <LinkStyled onClick={e => e.preventDefault()}>privacy policy & terms</LinkStyled>
                  </Link>
                </Fragment>
              }
            />
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 4 }}>
                {success}
              </Alert>
            )}
            <Button fullWidth size='large' type='submit' variant='contained' disabled={loading} sx={{
              marginBottom: 7,
              borderRadius: '12px',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)'
                : 'linear-gradient(135deg, #007bff 0%, #0056b3 50%, #007bff 100%)',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 8px 25px rgba(255,215,0,0.4)'
                : '0 8px 25px rgba(0,123,255,0.4)',
              color: 'common.white',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: theme => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ffed4e 0%, #ffd700 50%, #ffed4e 100%)'
                  : 'linear-gradient(135deg, #0056b3 0%, #007bff 50%, #0056b3 100%)',
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 12px 35px rgba(255,215,0,0.6)'
                  : '0 12px 35px rgba(0,123,255,0.6)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(0,0,0,0.12)',
                boxShadow: 'none',
                transform: 'none',
              },
            }}>
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Register'}
            </Button>
          </form>
          <Divider sx={{ my: 4 }}>Already have an account?</Divider>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ mr: 2, color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' }}>Sign in instead</Typography>
            <Button href='/pages/login' component='a' variant='outlined' sx={{
              borderRadius: '12px',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.5)' : '1px solid rgba(0,123,255,0.5)',
              color: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.8)' : 'primary.main',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.1)' : 'rgba(0,123,255,0.1)',
                borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,1)' : 'primary.main',
                boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 15px rgba(255,215,0,0.3)' : '0 4px 15px rgba(0,123,255,0.3)',
              },
            }}>
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  )
}

RegisterPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default RegisterPage
