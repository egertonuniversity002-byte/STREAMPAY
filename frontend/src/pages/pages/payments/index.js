// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'

// ** Component Imports
import PaymentDashboard from '../../../views/payments/PaymentDashboard'
import GatewaySelection from '../../../views/payments/GatewaySelection'
import PaystackDeposit from '../../../views/payments/PaystackDeposit'
import PayPalDeposit from '../../../views/payments/PayPalDeposit'
import StripeDeposit from '../../../views/payments/StripeDeposit'
import FlutterwaveDeposit from '../../../views/payments/FlutterwaveDeposit'
import PesapalDeposit from '../../../views/payments/PesapalDeposit'
import PaystackWithdrawal from '../../../views/payments/PaystackWithdrawal'
import TransactionHistory from '../../../views/payments/TransactionHistory'

// ** Icon Imports
import AccountOutline from 'mdi-material-ui/AccountOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import History from 'mdi-material-ui/History'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// Styled TabList component
const StyledTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    color: theme.palette.text.primary,
    margin: theme.spacing(0, 0.5),
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const PaymentsPage = () => {
  // ** State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedGateway, setSelectedGateway] = useState(null)
  const [showGatewaySelection, setShowGatewaySelection] = useState(false)

  // ** Auth Context
  const { user, loading, isAuthenticated, authError } = useAuth()

  // ** Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    if (newValue !== 'deposit') {
      setSelectedGateway(null)
      setShowGatewaySelection(false)
    } else if (newValue === 'deposit' && !selectedGateway) {
      // Show gateway selection when deposit tab is clicked and no gateway is selected
      setShowGatewaySelection(true)
    }
  }

  // ** Handle Gateway Selection
  const handleGatewaySelect = (gateway) => {
    console.log('Gateway selected in parent:', gateway)
    setSelectedGateway(gateway)
    setActiveTab('deposit')
    setShowGatewaySelection(false)
    console.log('State updated - selectedGateway:', gateway, 'activeTab:', 'deposit', 'showGatewaySelection:', false)
  }

  // ** Handle Back to Gateway Selection
  const handleBackToGateway = () => {
    setSelectedGateway(null)
    setShowGatewaySelection(true)
    setActiveTab('deposit')
  }

  // ** Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant='h6'>Loading...</Typography>
      </div>
    )
  }

  // ** Show error message if authentication fails
  if (!isAuthenticated()) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Please log in to access payments
          </Typography>
          {authError && (
            <Typography variant='body2' color='error' sx={{ mb: 2 }}>
              {authError}
            </Typography>
          )}
          <Typography variant='body2' color='text.secondary'>
            You will be redirected to login automatically...
          </Typography>
        </div>
      </div>
    )
  }

  // ** Check if user is activated
  const isActivated = user?.is_activated || false

  // ** If user is not activated, show only deposit options
  if (!isActivated && !selectedGateway) {
    return (
      <Card>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 2 }}>
            Account Activation Required
          </Typography>
          <Typography variant='body1' sx={{ mb: 4, color: 'text.secondary' }}>
            To access all payment features, you need to activate your account by making a deposit of at least 500 KSH.
          </Typography>
          <GatewaySelection onGatewaySelect={handleGatewaySelect} user={user} />
        </CardContent>
      </Card>
    )
  }

  // ** Render Gateway Selection
  if (showGatewaySelection) {
    return (
      <Card>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 4 }}>
            Choose Payment Gateway
          </Typography>
          <GatewaySelection onGatewaySelect={handleGatewaySelect} user={user} />
        </CardContent>
      </Card>
    )
  }

  // ** Render Deposit Component based on selected gateway
  const renderDepositComponent = () => {
    switch (selectedGateway) {
      case 'paypal':
        return <PayPalDeposit user={user} onBack={handleBackToGateway} />
      case 'stripe':
        return <StripeDeposit user={user} onBack={handleBackToGateway} />
      case 'flutterwave':
        return <FlutterwaveDeposit user={user} onBack={handleBackToGateway} />
      case 'pesapal':
        return <PesapalDeposit user={user} onBack={handleBackToGateway} />
      case 'paystack':
      default:
        return <PaystackDeposit user={user} onBack={handleBackToGateway} />
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' sx={{ mb: 4 }}>
          Payment Management
        </Typography>

        <TabContext value={activeTab}>
          <StyledTabList onChange={handleTabChange} aria-label='payment tabs'>
            <Tab
              value='dashboard'
              label='Dashboard'
              icon={<AccountOutline fontSize='small' />}
              iconPosition='start'
            />
            <Tab
              value='deposit'
              label='Deposit'
              icon={<CreditCardOutline fontSize='small' />}
              iconPosition='start'
            />
            <Tab
              value='withdraw'
              label='Withdraw'
              icon={<TrendingUp fontSize='small' />}
              iconPosition='start'
            />
            <Tab
              value='history'
              label='History'
              icon={<History fontSize='small' />}
              iconPosition='start'
            />
          </StyledTabList>

          <TabPanel value='dashboard' sx={{ p: 0, mt: 4 }}>
            <PaymentDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
          </TabPanel>

          <TabPanel value='deposit' sx={{ p: 0, mt: 4 }}>
            {showGatewaySelection ? (
              <GatewaySelection onGatewaySelect={handleGatewaySelect} user={user} />
            ) : (
              renderDepositComponent()
            )}
          </TabPanel>

          <TabPanel value='withdraw' sx={{ p: 0, mt: 4 }}>
            <PaystackWithdrawal user={user} />
          </TabPanel>

          <TabPanel value='history' sx={{ p: 0, mt: 4 }}>
            <TransactionHistory user={user} />
          </TabPanel>
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default PaymentsPage
