// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

// ** Icons Imports
import Download from 'mdi-material-ui/Download'
import CheckCircle from 'mdi-material-ui/CheckCircle'
import Star from 'mdi-material-ui/Star'
import Smartphone from 'mdi-material-ui/Cellphone'
import Rocket from 'mdi-material-ui/Rocket'
import TrendingUp from 'mdi-material-ui/TrendingUp'

const ApkDownloadModal = ({ open, onClose }) => {
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)

  useEffect(() => {
    if (downloading && downloadProgress < 100) {
      const timer = setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = prev + Math.random() * 15
          if (newProgress >= 100) {
            setDownloadComplete(true)
            setTimeout(() => setShowCongrats(true), 500)
            return 100
          }
          return newProgress
        })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [downloading, downloadProgress])

  const handleDownload = () => {
    setDownloading(true)
    setDownloadProgress(0)
    setDownloadComplete(false)
    setShowCongrats(false)

    // Simulate download by creating a link and triggering download
    const link = document.createElement('a')
    link.href = '/app-release.apk'
    link.download = 'StreamPay.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleInstalled = () => {
    localStorage.setItem('streampay_apk_installed', 'true')
    onClose()
  }

  const handleClose = () => {
    if (!downloading || downloadComplete) {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '20px',
          background: theme => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 30px 60px rgba(0, 123, 255, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
            : '0 30px 60px rgba(0, 123, 255, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
          animation: 'modalFadeIn 0.5s ease-out',
          '@keyframes modalFadeIn': {
            '0%': { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
            '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
          },
        }
      }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        pb: 1,
        color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Avatar sx={{
            bgcolor: 'primary.main',
            mr: 2,
            width: 50,
            height: 50,
            animation: 'bounce 2s infinite'
          }}>
            <Smartphone />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #2196F3, #21CBF3)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Get StreamPay Mobile App!
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {!showCongrats ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme => theme.palette.mode === 'dark' ? '#ddd' : '#2c3e50', fontWeight: 600 }}>
                🚀 Unlock the Full StreamPay Experience!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
                Take your earnings to the next level with our powerful mobile app! Get instant notifications,
                real-time updates, and exclusive mobile-only features that will supercharge your income.
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '12px',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box>
                    <TrendingUp sx={{ fontSize: 24, mb: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      50% More Earnings
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '12px',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box>
                    <Rocket sx={{ fontSize: 24, mb: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Instant Updates
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {downloading && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
                  Downloading StreamPay APK... {Math.round(downloadProgress)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={downloadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #2196F3, #21CBF3)',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
            )}

            {downloadComplete && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                ✅ Download Complete! Please install the APK file on your device.
              </Alert>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar sx={{
              bgcolor: 'success.main',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              animation: 'celebrate 1s ease-out'
            }}>
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'success.main' }}>
              🎉 Congratulations!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              You've successfully downloaded the StreamPay mobile app! Install it now and start earning more with our enhanced mobile features.
            </Typography>
            <Chip
              icon={<Star />}
              label="Welcome to the StreamPay Family!"
              color="success"
              variant="outlined"
              sx={{ fontSize: '1rem', py: 1, px: 2 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        {!showCongrats ? (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={downloading}
              sx={{
                borderRadius: '25px',
                px: 3,
                mr: 1,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Maybe Later
            </Button>
            <Button
              variant="contained"
              onClick={handleDownload}
              disabled={downloading}
              startIcon={<Download />}
              sx={{
                borderRadius: '25px',
                px: 4,
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2, #00BCD4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                }
              }}
            >
              {downloading ? 'Downloading...' : 'Download APK'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleInstalled}
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: '25px',
              px: 4,
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
              }
            }}
          >
            I've Installed It!
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ApkDownloadModal