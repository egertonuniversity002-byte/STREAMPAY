// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import ShieldAccount from 'mdi-material-ui/ShieldAccount'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import Bank from 'mdi-material-ui/Bank'
import ClipboardList from 'mdi-material-ui/ClipboardList'
import Bell from 'mdi-material-ui/Bell'
import AccountTree from 'mdi-material-ui/Sitemap'
import People from 'mdi-material-ui/AccountGroup'
import Balance from 'mdi-material-ui/ScaleBalance'
import TrendingUp from 'mdi-material-ui/TrendingUp'

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
      path: '/'
    },
    {
      title: 'Deriv Trading',
      icon: TrendingUp,
      path: '/'
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
      sectionTitle: 'Products'
    },
    {
      title: 'Tasks',
      icon: ClipboardList,
      path: '/pages/tasks',
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
    }
  ]
}

export default navigation
