import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Lane } from '../../types'

export default function BookLane() {
  const { user } = useAuth()
  const [lanes, setLanes] = useState<Lane[]>([])
  const [selectedLane, setSelectedLane] = useState<string>('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('lanes').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setLanes(data)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.from('bookings').insert({
      user_id: user!.id,
      lane_id: selectedLane,
      date,
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
      status: 'pending',
    })
    setLoading(false)
    if (error) setError(error.message)
    else { setSuccess(true); setSelectedLane(''); setDate(''); setStartTime(''); setEndTime(''); setNotes('') }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Book a Lane</h1>
      {success && (
        <div className="mb-4 bg-green-900/30 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
          ✅ Booking submitted! Awaiting confirmation.
          <button onClick={() => setSuccess(false)} className="ml-2 underline">Book another</button>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Lane</label>
            <select
              value={selectedLane}
              onChange={e => setSelectedLane(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">-- Choose a lane --</option>
              {lanes.map(lane => (
                <option key={lane.id} value={lane.id}>
                  {lane.name} ({lane.type}) — {lane.max_distance_m}m
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
              rows={2} placeholder="Any special requirements..." />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {loading ? 'Submitting...' : 'Submit Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}
