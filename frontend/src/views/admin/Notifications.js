// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'

// ** Icons Imports
import Bell from 'mdi-material-ui/Bell'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const Notifications = () => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  })
  const [loading, setLoading] = useState(false)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  const handleCreateNotification = async () => {
    if (!notification.title || !notification.message) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        alert('Authentication required. Please log in again.')
        setLoading(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/notifications/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      })

      if (response.ok) {
        alert('Notification created successfully!')
        setNotification({
          title: '',
          message: '',
          type: 'info',
          target: 'all'
        })
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        alert('Failed to create notification')
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      alert('Error creating notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title="Create Notification"
        avatar={<Bell />}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Notification Title"
            value={notification.title}
            onChange={(e) => setNotification({ ...notification, title: e.target.value })}
            placeholder="Enter notification title"
          />

          <TextField
            fullWidth
            label="Notification Message"
            multiline
            rows={4}
            value={notification.message}
            onChange={(e) => setNotification({ ...notification, message: e.target.value })}
            placeholder="Enter notification message"
          />

          <FormControl fullWidth>
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={notification.type}
              label="Notification Type"
              onChange={(e) => setNotification({ ...notification, type: e.target.value })}
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Target Audience</InputLabel>
            <Select
              value={notification.target}
              label="Target Audience"
              onChange={(e) => setNotification({ ...notification, target: e.target.value })}
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="active">Active Users</MenuItem>
              <MenuItem value="inactive">Inactive Users</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleCreateNotification}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Creating...' : 'Create Notification'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default Notifications
