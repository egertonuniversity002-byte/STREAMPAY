// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const ResetPasswordPage = () => {
  const router = useRouter()
  const { token } = router.query

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [tokenValid, setTokenValid] = useState(false)
  const [verifying, setVerifying] = useState(true)

  const { verifyResetToken, resetPassword } = useAuth()

  useEffect(() => {
    if (!token) return

    const verifyToken = async () => {
      setVerifying(true)
      setError(null)
      try {
        const response = await verifyResetToken(token)
        if (response.success && response.valid) {
          setTokenValid(true)
        } else {
          setError('Invalid or expired token')
          setTokenValid(false)
        }
      } catch (err) {
        setError(err.message || 'Failed to verify token')
        setTokenValid(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token, verifyResetToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await resetPassword(token, newPassword)
      if (response.success) {
        setSuccess(response.message || 'Password has been reset successfully.')
        setTimeout(() => {
          router.push('/pages/login')
        }, 3000)
      } else {
        setError('Failed to reset password')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <Box className='content-center'>
        <Typography variant='h6'>Verifying token...</Typography>
      </Box>
    )
  }

  if (!tokenValid) {
    return (
      <Box className='content-center'>
        <Alert severity='error'>Invalid or expired token. Please request a new password reset.</Alert>
        <Button variant='contained' sx={{ mt: 3 }} onClick={() => router.push('/pages/forgot-password')}>
          Go to Forgot Password
        </Button>
      </Box>
    )
  }

  return (
    <Box className='content-center'>
      <Box sx={{ width: 400, p: 6, borderRadius: 2, boxShadow: 3, backgroundColor: 'background.paper' }}>
        <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            type='password'
            label='New Password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            type='password'
            label='Confirm New Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Reset Password'}
          </Button>
        </form>
      </Box>
    </Box>
  )
}

ResetPasswordPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default ResetPasswordPage
