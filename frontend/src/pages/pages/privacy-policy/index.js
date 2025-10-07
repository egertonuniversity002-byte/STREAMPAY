// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import { styled, keyframes, useTheme } from '@mui/material/styles'

// ** Next Imports
import NextLink from 'next/link'
import { useRouter } from 'next/router'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Icons Imports
import HomeIcon from 'mdi-material-ui/Home'
import ChevronRightIcon from 'mdi-material-ui/ChevronRight'
import AccountIcon from 'mdi-material-ui/Account'
import EyeIcon from 'mdi-material-ui/Eye'
import ShareIcon from 'mdi-material-ui/Share'
import ShieldIcon from 'mdi-material-ui/Shield'
import CogIcon from 'mdi-material-ui/Cog'
import EmailIcon from 'mdi-material-ui/Email'
import UpdateIcon from 'mdi-material-ui/Update'
import PhoneIcon from 'mdi-material-ui/Phone'

// ** Styled Components
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const SectionBox = styled(Box)(({ theme }) => ({
  mb: 4,
  p: 3,
  borderRadius: 2,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 10px 30px rgba(255,215,0,0.2)'
      : '0 10px 30px rgba(0,123,255,0.2)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
  }
}))

const PrivacyPolicyPage = () => {
  const router = useRouter()

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
          separator={<ChevronRightIcon fontSize="small" />}
        >
          <Link component={NextLink} href="/" underline="hover">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Box>
          </Link>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Privacy Policy
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          background: theme => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
            : 'linear-gradient(135deg, #f3e5f5 0%, #e3f2fd 50%, #fff3e0 100%)',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
            : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
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
            '&::before': {
              left: '100%',
            }
          },
        }}
      >
        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              1. Information Collection
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us when you create an account, update your profile, or use our services.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EyeIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              2. Use of Information
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            We use the information we collect to provide, maintain, and improve our services, communicate with you, and comply with legal obligations.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShareIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              3. Sharing of Information
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            We do not share your personal information with third parties except as necessary to provide our services or comply with the law.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShieldIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              4. Security
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            We take reasonable measures to protect your information from unauthorized access, disclosure, or destruction.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CogIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              5. Your Choices
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            You may update or delete your account information at any time. You can also opt out of receiving promotional communications.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              6. Children's Privacy
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            Our services are not directed to children under 13, and we do not knowingly collect personal information from children under 13.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <UpdateIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              7. Changes to This Policy
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              8. Contact Us
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at support@streampay.com.
          </Typography>
        </SectionBox>

        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => router.back()}
            sx={{
              mr: 2,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Go Back
          </Button>
          <NextLink href="/pages/terms-of-service" passHref>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600
              }}
            >
              View Terms of Service
            </Button>
          </NextLink>
        </Box>
      </Paper>
    </Container>
  )
}

PrivacyPolicyPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default PrivacyPolicyPage
