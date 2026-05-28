import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LeaderboardEntry } from '../../types'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_leaderboard').then(({ data }) => {
      if (data) setData(data)
      setLoading(false)
    })
  }, [])

  const myEntry = data.find(e => e.user_id === user?.id)

  if (loading) return <div className="text-caliber-dim">Loading leaderboard...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-caliber-steel">🏆 Leaderboard</h1>
        <p className="text-caliber-dim mt-1">Top shooters ranked by cumulative score</p>
      </div>

      {myEntry && (
        <div className="bg-caliber-gold/10 border border-caliber-gold/60 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-caliber-gold-light text-sm font-semibold">Your Ranking</p>
            <p className="text-caliber-steel text-lg font-bold mt-0.5">#{myEntry.rank} — {myEntry.total_score.toLocaleString()} pts total</p>
          </div>
          <div className="text-right text-sm text-caliber-dim">
            <p>{myEntry.sessions_count} sessions · Best: {myEntry.best_score} · Avg: {myEntry.avg_score}</p>
          </div>
        </div>
      )}

      <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
        <div className="bg-caliber-elevated px-4 py-3 grid grid-cols-12 text-xs font-bold text-caliber-dim uppercase tracking-wider">
          <span className="col-span-1">Rank</span>
          <span className="col-span-4">Shooter</span>
          <span className="col-span-2 text-right">Total Score</span>
          <span className="col-span-2 text-right">Sessions</span>
          <span className="col-span-2 text-right">Best</span>
          <span className="col-span-1 text-right">Avg</span>
        </div>
        {data.length === 0 ? (
          <p className="text-center text-caliber-muted py-12">No scores yet. Start shooting!</p>
        ) : (
          data.map((entry, i) => (
            <div
              key={entry.user_id}
              className={`px-4 py-3.5 grid grid-cols-12 items-center border-b border-caliber-border last:border-0 transition-colors
                ${entry.user_id === user?.id ? 'bg-caliber-gold/05' : 'hover:bg-caliber-elevated/40'}`}
            >
              <span className="col-span-1">
                {i < 3
                  ? <span className="text-xl">{medals[i]}</span>
                  : <span className="text-caliber-muted font-bold">#{entry.rank}</span>}
              </span>
              <span className="col-span-4 font-semibold text-caliber-steel">
                {entry.full_name}
                {entry.user_id === user?.id && <span className="ml-2 text-xs text-caliber-gold">(you)</span>}
              </span>
              <span className="col-span-2 text-right font-bold text-caliber-gold">{entry.total_score.toLocaleString()}</span>
              <span className="col-span-2 text-right text-caliber-steel/80">{entry.sessions_count}</span>
              <span className="col-span-2 text-right text-caliber-steel/80">{entry.best_score}</span>
              <span className="col-span-1 text-right text-caliber-dim">{entry.avg_score}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
