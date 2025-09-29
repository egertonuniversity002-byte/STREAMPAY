// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'

// ** Component Imports
import TaskList from '../../../views/tasks/TaskList'
import TaskCompletion from '../../../views/tasks/TaskCompletion'
import TaskHistory from '../../../views/tasks/TaskHistory'
import ProtectedRoute from '../../../components/ProtectedRoute'

// ** Icon Imports
import ClipboardListOutline from 'mdi-material-ui/ClipboardListOutline'
import CheckCircleOutline from 'mdi-material-ui/CheckCircleOutline'
import History from 'mdi-material-ui/History'
import TrendingUp from 'mdi-material-ui/TrendingUp'

// Styled TabList component
const StyledTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    color: theme.palette.text.primary,
    margin: theme.spacing(0, 0.5),
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const TasksPage = () => {
  // ** State
  const [activeTab, setActiveTab] = useState('available')

  // ** Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <ProtectedRoute>
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
        animation: 'fadeInUp 0.6s ease-out',
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
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 4, color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50', fontWeight: 'bold' }}>
            Task Management
          </Typography>

          <TabContext value={activeTab}>
            <StyledTabList onChange={handleTabChange} aria-label='task tabs'>
              <Tab
                value='available'
                label='Available Tasks'
                icon={<ClipboardListOutline fontSize='small' />}
                iconPosition='start'
              />
              <Tab
                value='complete'
                label='Complete Task'
                icon={<CheckCircleOutline fontSize='small' />}
                iconPosition='start'
              />
              <Tab
                value='history'
                label='Task History'
                icon={<History fontSize='small' />}
                iconPosition='start'
              />
              <Tab
                value='earnings'
                label='Task Earnings'
                icon={<TrendingUp fontSize='small' />}
                iconPosition='start'
              />
            </StyledTabList>

            <TabPanel value='available' sx={{ p: 0, mt: 4 }}>
              <TaskList onStartTask={() => setActiveTab('complete')} />
            </TabPanel>

            <TabPanel value='complete' sx={{ p: 0, mt: 4 }}>
              <TaskCompletion />
            </TabPanel>

            <TabPanel value='history' sx={{ p: 0, mt: 4 }}>
              <TaskHistory />
            </TabPanel>

            <TabPanel value='earnings' sx={{ p: 0, mt: 4 }}>
              <TaskHistory showEarnings={true} />
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>
    </ProtectedRoute>
  )
}

export default TasksPage
