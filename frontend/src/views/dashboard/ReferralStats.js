import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  People,
  TrendingUp,
  AttachMoney,
  Star,
  PersonAdd,
  Schedule
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
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
  borderRadius: '20px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
    : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
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
    boxShadow: theme.palette.mode === 'dark'
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
  color: theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50'
}))

const ReferralStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    fetchReferralStats()
  }, [token, isAuthenticated])

  const fetchReferralStats = async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch referral stats')
        setLoading(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/referrals/stats', {
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
          throw new Error('Failed to fetch referral stats')
        }
        return
      }

      const data = await response.json()
      setStats(data)
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

  if (!stats) return null

  const { stats: referralStats, recent_referrals } = stats

  return (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mx: 'auto' }}>
              <People />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {referralStats.total_referrals}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Referrals
          </Typography>
        </StatsCard>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'success.main', mx: 'auto' }}>
              <AttachMoney />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' }}>
            {referralStats.total_earnings} {referralStats.currency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Earnings
          </Typography>
        </StatsCard>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'warning.main', mx: 'auto' }}>
              <TrendingUp />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {referralStats.potential_earnings} {referralStats.currency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Potential Earnings
          </Typography>
        </StatsCard>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatsCard>
          <Box mb={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'info.main', mx: 'auto' }}>
              <Star />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {referralStats.tier}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Tier
          </Typography>
        </StatsCard>
      </Grid>

      {/* Recent Referrals */}
      <Grid item xs={12} md={6}>
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
            <Typography variant="h6" gutterBottom>
              Recent Referrals
            </Typography>
            {recent_referrals && recent_referrals.length > 0 ? (
              <List>
                {recent_referrals.map((referral, index) => (
                  <ListItem key={index} divider={index < recent_referrals.length - 1}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonAdd />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={referral.full_name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {referral.email}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(referral.join_date).toLocaleDateString()}
                            </Typography>
                            <Chip
                              size="small"
                              label={referral.status}
                              color={referral.status === 'active' ? 'success' : 'default'}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No recent referrals
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Referral Details */}
      <Grid item xs={12} md={6}>
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
            <Typography variant="h6" gutterBottom>
              Referral Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Direct Referrals:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {referralStats.direct_referrals}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Indirect Referrals:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {referralStats.indirect_referrals}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Commission Rate:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {referralStats.commission_rate}%
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Monthly Target:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {referralStats.monthly_target} referrals
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  This Month:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {referralStats.monthly_achieved} referrals
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ReferralStats
