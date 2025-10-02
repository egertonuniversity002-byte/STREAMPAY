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
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
    borderRadius: '20px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 30px 60px rgba(0, 123, 255, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
      : '0 30px 60px rgba(0, 123, 255, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
    backdropFilter: 'blur(25px)',
    animation: 'fadeInScale 0.3s ease-out',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
      transition: 'left 0.5s',
      pointerEvents: 'none',
    },
    '&:hover::before': {
      left: '100%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  },
  '@keyframes fadeInScale': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.95) translateY(-10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1) translateY(0)',
    },
  },
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderBottom: theme.palette.mode === 'dark' ? `1px solid rgba(255,255,255,0.1)` : `1px solid rgba(255,255,255,0.3)`,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '4px',
    height: '100%',
    background: 'linear-gradient(135deg, #007bff 0%, #00d4ff 100%)',
    transform: 'scaleY(0)',
    transition: 'transform 0.3s ease',
    borderRadius: '0 4px 4px 0',
  },
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
      : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
    backdropFilter: 'blur(15px)',
    transform: 'translateX(8px)',
    '&::before': {
      transform: 'scaleY(1)',
    }
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
  overflow: 'visible',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  lineHeight: 1.4
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
    const iconStyle = {
      fontSize: '1.5rem',
      transition: 'all 0.3s ease',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      '&:hover': {
        transform: 'scale(1.1) rotate(5deg)',
      }
    }

    switch (type) {
      case 'reward':
      case 'payment':
        return (
          <Box sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)' },
              '50%': { boxShadow: '0 4px 25px rgba(76, 175, 80, 0.6)' },
              '100%': { boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)' },
            }
          }}>
            <Gift sx={{ color: 'white', fontSize: '1.2rem' }} />
          </Box>
        )
      case 'system':
        return (
          <Box sx={{
            background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
          }}>
            <Information sx={{ color: 'white', fontSize: '1.2rem' }} />
          </Box>
        )
      case 'alert':
        return (
          <Box sx={{
            background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
            animation: 'shake 1s infinite',
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '25%': { transform: 'translateX(-2px)' },
              '75%': { transform: 'translateX(2px)' },
            }
          }}>
            <AlertCircle sx={{ color: 'white', fontSize: '1.2rem' }} />
          </Box>
        )
      default:
        return (
          <Box sx={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
          }}>
            <CheckCircle sx={{ color: 'white', fontSize: '1.2rem' }} />
          </Box>
        )
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
