import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Lane } from '../../types'

export default function Lanes() {
  const [lanes, setLanes] = useState<Lane[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'pistol', max_distance_m: 25, is_active: true, notes: '' })

  useEffect(() => {
    supabase.from('lanes').select('*').order('name')
      .then(({ data }) => { if (data) setLanes(data); setLoading(false) })
  }, [])

  const addLane = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('lanes').insert(form).select().single()
    if (!error && data) { setLanes(prev => [...prev, data]); setShowForm(false) }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('lanes').update({ is_active: !current }).eq('id', id)
    setLanes(prev => prev.map(l => l.id === id ? { ...l, is_active: !current } : l))
  }

  if (loading) return <div className="text-caliber-dim">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-caliber-steel">Lanes</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-caliber-gold hover:bg-caliber-gold-light text-caliber-dark rounded-lg text-sm font-medium">+ Add Lane</button>
      </div>
      {showForm && (
        <div className="bg-caliber-surface border border-caliber-gold/60 rounded-xl p-5 mb-6">
          <form onSubmit={addLane} className="grid grid-cols-2 gap-3">
            <input placeholder="Lane name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm">
              <option value="pistol">Pistol</option>
              <option value="rifle">Rifle</option>
              <option value="mixed">Mixed</option>
            </select>
            <input type="number" placeholder="Max distance (m)" value={form.max_distance_m} onChange={e => setForm({...form, max_distance_m: +e.target.value})} required
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-caliber-gold text-caliber-dark rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-caliber-muted text-caliber-steel rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lanes.map(lane => (
          <div key={lane.id} className={`bg-caliber-surface border rounded-xl p-5 ${lane.is_active ? 'border-caliber-muted' : 'border-caliber-border opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-caliber-steel font-semibold">{lane.name}</h3>
                <p className="text-caliber-dim text-sm mt-1 capitalize">{lane.type} · {lane.max_distance_m}m</p>
                {lane.notes && <p className="text-caliber-muted text-xs mt-2">{lane.notes}</p>}
              </div>
              <button onClick={() => toggleActive(lane.id, lane.is_active)}
                className={`text-xs font-semibold px-2 py-1 rounded-full border transition-colors ${lane.is_active ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-caliber-elevated text-caliber-muted border-caliber-muted'}`}>
                {lane.is_active ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
