// ** React Imports
import { useState, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icons Imports
import CogOutline from 'mdi-material-ui/CogOutline'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'

// ** Context Imports
import { useAuth } from '../../../../contexts/AuthContext'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState(null)

  // ** Hooks
  const router = useRouter()

  // ** Context
  const { user, logout, loading } = useAuth()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    setAnchorEl(null)
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }

  // Show loading spinner if auth is loading
  if (loading) {
    return (
      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt={user?.full_name || 'User'}
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src='/images/avatars/1.png'
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{
          '& .MuiMenu-paper': (theme) => ({
            width: 280,
            marginTop: 4,
            borderRadius: '20px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 30px 60px rgba(0, 123, 255, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
              : '0 30px 60px rgba(0, 123, 255, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
              : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
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
            [theme.breakpoints.down('sm')]: {
              width: '100%'
            }
          })
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{
          pt: 3,
          pb: 4,
          px: 4,
          background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          borderRadius: '16px 16px 0 0',
          borderBottom: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar
                alt={user?.full_name || 'User'}
                src='/images/avatars/1.png'
                sx={{
                  width: '3rem',
                  height: '3rem',
                  border: theme => theme.palette.mode === 'dark' ? '3px solid rgba(255,255,255,0.2)' : '3px solid rgba(255,255,255,0.8)',
                  boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 25px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,0,0,0.15)'
                }}
              />
            </Badge>
            <Box sx={{ display: 'flex', marginLeft: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                color: theme => theme.palette.mode === 'dark' ? 'text.primary' : '#2c3e50',
                textShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant='body2' sx={{
                fontSize: '0.85rem',
                color: 'text.secondary',
                fontWeight: 500,
                mt: 0.5
              }}>
                {user?.role || 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 0, mb: 1 }} />
        <MenuItem
          sx={{
            p: 0,
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
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={() => handleDropdownClose()}
        >
          <Box sx={styles}>
            <AccountOutline sx={{ marginRight: 2 }} />
            Profile
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            p: 0,
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
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={() => handleDropdownClose()}
        >
          <Box sx={styles}>
            <EmailOutline sx={{ marginRight: 2 }} />
            Inbox
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            p: 0,
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
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={() => handleDropdownClose()}
        >
          <Box sx={styles}>
            <MessageOutline sx={{ marginRight: 2 }} />
            Chat
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          sx={{
            p: 0,
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
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={() => handleDropdownClose()}
        >
          <Box sx={styles}>
            <CogOutline sx={{ marginRight: 2 }} />
            Settings
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            p: 0,
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
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={() => handleDropdownClose()}
        >
          <Box sx={styles}>
            <CurrencyUsd sx={{ marginRight: 2 }} />
            Pricing
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            p: 0,
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
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,212,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,212,255,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={() => handleDropdownClose()}
        >
          <Box sx={styles}>
            <HelpCircleOutline sx={{ marginRight: 2 }} />
            FAQ
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          sx={{
            py: 2,
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
              background: 'linear-gradient(135deg, #ff4444 0%, #ff6666 100%)',
              transform: 'scaleY(0)',
              transition: 'transform 0.3s ease',
              borderRadius: '0 4px 4px 0',
            },
            '&:hover': {
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255,68,68,0.1) 0%, rgba(255,102,102,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255,68,68,0.05) 0%, rgba(255,102,102,0.02) 100%)',
              backdropFilter: 'blur(15px)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleY(1)',
              }
            }
          }}
          onClick={handleLogout}
        >
          <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
          Logout
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
