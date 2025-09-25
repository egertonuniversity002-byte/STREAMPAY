// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icons Imports
import AccountTree from 'mdi-material-ui/Sitemap'
import CheckCircle from 'mdi-material-ui/CheckCircle'
import CircleOutline from 'mdi-material-ui/CircleOutline'
import Star from 'mdi-material-ui/Star'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

const TeamTree = () => {
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [claimingReward, setClaimingReward] = useState(false)

  // ** Auth Context
  const { token, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    fetchTeamData()
  }, [token, isAuthenticated])

  const fetchTeamData = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to fetch team data')
        setLoading(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/team/tree', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTeamData(data)
        setError(null)
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        if (response.status === 401) {
          console.error('Invalid token - authentication required')
          setError('Authentication required. Please log in again.')
        } else {
          setError('Failed to fetch team data')
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
      setError('Network error while fetching team data')
    } finally {
      setLoading(false)
    }
  }

  const handleClaimReward = async () => {
    setClaimingReward(true)
    try {
      // Check if user is authenticated
      if (!isAuthenticated() || !token) {
        console.error('Authentication required to claim reward')
        alert('Authentication required. Please log in again.')
        setClaimingReward(false)
        return
      }

      const response = await fetch('https://official-paypal.onrender.com/api/team/claim-reward', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        alert('🎉 Reward claimed successfully! $500 has been added to your wallet.')
        // Refresh team data to update progress
        fetchTeamData()
      } else {
        if (response.status === 401) {
          console.error('Invalid token - authentication required')
          alert('Authentication required. Please log in again.')
        } else {
          const errorData = await response.json()
          alert(`Failed to claim reward: ${errorData.message || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('Network error while claiming reward')
    } finally {
      setClaimingReward(false)
    }
  }

  const renderTeamMember = (member, level = 0) => {
    if (!member) return null

    return (
      <Box key={member.user_id || member.id} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              width: 40 - level * 4,
              height: 40 - level * 4,
              mr: 2,
              bgcolor: member.is_activated ? 'success.main' : 'warning.main'
            }}
          >
            {member.is_activated ? <CheckCircle /> : <CircleOutline />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {member.full_name || member.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.email}
            </Typography>
          </Box>
          <Chip
            label={member.is_activated ? 'Active' : 'Inactive'}
            color={member.is_activated ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        {member.children && member.children.length > 0 && (
          <Box sx={{ ml: 4, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
            {member.children.map(child => renderTeamMember(child, level + 1))}
          </Box>
        )}
      </Box>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader
          title="Team Tree"
          avatar={<AccountTree />}
          subheader="Your referral network structure"
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader
          title="Team Tree"
          avatar={<AccountTree />}
          subheader="Your referral network structure"
        />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  const totalMembers = teamData?.total_members || 0
  const progressToReward = Math.min((totalMembers / 100) * 100, 100)
  const canClaimReward = totalMembers >= 100

  return (
    <Card>
      <CardHeader
        title="Team Tree"
        avatar={<AccountTree />}
        subheader="Your referral network structure"
      />
      <CardContent>
        {/* Progress to Reward */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress to 100 Member Reward
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {totalMembers}/100 members
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressToReward}
            sx={{ height: 8, borderRadius: 4 }}
          />
          {canClaimReward && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Chip
                icon={<Star />}
                label="🎉 100 Member Reward Available!"
                color="success"
                variant="outlined"
                sx={{ fontSize: '1rem', py: 1 }}
              />
              <br />
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 1 }}
                onClick={handleClaimReward}
                disabled={claimingReward}
                startIcon={claimingReward ? <CircularProgress size={16} /> : <Star />}
              >
                {claimingReward ? 'Claiming...' : 'Claim $500 Reward'}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Team Structure */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Team Structure
        </Typography>

        {teamData?.tree ? (
          <Box>
            {renderTeamMember(teamData.tree)}
          </Box>
        ) : (
          <Alert severity="info">
            No team members found. Start building your network by referring others!
          </Alert>
        )}

        {/* Team Stats */}
        {teamData && (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {teamData.left_leg_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Left Leg
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {teamData.right_leg_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Right Leg
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {teamData.active_members || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {teamData.inactive_members || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactive
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default TeamTree
