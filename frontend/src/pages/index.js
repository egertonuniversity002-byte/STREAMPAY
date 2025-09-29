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
                  sx={{
                    background: theme => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #4caf50 100%)'
                      : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #4caf50 100%)',
                    borderRadius: '20px',
                    boxShadow: theme => theme.palette.mode === 'dark'
                      ? '0 20px 40px rgba(76, 175, 80, 0.3), 0 0 20px rgba(76, 175, 80, 0.1)'
                      : '0 20px 40px rgba(76, 175, 80, 0.2), 0 0 20px rgba(76, 175, 80, 0.1)',
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(76,175,80,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: 'fadeInUp 0.6s ease-out, pulse 2s infinite',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(76,175,80,0.3), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 30px 60px rgba(76, 175, 80, 0.4), 0 0 30px rgba(76, 175, 80, 0.2)'
                        : '0 30px 60px rgba(76, 175, 80, 0.3), 0 0 30px rgba(76, 175, 80, 0.15)',
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
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', boxShadow: '0 20px 40px rgba(76, 175, 80, 0.3)' },
                      '50%': { transform: 'scale(1.05)', boxShadow: '0 25px 50px rgba(76, 175, 80, 0.5)' },
                      '100%': { transform: 'scale(1)', boxShadow: '0 20px 40px rgba(76, 175, 80, 0.3)' },
                    },
                  }}
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
                  sx={{
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
                  }}
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
                  sx={{
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
                  }}
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
                  sx={{
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
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={user.left_leg_size || 0}
                  color='primary'
                  title='Left Leg'
                  subtitle='Binary Tree'
                  icon={<Tree />}
                  sx={{
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
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <CardStatisticsVerticalComponent
                  stats={user.right_leg_size || 0}
                  color='primary'
                  title='Right Leg'
                  subtitle='Binary Tree'
                  icon={<Tree />}
                  sx={{
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
                  }}
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
