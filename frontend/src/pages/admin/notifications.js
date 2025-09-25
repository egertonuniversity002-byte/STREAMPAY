// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Components
import Notifications from 'src/views/admin/Notifications'

// ** Component Imports
import ProtectedRoute from 'src/components/ProtectedRoute'

const AdminNotifications = () => {
  return (
    <ProtectedRoute>
      <Box>
        <Typography variant='h4' sx={{ mb: 6 }}>
          Notification Management
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Notifications />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant='h6'>Quick Stats</Typography>
              <Typography variant='body2'>• Create system-wide notifications</Typography>
              <Typography variant='body2'>• Target specific user groups</Typography>
              <Typography variant='body2'>• Choose notification types</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ProtectedRoute>
  )
}

export default AdminNotifications
