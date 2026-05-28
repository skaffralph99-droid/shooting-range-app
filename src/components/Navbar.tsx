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
  const [mobileOpen, setMobileOpen] = useState(false)

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
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/shop', label: 'Shop' },
    { to: '/loyalty', label: 'Loyalty' },
  ]
  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/members', label: 'Members' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/scores', label: 'Scores' },
    { to: '/admin/lanes', label: 'Lanes' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/loyalty', label: 'Loyalty' },
  ]
  const links = isAdmin ? adminLinks : customerLinks

  return (
    <nav className="bg-caliber-surface border-b border-caliber-border sticky top-0 z-50" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
      {/* Top gold stripe */}
      <div className="h-0.5 w-full bg-caliber-gold" />

      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 bg-caliber-gold rounded flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-caliber-dark">
              <rect x="4" y="4" width="24" height="4" rx="1"/>
              <rect x="4" y="10" width="10" height="3" rx="1"/>
              <rect x="18" y="10" width="10" height="3" rx="1"/>
              <rect x="6" y="15" width="8" height="8" rx="1"/>
              <rect x="18" y="15" width="8" height="8" rx="1"/>
              <rect x="12" y="18" width="8" height="5" rx="1"/>
              <rect x="9" y="24" width="4" height="4" rx="0.5"/>
              <rect x="19" y="24" width="4" height="4" rx="0.5"/>
            </svg>
          </div>
          <div>
            <div className="text-caliber-gold font-black text-sm uppercase tracking-widest leading-none group-hover:text-caliber-gold-light transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
              CALIBER
            </div>
            <div className="text-caliber-dim text-xs uppercase tracking-widest leading-none" style={{ fontSize: '9px' }}>
              SHOOTING RANGE
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {links.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive(link.to)
                  ? 'bg-caliber-gold text-caliber-dark'
                  : 'text-caliber-dim hover:text-caliber-steel hover:bg-caliber-elevated'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isAdmin && count > 0 && (
            <Link to="/cart" className="relative p-1.5 hover:bg-caliber-elevated rounded-lg transition-colors">
              <svg className="w-5 h-5 text-caliber-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 bg-caliber-gold text-caliber-dark text-xs w-4 h-4 rounded-full flex items-center justify-center font-black text-[10px]">{count}</span>
            </Link>
          )}
          {!isAdmin && points !== null && (
            <Link to="/loyalty" className="hidden sm:flex items-center gap-1.5 bg-caliber-elevated border border-caliber-border px-2.5 py-1 rounded-lg hover:border-caliber-gold transition-colors">
              <span className="text-sm">{tierEmoji}</span>
              <span className="text-caliber-gold font-bold text-xs">{points.toLocaleString()} pts</span>
            </Link>
          )}
          {isAdmin && (
            <span className="px-2 py-0.5 bg-caliber-gold/20 text-caliber-gold text-xs rounded font-bold uppercase tracking-widest border border-caliber-gold/40">
              ADMIN
            </span>
          )}
          <div className="hidden md:flex items-center gap-1 text-xs text-caliber-dim border-l border-caliber-border pl-2">
            <span>{profile?.full_name?.split(' ')[0]}</span>
            <button onClick={handleSignOut} className="text-caliber-dim hover:text-red-400 transition-colors ml-1 p-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 text-caliber-dim hover:text-caliber-steel">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-caliber-border bg-caliber-dark px-4 py-3">
          <div className="grid grid-cols-2 gap-1">
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive(link.to) ? 'bg-caliber-gold text-caliber-dark' : 'text-caliber-dim hover:text-caliber-steel hover:bg-caliber-elevated'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-caliber-border">
            <span className="text-caliber-dim text-xs">{profile?.full_name}</span>
            <button onClick={handleSignOut} className="text-red-400 text-xs font-semibold uppercase tracking-wider">Sign Out</button>
          </div>
        </div>
      )}
    </nav>
  )
}
