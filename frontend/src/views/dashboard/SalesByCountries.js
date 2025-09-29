// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** React Imports
import { useState, useEffect } from 'react'

const SalesByCountries = () => {
  const [data, setData] = useState([
    {
      sales: '894k',
      trendDir: 'up',
      subtitle: 'USA',
      title: '$8,656k',
      avatarText: '🇺🇸',
      trendNumber: '25.8%',
      avatarColor: 'success',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '645k',
      subtitle: 'KENYA',
      trendDir: 'down',
      title: '$2,415k',
      avatarText: '🇰🇪',
      trendNumber: '6.2%',
      avatarColor: 'error',
      trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
    },
    {
      sales: '148k',
      title: '$865k',
      trendDir: 'up',
      avatarText: '🇳🇬',
      subtitle: 'NAIGERIA',
      trendNumber: '12.4%',
      avatarColor: 'warning',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '86k',
      title: '$745k',
      trendDir: 'down',
      avatarText: '🇯🇵',
      subtitle: 'Japan',
      trendNumber: '11.9%',
      avatarColor: 'secondary',
      trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
    },
    {
      sales: '42k',
      title: '$45k',
      trendDir: 'up',
      avatarText: '🇰🇷',
      subtitle: 'Korea',
      trendNumber: '16.2%',
      avatarColor: 'error',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '523k',
      title: '$3,421k',
      trendDir: 'up',
      avatarText: '🇬🇧',
      subtitle: 'United Kingdom',
      trendNumber: '18.7%',
      avatarColor: 'success',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '312k',
      title: '$1,876k',
      trendDir: 'down',
      avatarText: '🇨🇦',
      subtitle: 'Canada',
      trendNumber: '8.3%',
      avatarColor: 'error',
      trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
    },
    {
      sales: '267k',
      title: '$2,134k',
      trendDir: 'up',
      avatarText: '🇦🇺',
      subtitle: 'Australia',
      trendNumber: '14.5%',
      avatarColor: 'warning',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '189k',
      title: '$1,543k',
      trendDir: 'down',
      avatarText: '🇩🇪',
      subtitle: 'Germany',
      trendNumber: '9.1%',
      avatarColor: 'secondary',
      trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
    },
    {
      sales: '156k',
      title: '$987k',
      trendDir: 'up',
      avatarText: '🇫🇷',
      subtitle: 'France',
      trendNumber: '11.8%',
      avatarColor: 'success',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '234k',
      title: '$1,543k',
      trendDir: 'up',
      avatarText: '🇿🇦',
      subtitle: 'South Africa',
      trendNumber: '15.2%',
      avatarColor: 'warning',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '189k',
      title: '$1,234k',
      trendDir: 'down',
      avatarText: '🇪🇬',
      subtitle: 'Egypt',
      trendNumber: '7.8%',
      avatarColor: 'error',
      trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
    },
    {
      sales: '167k',
      title: '$876k',
      trendDir: 'up',
      avatarText: '🇬🇭',
      subtitle: 'Ghana',
      trendNumber: '13.4%',
      avatarColor: 'success',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    },
    {
      sales: '145k',
      title: '$654k',
      trendDir: 'down',
      avatarText: '🇲🇦',
      subtitle: 'Morocco',
      trendNumber: '9.6%',
      avatarColor: 'secondary',
      trend: <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />
    },
    {
      sales: '123k',
      title: '$432k',
      trendDir: 'up',
      avatarText: '🇹🇳',
      subtitle: 'Tunisia',
      trendNumber: '12.1%',
      avatarColor: 'warning',
      trend: <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} />
    }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData =>
        prevData.map(item => {
          const randomSales = Math.floor(Math.random() * 500 + 50) + 'k' // Realistic range: 50k to 549k
          const randomTitle = '$' + Math.floor(Math.random() * 5000 + 500) + 'k' // Realistic range: $500k to $5499k
          const randomTrendNumber = (Math.random() * 20 + 5).toFixed(1) + '%' // Realistic range: 5.0% to 24.9%
          const trendDir = Math.random() > 0.5 ? 'up' : 'down'
          const avatarColor = trendDir === 'up' ? 'success' : 'error'
          const trend = trendDir === 'up' ? <ChevronUp sx={{ color: 'success.main', fontWeight: 600 }} /> : <ChevronDown sx={{ color: 'error.main', fontWeight: 600 }} />

          return {
            ...item,
            sales: randomSales,
            title: randomTitle,
            trendNumber: randomTrendNumber,
            trendDir,
            avatarColor,
            trend
          }
        })
      )
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
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
      <CardHeader
        title='Active users By countries'
        titleTypographyProps={{ sx: { lineHeight: '1.2 !important', letterSpacing: '0.31px !important', fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50' } }}
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
        {data.map((item, index) => {
          return (
            <Box
              key={item.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                ...(index !== data.length - 1 ? { mb: 5.875 } : {}),
                p: 2,
                borderRadius: '12px',
                background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  marginRight: 3,
                  fontSize: '1rem',
                  color: 'common.white',
                  backgroundColor: `${item.avatarColor}.main`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                {item.avatarText}
              </Avatar>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex' }}>
                    <Typography sx={{
                      mr: 0.5,
                      fontWeight: 600,
                      letterSpacing: '0.25px',
                      color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
                      transition: 'color 0.5s ease'
                    }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.trend}
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.5,
                          color: item.trendDir === 'down' ? 'error.main' : 'success.main',
                          animation: item.trendDir === 'up' ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                            '100%': { opacity: 1 },
                          },
                        }}
                      >
                        {item.trendNumber}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='caption' sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                    {item.subtitle}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', textAlign: 'end', flexDirection: 'column' }}>
                  <Typography sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.72,
                    letterSpacing: '0.22px',
                    color: 'primary.main',
                    transition: 'color 0.5s ease'
                  }}>
                    {item.sales}
                  </Typography>
                  <Typography variant='caption' sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                    Users
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default SalesByCountries
