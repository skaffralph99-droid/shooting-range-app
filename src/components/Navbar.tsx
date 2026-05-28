import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const customerLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/book', label: 'Book Lane' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/my-scores', label: 'My Scores' },
  ]

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/members', label: 'Members' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/scores', label: 'Scores' },
    { to: '/admin/lanes', label: 'Lanes' },
  ]

  const links = isAdmin ? adminLinks : customerLinks

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-orange-500 font-bold text-lg">🎯 RangeApp</span>
        <div className="flex gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{profile?.full_name}</span>
        {isAdmin && <span className="px-2 py-0.5 bg-orange-900 text-orange-300 text-xs rounded-full font-semibold">ADMIN</span>}
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
