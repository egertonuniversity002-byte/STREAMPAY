// src/pages/pages/pending/index.js
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'

export default function PendingPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Withdrawal Request Submitted
        </Typography>
        <Typography variant="body2" paragraph>
          Your request has been sent to the admin for approval.  
          This process can take up to 24 hours. You will be notified once it’s processed.
        </Typography>
        <Link href="/" passHref>
          <Button variant="contained" fullWidth>
            Back to Home
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
