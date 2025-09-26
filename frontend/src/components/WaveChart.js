import { useEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'

const WaveChart = ({ priceHistory, currentPrice, asset, onTradePlaced, onPlaceTrade }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [waveOffset, setWaveOffset] = useState(0)
  const [tradeEffect, setTradeEffect] = useState(null)
  const [lastTradeTime, setLastTradeTime] = useState(0)

  useEffect(() => {
    if (onTradePlaced) {
      setTradeEffect(onTradePlaced)
      setLastTradeTime(Date.now())

      // Clear trade effect after animation
      setTimeout(() => setTradeEffect(null), 2000)
    }
  }, [onTradePlaced])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set up gradient for waves
    const gradient1 = ctx.createLinearGradient(0, 0, 0, height)
    gradient1.addColorStop(0, 'rgba(25, 118, 210, 0.8)') // Blue
    gradient1.addColorStop(1, 'rgba(25, 118, 210, 0.1)')

    const gradient2 = ctx.createLinearGradient(0, 0, 0, height)
    gradient2.addColorStop(0, 'rgba(76, 175, 80, 0.6)') // Green
    gradient2.addColorStop(1, 'rgba(76, 175, 80, 0.1)')

    // Draw multiple wave layers with trade effects
    drawWave(ctx, priceHistory, width, height, waveOffset, gradient1, 0.025, 35, tradeEffect, lastTradeTime)
    drawWave(ctx, priceHistory, width, height, waveOffset * 0.7, gradient2, 0.018, 20, tradeEffect, lastTradeTime)

    // Draw smooth price line
    drawSmoothPriceLine(ctx, priceHistory, width, height)

    // Draw current price indicator
    drawCurrentPrice(ctx, currentPrice, width, height, priceHistory)

    // Draw trade effect if active
    if (tradeEffect) {
      drawTradeEffect(ctx, width, height, tradeEffect, Date.now() - lastTradeTime)
    }

  }, [priceHistory, currentPrice, waveOffset, tradeEffect, lastTradeTime])

  // Animation loop with smoother timing
  useEffect(() => {
    let lastTime = 0
    const animate = (time) => {
      if (!lastTime) lastTime = time
      const dt = (time - lastTime) / 16 // Approximate 60fps delta
      lastTime = time
      setWaveOffset(prev => {
        const easedDelta = dt * 0.1 * (0.5 + 0.5 * Math.sin(time / 500)) // Time-based with sinusoidal easing
        return prev + easedDelta
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const drawWave = (ctx, prices, width, height, offset, gradient, frequency, amplitude, tradeEffect, lastTradeTime) => {
    if (prices.length < 2) return

    const points = []
    const step = width / (prices.length - 1)

    // Normalize prices to canvas height
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    // Add trade disturbance effect
    let disturbance = 0
    if (tradeEffect) {
      const timeSinceTrade = Date.now() - lastTradeTime
      const disturbanceStrength = Math.max(0, 1 - timeSinceTrade / 2000) // Fade over 2 seconds
      disturbance = disturbanceStrength * (tradeEffect.direction === 'Call' ? 1 : -1) * 20
    }

    for (let i = 0; i < prices.length; i++) {
      const x = i * step
      const normalizedPrice = (prices[i] - minPrice) / priceRange
      const baseY = height - (normalizedPrice * height * 0.8) - height * 0.1

      // More realistic wave with multiple harmonics
      const wave1 = Math.sin((x / width) * Math.PI * 2 * frequency + offset) * amplitude
      const wave2 = Math.sin((x / width) * Math.PI * 4 * frequency + offset * 1.5) * amplitude * 0.3
      const wave3 = Math.sin((x / width) * Math.PI * 8 * frequency + offset * 2) * amplitude * 0.1
      const wave4 = Math.sin((x / width) * Math.PI * 12 * frequency + offset * 0.5) * amplitude * 0.05 // Additional harmonic for smoothness

      const waveY = baseY + wave1 + wave2 + wave3 + wave4 + disturbance

      points.push({ x, y: waveY })
    }

    // Draw filled wave with smoother curves using bezier
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(0, height)

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const prev = i > 0 ? points[i - 1] : current

      // Calculate control points for bezier curve
      const cp1x = current.x + (next.x - current.x) * 0.25
      const cp1y = current.y
      const cp2x = next.x - (next.x - current.x) * 0.25
      const cp2y = next.y

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y)
    }

    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }

  const drawSmoothPriceLine = (ctx, prices, width, height) => {
    if (prices.length < 2) return

    const step = width / (prices.length - 1)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    ctx.beginPath()
    ctx.strokeStyle = '#1976d2'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (let i = 0; i < prices.length; i++) {
      const x = i * step
      const normalizedPrice = (prices[i] - minPrice) / priceRange
      const y = height - (normalizedPrice * height * 0.8) - height * 0.1

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  const drawTradeEffect = (ctx, width, height, trade, elapsedTime) => {
    const progress = elapsedTime / 2000 // 2 second animation
    const alpha = Math.max(0, 1 - progress)

    // Create ripple effect from center
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.sqrt(width * width + height * height) / 2

    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * progress, 0, Math.PI * 2)
    ctx.strokeStyle = trade.direction === 'Call' ? `rgba(76, 175, 80, ${alpha * 0.5})` : `rgba(244, 67, 54, ${alpha * 0.5})`
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw trade direction indicator
    ctx.fillStyle = trade.direction === 'Call' ? `rgba(76, 175, 80, ${alpha})` : `rgba(244, 67, 54, ${alpha})`
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(trade.direction.toUpperCase(), centerX, centerY - 20)
    ctx.fillText(`$${trade.amount}`, centerX, centerY + 10)
    ctx.textAlign = 'left'
  }

  const handleCallTrade = () => {
    const trade = { direction: 'Call', amount: 10 }
    if (onPlaceTrade) {
      onPlaceTrade(trade)
    }
    setTradeEffect(trade)
    setLastTradeTime(Date.now())
    // Clear after animation
    setTimeout(() => setTradeEffect(null), 2000)
  }

  const handlePutTrade = () => {
    const trade = { direction: 'Put', amount: 10 }
    if (onPlaceTrade) {
      onPlaceTrade(trade)
    }
    setTradeEffect(trade)
    setLastTradeTime(Date.now())
    // Clear after animation
    setTimeout(() => setTradeEffect(null), 2000)
  }

  const drawCurrentPrice = (ctx, currentPrice, width, height, prices) => {
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1
    const normalizedPrice = (currentPrice - minPrice) / priceRange
    const y = height - (normalizedPrice * height * 0.8) - height * 0.1

    // Draw horizontal line
    ctx.beginPath()
    ctx.strokeStyle = '#ff9800'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw price label with background
    ctx.fillStyle = 'rgba(255, 152, 0, 0.9)'
    ctx.fillRect(width - 85, y - 15, 80, 20)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px Arial'
    ctx.fillText(`$${currentPrice.toFixed(4)}`, width - 80, y - 2)
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: '#1976d2'
        }}
      >
        {asset} Live Waves
      </Box>
      {tradeEffect && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: tradeEffect.direction === 'Call' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: 'white',
            animation: 'fadeOut 2s ease-out forwards'
          }}
        >
          {tradeEffect.direction} ${tradeEffect.amount}
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          px: 2
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={handleCallTrade}
          size="small"
          sx={{ flex: 1, borderRadius: 2 }}
        >
          Call (Buy)
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handlePutTrade}
          size="small"
          sx={{ flex: 1, borderRadius: 2 }}
        >
          Put (Sell)
        </Button>
      </Box>
    </Box>
  )
}

export default WaveChart
