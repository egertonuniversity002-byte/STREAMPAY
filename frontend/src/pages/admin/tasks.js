// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Components
import TasksTable from 'src/views/admin/TasksTable'

// ** Component Imports
import ProtectedRoute from 'src/components/ProtectedRoute'

const AdminTasks = () => {
  return (
    <ProtectedRoute>
      <Box>
        <Typography variant='h4' sx={{ mb: 6 }}>
          Task Management
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <TasksTable />
          </Grid>
        </Grid>
      </Box>
    </ProtectedRoute>
  )
}

export default AdminTasks
