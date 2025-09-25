import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  AccountBalance,
  People,
  TrendingUp,
  Balance,
  ArrowForward
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(2)
}))

const LegCard = styled(Card)(({ theme, side }) => ({
  height: '100%',
  borderLeft: `4px solid ${side === 'left' ? theme.palette.primary.main : theme.palette.secondary.main}`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}))

const BinaryStats = () => {
  const [binaryData, setBinaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    fetchBinaryStats()
  }, [token, isAuthenticated])

  const fetchBinaryStats = async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch binary stats')
        setLoading(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/referrals/binary-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Invalid token - authentication required')
          setError('Authentication required. Please log in again.')
        } else {
          throw new Error('Failed to fetch binary stats')
        }
        return
      }

      const data = await response.json()
      setBinaryData(data)
      // Update AuthContext with latest user data
      await refreshUser()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!binaryData) return null

  const { binary } = binaryData
  const leftPercentage = binary.total_downline > 0 ?
    (binary.left_leg_size / binary.total_downline) * 100 : 0
  const rightPercentage = binary.total_downline > 0 ?
    (binary.right_leg_size / binary.total_downline) * 100 : 0

  return (
    <Grid container spacing={3}>
      {/* Overview Cards */}
      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <People sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {binary.total_downline}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Downline
          </Typography>
        </StatsCard>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <AccountBalance sx={{ fontSize: 48, color: 'success.main' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {binary.total_binary_earnings} {binary.currency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Binary Earnings
          </Typography>
        </StatsCard>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <TrendingUp sx={{ fontSize: 48, color: 'warning.main' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {binary.monthly_binary_earnings} {binary.currency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monthly Earnings
          </Typography>
        </StatsCard>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <Balance sx={{ fontSize: 48, color: 'info.main' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {binary.leg_balance} {binary.currency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Leg Balance
          </Typography>
        </StatsCard>
      </Grid>

      {/* Left vs Right Leg */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Left vs Right Leg Distribution
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <LegCard side="left">
                  <CardContent>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Left Leg
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {binary.left_leg_size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      members
                    </Typography>
                    <Box mt={2}>
                      <LinearProgress
                        variant="determinate"
                        value={leftPercentage}
                        color="primary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={1} display="block">
                        {leftPercentage.toFixed(1)}% of total
                      </Typography>
                    </Box>
                  </CardContent>
                </LegCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <LegCard side="right">
                  <CardContent>
                    <Typography variant="h6" color="secondary.main" gutterBottom>
                      Right Leg
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {binary.right_leg_size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      members
                    </Typography>
                    <Box mt={2}>
                      <LinearProgress
                        variant="determinate"
                        value={rightPercentage}
                        color="secondary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={1} display="block">
                        {rightPercentage.toFixed(1)}% of total
                      </Typography>
                    </Box>
                  </CardContent>
                </LegCard>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <ArrowForward sx={{ mx: 2, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Balance your legs for optimal binary earnings
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Binary Details */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Binary Performance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Weekly New Members:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.weekly_new_members}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Monthly New Members:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.monthly_new_members}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Binary Cycle Rate:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.cycle_rate}%
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Matching Bonus:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.matching_bonus}%
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Rank:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.rank}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Earnings Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Earnings Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Direct Commissions:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.direct_commissions} {binary.currency}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Binary Commissions:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.binary_commissions} {binary.currency}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Matching Bonuses:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {binary.matching_bonuses} {binary.currency}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Total This Month:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {binary.monthly_binary_earnings} {binary.currency}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Total All Time:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {binary.total_binary_earnings} {binary.currency}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BinaryStats
