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
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ mr: 1 }}>
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
    </Card>
  )
}

export default UsersTable
