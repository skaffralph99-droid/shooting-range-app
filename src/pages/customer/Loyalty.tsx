import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { UserLoyalty } from '../../types'
import { format } from 'date-fns'

interface PointsEvent { id: string; points: number; reason: string; created_at: string }

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 299,  discount: 5,  emoji: '🥉', color: '#cd7f32', bg: 'bg-amber-900/20', border: 'border-amber-700' },
  { name: 'Silver',   min: 300,  max: 699,  discount: 10, emoji: '🥈', color: '#94a3b8', bg: 'bg-slate-700/20', border: 'border-slate-500' },
  { name: 'Gold',     min: 700,  max: 1499, discount: 15, emoji: '🥇', color: '#fbbf24', bg: 'bg-yellow-900/20', border: 'border-yellow-600' },
  { name: 'Platinum', min: 1500, max: Infinity, discount: 20, emoji: '💎', color: '#e879f9', bg: 'bg-purple-900/20', border: 'border-purple-600' },
]

export default function Loyalty() {
  const { user } = useAuth()
  const [loyalty, setLoyalty] = useState<UserLoyalty | null>(null)
  const [history, setHistory] = useState<PointsEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: lData }, { data: hData }] = await Promise.all([
        supabase.rpc('get_user_loyalty', { uid: user!.id }),
        supabase.from('loyalty_points').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(20),
      ])
      if (lData?.[0]) setLoyalty(lData[0])
      if (hData) setHistory(hData)
      setLoading(false)
    }
    if (user) load()
  }, [user])

  if (loading) return <div className="text-gray-400">Loading loyalty info...</div>

  const currentTier = TIERS.find(t => t.name === loyalty?.tier_name) ?? TIERS[0]
  const nextTier = TIERS.find(t => t.min > (loyalty?.total_points ?? 0))
  const progress = nextTier
    ? ((loyalty?.total_points ?? 0) - currentTier.min) / (nextTier.min - currentTier.min) * 100
    : 100

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">💎 Loyalty Program</h1>

      {/* Tier Card */}
      <div className={`${currentTier.bg} border ${currentTier.border} rounded-2xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Your Current Tier</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl">{currentTier.emoji}</span>
              <span className="text-3xl font-bold text-white">{currentTier.name}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Points</p>
            <p className="text-4xl font-bold" style={{ color: currentTier.color }}>{loyalty?.total_points.toLocaleString() ?? 0}</p>
          </div>
        </div>

        {nextTier ? (
          <>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{loyalty?.total_points ?? 0} pts</span>
              <span>{nextTier.min} pts → {nextTier.emoji} {nextTier.name}</span>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%`, backgroundColor: currentTier.color }} />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              <span className="font-semibold text-white">{loyalty?.points_to_next}</span> more points to reach {nextTier.emoji} {nextTier.name}
            </p>
          </>
        ) : (
          <p className="text-purple-300 font-semibold mt-2">🎉 You've reached the highest tier!</p>
        )}
      </div>

      {/* Shop Discount Banner */}
      <div className="bg-orange-900/20 border border-orange-700 rounded-xl p-4 mb-6 flex items-center gap-4">
        <span className="text-3xl">🛍️</span>
        <div>
          <p className="text-white font-bold text-lg">{currentTier.discount}% off all shop items</p>
          <p className="text-gray-400 text-sm">Your {currentTier.name} tier discount is automatically applied at checkout</p>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {TIERS.map(tier => (
          <div key={tier.name}
            className={`rounded-xl p-4 text-center border ${tier.name === currentTier.name ? `${tier.bg} ${tier.border}` : 'bg-gray-900 border-gray-800 opacity-60'}`}>
            <div className="text-2xl mb-1">{tier.emoji}</div>
            <p className="font-bold text-white text-sm">{tier.name}</p>
            <p className="text-xs text-gray-400 mt-1">{tier.min.toLocaleString()}+ pts</p>
            <p className="text-sm font-bold mt-1" style={{ color: tier.color }}>{tier.discount}% off</p>
          </div>
        ))}
      </div>

      {/* How to Earn */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-white font-bold mb-4">How to Earn Points</h2>
        <div className="space-y-3">
          {[
            { icon: '📅', label: 'Booking confirmed', pts: '+50 pts' },
            { icon: '🎯', label: 'Score recorded', pts: '+1 pt per 10 score' },
            { icon: '🛒', label: 'Shop purchase', pts: '+1 pt per $1 spent' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.label}</span>
              </div>
              <span className="text-orange-400 font-semibold text-sm">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold">Points History</h2>
        </div>
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No points earned yet. Book a lane or log a score!</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {history.map(evt => (
              <div key={evt.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{evt.reason}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{format(new Date(evt.created_at), 'MMM dd, yyyy · HH:mm')}</p>
                </div>
                <span className={`font-bold text-sm ${evt.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {evt.points > 0 ? '+' : ''}{evt.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
