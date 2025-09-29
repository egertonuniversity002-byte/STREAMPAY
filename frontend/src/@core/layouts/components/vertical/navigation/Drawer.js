// ** MUI Imports
import { styled, useTheme } from '@mui/material/styles'
import MuiSwipeableDrawer from '@mui/material/SwipeableDrawer'

const SwipeableDrawer = styled(MuiSwipeableDrawer)({
  overflowX: 'hidden',
  transition: 'width .25s ease-in-out',
  '& ul': {
    listStyle: 'none'
  },
  '& .MuiListItem-gutters': {
    paddingLeft: 4,
    paddingRight: 4
  },
  '& .MuiDrawer-paper': {
    left: 'unset',
    right: 'unset',
    overflowX: 'hidden',
    transition: 'width .25s ease-in-out, box-shadow .25s ease-in-out'
  }
})

const Drawer = props => {
  // ** Props
  const { hidden, children, navWidth, navVisible, setNavVisible } = props

  // ** Hook
  const theme = useTheme()

  // Drawer Props for Mobile & Tablet screens
  const MobileDrawerProps = {
    open: navVisible,
    onOpen: () => setNavVisible(true),
    onClose: () => setNavVisible(false),
    ModalProps: {
      keepMounted: true // Better open performance on mobile.
    }
  }

  // Drawer Props for Desktop screens
  const DesktopDrawerProps = {
    open: true,
    onOpen: () => null,
    onClose: () => null
  }

  return (
    <SwipeableDrawer
      className='layout-vertical-nav'
      variant={hidden ? 'temporary' : 'permanent'}
      {...(hidden ? { ...MobileDrawerProps } : { ...DesktopDrawerProps })}
      PaperProps={{ sx: { width: navWidth } }}
      sx={{
        width: navWidth,
        '& .MuiDrawer-paper': {
          borderRight: 0,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(15, 15, 35, 0.6)'
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRight: theme.palette.mode === 'dark'
            ? '1px solid rgba(255, 215, 0, 0.3)'
            : '1px solid rgba(0, 123, 255, 0.3)',
          boxShadow: theme.palette.mode === 'dark'
            ? '4px 0 25px rgba(0, 123, 255, 0.4), 0 0 50px rgba(255, 215, 0, 0.1)'
            : '4px 0 25px rgba(0, 123, 255, 0.3), 0 0 50px rgba(0, 123, 255, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(15, 15, 35, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            boxShadow: theme.palette.mode === 'dark'
              ? '4px 0 30px rgba(0, 123, 255, 0.5), 0 0 60px rgba(255, 215, 0, 0.15)'
              : '4px 0 30px rgba(0, 123, 255, 0.4), 0 0 60px rgba(0, 123, 255, 0.15)'
          }
        }
      }}
    >
      {children}
    </SwipeableDrawer>
  )
}

export default Drawer
