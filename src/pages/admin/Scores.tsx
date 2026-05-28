import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { format } from 'date-fns'
import { Profile } from '../../types'

interface SessionRow { id: string; date: string; weapon_type: string; rounds_fired: number; profiles: { full_name: string } | null }

export default function AdminScores() {
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Profile[]>([])
  const [form, setForm] = useState({ user_id: '', date: '', weapon_type: '', rounds_fired: 1, notes: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    supabase.from('sessions').select('*, profiles(full_name)').order('date', { ascending: false })
      .then(({ data }) => { if (data) setSessions(data as SessionRow[]); setLoading(false) })
    supabase.from('profiles').select('id, full_name').eq('role', 'customer')
      .then(({ data }) => { if (data) setMembers(data as Profile[]) })
  }, [])

  const addSession = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('sessions').insert({
      ...form,
      rounds_fired: Number(form.rounds_fired),
      notes: form.notes || null,
    }).select('*, profiles(full_name)').single()
    if (!error && data) { setSessions(prev => [data as SessionRow, ...prev]); setShowForm(false) }
  }

  if (loading) return <div className="text-caliber-dim">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-caliber-steel">Score Sessions</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-caliber-gold hover:bg-caliber-gold-light text-caliber-dark rounded-lg text-sm font-medium">+ Log Session</button>
      </div>
      {showForm && (
        <div className="bg-caliber-surface border border-caliber-gold/60 rounded-xl p-5 mb-6">
          <form onSubmit={addSession} className="grid grid-cols-2 gap-3">
            <select value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required
              className="col-span-2 bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm">
              <option value="">Select member</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <input placeholder="Weapon type" value={form.weapon_type} onChange={e => setForm({...form, weapon_type: e.target.value})} required
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <input type="number" placeholder="Rounds fired" value={form.rounds_fired} onChange={e => setForm({...form, rounds_fired: +e.target.value})} required
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-caliber-gold text-caliber-dark rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-caliber-muted text-caliber-steel rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-caliber-dark text-caliber-dim uppercase text-xs">
            <tr>{['Member', 'Date', 'Weapon', 'Rounds', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-caliber-border">
            {sessions.map(s => (
              <tr key={s.id} className="hover:bg-caliber-elevated/50">
                <td className="px-4 py-3 text-caliber-steel font-medium">{s.profiles?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-caliber-steel/80">{format(new Date(s.date), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-3 text-caliber-steel/80">{s.weapon_type}</td>
                <td className="px-4 py-3 text-caliber-steel/80">{s.rounds_fired}</td>
                <td className="px-4 py-3"><span className="text-xs text-caliber-gold hover:underline cursor-pointer">View Scores</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
