import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface LoyaltySummary {
  user_id: string; full_name: string; total_points: number
  tier_name: string; discount_pct: number; tier_color: string; badge_emoji: string
}

export default function LoyaltyAdmin() {
  const [members, setMembers] = useState<LoyaltySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [awarding, setAwarding] = useState<{ userId: string; pts: string; reason: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').eq('role', 'customer')
    if (!profiles) { setLoading(false); return }
    const summaries = await Promise.all(profiles.map(async p => {
      const { data } = await supabase.rpc('get_user_loyalty', { uid: p.id })
      const l = data?.[0] ?? { total_points: 0, tier_name: 'Bronze', discount_pct: 5, tier_color: '#cd7f32', badge_emoji: '🥉', next_tier_name: null, next_tier_min: null, points_to_next: 300 }
      return { user_id: p.id, full_name: p.full_name, ...l }
    }))
    setMembers(summaries.sort((a, b) => b.total_points - a.total_points))
    setLoading(false)
  }

  const awardPoints = async () => {
    if (!awarding) return
    await supabase.from('loyalty_points').insert({
      user_id: awarding.userId,
      points: parseInt(awarding.pts),
      reason: awarding.reason || 'Admin award',
    })
    setAwarding(null)
    loadData()
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Loyalty Management</h1>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[['🥉','Bronze',0,'#cd7f32'],['🥈','Silver',300,'#94a3b8'],['🥇','Gold',700,'#fbbf24'],['💎','Platinum',1500,'#e879f9']].map(([emoji, name, min, color]) => {
          const count = members.filter(m => m.tier_name === name).length
          return (
            <div key={name as string} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-white font-bold">{name}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: color as string }}>{count}</p>
              <p className="text-gray-500 text-xs">members</p>
            </div>
          )
        })}
      </div>

      {awarding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-orange-700 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-4">Award Points</h3>
            <p className="text-gray-400 text-sm mb-4">Member: {members.find(m => m.user_id === awarding.userId)?.full_name}</p>
            <input type="number" placeholder="Points to award" value={awarding.pts}
              onChange={e => setAwarding({...awarding, pts: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-orange-500" />
            <input placeholder="Reason" value={awarding.reason}
              onChange={e => setAwarding({...awarding, reason: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-orange-500" />
            <div className="flex gap-2">
              <button onClick={awardPoints} className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold">Award</button>
              <button onClick={() => setAwarding(null)} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>{['Member','Tier','Points','Discount','Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {members.map((m, i) => (
              <tr key={m.user_id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {i < 3 && <span className="text-sm">{['🥇','🥈','🥉'][i]}</span>}
                    <span className="text-white font-medium">{m.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold" style={{ color: m.tier_color }}>{m.badge_emoji} {m.tier_name}</span>
                </td>
                <td className="px-4 py-3 text-orange-400 font-bold">{m.total_points.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-400 font-semibold">{m.discount_pct}% off</td>
                <td className="px-4 py-3">
                  <button onClick={() => setAwarding({ userId: m.user_id, pts: '', reason: '' })}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors">+ Award Points</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
