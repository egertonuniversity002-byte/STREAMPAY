// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'

// ** Icon Imports
import History from 'mdi-material-ui/History'
import CheckCircleOutline from 'mdi-material-ui/CheckCircleOutline'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import Calendar from 'mdi-material-ui/Calendar'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const TaskHistory = ({ showEarnings = false }) => {
  const { token, refreshUser } = useAuth()
  const [taskCompletions, setTaskCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    thisWeekEarnings: 0
  })

  useEffect(() => {
    fetchTaskHistory()
    fetchTaskStats()
  }, [token])

  const fetchTaskHistory = async () => {
    if (!token) {
      setError('No authentication token found')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Extract task completions from analytics
        const completions = data.analytics?.tasks?.completions || []
        setTaskCompletions(completions)
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        setError('Failed to fetch task history')
      }
    } catch (error) {
      console.error('Error fetching task history:', error)
      setError('Network error while fetching task history')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskStats = async () => {
    if (!token) return

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats({
          totalCompleted: data.analytics?.tasks?.completed || 0,
          totalEarnings: data.analytics?.tasks?.total_earnings || 0,
          todayEarnings: data.analytics?.daily_earnings?.[0] || 0,
          thisWeekEarnings: data.analytics?.weekly_earnings || 0
        })
      }
    } catch (error) {
      console.error('Error fetching task stats:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const getTaskTypeIcon = (type) => {
    const icons = {
      'survey': '📊',
      'video': '🎥',
      'ad': '📺',
      'writing': '✍️',
      'social': '📱',
      'image': '🖼️',
      'upload': '📤'
    }
    return icons[type] || '📋'
  }

  const getTaskTypeColor = (type) => {
    const colors = {
      'survey': 'primary',
      'video': 'secondary',
      'ad': 'info',
      'writing': 'success',
      'social': 'warning',
      'image': 'error',
      'upload': 'default'
    }
    return colors[type] || 'default'
  }

  if (loading) {
    return <LinearProgress />
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    )
  }

  if (showEarnings) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Task Earnings Overview
        </Typography>

        {/* Earnings Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
              borderRadius: '20px',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center">
                  <CheckCircleOutline color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {stats.totalCompleted}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tasks Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
              borderRadius: '20px',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center">
                  <CurrencyUsd color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {formatCurrency(stats.totalEarnings)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
              borderRadius: '20px',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center">
                  <Calendar color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {formatCurrency(stats.todayEarnings)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Today's Earnings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
              borderRadius: '20px',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {formatCurrency(stats.thisWeekEarnings)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Task Completions */}
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
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Task Completions
            </Typography>
            {taskCompletions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No task completions yet. Complete some tasks to see your earnings!
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' }}>
                      <TableCell>Task Type</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Reward</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taskCompletions.slice(0, 10).map((completion, index) => (
                      <TableRow key={index} sx={{
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.1)' : 'rgba(0,123,255,0.05)',
                        }
                      }}>
                        <TableCell>
                          <Chip
                            icon={getTaskTypeIcon(completion.type)}
                            label={completion.type}
                            color={getTaskTypeColor(completion.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{completion.title}</TableCell>
                        <TableCell>{formatCurrency(completion.reward)}</TableCell>
                        <TableCell>{formatDate(completion.completed_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Task Completion History
      </Typography>

      {taskCompletions.length === 0 ? (
        <Alert severity="info">
          No tasks completed yet. Start completing tasks to see your history here!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {taskCompletions.map((completion, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: theme => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                  : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
                borderRadius: '20px',
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                  : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <History color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {completion.title}
                    </Typography>
                    <Chip
                      label={completion.type}
                      color={getTaskTypeColor(completion.type)}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Completed on {formatDate(completion.completed_at)}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      Reward: {formatCurrency(completion.reward)}
                    </Typography>
                    <CheckCircleOutline color="success" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default TaskHistory
