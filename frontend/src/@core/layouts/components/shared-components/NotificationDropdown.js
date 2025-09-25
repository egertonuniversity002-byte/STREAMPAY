// ** React Imports
import { useState, Fragment, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu from '@mui/material/Menu'
import MuiAvatar from '@mui/material/Avatar'
import MuiMenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Badge from '@mui/material/Badge'

// ** Icons Imports
import BellOutline from 'mdi-material-ui/BellOutline'
import CheckCircle from 'mdi-material-ui/CheckCircle'
import Information from 'mdi-material-ui/Information'
import AlertCircle from 'mdi-material-ui/AlertCircle'
import Gift from 'mdi-material-ui/Gift'
import CreditCard from 'mdi-material-ui/CreditCard'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** Styled Menu component
const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4),
    background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '16px',
    boxShadow: theme.palette.mode === 'dark' ? '0 25px 50px rgba(0,0,0,0.7)' : '0 25px 50px rgba(0,0,0,0.15)',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(20px)',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderBottom: theme.palette.mode === 'dark' ? `1px solid rgba(255,255,255,0.1)` : `1px solid rgba(255,255,255,0.3)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)'
  }
}))

const styles = {
  maxHeight: 349,
  '& .MuiMenuItem-root:last-of-type': {
    border: 0
  }
}

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  ...styles
})

// ** Styled Avatar component
const Avatar = styled(MuiAvatar)({
  width: '2.375rem',
  height: '2.375rem',
  fontSize: '1.125rem'
})

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  flex: '1 1 100%',
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const NotificationDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // ** Hook
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))

  // ** Auth Hook
  const { token, isAuthenticated } = useAuth()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
    // Mark notifications as read when opening dropdown
    if (notifications.length > 0) {
      markAllAsRead()
    }
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const ScrollWrapper = ({ children }) => {
    if (hidden) {
      return <Box sx={{ ...styles, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
      return (
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
      )
    }
  }

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      console.log('Fetching notifications - Token:', token ? 'Present' : 'Missing', 'Is Authenticated:', isAuthenticated())
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch notifications')
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Notifications fetched successfully:', data)
        setNotifications(data.notifications || [])
        const unread = data.notifications?.filter(n => !n.is_read).length || 0
        setUnreadCount(unread)
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to mark notification as read')
        return
      }

      const response = await fetch(`https://official-paypal.onrender.com/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        console.error('Failed to mark notification as read:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to mark all notifications as read')
        return
      }

      const unreadNotifications = notifications.filter(n => !n.is_read)
      if (unreadNotifications.length === 0) return

      // Mark each unread notification as read
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.notification_id))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reward':
      case 'payment':
        return <Gift sx={{ color: 'success.main' }} />
      case 'system':
        return <Information sx={{ color: 'info.main' }} />
      case 'alert':
        return <AlertCircle sx={{ color: 'warning.main' }} />
      default:
        return <CheckCircle sx={{ color: 'primary.main' }} />
    }
  }

  // Format relative time
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()

    // Set up polling to refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [token, isAuthenticated])

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge badgeContent={unreadCount} color='error'>
          <BellOutline />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disableRipple>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Chip
                size='small'
                label={`${unreadCount} New`}
                color='primary'
                sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500, borderRadius: '10px' }}
              />
            )}
          </Box>
        </MenuItem>
        <ScrollWrapper>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <MenuItem>
              <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  No notifications yet
                </Typography>
              </Box>
            </MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.notification_id}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.notification_id)
                  }
                  handleDropdownClose()
                }}
                sx={{
                  backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 3, display: 'flex', alignItems: 'center' }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box sx={{ mx: 1, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                    <MenuItemTitle>{notification.title}</MenuItemTitle>
                    <MenuItemSubtitle variant='body2'>{notification.message}</MenuItemSubtitle>
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.disabled', ml: 2 }}>
                    {formatTimeAgo(notification.created_at)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </ScrollWrapper>
        {notifications.length > 0 && (
          <MenuItem
            disableRipple
            sx={{ py: 3.5, borderBottom: 0, borderTop: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Button fullWidth variant='contained' onClick={handleDropdownClose}>
              View All Notifications
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Fragment>
  )
}

export default NotificationDropdown
