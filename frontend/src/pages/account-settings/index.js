// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline'
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'

// ** Demo Tabs Imports
import TabInfo from 'src/views/account-settings/TabInfo'
import TabAccount from 'src/views/account-settings/TabAccount'
import TabSecurity from 'src/views/account-settings/TabSecurity'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

const Tab = styled(MuiTab)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

const AccountSettings = () => {
  // ** State
  const [value, setValue] = useState('account')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '16px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.8)',
      overflow: 'hidden'
    }}>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='account-settings tabs'
          sx={{
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            borderRadius: '16px 16px 0 0',
            px: 2,
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: '3px',
              borderRadius: '3px'
            }
          }}
        >
          <Tab
            value='account'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountOutline sx={{ color: value === 'account' ? '#1976d2' : '#666' }} />
                <TabName sx={{ color: value === 'account' ? '#1976d2' : '#666', fontWeight: value === 'account' ? 600 : 400 }}>
                  Account
                </TabName>
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600
              },
              minHeight: '64px'
            }}
          />
          <Tab
            value='security'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LockOpenOutline sx={{ color: value === 'security' ? '#1976d2' : '#666' }} />
                <TabName sx={{ color: value === 'security' ? '#1976d2' : '#666', fontWeight: value === 'security' ? 600 : 400 }}>
                  Security
                </TabName>
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600
              },
              minHeight: '64px'
            }}
          />
          <Tab
            value='info'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InformationOutline sx={{ color: value === 'info' ? '#1976d2' : '#666' }} />
                <TabName sx={{ color: value === 'info' ? '#1976d2' : '#666', fontWeight: value === 'info' ? 600 : 400 }}>
                  Info
                </TabName>
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600
              },
              minHeight: '64px'
            }}
          />
        </TabList>

        <TabPanel sx={{ p: 0, background: 'rgba(255,255,255,0.8)' }} value='account'>
          <TabAccount />
        </TabPanel>
        <TabPanel sx={{ p: 0, background: 'rgba(255,255,255,0.8)' }} value='security'>
          <TabSecurity />
        </TabPanel>
        <TabPanel sx={{ p: 0, background: 'rgba(255,255,255,0.8)' }} value='info'>
          <TabInfo />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default AccountSettings
