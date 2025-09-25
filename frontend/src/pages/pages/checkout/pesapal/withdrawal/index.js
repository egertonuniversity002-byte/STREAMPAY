// src/pages/pages/checkout/pesapal/withdrawal/index.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

export default function PesapalWithdrawal() {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const router = useRouter()

  const handleWithdrawal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pesapal/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone })
      })

      if (res.status === 200) {
        router.push('/pages/pending')
      } else {
        router.push('/pages/failure')
      }
    } catch (err) {
      console.error(err)
      router.push('/pages/failure')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Pesapal Withdrawal</Typography>
        <TextField
          label="Phone Number"
          fullWidth
          margin="normal"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <TextField
          label="Amount"
          fullWidth
          margin="normal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          disabled={loading}
          onClick={handleWithdrawal}
        >
          {loading ? 'Submitting...' : 'Request Withdrawal'}
        </Button>
      </CardContent>
    </Card>
  )
}
