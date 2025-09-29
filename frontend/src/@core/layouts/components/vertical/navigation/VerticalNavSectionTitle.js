// ** MUI Imports
import Divider from '@mui/material/Divider'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiListSubheader from '@mui/material/ListSubheader'

// ** Styled Components
const ListSubheader = styled(props => <MuiListSubheader component='li' {...props} />)(({ theme }) => ({
  lineHeight: 1,
  display: 'flex',
  position: 'relative',
  marginTop: theme.spacing(7),
  marginBottom: theme.spacing(2),
  backgroundColor: 'transparent',
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 215, 0, 0.05)'
      : 'rgba(0, 123, 255, 0.05)',
    borderRadius: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  }
}))

const TypographyHeaderText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  lineHeight: 'normal',
  letterSpacing: '0.21px',
  textTransform: 'uppercase',
  color: theme.palette.text.disabled,
  fontWeight: theme.typography.fontWeightMedium,
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.mode === 'dark'
      ? 'rgba(255, 215, 0, 0.8)'
      : 'rgba(0, 123, 255, 0.8)'
  }
}))

const VerticalNavSectionTitle = props => {
  // ** Props
  const { item } = props

  // ** Hook
  const theme = useTheme()

  return (
    <ListSubheader
      className='nav-section-title'
      sx={{
        px: 0,
        py: 1.75,
        color: theme.palette.text.disabled,
        '& .MuiDivider-root:before, & .MuiDivider-root:after, & hr': {
          borderColor: `rgba(${theme.palette.customColors.main}, 0.12)`
        }
      }}
    >
      <Divider
        textAlign='left'
        sx={{
          m: 0,
          width: '100%',
          lineHeight: 'normal',
          textTransform: 'uppercase',
          '&:before, &:after': { top: 7, transform: 'none' },
          '& .MuiDivider-wrapper': { px: 2.5, fontSize: '0.75rem', letterSpacing: '0.21px' }
        }}
      >
        <TypographyHeaderText noWrap>{item.sectionTitle}</TypographyHeaderText>
      </Divider>
    </ListSubheader>
  )
}

export default VerticalNavSectionTitle
