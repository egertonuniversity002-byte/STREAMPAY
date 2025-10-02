// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import ArrowForward from 'mdi-material-ui/ArrowRight'
import CircularProgress from '@mui/material/CircularProgress'

// ** Gateway Icons and Logos (using actual images)
const gatewayData = [
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Global payment platform',
    logo: '/images/misc/paypal.png',
    color: '#0070BA',
    gradient: 'linear-gradient(135deg, #0070BA 0%, #00A3E0 100%)',
    glowColor: 'rgba(0, 112, 186, 0.3)',
    supported: true,
    features: ['Global Cards', 'PayPal Balance', 'Instant Transfer']
  },
  {
    id: 'pesapal',
    name: 'Pesapal',
    description: 'East African payment gateway',
    logo: '/images/misc/paypal.png', // Using paypal logo as placeholder for pesapal
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    supported: true,
    features: ['M-Pesa', 'Airtel Money', 'Card Payments']
  }
]

const GatewaySelection = ({ onGatewaySelect, user }) => {
  const [selectedGateway, setSelectedGateway] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleGatewayClick = (gateway) => {
    if (gateway.supported) {
      setSelectedGateway(gateway.id)
    }
  }

  const handleProceed = () => {
    console.log('Proceed button clicked, selectedGateway:', selectedGateway)
    if (selectedGateway) {
      console.log('Calling onGatewaySelect with:', selectedGateway)
      onGatewaySelect(selectedGateway)
    } else {
      console.log('No gateway selected')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
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
          <CardContent sx={{
            color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50'
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant='h5' sx={{ mb: 2, color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50', fontWeight: 'bold' }}>
                Choose Your Payment Gateway
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Select a payment method to proceed with your deposit
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {gatewayData.map((gateway) => (
                <Grid item xs={12} sm={6} md={4} key={gateway.id}>
                  <Card
                    sx={{
                      cursor: gateway.supported ? 'pointer' : 'not-allowed',
                      opacity: gateway.supported ? 1 : 0.6,
                      border: selectedGateway === gateway.id ? '3px solid' : '2px solid',
                      borderColor: selectedGateway === gateway.id ? gateway.color : 'rgba(255,255,255,0.1)',
                      background: selectedGateway === gateway.id
                        ? `linear-gradient(135deg, ${gateway.color}10 0%, ${gateway.color}05 100%)`
                        : 'transparent',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${gateway.glowColor}, transparent)`,
                        transition: 'left 0.5s',
                      },
                      '&:hover': {
                        transform: gateway.supported ? 'translateY(-8px) scale(1.02)' : 'none',
                        boxShadow: gateway.supported
                          ? `0 20px 40px ${gateway.glowColor}, 0 0 0 1px ${gateway.color}40`
                          : 1,
                        '&::before': {
                          left: '100%',
                        }
                      },
                      '&:active': {
                        transform: gateway.supported ? 'translateY(-4px) scale(0.98)' : 'none',
                      }
                    }}
                    onClick={() => handleGatewayClick(gateway)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        component="img"
                        src={gateway.logo}
                        alt={`${gateway.name} logo`}
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                          borderRadius: '50%',
                          background: gateway.gradient,
                          padding: '12px',
                          boxShadow: `0 0 20px ${gateway.glowColor}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: `0 0 30px ${gateway.glowColor}, 0 0 40px ${gateway.glowColor}`
                          }
                        }}
                      />

                      <Typography variant='h6' sx={{ mb: 1 }}>
                        {gateway.name}
                      </Typography>

                      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        {gateway.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        {gateway.features.map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size='small'
                            sx={{ mr: 0.5, mb: 0.5 }}
                            color='primary'
                            variant='outlined'
                          />
                        ))}
                      </Box>

                      {!gateway.supported && (
                        <Chip
                          label='Coming Soon'
                          color='warning'
                          size='small'
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedGateway && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant='contained'
                  size='large'
                  endIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  onClick={handleProceed}
                  disabled={isProcessing}
                  sx={{
                    px: 6,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${gatewayData.find(g => g.id === selectedGateway)?.color} 0%, ${gatewayData.find(g => g.id === selectedGateway)?.color}dd 100%)`,
                    boxShadow: `0 4px 15px ${gatewayData.find(g => g.id === selectedGateway)?.glowColor}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${gatewayData.find(g => g.id === selectedGateway)?.color}dd 0%, ${gatewayData.find(g => g.id === selectedGateway)?.color} 100%)`,
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: `0 8px 25px ${gatewayData.find(g => g.id === selectedGateway)?.glowColor}, 0 0 0 1px ${gatewayData.find(g => g.id === selectedGateway)?.color}40`
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    }
                  }}
                >
                  {isProcessing ? 'Processing...' : `Proceed with ${gatewayData.find(g => g.id === selectedGateway)?.name}`}
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                💳 All transactions are secure and encrypted
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default GatewaySelection
