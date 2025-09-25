// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import DotsVertical from 'mdi-material-ui/DotsVertical'

const CardStatsVertical = props => {
  // ** Props
  const { title, subtitle, color, icon, stats, trend, trendNumber } = props

  return (
    <Card sx={{
      background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e1e2f 0%, #2c2c3e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '16px',
      boxShadow: theme => theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.7)' : '0 15px 35px rgba(0,0,0,0.1)',
      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 25px 50px rgba(0,0,0,0.9)' : '0 25px 50px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent sx={{
        background: theme => theme.palette.mode === 'dark' ? 'rgba(30,30,47,0.6)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px'
      }}>
        <Box sx={{ display: 'flex', marginBottom: 5.5, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Avatar sx={{
            boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 25px rgba(0,0,0,0.7)' : '0 8px 25px rgba(0,0,0,0.15)',
            marginRight: 4,
            color: 'common.white',
            background: `linear-gradient(135deg, ${color === 'success' ? '#4caf50' : color === 'secondary' ? '#9c27b0' : color === 'warning' ? '#ff9800' : '#2196f3'} 0%, ${color === 'success' ? '#66bb6a' : color === 'secondary' ? '#ba68c8' : color === 'warning' ? '#ffb74d' : '#64b5f6'} 100%)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: theme => theme.palette.mode === 'dark' ? '0 12px 35px rgba(0,0,0,0.9)' : '0 12px 35px rgba(0,0,0,0.2)'
            }
          }}>
            {icon}
          </Avatar>
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{
            color: theme => theme.palette.mode === 'dark' ? '#aaa' : '#666',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
              transform: 'scale(1.1)'
            }
          }}>
            <DotsVertical />
          </IconButton>
        </Box>
        <Typography sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
          textShadow: theme => theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
        }}>{title}</Typography>
        <Box sx={{ marginTop: 1.5, display: 'flex', flexWrap: 'wrap', marginBottom: 1.5, alignItems: 'flex-start' }}>
          <Typography variant='h6' sx={{
            mr: 2,
            fontWeight: 'bold',
            color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50',
            textShadow: theme => theme.palette.mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {stats}
          </Typography>
          <Typography
            component='sup'
            variant='caption'
            sx={{
              color: trend === 'positive' ? '#4caf50' : '#f44336',
              fontWeight: 'bold',
              textShadow: theme => theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {trendNumber}
          </Typography>
        </Box>
        <Typography variant='caption' sx={{
          color: theme => theme.palette.mode === 'dark' ? '#aaa' : '#666',
          fontWeight: 500
        }}>{subtitle}</Typography>
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical

CardStatsVertical.defaultProps = {
  color: 'primary',
  trend: 'positive'
}
