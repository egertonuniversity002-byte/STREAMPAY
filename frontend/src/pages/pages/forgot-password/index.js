// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const { requestPasswordReset } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    try {
      const response = await requestPasswordReset(email.trim())
      if (response.success) {
        setSuccess(response.message || 'If your email is in our system, you will receive a password reset link.')
      } else {
        setError('Failed to send password reset email')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className='content-center'>
      <Box sx={{ width: 400, p: 6, borderRadius: 2, boxShadow: 3, backgroundColor: 'background.paper' }}>
        <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
          Forgot Password
        </Typography>
        <Typography variant='body2' sx={{ mb: 4 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            type='email'
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          {error && <Alert severity='error' sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity='success' sx={{ mb: 3 }}>{success}</Alert>}
          <Button
            fullWidth
            type='submit'
            variant='contained'
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Send Reset Link'}
          </Button>
        </form>
        <Typography variant='body2' sx={{ textAlign: 'center' }}>
          Remember your password?{' '}
          <Link href='/pages/login' passHref>
            <a>Login</a>
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

ForgotPasswordPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default ForgotPasswordPage
