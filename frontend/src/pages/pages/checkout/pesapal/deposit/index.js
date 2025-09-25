// src/pages/pages/checkout/pesapal/deposit/index.js
import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

export default function PesapalDeposit() {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')

  const handleDeposit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pesapal/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      const data = await res.json()

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        window.location.href = '/pages/failure'
      }
    } catch (err) {
      console.error(err)
      window.location.href = '/pages/failure'
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Deposit with Pesapal</Typography>
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
          onClick={handleDeposit}
        >
          {loading ? 'Processing...' : 'Deposit Now'}
        </Button>
      </CardContent>
    </Card>
  )
}
