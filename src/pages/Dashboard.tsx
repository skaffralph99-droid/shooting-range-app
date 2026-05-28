import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [stats, setStats] = useState({ bookings: 0, members: 0, lowStock: 0 })

  useEffect(() => {
    async function loadStats() {
      if (isAdmin) {
        const [{ count: bookings }, { count: members }, { count: lowStock }] = await Promise.all([
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          supabase.from('inventory').select('*', { count: 'exact', head: true }).lte('quantity', 5),
        ])
        setStats({ bookings: bookings ?? 0, members: members ?? 0, lowStock: lowStock ?? 0 })
      } else {
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile?.id)
          .eq('status', 'confirmed')
        setStats(s => ({ ...s, bookings: count ?? 0 }))
      }
    }
    if (profile) loadStats()
  }, [profile, isAdmin])

  const adminCards = [
    { label: 'Active Bookings', value: stats.bookings, icon: '📅', color: 'border-orange-600' },
    { label: 'Total Members', value: stats.members, icon: '👥', color: 'border-blue-600' },
    { label: 'Low Stock Items', value: stats.lowStock, icon: '⚠️', color: 'border-red-600' },
  ]

  const customerCards = [
    { label: 'My Bookings', value: stats.bookings, icon: '📅', color: 'border-orange-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {isAdmin ? 'Admin Dashboard — manage your shooting range' : 'Your shooting range dashboard'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(isAdmin ? adminCards : customerCards).map(card => (
          <div key={card.label} className={`bg-gray-900 border ${card.color} border-l-4 rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {!isAdmin && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/book" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">
              📅 Book a Lane
            </a>
            <a href="/my-bookings" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
              📋 View My Bookings
            </a>
            <a href="/my-scores" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
              🏆 My Scores
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
