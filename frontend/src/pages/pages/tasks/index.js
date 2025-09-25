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
      <Card>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 4 }}>
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
