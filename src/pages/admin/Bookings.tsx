import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Booking, BookingStatus } from '../../types'
import { format } from 'date-fns'

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  confirmed: 'bg-green-900/40 text-green-300 border-green-700',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, profiles(full_name, phone), lanes(name, type)')
        .order('date', { ascending: false })
      if (data) setBookings(data as Booking[])
      setLoading(false)
    }
    fetchBookings()

    const channel = supabase.channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (id: string, status: BookingStatus) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Bookings</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>{['Member', 'Lane', 'Date', 'Time', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{b.profiles?.full_name}</p>
                  <p className="text-gray-500 text-xs">{b.profiles?.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{b.lanes?.name} <span className="text-gray-500">({b.lanes?.type})</span></td>
                <td className="px-4 py-3 text-gray-300">{format(new Date(b.date), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-3 text-gray-300">{b.start_time} – {b.end_time}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[b.status]}`}>
                    {b.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-xs text-green-400 hover:text-green-300 transition-colors">Confirm</button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
