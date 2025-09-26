import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'

const CandlestickChart = ({ priceHistory, currentPrice, asset }) => {
  const [series, setSeries] = useState([])
  const [options, setOptions] = useState({})

  useEffect(() => {
    // Convert price history to candlestick data
    // For simplicity, simulate OHLC from price history
    const candlestickData = priceHistory.map((price, index) => {
      const open = index > 0 ? priceHistory[index - 1] : price
      const high = Math.max(open, price) + Math.random() * 0.001 // Add some volatility
      const low = Math.min(open, price) - Math.random() * 0.001
      const close = price
      return {
        x: new Date(Date.now() - (priceHistory.length - index) * 1000).getTime(),
        y: [open, high, low, close]
      }
    })

    setSeries([{
      data: candlestickData
    }])

    setOptions({
      chart: {
        type: 'candlestick',
        height: 350,
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      title: {
        text: `${asset} Price Chart`,
        align: 'left',
        style: {
          color: '#1976d2',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#666'
          }
        }
      },
      yaxis: {
        tooltip: {
          enabled: true
        },
        labels: {
          style: {
            colors: '#666'
          },
          formatter: (value) => value.toFixed(4)
        }
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#00C853',
            downward: '#FF1744'
          },
          wick: {
            useFillColor: true
          }
        }
      },
      tooltip: {
        theme: 'dark',
        x: {
          format: 'HH:mm:ss'
        },
        y: {
          formatter: (value) => `$${value.toFixed(4)}`
        }
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 3
      }
    })
  }, [priceHistory, asset])

  return (
    <div id="candlestick-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={350}
      />
    </div>
  )
}

export default CandlestickChart
