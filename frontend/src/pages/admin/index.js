// ** React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import Bank from 'mdi-material-ui/Bank'
import ClipboardList from 'mdi-material-ui/ClipboardList'

// ** Custom Components
import AdminStatsCard from 'src/views/admin/AdminStatsCard'
import UsersTable from 'src/views/admin/UsersTable'
import TransactionsTable from 'src/views/admin/TransactionsTable'
import TasksTable from 'src/views/admin/TasksTable'
import RecentActivity from 'src/views/admin/RecentActivity'

// ** Component Imports
import ProtectedRoute from 'src/components/ProtectedRoute'

const AdminDashboard = () => {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleQuickAction = (action) => {
    switch (action) {
      case 'users':
        router.push('/admin/users')
        break
      case 'transactions':
        router.push('/admin/transactions')
        break
      case 'tasks':
        router.push('/admin/tasks')
        break
      case 'notifications':
        router.push('/admin/notifications')
        break
      default:
        break
    }
  }

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('https://official-paypal.onrender.com/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats) // Extract the stats object from the response
        } else {
          console.error('Failed to fetch admin stats')
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading admin dashboard...</Typography>
      </Box>
    )
  }

  return (
    <ProtectedRoute>
      <Box>
        <Typography variant='h4' sx={{ mb: 6 }}>
          Admin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={6} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AdminStatsCard
              title="Total Users"
              value={stats?.total_users || 0}
              icon={<AccountGroup />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AdminStatsCard
              title="Total Revenue"
              value={`$${stats?.total_deposits || 0}`}
              icon={<CurrencyUsd />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AdminStatsCard
              title="Pending Withdrawals"
              value={stats?.pending_withdrawals || 0}
              icon={<Bank />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AdminStatsCard
              title="Active Tasks"
              value={stats?.active_tasks || 0}
              icon={<ClipboardList />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={6}>
          <Grid item xs={12} lg={8}>
            <RecentActivity />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography
                    variant='body2'
                    color='primary'
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleQuickAction('users')}
                  >
                    • View All Users
                  </Typography>
                  <Typography
                    variant='body2'
                    color='primary'
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleQuickAction('transactions')}
                  >
                    • Approve Pending Withdrawals
                  </Typography>
                  <Typography
                    variant='body2'
                    color='primary'
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleQuickAction('tasks')}
                  >
                    • Create New Task
                  </Typography>
                  <Typography
                    variant='body2'
                    color='primary'
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleQuickAction('notifications')}
                  >
                    • Send Notification
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ProtectedRoute>
  )
}

export default AdminDashboard
