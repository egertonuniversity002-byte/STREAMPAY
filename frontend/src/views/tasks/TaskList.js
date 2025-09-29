import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import CardActions from '@mui/material/CardActions'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'

// ** Icon Imports
import ClipboardListOutline from 'mdi-material-ui/ClipboardListOutline'
import ClockOutline from 'mdi-material-ui/ClockOutline'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import CheckCircleOutline from 'mdi-material-ui/CheckCircleOutline'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** Utils Imports
import { getRandomYouTubeVideo } from 'src/utils/youtubeVideos'

const TaskList = ({ onStartTask }) => {
  const { token, refreshUser } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [taskStats, setTaskStats] = useState({
    totalCompleted: 0,
    totalPending: 0,
    totalEarnings: 0,
    todayEarnings: 0
  })
  const [currency, setCurrency] = useState('KES')

  useEffect(() => {
    fetchTasks()
    fetchTaskStats()
  }, [token])

  const fetchTasks = async () => {
    if (!token) {
      setError('No authentication token found')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/tasks/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        setError('Failed to fetch available tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError('Network error while fetching tasks')
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
        setCurrency(data.currency || 'KES')
        setTaskStats({
          totalCompleted: data.analytics?.tasks?.completed || 0,
          totalPending: data.analytics?.tasks?.pending || 0,
          totalEarnings: data.analytics?.tasks?.total_earnings || 0,
          todayEarnings: 0 // This would need a separate endpoint for daily stats
        })
      }
    } catch (error) {
      console.error('Error fetching task stats:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount)
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

  const handleStartTask = (task) => {
    setSelectedTask(task)
    setShowTaskDialog(true)
  }

  const handleCloseDialog = () => {
    setShowTaskDialog(false)
    setSelectedTask(null)
  }

  const handleCompleteTask = () => {
    // Switch to complete task tab
    if (onStartTask) {
      onStartTask()
    }
    handleCloseDialog()
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

  return (
    <Box>
      {/* Task Stats Cards */}
      <Grid container spacing={6} sx={{ mb: 6 }}>
        <Grid item xs={12} md={3}>
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
              <Box display="flex" alignItems="center">
                <CheckCircleOutline color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {taskStats.totalCompleted}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tasks Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
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
              <Box display="flex" alignItems="center">
                <ClipboardListOutline color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {taskStats.totalPending}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pending Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
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
              <Box display="flex" alignItems="center">
                <CurrencyUsd color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {formatCurrency(taskStats.totalEarnings)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
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
              <Box display="flex" alignItems="center">
                <ClockOutline color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {formatCurrency(taskStats.todayEarnings)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Today's Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Available Tasks */}
      <Typography variant="h6" gutterBottom>
        Available Tasks ({tasks.length})
      </Typography>

      {tasks.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No tasks available at the moment. Check back later!
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.task_id}>
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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.type}
                      color={getTaskTypeColor(task.type)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      {getTaskTypeIcon(task.type)} {task.type}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(task.reward)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reward
                      </Typography>
                    </Box>

                    <Box textAlign="right">
                      <Typography variant="body2" color="text.secondary">
                        Est. Time
                      </Typography>
                      <Typography variant="body2">
                        {task.estimated_time || '5-10'} min
                      </Typography>
                    </Box>
                  </Box>

                  {task.requirements && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Requirements:
                      </Typography>
                      <Typography variant="body2">
                        {task.requirements.min_words && `Min ${task.requirements.min_words} words`}
                        {task.requirements.duration && ` • ${task.requirements.duration}s video`}
                        {task.requirements.platforms && ` • ${task.requirements.platforms.join(', ')}`}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleStartTask(task)}
                    startIcon={<ClipboardListOutline />}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Task Details Dialog */}
      <Dialog
        open={showTaskDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {selectedTask?.title}
            </Typography>
            <Chip
              label={selectedTask?.type}
              color={getTaskTypeColor(selectedTask?.type)}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {selectedTask?.description}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Reward
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(selectedTask?.reward || 0)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estimated Time
                </Typography>
                <Typography variant="h6">
                  {selectedTask?.estimated_time || '5-10'} minutes
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Task Type
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6">
                    {getTaskTypeIcon(selectedTask?.type)} {selectedTask?.type}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Difficulty
                </Typography>
                <Typography variant="h6">
                  {selectedTask?.difficulty || 'Easy'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {selectedTask?.requirements && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Requirements:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {selectedTask.requirements.min_words && (
                  <li>Minimum {selectedTask.requirements.min_words} words</li>
                )}
                {selectedTask.requirements.duration && (
                  <li>Watch full video ({selectedTask.requirements.duration} seconds)</li>
                )}
                {selectedTask.requirements.platforms && (
                  <li>Share on: {selectedTask.requirements.platforms.join(', ')}</li>
                )}
                {selectedTask.requirements.image_quality && (
                  <li>Image quality: {selectedTask.requirements.image_quality}</li>
                )}
              </Box>
            </Box>
          )}

          {(selectedTask?.media || (selectedTask?.type === 'video' || selectedTask?.type === 'ad')) && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Media:
              </Typography>
              {selectedTask.media?.video_url && (
                <Box>
                  <Typography variant="body2">
                    Video URL: <a href={selectedTask.media.video_url} target="_blank" rel="noopener noreferrer">
                      {selectedTask.media.video_url}
                    </a>
                  </Typography>
                </Box>
              )}
              {(selectedTask.media?.youtube_id || selectedTask?.type === 'video' || selectedTask?.type === 'ad') && (
                <Box>
                  <Typography variant="body2">
                    YouTube Video: <a href={`https://youtube.com/watch?v=${selectedTask.media?.youtube_id || getRandomYouTubeVideo()}`} target="_blank" rel="noopener noreferrer">
                      Watch Video
                    </a>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Random video selected for this task
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {selectedTask?.survey_questions && selectedTask.survey_questions.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Survey Questions:
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                {selectedTask.survey_questions.map((question, index) => (
                  <li key={index}>
                    <Typography variant="body2">{question}</Typography>
                  </li>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Close
          </Button>
          <Button
            onClick={handleCompleteTask}
            variant="contained"
            startIcon={<CheckCircleOutline />}
          >
            Start Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TaskList
