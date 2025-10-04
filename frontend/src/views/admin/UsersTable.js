// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Close from 'mdi-material-ui/Close'
import { useEffect, useState } from 'react'

// ** Icons Imports
import Eye from 'mdi-material-ui/Eye'
import Block from 'mdi-material-ui/CheckCircle'
import CheckCircle from 'mdi-material-ui/CheckCircle'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const UsersTable = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [token, isAuthenticated])

  const fetchUsers = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch users')
        setLoading(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Handle both direct array and nested response structure
        const usersData = Array.isArray(data) ? data : (data.users || [])
        setUsers(usersData)
        setError(null)
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        console.error('Failed to fetch users')
        setUsers([])
        setError('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      setError('Network error while fetching users')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'warning'
      case 'suspended':
        return 'error'
      default:
        return 'default'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'primary'
      case 'user':
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="User Management" />
        <CardContent>
          <Typography>Loading users...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="User Management" />
        <CardContent>
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            onClick={fetchUsers}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="User Management"
        action={
          <Button variant="contained" startIcon={<Eye />}>
            View All
          </Button>
        }
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {user.full_name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_activated ? 'Activated' : 'Not Activated'}
                        color={user.is_activated ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => { setSelectedUser(user); setOpenModal(true) }}>
                        View
                      </Button>
                      {user.status === 'active' ? (
                        <Button size="small" variant="outlined" color="warning">
                          Suspend
                        </Button>
                      ) : (
                        <Button size="small" variant="outlined" color="success">
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="user-details-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedUser && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5" component="h2">
                  User Details: {selectedUser.full_name}
                </Typography>
                <IconButton onClick={() => setOpenModal(false)}>
                  <Close />
                </IconButton>
              </Box>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Typography><strong>User ID:</strong> {selectedUser.user_id || 'N/A'}</Typography>
                    <Typography><strong>Email:</strong> {selectedUser.email || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</Typography>
                    <Typography><strong>Referral Code:</strong> {selectedUser.referral_code || 'N/A'}</Typography>
                    <Typography><strong>Referred By:</strong> {selectedUser.referred_by || 'N/A'}</Typography>
                    <Typography><strong>Parent ID:</strong> {selectedUser.parent_id || 'N/A'}</Typography>
                    <Typography><strong>Position:</strong> {selectedUser.position || 'N/A'}</Typography>
                    <Typography><strong>Role:</strong> {selectedUser.role || 'N/A'}</Typography>
                    <Typography><strong>Status:</strong> <Chip label={selectedUser.is_activated ? 'Activated' : 'Not Activated'} color={selectedUser.is_activated ? 'success' : 'error'} size="small" /></Typography>
                    <Typography><strong>Preferred Currency:</strong> {selectedUser.preferred_currency || 'N/A'}</Typography>
                    <Typography><strong>Theme:</strong> {selectedUser.theme || 'N/A'}</Typography>
                    <Typography><strong>Joined:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography><strong>Last Login:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography><strong>Notifications Enabled:</strong> {selectedUser.notifications_enabled ? 'Yes' : 'No'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Financial Information</Typography>
                    <Typography><strong>Wallet Balance:</strong> {selectedUser.wallet_balance || 'N/A'}</Typography>
                    <Typography><strong>Total Earned:</strong> {selectedUser.total_earned || 'N/A'}</Typography>
                    <Typography><strong>Total Withdrawn:</strong> {selectedUser.total_withdrawn || 'N/A'}</Typography>
                    <Typography><strong>Referral Earnings:</strong> {selectedUser.referral_earnings || 'N/A'}</Typography>
                    <Typography><strong>Task Earnings:</strong> {selectedUser.task_earnings || 'N/A'}</Typography>
                    <Typography><strong>Referral Count:</strong> {selectedUser.referral_count || 'N/A'}</Typography>

                    <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Binary Information</Typography>
                    <Typography><strong>Left Leg Size:</strong> {selectedUser.left_leg_size || 'N/A'}</Typography>
                    <Typography><strong>Right Leg Size:</strong> {selectedUser.right_leg_size || 'N/A'}</Typography>
                    <Typography><strong>Binary Earnings:</strong> {selectedUser.binary_earnings || 'N/A'}</Typography>
                    <Typography><strong>Team Earnings:</strong> {selectedUser.team_earnings || 'N/A'}</Typography>
                    <Typography><strong>Left Child ID:</strong> {selectedUser.left_child_id || 'N/A'}</Typography>
                    <Typography><strong>Right Child ID:</strong> {selectedUser.right_child_id || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Activation</Typography>
                    <Typography><strong>Is Activated:</strong> {selectedUser.is_activated ? 'Yes' : 'No'}</Typography>
                    <Typography><strong>Activation Amount:</strong> {selectedUser.activation_amount || 'N/A'}</Typography>
                    <Typography><strong>Activation Expense:</strong> {selectedUser.activation_expense || 'N/A'}</Typography>
                    <Typography><strong>Activation Reward:</strong> {selectedUser.activation_reward || 'N/A'}</Typography>
                    <Typography><strong>Team Reward Claimed:</strong> {selectedUser.team_reward_claimed ? 'Yes' : 'No'}</Typography>
                    <Typography><strong>Has Spun Once:</strong> {selectedUser.has_spun_once ? 'Yes' : 'No'}</Typography>

                    <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Payment Methods</Typography>
                    {selectedUser.payment_methods ? (
                      <>
                        <Typography><strong>Mpesa:</strong> {selectedUser.payment_methods.mpesa?.verified ? 'Verified' : 'Not Verified'}</Typography>
                        <Typography><strong>Paypal:</strong> {selectedUser.payment_methods.paypal?.verified ? 'Verified' : 'Not Verified'}</Typography>
                        <Typography><strong>Pesapal:</strong> {selectedUser.payment_methods.pesapal?.verified ? 'Verified' : 'Not Verified'}</Typography>
                      </>
                    ) : <Typography>N/A</Typography>}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Security</Typography>
                    {selectedUser.security ? (
                      <>
                        <Typography><strong>2FA Enabled:</strong> {selectedUser.security.two_factor_enabled ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>Last Password Change:</strong> {new Date(selectedUser.security.last_password_change).toLocaleDateString()}</Typography>
                      </>
                    ) : <Typography>N/A</Typography>}

                    <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Verification</Typography>
                    {selectedUser.verification ? (
                      <>
                        <Typography><strong>Email Verified:</strong> {selectedUser.verification.email_verified ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>Phone Verified:</strong> {selectedUser.verification.phone_verified ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>Identity Verified:</strong> {selectedUser.verification.identity_verified ? 'Yes' : 'No'}</Typography>
                      </>
                    ) : <Typography>N/A</Typography>}

                    <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Communication Preferences</Typography>
                    {selectedUser.communication_preferences ? (
                      <>
                        <Typography><strong>Email:</strong> {selectedUser.communication_preferences.email ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>SMS:</strong> {selectedUser.communication_preferences.sms ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>Push:</strong> {selectedUser.communication_preferences.push ? 'Yes' : 'No'}</Typography>
                      </>
                    ) : <Typography>N/A</Typography>}

                    <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Timestamps</Typography>
                    <Typography><strong>Created At:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}</Typography>
                    <Typography><strong>Updated At:</strong> {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Card>
  )
}

export default UsersTable
