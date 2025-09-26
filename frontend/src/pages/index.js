// ** MUI Imports
import Grid from '@mui/material/Grid'
import { useState, useEffect } from 'react'
import Skeleton from '@mui/material/Skeleton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import Poll from 'mdi-material-ui/Poll'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import BriefcaseVariantOutline from 'mdi-material-ui/BriefcaseVariantOutline'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import Tree from 'mdi-material-ui/Tree'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import Table from 'src/views/dashboard/Table'
import Trophy from 'src/views/dashboard/Trophy'
import TotalEarning from 'src/views/dashboard/TotalEarning'
import StatisticsCard from 'src/views/dashboard/StatisticsCard'
import WeeklyOverview from 'src/views/dashboard/WeeklyOverview'
import DepositWithdraw from 'src/views/dashboard/DepositWithdraw'
import SalesByCountries from 'src/views/dashboard/SalesByCountries'

// ** Component Imports
import ProtectedRoute from 'src/components/ProtectedRoute'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ** Auth Context
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!isAuthenticated() || !token) {
          setLoading(false)
          return
        }

        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
          setError(null)
        } else {
          setError('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Network error while fetching dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token, isAuthenticated])

  if (loading) {
    return (
      <ProtectedRoute>
        <ApexChartWrapper>
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={200} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={300} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={250} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={250} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Grid container spacing={6}>
                {[1,2,3,4,5,6].map((i) => (
                  <Grid item xs={6} key={i}>
                    <CardStatisticsVerticalComponent
                      stats={<Skeleton variant="text" width={60} />}
                      icon={<Skeleton variant="circular" width={24} height={24} />}
                      color='primary'
                      trendNumber={<Skeleton variant="text" width={40} />}
                      title={<Skeleton variant="text" width={80} />}
                      subtitle={<Skeleton variant="text" width={60} />}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={300} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={8}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={400} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={300} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </ApexChartWrapper>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <ApexChartWrapper>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <div>Error: {error}</div>
            </Grid>
          </Grid>
        </ApexChartWrapper>
      </ProtectedRoute>
    )
  }

  const user = dashboardData?.user || {}
  const analytics = dashboardData?.analytics || {}

  return (
    <ProtectedRoute>
      <ApexChartWrapper>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Trophy />
          </Grid>
          <Grid item xs={12} md={8}>
            <StatisticsCard data={dashboardData} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <WeeklyOverview data={dashboardData} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TotalEarning data={dashboardData} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Grid container spacing={6}>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={`KES ${user.profit || 0}`}
                  icon={<Poll />}
                  color='success'
                  trendNumber='+42%'
                  title='Total Profit'
                  subtitle='earnings'
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={`KES ${user.total_earned || 0}`}
                  title='Total Earned'
                  trend='negative'
                  color='secondary'
                  trendNumber='-15%'
                  subtitle='Work Hard'
                  icon={<CurrencyUsd />}
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={user.referral_count || 0}
                  trend='negative'
                  trendNumber='-18%'
                  title='Referrals'
                  subtitle='Total Referrals'
                  icon={<AccountGroup />}
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={analytics.tasks?.completed || 0}
                  color='warning'
                  trend='negative'
                  trendNumber='-18%'
                  subtitle='Completed Tasks'
                  title='Tasks Done'
                  icon={<BriefcaseVariantOutline />}
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={user.left_leg_size || 0}
                  color='primary'
                  title='Left Leg'
                  subtitle='Binary Tree'
                  icon={<Tree />}
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={user.right_leg_size || 0}
                  color='primary'
                  title='Right Leg'
                  subtitle='Binary Tree'
                  icon={<Tree />}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SalesByCountries />
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DepositWithdraw />
          </Grid>
          <Grid item xs={12}>
            <Table />
          </Grid>
        </Grid>
      </ApexChartWrapper>
    </ProtectedRoute>
  )
}

export default Dashboard
