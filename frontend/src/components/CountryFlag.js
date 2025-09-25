// ** MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import { useState, useEffect } from 'react'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** Currency to Country Flag mapping
const currencyToFlag = {
  'UGX': '🇺🇬', // Uganda
  'USD': '🇺🇸', // United States
  'EUR': '🇪🇺', // European Union
  'GBP': '🇬🇧', // United Kingdom
  'KES': '🇰🇪', // Kenya
  'TZS': '🇹🇿', // Tanzania
  'RWF': '🇷🇼', // Rwanda
  'NGN': '🇳🇬', // Nigeria
  'GHS': '🇬🇭', // Ghana
  'ZAR': '🇿🇦', // South Africa
  'CAD': '🇨🇦', // Canada
  'AUD': '🇦🇺', // Australia
  'JPY': '🇯🇵', // Japan
  'CHF': '🇨🇭', // Switzerland
  'SEK': '🇸🇪', // Sweden
  'NOK': '🇳🇴', // Norway
  'DKK': '🇩🇰', // Denmark
  'INR': '🇮🇳', // India
  'BRL': '🇧🇷', // Brazil
  'MXN': '🇲🇽', // Mexico
  'CNY': '🇨🇳', // China
  'KRW': '🇰🇷', // South Korea
  'SGD': '🇸🇬', // Singapore
  'HKD': '🇭🇰', // Hong Kong
  'THB': '🇹🇭', // Thailand
  'MYR': '🇲🇾', // Malaysia
  'IDR': '🇮🇩', // Indonesia
  'PHP': '🇵🇭', // Philippines
  'VND': '🇻🇳', // Vietnam
  'TRY': '🇹🇷', // Turkey
  'RUB': '🇷🇺', // Russia
  'PLN': '🇵🇱', // Poland
  'CZK': '🇨🇿', // Czech Republic
  'HUF': '🇭🇺', // Hungary
  'ILS': '🇮🇱', // Israel
  'AED': '🇦🇪', // UAE
  'SAR': '🇸🇦', // Saudi Arabia
  'EGP': '🇪🇬', // Egypt
  'MAD': '🇲🇦', // Morocco
  'ZMW': '🇿🇲', // Zambia
  'BWP': '🇧🇼', // Botswana
  'MUR': '🇲🇺', // Mauritius
  'SCR': '🇸🇨', // Seychelles
  'MGA': '🇲🇬', // Madagascar
  'MWK': '🇲🇼', // Malawi
  'LSL': '🇱🇸', // Lesotho
  'SZL': '🇸🇿', // Eswatini
  'NAD': '🇳🇦', // Namibia
  'AOA': '🇦🇴', // Angola
  'XOF': '🇧🇫', // West African CFA franc
  'XAF': '🇨🇲', // Central African CFA franc
  'CDF': '🇨🇩', // Democratic Republic of Congo
  'BIF': '🇧🇮', // Burundi
  'DJF': '🇩🇯', // Djibouti
  'ERN': '🇪🇷', // Eritrea
  'ETB': '🇪🇹', // Ethiopia
  'SOS': '🇸🇴', // Somalia
  'SSP': '🇸🇸', // South Sudan
  'SDG': '🇸🇩', // Sudan
  'LYD': '🇱🇾', // Libya
  'TND': '🇹🇳', // Tunisia
  'DZD': '🇩🇿', // Algeria
  'MRO': '🇲🇷', // Mauritania
  'GMD': '🇬🇲', // Gambia
  'GNF': '🇬🇳', // Guinea
  'SLL': '🇸🇱', // Sierra Leone
  'LRD': '🇱🇷', // Liberia
  'CVE': '🇨🇻', // Cape Verde
  'STD': '🇸🇹', // São Tomé and Príncipe
  'XCD': '🇦🇬', // East Caribbean dollar
  'BBD': '🇧🇧', // Barbados
  'BZD': '🇧🇿', // Belize
  'CRC': '🇨🇷', // Costa Rica
  'CUP': '🇨🇺', // Cuba
  'DOP': '🇩🇴', // Dominican Republic
  'GTQ': '🇬🇹', // Guatemala
  'HTG': '🇭🇹', // Haiti
  'HNL': '🇭🇳', // Honduras
  'JMD': '🇯🇲', // Jamaica
  'NIO': '🇳🇮', // Nicaragua
  'PAB': '🇵🇦', // Panama
  'PYG': '🇵🇾', // Paraguay
  'PEN': '🇵🇪', // Peru
  'SRD': '🇸🇷', // Suriname
  'TTD': '🇹🇹', // Trinidad and Tobago
  'UYU': '🇺🇾', // Uruguay
  'VED': '🇻🇪', // Venezuela
  'ARS': '🇦🇷', // Argentina
  'BOB': '🇧🇴', // Bolivia
  'CLP': '🇨🇱', // Chile
  'COP': '🇨🇴', // Colombia
  'GYD': '🇬🇾', // Guyana
  'KSH': '🇰🇪' // Kenya
}

const CountryFlag = () => {
  // ** State
  const [currency, setCurrency] = useState('UGX')
  const [loading, setLoading] = useState(true)

  // ** Auth Context
  const { token, isAuthenticated } = useAuth()

  // ** Fetch currency data from API
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        setLoading(true)

        if (!isAuthenticated() || !token) {
          console.error('Authentication required to fetch currency data')
          setLoading(false)
          return
        }

        const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch currency data: ${response.statusText}`)
        }

        const data = await response.json()
        setCurrency(data.currency || 'UGX')
        setLoading(false)
      } catch (err) {
        console.error('Error fetching currency data:', err)
        setCurrency('UGX') // Default fallback
        setLoading(false)
      }
    }

    fetchCurrency()
  }, [token, isAuthenticated])

  if (loading) {
    return (
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: '1rem',
          backgroundColor: 'primary.main'
        }}
      >
        🌍
      </Avatar>
    )
  }

  const flag = currencyToFlag[currency] || '🌍'

  return (
    <Avatar
      sx={{
        width: 32,
        height: 32,
        fontSize: '1rem',
        backgroundColor: 'transparent',
        color: 'text.primary'
      }}
    >
      {flag}
    </Avatar>
  )
}

export default CountryFlag
