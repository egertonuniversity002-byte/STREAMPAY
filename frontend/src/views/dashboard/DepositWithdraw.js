// ** MUI Imports
import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { styled, keyframes } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useAuth } from '../../contexts/AuthContext'

// Keyframe animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`

// Styled components
const SpinWheel = styled(Box)(({ theme, spinning }) => ({
  width: 200,
  height: 200,
  borderRadius: '50%',
  background: `conic-gradient(
    from 0deg,
    ${theme.palette.primary.main} 0deg 60deg,
    ${theme.palette.secondary.main} 60deg 120deg,
    ${theme.palette.success.main} 120deg 180deg,
    ${theme.palette.warning.main} 180deg 240deg,
    ${theme.palette.error.main} 240deg 300deg,
    ${theme.palette.info.main} 300deg 360deg
  )`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  animation: spinning ? `${spin} 2s ease-in-out` : 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: '50%',
    border: `3px solid ${theme.palette.primary.main}`,
    opacity: 0.3
  }
}))

const Pointer = styled(Box)({
  position: 'absolute',
  top: -10,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '15px solid transparent',
  borderRight: '15px solid transparent',
  borderTop: '30px solid #ff0000',
  zIndex: 10
})

const ResultMessage = styled(Box)(({ theme, type }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: type === 'success' ? theme.palette.success.main : theme.palette.error.main,
  color: 'white',
  animation: `${bounce} 0.6s ease-in-out, ${fadeIn} 0.5s ease-in-out`,
  marginTop: theme.spacing(2)
}))

const DepositWithdraw = () => {
  const { token, isAuthenticated } = useAuth()
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinButtonDisabled, setSpinButtonDisabled] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultType, setResultType] = useState('') // 'success' or 'error'
  const [resultMessage, setResultMessage] = useState('')

  const handleSpin = async () => {
    if (spinButtonDisabled || isSpinning || !isAuthenticated) return

    setIsSpinning(true)
    setShowResult(false)

    // Generate a random winning amount between 10 and 100
    const winningAmount = Math.floor(Math.random() * 91) + 10

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/spin-and-win', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ winning_amount: winningAmount })
      })

      const data = await response.json()

      setIsSpinning(false)

      if (response.ok) {
        setSpinButtonDisabled(true)
        setResultType('success')
        setResultMessage(`🎉 Congratulations! You won KES ${winningAmount}! 🎉`)
        setShowResult(true)
      } else {
        setResultType('error')
        setResultMessage(`❌ ${data.detail || 'Failed to spin'} ❌`)
        setShowResult(true)
      }
    } catch (error) {
      setIsSpinning(false)
      setResultType('error')
      setResultMessage('❌ Error: Unable to connect to server ❌')
      setShowResult(true)
    }
  }

  // Show login prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        minHeight: 500,
        background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '16px',
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.7)' : '0 15px 35px rgba(0,0,0,0.1)',
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme => theme.palette.mode === 'dark' ? '0 25px 50px rgba(0,0,0,0.9)' : '0 25px 50px rgba(0,0,0,0.15)'
        }
      }}>
        <Typography variant='h4' sx={{
          mb: 4,
          fontWeight: 'bold',
          textAlign: 'center',
          color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
          textShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🎰 Spin and Win! 🎰
        </Typography>

        <Box sx={{
          position: 'relative',
          mb: 4,
          p: 3,
          borderRadius: '20px',
          background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        }}>
          <SpinWheel spinning={false}>
            <Typography variant='h6' sx={{ fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' }}>
              LOGIN
            </Typography>
          </SpinWheel>
          <Pointer />
        </Box>

        <Typography variant='h6' sx={{
          mb: 3,
          textAlign: 'center',
          color: 'text.secondary',
          fontWeight: 500
        }}>
          🔐 Please log in to play Spin and Win!
        </Typography>

        <Button
          variant='contained'
          size='large'
          onClick={() => window.location.href = '/pages/login'}
          sx={{
            px: 4,
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102,126,234,0.6)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          LOGIN TO PLAY
        </Button>
      </Card>
    )
  }

  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      minHeight: 500,
      background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '16px',
      boxShadow: theme => theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.7)' : '0 15px 35px rgba(0,0,0,0.1)',
      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 25px 50px rgba(0,0,0,0.9)' : '0 25px 50px rgba(0,0,0,0.15)'
      }
    }}>
      <Typography variant='h4' sx={{
        mb: 4,
        fontWeight: 'bold',
        textAlign: 'center',
        color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
        textShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        🎰 Spin and Win! 🎰
      </Typography>

      <Box sx={{
        position: 'relative',
        mb: 4,
        p: 3,
        borderRadius: '20px',
        background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
        }
      }}>
        <SpinWheel spinning={isSpinning}>
          <Typography variant='h6' sx={{ fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' }}>
            {isSpinning ? '...' : 'SPIN'}
          </Typography>
        </SpinWheel>
        <Pointer />
      </Box>

      <Button
        variant='contained'
        size='large'
        onClick={handleSpin}
        disabled={spinButtonDisabled || isSpinning}
        sx={{
          mb: 3,
          px: 4,
          py: 2,
          fontSize: '1.2rem',
          fontWeight: 'bold',
          background: spinButtonDisabled ? '#666' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: spinButtonDisabled ? 'none' : '0 4px 15px rgba(102,126,234,0.4)',
          '&:hover': {
            background: spinButtonDisabled ? '#666' : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            boxShadow: spinButtonDisabled ? 'none' : '0 6px 20px rgba(102,126,234,0.6)',
            transform: spinButtonDisabled ? 'none' : 'translateY(-2px)'
          },
          '&:disabled': {
            backgroundColor: '#666',
            color: '#999',
            transform: 'none'
          },
          transition: 'all 0.3s ease'
        }}
      >
        {isSpinning ? <CircularProgress size={24} color="inherit" /> : 'SPIN TO WIN!'}
      </Button>

      {showResult && (
        <ResultMessage type={resultType} sx={{
          background: resultType === 'success'
            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
            : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          {resultType === 'success' ? <CheckCircleIcon sx={{ mr: 1 }} /> : <ErrorIcon sx={{ mr: 1 }} />}
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            {resultMessage}
          </Typography>
        </ResultMessage>
      )}

      {spinButtonDisabled && !showResult && (
        <Typography variant='body1' sx={{
          mt: 2,
          textAlign: 'center',
          color: 'text.secondary',
          fontWeight: 500,
          p: 2,
          borderRadius: '8px',
          background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)'
        }}>
          🎯 You've already spun! Come back tomorrow for another chance! 🎯
        </Typography>
      )}
    </Card>
  )
}

export default DepositWithdraw
