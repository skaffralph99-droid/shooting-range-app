import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Profile } from '../../types'
import { format } from 'date-fns'

export default function Members() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'customer').order('member_since', { ascending: false })
      .then(({ data }) => { if (data) setMembers(data); setLoading(false) })
  }, [])

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone ?? '').includes(search)
  )

  if (loading) return <div className="text-caliber-dim">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-caliber-steel">Members <span className="text-caliber-muted text-base">({members.length})</span></h1>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="bg-caliber-elevated border border-caliber-muted rounded-lg px-4 py-2 text-sm text-caliber-steel placeholder-gray-500 focus:outline-none focus:border-caliber-gold w-56"
          placeholder="Search by name or phone..." />
      </div>
      <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-caliber-dark text-caliber-dim uppercase text-xs">
            <tr>{['Name', 'Phone', 'License #', 'Member Since', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-caliber-border">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-caliber-elevated/50">
                <td className="px-4 py-3 text-caliber-steel font-medium">{m.full_name}</td>
                <td className="px-4 py-3 text-caliber-steel/80">{m.phone ?? '—'}</td>
                <td className="px-4 py-3 text-caliber-steel/80 font-mono text-xs">{m.license_number ?? '—'}</td>
                <td className="px-4 py-3 text-caliber-steel/80">{format(new Date(m.member_since), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-green-900/40 text-green-300 border-green-700">ACTIVE</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
