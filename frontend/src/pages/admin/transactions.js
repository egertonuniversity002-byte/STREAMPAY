// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Components
import TransactionsTable from 'src/views/admin/TransactionsTable'

// ** Component Imports
import ProtectedRoute from 'src/components/ProtectedRoute'

const AdminTransactions = () => {
  return (
    <ProtectedRoute>
      <Box>
        <Typography variant='h4' sx={{ mb: 6 }}>
          Transaction Management
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <TransactionsTable />
          </Grid>
        </Grid>
      </Box>
    </ProtectedRoute>
  )
}

export default AdminTransactions
