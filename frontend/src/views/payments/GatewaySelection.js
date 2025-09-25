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

// ** Gateway Icons and Logos (using text representations for now)
const gatewayData = [
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Popular Nigerian payment gateway',
    logo: '🟢',
    color: '#00C9A7',
    supported: true,
    features: ['M-Pesa', 'Card Payments', 'Bank Transfer']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Global payment platform',
    logo: '🔵',
    color: '#0070BA',
    supported: true,
    features: ['Global Cards', 'PayPal Balance', 'Instant Transfer']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Developer-friendly payment API',
    logo: '🟣',
    color: '#635BFF',
    supported: true,
    features: ['Credit Cards', 'Digital Wallets', 'Bank Transfers']
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'African payment technology',
    logo: '🟠',
    color: '#F5A623',
    supported: true,
    features: ['Mobile Money', 'Card Payments', 'Bank Transfer']
  },
  {
    id: 'pesapal',
    name: 'Pesapal',
    description: 'East African payment gateway',
    logo: '🟡',
    color: '#FFD700',
    supported: true,
    features: ['M-Pesa', 'Airtel Money', 'Card Payments']
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Business payment solutions',
    logo: '⚪',
    color: '#FFFFFF',
    supported: false,
    features: ['Point of Sale', 'Online Payments', 'Invoicing']
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
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
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
                      border: selectedGateway === gateway.id ? '2px solid' : '1px solid',
                      borderColor: selectedGateway === gateway.id ? 'primary.main' : 'divider',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: gateway.supported ? 'translateY(-4px)' : 'none',
                        boxShadow: gateway.supported ? 3 : 1
                      }
                    }}
                    onClick={() => handleGatewayClick(gateway)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: gateway.color,
                          mx: 'auto',
                          mb: 2,
                          fontSize: '2rem'
                        }}
                      >
                        {gateway.logo}
                      </Avatar>

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
                  sx={{ px: 6, py: 1.5 }}
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
