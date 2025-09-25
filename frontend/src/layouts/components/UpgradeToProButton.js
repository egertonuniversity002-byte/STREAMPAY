// ** React Import
import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// ** MUI Icons
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import EmailIcon from '@mui/icons-material/Email'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import TelegramIcon from '@mui/icons-material/Telegram'

const BuyNowButton = () => {
  // ** States
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const socialMediaLinks = [
    { name: 'Facebook', icon: FacebookIcon, url: 'https://facebook.com/yourpage', color: '#1877F2', position: 'top-left' },
    { name: 'Twitter', icon: TwitterIcon, url: 'https://twitter.com/yourhandle', color: '#1DA1F2', position: 'top' },
    { name: 'Instagram', icon: InstagramIcon, url: 'https://instagram.com/yourhandle', color: '#E4405F', position: 'top-right' },
    { name: 'LinkedIn', icon: LinkedInIcon, url: 'https://linkedin.com/company/yourcompany', color: '#0A66C2', position: 'right' },
    { name: 'YouTube', icon: YouTubeIcon, url: 'https://youtube.com/yourchannel', color: '#FF0000', position: 'bottom-right' },
    { name: 'WhatsApp', icon: WhatsAppIcon, url: 'https://wa.me/yourphonenumber', color: '#25D366', position: 'bottom' },
    { name: 'Telegram', icon: TelegramIcon, url: 'https://t.me/yourusername', color: '#0088cc', position: 'bottom-left' },
    { name: 'Email', icon: EmailIcon, url: 'mailto:contact@yourcompany.com', color: '#EA4335', position: 'left' }
  ]

  const getIconPosition = (position) => {
    // Check if window is available (client-side only)
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 600 : false
    const distance = isMobile ? 50 : 70

    const positions = {
      'top-left': { top: -distance, left: -distance },
      'top': { top: -distance, left: 0 },
      'top-right': { top: -distance, right: -distance },
      'right': { top: 0, right: -distance },
      'bottom-right': { bottom: -distance, right: -distance },
      'bottom': { bottom: -distance, left: 0 },
      'bottom-left': { bottom: -distance, left: -distance },
      'left': { top: 0, left: -distance }
    }
    return positions[position] || { top: 0, left: 0 }
  }

  return (
    <Box
      ref={containerRef}
      className='upgrade-to-pro-button mui-fixed'
      sx={{
        right: theme => theme.spacing(theme.breakpoints.down('sm') ? 10 : 20),
        bottom: theme => theme.spacing(theme.breakpoints.down('sm') ? 5 : 10),
        zIndex: 11,
        position: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Social Media Icons */}
      {socialMediaLinks.map((social, index) => (
        <IconButton
          key={index}
          component='a'
          href={social.url}
          target='_blank'
          rel='noopener noreferrer'
          onClick={handleClose}
          sx={{
            position: 'absolute',
            width: 50,
            height: 50,
            backgroundColor: social.color,
            color: 'white',
            borderRadius: '50%',
            display: open ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease-in-out',
            transform: open ? 'scale(1)' : 'scale(0)',
            animation: open ? `fadeInScale 0.3s ease-out ${index * 0.1}s both` : 'none',
            '@keyframes fadeInScale': {
              '0%': {
                opacity: 0,
                transform: 'scale(0)'
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1)'
              }
            },
            '&:hover': {
              backgroundColor: social.color,
              transform: 'scale(1.1)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
            },
            ...getIconPosition(social.position)
          }}
        >
          <social.icon />
        </IconButton>
      ))}

      {/* Main Button */}
      <Button
        variant='contained'
        onClick={handleToggle}
        sx={{
          backgroundColor: '#2bff00ff',
          boxShadow: '0 1px 20px 1px #00ff88',
          borderRadius: '50%',
          width: 60,
          height: 60,
          minWidth: 60,
          padding: 0,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 1px 20px 1px #00ff88, 0 0 0 0 rgba(0, 255, 136, 0.7)'
            },
            '70%': {
              boxShadow: '0 1px 20px 1px #00ff88, 0 0 0 10px rgba(0, 255, 136, 0)'
            },
            '100%': {
              boxShadow: '0 1px 20px 1px #00ff88, 0 0 0 0 rgba(0, 255, 136, 0)'
            }
          },
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#00e674',
            animation: 'none'
          }
        }}
      >
        <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 'bold' }}>
          ?
        </Typography>
      </Button>
    </Box>
  )
}

export default BuyNowButton
