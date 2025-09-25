// ** Icon imports
import Login from 'mdi-material-ui/Login'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'
import ShieldAccount from 'mdi-material-ui/ShieldAccount'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import Bank from 'mdi-material-ui/Bank'
import ClipboardList from 'mdi-material-ui/ClipboardList'
import Bell from 'mdi-material-ui/Bell'
import AccountTree from 'mdi-material-ui/Sitemap'
import People from 'mdi-material-ui/AccountGroup'
import Balance from 'mdi-material-ui/ScaleBalance'

const navigation = () => {
  // Check if user is admin using AuthContext
  const userData = typeof window !== 'undefined' ? localStorage.getItem('user') || sessionStorage.getItem('user') : null
  const user = userData ? JSON.parse(userData) : null
  const isAdmin = user && (user.role === 'admin' || user.user?.role === 'admin')

  return [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline,
      path: '/account-settings'
    },
    // Admin Section - Only visible to admin users
    ...(isAdmin ? [
      {
        sectionTitle: 'Admin Panel'
      },
      {
        title: 'Admin Dashboard',
        icon: ShieldAccount,
        path: '/admin',
        badge: 'Admin'
      },
      {
        title: 'User Management',
        icon: AccountGroup,
        path: '/admin/users'
      },
      {
        title: 'Transactions',
        icon: Bank,
        path: '/admin/transactions'
      },
      {
        title: 'Task Management',
        icon: ClipboardList,
        path: '/admin/tasks'
      },
      {
        title: 'Notifications',
        icon: Bell,
        path: '/admin/notifications'
      },
      {
        sectionTitle: 'Quick Actions'
      },
      {
        title: 'View All Users',
        icon: AccountGroup,
        path: '/admin/users'
      },
      {
        title: 'Approve Withdrawals',
        icon: Bank,
        path: '/admin/transactions'
      },
      {
        title: 'Create New Task',
        icon: ClipboardList,
        path: '/admin/tasks'
      },
      {
        title: 'Send Notification',
        icon: Bell,
        path: '/admin/notifications'
      }
    ] : []),
    {
      sectionTitle: 'Pages'
    },
    {
      title: 'Login',
      icon: Login,
      path: '/pages/login',
      openInNewTab: false
    },
    {
      title: 'Register',
      icon: AccountPlusOutline,
      path: '/pages/register',
      openInNewTab: false
    },
    {
      title: 'Tasks',
      icon: ClipboardList,
      path: '/pages/tasks',
      openInNewTab: false
    },
        {
      title: 'paypal',
      icon: AccountPlusOutline,
      path: '/pages/checkout/paypal/deposit',
      openInNewTab: false
    },
        {
      title: 'pesapal',
      icon: AccountPlusOutline,
      path: '/pages/checkout/pesapal/deposit',
      openInNewTab: false
    },
    {
      title: 'Error',
      icon: AlertCircleOutline,
      path: '/pages/error',
      openInNewTab: false
    },
        {
      title: 'success',
      icon: Login,
      path: '/pages/success',
      openInNewTab: false
    },
    {
      title: 'failure',
      icon: Login,
      path: '/pages/failure',
      openInNewTab: false
    },
    {
      sectionTitle: 'Network & Referrals'
    },
    {
      title: 'Team Tree',
      icon: AccountTree,
      path: '/team-tree'
    },
    {
      title: 'Referral Stats',
      icon: People,
      path: '/referral-stats'
    },
    {
      title: 'Binary Stats',
      icon: Balance,
      path: '/binary-stats'
    },
    {
      sectionTitle: 'User Interface'
    },
    {
      title: 'Typography',
      icon: FormatLetterCase,
      path: '/typography'
    },
    {
      title: 'Icons',
      path: '/icons',
      icon: GoogleCirclesExtended
    },
    {
      title: 'Cards',
      icon: CreditCardOutline,
      path: '/cards'
    },
    {
      title: 'Tables',
      icon: Table,
      path: '/tables'
    },
    {
      icon: CubeOutline,
      title: 'Form Layouts',
      path: '/form-layouts'
    }
  ]
}

export default navigation
