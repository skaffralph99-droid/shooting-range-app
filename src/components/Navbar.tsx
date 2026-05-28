import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const { profile, isAdmin, signOut } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [points, setPoints] = useState<number | null>(null)
  const [tierEmoji, setTierEmoji] = useState('')

  useEffect(() => {
    if (profile?.id && !isAdmin) {
      supabase.rpc('get_user_loyalty', { uid: profile.id }).then(({ data }) => {
        if (data?.[0]) { setPoints(data[0].total_points); setTierEmoji(data[0].badge_emoji) }
      })
    }
  }, [profile, isAdmin])

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const customerLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/book', label: 'Book Lane' },
    { to: '/my-bookings', label: 'Bookings' },
    { to: '/my-scores', label: 'Scores' },
    { to: '/leaderboard', label: '🏆 Leaderboard' },
    { to: '/shop', label: '🛍️ Shop' },
    { to: '/loyalty', label: '💎 Loyalty' },
  ]

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/members', label: 'Members' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/scores', label: 'Scores' },
    { to: '/admin/lanes', label: 'Lanes' },
    { to: '/admin/products', label: '🛍️ Products' },
    { to: '/admin/orders', label: '📦 Orders' },
    { to: '/admin/loyalty', label: '💎 Loyalty' },
  ]

  const links = isAdmin ? adminLinks : customerLinks

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 overflow-x-auto">
        <span className="text-orange-500 font-bold text-base whitespace-nowrap flex-shrink-0">🎯 RangeApp</span>
        <div className="flex gap-0.5">
          {links.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                isActive(link.to) ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {!isAdmin && count > 0 && (
          <Link to="/cart" className="relative">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>
          </Link>
        )}
        {!isAdmin && points !== null && (
          <Link to="/loyalty" className="hidden sm:flex items-center gap-1 bg-gray-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300 hover:bg-gray-700 transition-colors">
            {tierEmoji} {points.toLocaleString()} pts
          </Link>
        )}
        {isAdmin && <span className="px-2 py-0.5 bg-orange-900 text-orange-300 text-xs rounded-full font-bold">ADMIN</span>}
        <span className="text-xs text-gray-500 hidden md:block">{profile?.full_name?.split(' ')[0]}</span>
        <button onClick={handleSignOut} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Sign out</button>
      </div>
    </nav>
  )
}
