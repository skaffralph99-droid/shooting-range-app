import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { UserLoyalty, LeaderboardEntry } from '../types'

const TIER_COLORS: Record<string, string> = {
  Bronze: '#cd7f32', Silver: '#94a3b8', Gold: '#fbbf24', Platinum: '#e879f9'
}

export default function CustomerDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ bookings: 0 })
  const [loyalty, setLoyalty] = useState<UserLoyalty | null>(null)
  const [topShooters, setTopShooters] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'confirmed'),
      supabase.rpc('get_user_loyalty', { uid: profile.id }),
      supabase.rpc('get_leaderboard'),
    ]).then(([{ count: b }, { data: lData }, { data: lbData }]) => {
      setStats({ bookings: b ?? 0 })
      if (lData?.[0]) setLoyalty(lData[0])
      if (lbData) {
        setTopShooters(lbData.slice(0, 5))
        const myEntry = lbData.find((e: LeaderboardEntry) => e.user_id === profile.id)
        if (myEntry) setMyRank(myEntry.rank)
      }
    })
  }, [profile])

  const tierColor = loyalty ? (TIER_COLORS[loyalty.tier_name] ?? '#cd7f32') : '#cd7f32'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-caliber-steel">Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-caliber-dim mt-1 text-sm">LOCK · AIM · FIRE</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Bookings', value: stats.bookings, icon: '📅', color: 'border-caliber-gold' },
          { label: 'Loyalty Points', value: loyalty?.total_points ?? 0, icon: loyalty?.badge_emoji ?? '🥉', color: 'border-yellow-600' },
          { label: 'Your Rank', value: myRank ? `#${myRank}` : '—', icon: '🏆', color: 'border-green-600' },
          { label: 'Shop Discount', value: `${loyalty?.discount_pct ?? 5}%`, icon: '🏷️', color: 'border-pink-600' },
        ].map((card, i) => (
          <div key={i} className={`bg-caliber-surface border ${card.color} border-l-4 rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caliber-dim text-xs">{card.label}</p>
                <p className="text-2xl font-bold text-caliber-steel mt-1">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loyalty && (
          <div className="bg-caliber-surface border border-caliber-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-caliber-steel font-bold">Your Loyalty Status</h2>
              <Link to="/loyalty" className="text-xs text-caliber-gold hover:text-caliber-gold-light">Details →</Link>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{loyalty.badge_emoji}</span>
              <div>
                <p className="text-caliber-steel font-bold text-lg" style={{ color: tierColor }}>{loyalty.tier_name} Member</p>
                <p className="text-caliber-dim text-sm">{loyalty.total_points.toLocaleString()} pts · {loyalty.discount_pct}% off shop</p>
              </div>
            </div>
            {loyalty.next_tier_name && (
              <>
                <div className="h-2 bg-caliber-elevated rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (loyalty.total_points / (loyalty.next_tier_min ?? 1)) * 100)}%`, backgroundColor: tierColor }} />
                </div>
                <p className="text-caliber-muted text-xs">{loyalty.points_to_next} pts to {loyalty.next_tier_name}</p>
              </>
            )}
          </div>
        )}

        <div className="bg-caliber-surface border border-caliber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-caliber-steel font-bold">🏆 Top Shooters</h2>
            <Link to="/leaderboard" className="text-xs text-caliber-gold hover:text-caliber-gold-light">Full →</Link>
          </div>
          <div className="space-y-2">
            {topShooters.map((entry, i) => (
              <div key={entry.user_id} className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${entry.user_id === profile?.id ? 'bg-caliber-gold/10' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <span className="text-sm text-caliber-steel">{entry.full_name}{entry.user_id === profile?.id && <span className="text-caliber-gold text-xs ml-1">(you)</span>}</span>
                </div>
                <span className="text-caliber-gold font-bold text-sm">{entry.total_score.toLocaleString()}</span>
              </div>
            ))}
            {topShooters.length === 0 && <p className="text-caliber-muted text-sm">No scores yet</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-caliber-surface border border-caliber-border rounded-xl p-5">
          <h2 className="text-caliber-steel font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { to: '/book', label: '📅 Book a Lane', primary: true },
              { to: '/shop', label: '🛍️ Shop', primary: false },
              { to: '/my-bookings', label: '📋 My Bookings', primary: false },
              { to: '/leaderboard', label: '🏆 Leaderboard', primary: false },
              { to: '/my-scores', label: '🎯 My Scores', primary: false },
              { to: '/loyalty', label: '💎 Loyalty', primary: false },
              { to: '/my-orders', label: '📦 My Orders', primary: false },
            ].map(a => (
              <Link key={a.to} to={a.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${a.primary ? 'bg-caliber-gold hover:bg-caliber-gold-light text-caliber-dark' : 'bg-caliber-elevated hover:bg-caliber-muted text-caliber-steel/80'}`}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
