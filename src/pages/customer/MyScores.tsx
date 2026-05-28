import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

interface ScoreRow {
  id: string; score: number; round_number: number; distance_m: number; target_type: string
  sessions: { date: string; weapon_type: string } | null
}

export default function MyScores() {
  const { user } = useAuth()
  const [scores, setScores] = useState<ScoreRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('scores').select('*, sessions(date, weapon_type)')
      .eq('user_id', user!.id)
      .order('id', { ascending: false })
      .then(({ data }) => { if (data) setScores(data as ScoreRow[]); setLoading(false) })
  }, [user])

  const best = scores.length ? Math.max(...scores.map(s => s.score)) : 0
  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Scores</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sessions', value: scores.length },
          { label: 'Best Score', value: best },
          { label: 'Average Score', value: avg },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{s.value}</p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {scores.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No scores recorded yet.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>{['Date', 'Weapon', 'Round #', 'Distance', 'Target', 'Score'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {scores.map(s => (
                <tr key={s.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-300">{s.sessions ? format(new Date(s.sessions.date), 'MMM dd') : '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{s.sessions?.weapon_type ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-300">#{s.round_number}</td>
                  <td className="px-4 py-3 text-gray-300">{s.distance_m}m</td>
                  <td className="px-4 py-3 text-gray-300">{s.target_type}</td>
                  <td className="px-4 py-3 font-bold text-orange-400">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
