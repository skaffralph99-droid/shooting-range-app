import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { UserLoyalty, LeaderboardEntry } from '../types'

const TIER_COLORS: Record<string, string> = {
  Bronze: '#cd7f32', Silver: '#94a3b8', Gold: '#fbbf24', Platinum: '#e879f9'
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [stats, setStats] = useState({ bookings: 0, members: 0, lowStock: 0, pendingOrders: 0 })
  const [loyalty, setLoyalty] = useState<UserLoyalty | null>(null)
  const [topShooters, setTopShooters] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    if (!profile) return
    if (isAdmin) {
      Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('inventory').select('*', { count: 'exact', head: true }).lte('quantity', 5),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]).then(([{count: b},{count: m},{count: ls},{count: po}]) => {
        setStats({ bookings: b??0, members: m??0, lowStock: ls??0, pendingOrders: po??0 })
      })
    } else {
      Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'confirmed'),
        supabase.rpc('get_user_loyalty', { uid: profile.id }),
        supabase.rpc('get_leaderboard'),
      ]).then(([{count: b}, {data: lData}, {data: lbData}]) => {
        setStats(s => ({ ...s, bookings: b??0 }))
        if (lData?.[0]) setLoyalty(lData[0])
        if (lbData) {
          setTopShooters(lbData.slice(0, 5))
          const myEntry = lbData.find((e: LeaderboardEntry) => e.user_id === profile.id)
          if (myEntry) setMyRank(myEntry.rank)
        }
      })
    }
  }, [profile, isAdmin])

  const tierColor = loyalty ? (TIER_COLORS[loyalty.tier_name] ?? '#cd7f32') : '#cd7f32'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {isAdmin ? 'Admin Panel — full control of your shooting range' : 'Your shooting range dashboard'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isAdmin ? [
          { label: 'Active Bookings', value: stats.bookings, icon: '📅', color: 'border-orange-600' },
          { label: 'Total Members', value: stats.members, icon: '👥', color: 'border-blue-600' },
          { label: 'Pending Orders', value: stats.pendingOrders, icon: '📦', color: 'border-purple-600' },
          { label: 'Low Stock Items', value: stats.lowStock, icon: '⚠️', color: 'border-red-600' },
        ] : [
          { label: 'Active Bookings', value: stats.bookings, icon: '📅', color: 'border-orange-600' },
          { label: 'Loyalty Points', value: loyalty?.total_points ?? 0, icon: loyalty?.badge_emoji ?? '🥉', color: 'border-yellow-600' },
          { label: 'Your Rank', value: myRank ? `#${myRank}` : '—', icon: '🏆', color: 'border-green-600' },
          { label: 'Shop Discount', value: `${loyalty?.discount_pct ?? 5}%`, icon: '🏷️', color: 'border-pink-600' },
        ].map((card, i) => (
          <div key={i} className={`bg-gray-900 border ${card.color} border-l-4 rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Loyalty Card (customer) */}
        {!isAdmin && loyalty && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Your Loyalty Status</h2>
              <Link to="/loyalty" className="text-xs text-orange-400 hover:text-orange-300">View details →</Link>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{loyalty.badge_emoji}</span>
              <div>
                <p className="text-white font-bold text-lg" style={{ color: tierColor }}>{loyalty.tier_name} Member</p>
                <p className="text-gray-400 text-sm">{loyalty.total_points.toLocaleString()} points · {loyalty.discount_pct}% off shop</p>
              </div>
            </div>
            {loyalty.next_tier_name && (
              <>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(100, (loyalty.total_points / (loyalty.next_tier_min ?? 1)) * 100)}%`,
                    backgroundColor: tierColor
                  }} />
                </div>
                <p className="text-gray-500 text-xs">{loyalty.points_to_next} pts to {loyalty.next_tier_name}</p>
              </>
            )}
          </div>
        )}

        {/* Leaderboard Preview (customer) */}
        {!isAdmin && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">🏆 Top Shooters</h2>
              <Link to="/leaderboard" className="text-xs text-orange-400 hover:text-orange-300">Full leaderboard →</Link>
            </div>
            {topShooters.length === 0 ? (
              <p className="text-gray-500 text-sm">No scores recorded yet</p>
            ) : (
              <div className="space-y-2">
                {topShooters.map((entry, i) => (
                  <div key={entry.user_id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${entry.user_id === profile?.id ? 'bg-orange-900/20' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-5">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                      <span className="text-sm text-white font-medium">
                        {entry.full_name}{entry.user_id === profile?.id && <span className="text-orange-400 text-xs ml-1">(you)</span>}
                      </span>
                    </div>
                    <span className="text-orange-400 font-bold text-sm">{entry.total_score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 ${!isAdmin ? '' : 'lg:col-span-2'}`}>
          <h2 className="text-white font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? [
              { to: '/admin/bookings', label: '📅 Manage Bookings', primary: true },
              { to: '/admin/orders', label: '📦 View Orders', primary: false },
              { to: '/admin/members', label: '👥 Members', primary: false },
              { to: '/admin/products', label: '🛍️ Products', primary: false },
              { to: '/admin/inventory', label: '📦 Inventory', primary: false },
              { to: '/admin/loyalty', label: '💎 Loyalty', primary: false },
            ] : [
              { to: '/book', label: '📅 Book a Lane', primary: true },
              { to: '/shop', label: '🛍️ Shop', primary: false },
              { to: '/my-bookings', label: '📋 My Bookings', primary: false },
              { to: '/leaderboard', label: '🏆 Leaderboard', primary: false },
              { to: '/my-scores', label: '🎯 My Scores', primary: false },
              { to: '/loyalty', label: '💎 Loyalty', primary: false },
            ].map(action => (
              <Link key={action.to} to={action.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.primary ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
