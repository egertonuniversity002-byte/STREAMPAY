import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Slider from '@mui/material/Slider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'

// ** Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'

// ** Components
import { useAuth } from 'src/contexts/AuthContext'
import CandlestickChart from 'src/components/CandlestickChart'

const DerivPage = () => {
  const { user } = useAuth()
  const [asset, setAsset] = useState('EUR/USD')
  const [duration, setDuration] = useState(60) // seconds
  const [amount, setAmount] = useState(10)
  const [balance, setBalance] = useState(user?.wallet_balance || 1000)
  const [payout, setPayout] = useState(85) // percentage
  const [currentPrice, setCurrentPrice] = useState(1.0850)
  const [priceHistory, setPriceHistory] = useState([1.0850])
  const [recentTrades, setRecentTrades] = useState([
    { id: 1, asset: 'EUR/USD', direction: 'Call', amount: 10, payout: 8.5, time: '1 min ago' },
    { id: 2, asset: 'GBP/USD', direction: 'Put', amount: 20, payout: -20, time: '2 min ago' }
  ])
  const [activeTrades, setActiveTrades] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTrading, setIsTrading] = useState(false)
  const [activeUsers, setActiveUsers] = useState(1247) // Simulated active users count

  const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'Gold', 'Oil', 'Bitcoin']
  const durations = [15, 30, 60, 120, 300, 900] // seconds: 15s, 30s, 1m, 2m, 5m, 15m

  const priceIntervalRef = useRef(null)
  const tradeTimerRef = useRef(null)

  // Simulate price movement
  useEffect(() => {
    priceIntervalRef.current = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 0.001 // Random change between -0.0005 and 0.0005
        const newPrice = prev + change
        setPriceHistory(history => [...history.slice(-99), newPrice]) // Keep last 100 prices
        return newPrice
      })
    }, 1000) // Update every second

    return () => clearInterval(priceIntervalRef.current)
  }, [])

  // Handle trade expiration
  useEffect(() => {
    if (activeTrades.length > 0) {
      tradeTimerRef.current = setInterval(() => {
        setActiveTrades(trades =>
          trades.map(trade => ({
            ...trade,
            timeLeft: Math.max(0, trade.timeLeft - 1)
          })).filter(trade => {
            if (trade.timeLeft <= 0) {
              // Trade expired, determine outcome
              const outcome = Math.random() > 0.5 // 50% win rate for simulation
              const payout = outcome ? (trade.amount * payout / 100) : -trade.amount
              setBalance(prev => prev + payout)
              setRecentTrades(prev => [...prev, {
                id: trade.id,
                asset: trade.asset,
                direction: trade.direction,
                amount: trade.amount,
                payout: payout,
                time: 'Just now'
              }])
              return false
            }
            return true
          })
        )
      }, 1000)

      return () => clearInterval(tradeTimerRef.current)
    }
  }, [activeTrades, payout])

  const handleCallTrade = () => {
    if (balance < amount) {
      alert('Insufficient balance!')
      return
    }

    const trade = {
      id: Date.now(),
      asset,
      direction: 'Call',
      amount,
      entryPrice: currentPrice,
      timeLeft: duration
    }

    setActiveTrades(prev => [...prev, trade])
    setBalance(prev => prev - amount)
    setIsTrading(true)
  }

  const handlePutTrade = () => {
    if (balance < amount) {
      alert('Insufficient balance!')
      return
    }

    const trade = {
      id: Date.now(),
      asset,
      direction: 'Put',
      amount,
      entryPrice: currentPrice,
      timeLeft: duration
    }

    setActiveTrades(prev => [...prev, trade])
    setBalance(prev => prev - amount)
    setIsTrading(true)
  }

  const handleDeposit = () => {
    window.open('https://app.deriv.com/signup?client_type=1', '_blank')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4'>Pocket Option Style Trading</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6'>Balance: ${balance.toFixed(2)}</Typography>
            <Chip icon={<AccountBalanceWalletIcon />} label='Wallet' color='primary' />
          </Box>
          <Button variant='contained' startIcon={<AccountBalanceWalletIcon />} onClick={handleDeposit}>
            Deposit
          </Button>
        </Box>
      </Box>

      {/* Active Users Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
            {activeUsers.toLocaleString()} Active Traders
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.9 }}>
            Join the community of active traders
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Asset Selector and Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControl variant='outlined' sx={{ minWidth: 120 }}>
                  <InputLabel>Asset</InputLabel>
                  <Select value={asset} onChange={(e) => setAsset(e.target.value)} label='Asset'>
                    {assets.map((a) => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant='h6'>Payout: {payout}%</Typography>
              </Box>
              {/* Candlestick Chart */}
              <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden' }}>
                <CandlestickChart
                  priceHistory={priceHistory}
                  currentPrice={currentPrice}
                  asset={asset}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trade Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>Trade Settings</Typography>
              
              {/* Duration */}
              <Box sx={{ mb: 2 }}>
                <Typography>Duration: {duration}s</Typography>
                <Slider
                  value={duration}
                  onChange={(e, val) => setDuration(val)}
                  marks={durations.map(d => ({ value: d, label: `${d}s` }))}
                  min={15}
                  max={900}
                  step={15}
                  valueLabelDisplay='auto'
                />
              </Box>

              {/* Amount */}
              <Box sx={{ mb: 3 }}>
                <Typography>Investment: ${amount}</Typography>
                <Slider
                  value={amount}
                  onChange={(e, val) => setAmount(val)}
                  min={1}
                  max={balance}
                  step={1}
                  valueLabelDisplay='auto'
                />
              </Box>

              {/* Call/Put Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant='contained'
                  color='success'
                  fullWidth
                  size='large'
                  onClick={handleCallTrade}
                  startIcon={<TrendingUpIcon />}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  CALL (UP)
                </Button>
                <Button
                  variant='contained'
                  color='error'
                  fullWidth
                  size='large'
                  onClick={handlePutTrade}
                  startIcon={<TrendingDownIcon />}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  PUT (DOWN)
                </Button>
              </Box>

              <Typography variant='body2' sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                Potential Payout: ${(amount * payout / 100).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Trades */}
      {activeTrades.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>Active Trades</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Direction</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Entry Price</TableCell>
                    <TableCell>Time Left</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.asset}</TableCell>
                      <TableCell>
                        <Chip
                          label={trade.direction}
                          color={trade.direction === 'Call' ? 'success' : 'error'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>${trade.amount}</TableCell>
                      <TableCell>{trade.entryPrice.toFixed(4)}</TableCell>
                      <TableCell>{formatTime(trade.timeLeft)}</TableCell>
                      <TableCell sx={{ width: 150 }}>
                        <LinearProgress
                          variant='determinate'
                          value={(trade.timeLeft / duration) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Trades */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>Recent Trades</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payout</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTrades.slice(-5).map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{trade.asset}</TableCell>
                    <TableCell>
                      <Chip
                        label={trade.direction}
                        color={trade.direction === 'Call' ? 'success' : 'error'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>${trade.amount}</TableCell>
                    <TableCell>${trade.payout.toFixed(2)}</TableCell>
                    <TableCell>{trade.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {recentTrades.length === 0 && (
            <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              No recent trades. Place a trade to get started!
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default DerivPage
