// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useEffect, useState } from 'react'

// ** Icons Imports
import CheckCircle from 'mdi-material-ui/CheckCircle'
import Cancel from 'mdi-material-ui/Cancel'
import Clock from 'mdi-material-ui/Clock'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const TransactionsTable = () => {
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    fetchTransactions()
  }, [token, isAuthenticated])

  const fetchTransactions = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch transactions')
        setLoading(false)
        return
      }

      // Fetch deposits
      const depositsResponse = await fetch('https://official-paypal.onrender.com/api/admin/transactions/deposits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch withdrawals
      const withdrawalsResponse = await fetch('https://official-paypal.onrender.com/api/admin/transactions/withdrawals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (depositsResponse.ok) {
        const depositsData = await depositsResponse.json()
        // Handle both direct array and nested response structure
        const depositsArray = Array.isArray(depositsData) ? depositsData : (depositsData.deposits || [])
        setDeposits(depositsArray)
      } else {
        setDeposits([])
      }

      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json()
        // Handle both direct array and nested response structure
        const withdrawalsArray = Array.isArray(withdrawalsData) ? withdrawalsData : (withdrawalsData.withdrawals || [])
        setWithdrawals(withdrawalsArray)
      } else {
        setWithdrawals([])
      }

      setError(null)
      // Update AuthContext with latest user data
      await refreshUser()
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setDeposits([])
      setWithdrawals([])
      setError('Network error while fetching transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
      case 'pending_admin_approval':
        return 'warning'
      case 'failed':
        return 'error'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />
      case 'pending':
      case 'pending_admin_approval':
        return <Clock />
      case 'failed':
      case 'cancelled':
        return <Cancel />
      default:
        return <Clock />
    }
  }

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      const response = await fetch('https://official-paypal.onrender.com/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id: withdrawalId })
      })

      if (response.ok) {
        // Refresh transactions
        fetchTransactions()
      } else {
        console.error('Failed to approve withdrawal')
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error)
    }
  }

  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      const response = await fetch('https://official-paypal.onrender.com/api/admin/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: withdrawalId,
          status: "rejected",
          reason: "Admin rejected the withdrawal"
        })
      })

      if (response.ok) {
        // Refresh transactions
        fetchTransactions()
      } else {
        console.error('Failed to reject withdrawal')
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
    }
  }

  const handleManualComplete = async (transactionId) => {
    try {
      const response = await fetch('https://official-paypal.onrender.com/api/admin/manual-complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id: transactionId })
      })

      if (response.ok) {
        // Refresh transactions
        fetchTransactions()
      } else {
        console.error('Failed to manually complete transaction')
      }
    } catch (error) {
      console.error('Error manually completing transaction:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Transaction Management" />
        <CardContent>
          <Typography>Loading transactions...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Transaction Management" />
        <CardContent>
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            onClick={fetchTransactions}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentTransactions = activeTab === 0 ? deposits : withdrawals

  return (
    <Card>
      <CardHeader title="Transaction Management" />
      <CardContent>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label={`Deposits (${deposits.length})`} />
          <Tab label={`Withdrawals (${withdrawals.length})`} />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTransactions && currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.email || transaction.user_email || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        ${transaction.kes_amount || transaction.original_amount || transaction.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.currency || transaction.original_currency || 'N/A'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.method || 'N/A'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={transaction.type === 'deposit' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status)}
                          size="small"
                          icon={getStatusIcon(transaction.status)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {activeTab === 1 && (transaction.status === 'pending' || transaction.status === 'pending_admin_approval') && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApproveWithdrawal(transaction.transaction_id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectWithdrawal(transaction.transaction_id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(transaction.status === 'pending' || transaction.status === 'pending_admin_approval' || transaction.status === 'failed') && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleManualComplete(transaction.transaction_id)}
                          >
                            Manual Complete
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default TransactionsTable
