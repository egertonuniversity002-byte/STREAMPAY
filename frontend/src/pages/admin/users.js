// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Components
import UsersTable from 'src/views/admin/UsersTable'

// ** Component Imports
import ProtectedRoute from 'src/components/ProtectedRoute'

const AdminUsers = () => {
  return (
    <ProtectedRoute>
      <Box>
        <Typography variant='h4' sx={{ mb: 6 }}>
          User Management
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <UsersTable />
          </Grid>
        </Grid>
      </Box>
    </ProtectedRoute>
  )
}

export default AdminUsers
