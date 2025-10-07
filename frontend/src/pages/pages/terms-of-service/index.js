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

// ** Next Imports
import NextLink from 'next/link'
import { useRouter } from 'next/router'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Icons Imports
import HomeIcon from 'mdi-material-ui/Home'
import ChevronRightIcon from 'mdi-material-ui/ChevronRight'

const TermsOfServicePage = () => {
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
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Terms of Service
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using StreamPay ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            2. Use License
          </Typography>
          <Typography variant="body1" paragraph>
            Permission is granted to temporarily access the materials (information or software) on StreamPay's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
            <li>Attempt to decompile or reverse engineer any software contained on StreamPay's website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            3. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
          </Typography>
          <Typography variant="body1" paragraph>
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            4. Payment Terms
          </Typography>
          <Typography variant="body1" paragraph>
            All payments made through StreamPay are processed securely. You agree to pay all charges associated with your use of the Service. Payment terms may vary depending on the payment method chosen.
          </Typography>
          <Typography variant="body1" paragraph>
            Refunds, if applicable, will be processed according to our refund policy and applicable laws.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            5. Prohibited Activities
          </Typography>
          <Typography variant="body1" paragraph>
            You may not use our Service:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            <li>To interfere with or circumvent the security features of the Service</li>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            6. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </Typography>
          <Typography variant="body1" paragraph>
            If you wish to terminate your account, you may simply discontinue using the Service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            7. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall StreamPay, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            8. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be interpreted and governed by the laws of Kenya, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            9. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            10. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at support@streampay.com.
          </Typography>
        </Box>

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
          <NextLink href="/pages/privacy-policy" passHref>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600
              }}
            >
              View Privacy Policy
            </Button>
          </NextLink>
        </Box>
      </Paper>
    </Container>
  )
}

TermsOfServicePage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default TermsOfServicePage
