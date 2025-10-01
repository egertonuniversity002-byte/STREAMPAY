// ** MUI Imports
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useEffect } from 'react'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery(theme => theme.breakpoints.down('md'))

  // ** State for real-time clock
  const [currentTime, setCurrentTime] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2 }}>
        {`© ${new Date().getFullYear()}, Made with `}
        <Box component='span' sx={{ color: 'error.main' }}>
          ❤️
        </Box>
        {` by `}
        <Link target='_blank' href='#'>
          DR.TechTZ
        </Link>
        {mounted && (
          <Box component='span' sx={{ ml: 2, fontWeight: 'bold', color: 'primary.main' }}>
            | Live Time: {formatTime(currentTime)}
          </Box>
        )}
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
          <Link
            target='_blank'
            href='#'
          >
            DEVELOPER
          </Link>
          <Link target='_blank' href='#'>
            TANZA
          </Link>
          <Link
            target='_blank'
            href='#'
          >
            Contact Me!!
          </Link>
          <Link
            target='_blank'
            href='#'
          >
            Support
          </Link>
          <Link
            href='/app-release.apk'
            download
          >
            Install App
          </Link>
        </Box>
      )}
    </Box>
  )
}

export default FooterContent
