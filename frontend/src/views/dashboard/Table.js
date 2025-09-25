// ** MUI Imports
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../contexts/AuthContext'

const DashboardTable = () => {
  const { user, token, loading } = useAuth()
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return

      try {
        const response = await fetch('https://official-paypal.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        } else {
          setError('Failed to fetch user data')
        }
      } catch (err) {
        setError('Error connecting to server')
      }
    }

    fetchUserData()
  }, [token])

  if (loading) {
    return (
      <Card sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
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
        <CircularProgress />
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{
        p: 4,
        textAlign: 'center',
        background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '16px',
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.7)' : '0 15px 35px rgba(0,0,0,0.1)',
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
        color: 'error.main',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme => theme.palette.mode === 'dark' ? '0 25px 50px rgba(0,0,0,0.9)' : '0 25px 50px rgba(0,0,0,0.15)'
        }
      }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card sx={{
        p: 4,
        textAlign: 'center',
        background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '16px',
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.7)' : '0 15px 35px rgba(0,0,0,0.1)',
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)'
      }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          No user data available
        </Typography>
      </Card>
    )
  }

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency helper
  const formatCurrency = (amount, currency = 'TZS') => {
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <Card sx={{
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
      <Box sx={{
        p: 3,
        borderBottom: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
        background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px 16px 0 0'
      }}>
        <Typography variant="h6" sx={{
          fontWeight: 'bold',
          color: 'text.primary',
          textShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          👤 User Profile & Account Details
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Complete overview of your account information and statistics
        </Typography>
      </Box>

      <TableContainer sx={{
        background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 16px 16px'
      }}>
        <Table sx={{ minWidth: 800 }} aria-label='user profile table'>
          <TableHead sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '& .MuiTableCell-head': {
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }
          }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Basic Information */}
            <TableRow hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User ID</Typography>
                <Typography variant='caption' color="text.secondary">Unique identifier</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {userData.user_id}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Active" color="success" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Full Name</Typography>
                <Typography variant='caption' color="text.secondary">Display name</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1">{userData.full_name}</Typography>
              </TableCell>
              <TableCell>
                <Chip label="Verified" color="primary" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Email Address</Typography>
                <Typography variant='caption' color="text.secondary">Contact email</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{userData.email}</Typography>
              </TableCell>
              <TableCell>
                <Chip label="Active" color="success" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Phone Number</Typography>
                <Typography variant='caption' color="text.secondary">Mobile contact</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{userData.phone}</Typography>
              </TableCell>
              <TableCell>
                <Chip label="Verified" color="primary" size="small" />
              </TableCell>
            </TableRow>

            {/* Account Status */}
            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Account Status</Typography>
                <Typography variant='caption' color="text.secondary">Activation status</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1">
                  {userData.is_activated ? '✅ Activated' : '⏳ Pending Activation'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={userData.is_activated ? 'Active' : 'Inactive'}
                  color={userData.is_activated ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Account Role</Typography>
                <Typography variant='caption' color="text.secondary">User permissions</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {userData.role}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={userData.role} color="info" size="small" />
              </TableCell>
            </TableRow>

            {/* Financial Information */}
            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>💰 Wallet Balance</Typography>
                <Typography variant='caption' color="text.secondary">Current balance</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(userData.wallet_balance, userData.preferred_currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Available" color="success" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Earned</Typography>
                <Typography variant='caption' color="text.secondary">Lifetime earnings</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" color="success.main">
                  {formatCurrency(userData.total_earned, userData.preferred_currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Earned" color="success" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Withdrawn</Typography>
                <Typography variant='caption' color="text.secondary">Amount withdrawn</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" color="warning.main">
                  {formatCurrency(userData.total_withdrawn, userData.preferred_currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Withdrawn" color="warning" size="small" />
              </TableCell>
            </TableRow>

            {/* Earnings Breakdown */}
            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Referral Earnings</Typography>
                <Typography variant='caption' color="text.secondary">From referrals</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="info.main">
                  {formatCurrency(userData.referral_earnings, userData.preferred_currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={`${userData.referral_count} referrals`} color="info" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Task Earnings</Typography>
                <Typography variant='caption' color="text.secondary">From completed tasks</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="secondary.main">
                  {formatCurrency(userData.task_earnings, userData.preferred_currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Tasks" color="secondary" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Binary Earnings</Typography>
                <Typography variant='caption' color="text.secondary">From binary structure</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="primary.main">
                  {formatCurrency(userData.binary_earnings, userData.preferred_currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Binary" color="primary" size="small" />
              </TableCell>
            </TableRow>

            {/* Network Information */}
            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Network Size</Typography>
                <Typography variant='caption' color="text.secondary">Left/Right leg sizes</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  Left: {userData.left_leg_size} | Right: {userData.right_leg_size}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Network" color="info" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Referral Code</Typography>
                <Typography variant='caption' color="text.secondary">Your referral link</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {userData.referral_code}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Share" color="primary" size="small" />
              </TableCell>
            </TableRow>

            {/* Spin Status */}
            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>🎰 Spin Status</Typography>
                <Typography variant='caption' color="text.secondary">Daily spin availability</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1">
                  {userData.has_spun_once ? '✅ Already spun today' : '🎯 Available to spin'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={userData.has_spun_once ? 'Used' : 'Available'}
                  color={userData.has_spun_once ? 'warning' : 'success'}
                  size="small"
                />
              </TableCell>
            </TableRow>

            {/* Account Dates */}
            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Account Created</Typography>
                <Typography variant='caption' color="text.secondary">Registration date</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(userData.created_at)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Created" color="info" size="small" />
              </TableCell>
            </TableRow>

            <TableRow hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Last Login</Typography>
                <Typography variant='caption' color="text.secondary">Most recent login</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(userData.last_login)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label="Recent" color="success" size="small" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default DashboardTable
