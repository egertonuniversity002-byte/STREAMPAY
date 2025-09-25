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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { useEffect, useState } from 'react'

// ** Icons Imports
import Plus from 'mdi-material-ui/Plus'
import Pencil from 'mdi-material-ui/Pencil'
import TrashCan from 'mdi-material-ui/TrashCan'
import CheckCircle from 'mdi-material-ui/CheckCircle'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const TasksTable = () => {
  const [tasks, setTasks] = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    reward: '',
    max_completions: '',
    type: 'survey',
    requirements: {}
  })

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    fetchTasks()
    fetchTaskStats()
  }, [token, isAuthenticated])

  const fetchTasks = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch tasks')
        setLoading(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Handle both direct array and {success: true, tasks: [...]} formats
        const tasksData = Array.isArray(data) ? data : (data.success ? data.tasks : [])
        setTasks(tasksData || [])
        setError(null)
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        console.error('Failed to fetch tasks')
        setTasks([])
        setError('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
      setError('Network error while fetching tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskStats = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch task stats')
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/admin/tasks/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTaskStats(data)
      } else {
        console.error('Failed to fetch task stats')
        setTaskStats({})
      }
    } catch (error) {
      console.error('Error fetching task stats:', error)
      setTaskStats({})
    }
  }

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://official-paypal.onrender.com/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      })

      if (response.ok) {
        setCreateDialogOpen(false)
        setNewTask({
          title: '',
          description: '',
          reward: '',
          max_completions: '',
          type: 'survey',
          requirements: {}
        })
        fetchTasks()
        fetchTaskStats()
      } else {
        console.error('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const token = localStorage.getItem('token')
      // Convert status to is_active boolean that backend expects
      const is_active = status === 'active'
      const response = await fetch(`https://official-paypal.onrender.com/api/admin/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active })
      })

      if (response.ok) {
        fetchTasks()
        fetchTaskStats()
      } else {
        console.error('Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleTypeChange = (type) => {
    setNewTask({
      ...newTask,
      type,
      requirements: getDefaultRequirements(type)
    })
  }

  const getDefaultRequirements = (type) => {
    switch (type) {
      case 'survey':
        return { questions: 10, time_limit: 300 }
      case 'ad':
        return { duration: 30, interaction: true }
      case 'writing':
        return { min_words: 100, topic: 'general' }
      case 'social':
        return { platforms: ['facebook', 'twitter'] }
      default:
        return {}
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Task Management" />
        <CardContent>
          <Typography>Loading tasks...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Task Management" />
        <CardContent>
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              fetchTasks()
              fetchTaskStats()
            }}
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
        title="Task Management"
        action={
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Task
          </Button>
        }
      />
      <CardContent>
        {/* Task Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip label={`Total Tasks: ${taskStats.total_tasks || 0}`} color="primary" />
          <Chip label={`Active Tasks: ${taskStats.active_tasks || 0}`} color="success" />
          <Chip label={`Completed Tasks: ${taskStats.completed_tasks || 0}`} color="info" />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Reward</TableCell>
                <TableCell>Requirements</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow key={task.task_id || task.id}>
                    <TableCell>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {task.description?.substring(0, 60)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.type || 'general'}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        ${task.reward}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {task.requirements ? (
                          Object.entries(task.requirements).map(([key, value]) => (
                            <div key={key}>
                              {key}: {Array.isArray(value) ? value.join(', ') : value}
                            </div>
                          ))
                        ) : (
                          'No requirements'
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.is_active ? 'Active' : 'Inactive'}
                        color={task.is_active ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {new Date(task.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!task.is_active && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleUpdateTaskStatus(task.task_id || task.id, 'active')}
                          >
                            Activate
                          </Button>
                        )}
                        {task.is_active && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleUpdateTaskStatus(task.task_id || task.id, 'inactive')}
                          >
                            Deactivate
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tasks found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={newTask.type}
              label="Task Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <MenuItem value="survey">Survey</MenuItem>
              <MenuItem value="ad">Advertisement</MenuItem>
              <MenuItem value="writing">Writing</MenuItem>
              <MenuItem value="social">Social Media</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Reward ($)"
            type="number"
            value={newTask.reward}
            onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Max Completions (leave empty for unlimited)"
            type="number"
            value={newTask.max_completions}
            onChange={(e) => setNewTask({ ...newTask, max_completions: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TasksTable
