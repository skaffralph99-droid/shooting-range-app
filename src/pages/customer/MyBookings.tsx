import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Booking } from '../../types'
import { format } from 'date-fns'

const statusColors = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  confirmed: 'bg-green-900/40 text-green-300 border-green-700',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700',
}

export default function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bookings').select('*, lanes(name, type)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .then(({ data }) => { if (data) setBookings(data as Booking[]); setLoading(false) })
  }, [user])

  const cancelBooking = async (id: string) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No bookings yet. <a href="/book" className="text-orange-400 hover:underline">Book a lane →</a></div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{b.lanes?.name} <span className="text-gray-500 text-sm">({b.lanes?.type})</span></p>
                <p className="text-gray-400 text-sm mt-0.5">{format(new Date(b.date), 'MMM dd, yyyy')} · {b.start_time} – {b.end_time}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[b.status]}`}>
                  {b.status.toUpperCase()}
                </span>
                {b.status === 'pending' && (
                  <button onClick={() => cancelBooking(b.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
