import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { motion } from 'framer-motion'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Link from 'next/link'

const SuccessCard = () => {
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center', mt: 10 }}>
      <CardContent sx={{ padding: theme => `${theme.spacing(5, 5.25, 6)} !important` }}>
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
        </motion.div>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Payment Successful 🎉
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Thank you! Your payment was processed successfully.
        </Typography>

        <Link href="/" passHref>
          <Button
            variant="contained"
            sx={{ py: 2, width: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          >
            Go Home
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default SuccessCard
