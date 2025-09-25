import React from 'react'
import { Card, CardContent, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Link from 'next/link'

const FailureCard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6 shadow-lg rounded-2xl max-w-md text-center">
          <CardContent>
            <ErrorOutlineIcon
              sx={{ fontSize: 80, color: 'red' }}
            />
            <Typography
              variant="h5"
              gutterBottom
              className="mt-4 font-semibold"
            >
              Payment Failed
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Oops! Something went wrong with your transaction.
              Please try again or contact support.
            </Typography>

            <div className="mt-6 flex justify-center gap-4">
              <Link href="/">
                <Button variant="contained" color="primary">
                  Go Home
                </Button>
              </Link>
              <Link href="/pages/checkout">
                <Button variant="outlined" color="secondary">
                  Retry Payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default FailureCard
