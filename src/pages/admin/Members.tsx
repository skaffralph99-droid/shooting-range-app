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

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Members <span className="text-gray-500 text-base">({members.length})</span></h1>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-56"
          placeholder="Search by name or phone..." />
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>{['Name', 'Phone', 'License #', 'Member Since', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-white font-medium">{m.full_name}</td>
                <td className="px-4 py-3 text-gray-300">{m.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-300 font-mono text-xs">{m.license_number ?? '—'}</td>
                <td className="px-4 py-3 text-gray-300">{format(new Date(m.member_since), 'MMM dd, yyyy')}</td>
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
