// ** React Imports
import { useState, useEffect } from 'react'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import History from 'mdi-material-ui/History'
import Search from 'mdi-material-ui/Magnify'
import FilterList from '@mui/icons-material/FilterList'

const TransactionHistory = ({ user }) => {
  // ** State
  const { token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // ** Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('https://official-paypal.onrender.com/api/transactions/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions || [])
        } else {
          setError('Failed to fetch transaction history')
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [token])

  // ** Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // ** Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // ** Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.method?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || transaction.type === filterType
    return matchesSearch && matchesFilter
  })

  // ** Format currency
  const formatCurrency = (amount, currency = 'TZS') => {
    // For TZS (Tanzanian Shilling), use Tanzania locale
    if (currency === 'TZS') {
      return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS'
      }).format(amount)
    }

    // For other currencies, use appropriate locale
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // ** Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ** Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  // ** Get type icon
  const getTypeIcon = (type) => {
    return type === 'deposit' ? '💰' : '💸'
  }

  if (loading) {
    return (
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
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
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant='contained'
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
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
          <History sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h6'>Transaction History</Typography>
        </Box>

        {/* Filters */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder='Search by email, ID, or method...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label='Filter by Type'
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value='all'>All Transactions</MenuItem>
                <MenuItem value='deposit'>Deposits</MenuItem>
                <MenuItem value='withdrawal'>Withdrawals</MenuItem>
                <MenuItem value='payment'>Payments</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Transaction Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align='right'>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction, index) => (
                  <TableRow key={transaction.id || index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1 }}>
                          {getTypeIcon(transaction.type)}
                        </Typography>
                        <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {transaction.email || transaction.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 500,
                          color: transaction.type === 'deposit' ? 'success.main' : 'text.primary'
                        }}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {formatCurrency(parseFloat(transaction.amount || 0), transaction.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.method || 'Unknown'}
                        color="primary"
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status || 'Unknown'}
                        color={getStatusColor(transaction.status)}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {formatDate(transaction.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                        {transaction.id}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={filteredTransactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' color='text.secondary'>
              No transactions found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Your transaction history will appear here'
              }
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionHistory
