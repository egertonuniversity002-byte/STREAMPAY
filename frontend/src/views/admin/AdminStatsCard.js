// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useState, useEffect } from 'react'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}))

const IconWrapper = styled(Box)(({ theme, color }) => ({
  backgroundColor: theme.palette[color]?.main || theme.palette.primary.main,
  color: 'white',
  borderRadius: '50%',
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: '1.5rem'
  }
}))

const AdminStatsCard = ({ title, value, icon, color = 'primary' }) => {
  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated() || !token) {
          console.error('Authentication required to fetch admin stats')
          return
        }

        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Update AuthContext with latest user data
          await refreshUser()
        } else {
          console.error('Failed to fetch admin stats')
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      }
    }

    fetchAdminStats()
  }, [token, isAuthenticated, refreshUser])

  return (
    <StyledCard>
      <IconWrapper color={color}>
        {icon}
      </IconWrapper>
      <CardContent sx={{ p: 0, flex: 1 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </CardContent>
    </StyledCard>
  )
}

export default AdminStatsCard
