// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import Bank from 'mdi-material-ui/Bank'
import ClipboardList from 'mdi-material-ui/ClipboardList'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const RecentActivity = () => {
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated() || !token) {
          console.error('Authentication required to fetch recent activity')
          setLoading(false)
          return
        }

        const response = await fetch('https://official-paypal.onrender.com/api/admin/dashboard/recent-activity', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setRecentActivities(Array.isArray(data.activities) ? data.activities : [])
          setError(null)
          // Update AuthContext with latest user data
          await refreshUser()
        } else {
          console.error('Failed to fetch recent activity')
          setRecentActivities([])
          setError('Failed to fetch recent activity')
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error)
        setRecentActivities([])
        setError('Network error while fetching recent activity')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [token, isAuthenticated])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <AccountOutline />
      case 'deposit':
        return <CurrencyUsd />
      case 'withdrawal':
        return <Bank />
      case 'task_completion':
        return <ClipboardList />
      default:
        return <AccountOutline />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration':
        return 'primary'
      case 'deposit':
        return 'success'
      case 'withdrawal':
        return 'warning'
      case 'task_completion':
        return 'info'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Typography>Loading recent activity...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <CardContent>
        {recentActivities && recentActivities.length > 0 ? (
          <List>
            {recentActivities.map((activity, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.light` }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {activity.description}
                      </Typography>
                      <Chip
                        label={activity.type.replace('_', ' ')}
                        size='small'
                        color={getActivityColor(activity.type)}
                        variant='outlined'
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant='body2' color='text.secondary'>
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            No recent activity found.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivity
