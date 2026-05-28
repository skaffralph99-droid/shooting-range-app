import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Order, OrderStatus } from '../../types'
import { format } from 'date-fns'

const STATUSES: OrderStatus[] = ['pending','confirmed','ready','completed','cancelled']
const statusStyles: Record<OrderStatus, string> = {
  pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  confirmed: 'bg-blue-900/40 text-blue-300 border-blue-700',
  ready:     'bg-purple-900/40 text-purple-300 border-purple-700',
  completed: 'bg-green-900/40 text-green-300 border-green-700',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(full_name), order_items(*, products(name, category))')
        .order('created_at', { ascending: false })
      if (data) setOrders(data as Order[])
      setLoading(false)
    }
    fetch()
    const channel = supabase.channel('orders-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const pending = orders.filter(o => o.status === 'pending').length

  if (loading) return <div className="text-caliber-dim">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-caliber-steel">
          Orders {pending > 0 && <span className="ml-2 text-sm bg-caliber-gold text-caliber-dark px-2 py-0.5 rounded-full">{pending} pending</span>}
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-caliber-gold text-caliber-dark' : 'bg-caliber-elevated text-caliber-dim hover:text-caliber-steel'}`}>
            {s} {s !== 'all' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-caliber-elevated/40"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-caliber-steel font-semibold">{order.profiles?.full_name}</p>
                  <p className="text-caliber-muted text-xs">{format(new Date(order.created_at), 'MMM dd, yyyy · HH:mm')}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusStyles[order.status]}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-caliber-steel font-bold">${order.total.toFixed(2)}</p>
                  {order.discount_pct > 0 && (
                    <p className="text-green-400 text-xs">{order.discount_pct}% off applied</p>
                  )}
                </div>
                <span className="text-caliber-muted">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-caliber-border p-4">
                <div className="mb-4">
                  <p className="text-caliber-dim text-xs font-semibold uppercase mb-2">Items</p>
                  <div className="flex flex-wrap gap-2">
                    {order.order_items?.map(item => (
                      <span key={item.id} className="text-sm bg-caliber-elevated text-caliber-steel/80 px-3 py-1 rounded-lg">
                        {item.products?.name} ×{item.quantity} · ${(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
                {order.notes && <p className="text-caliber-dim text-sm mb-4">📝 {order.notes}</p>}
                <div className="flex gap-2 flex-wrap">
                  <p className="text-caliber-muted text-xs self-center mr-2">Update status:</p>
                  {STATUSES.filter(s => s !== order.status).map(s => (
                    <button key={s} onClick={() => updateStatus(order.id, s)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize ${statusStyles[s]}`}>
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-caliber-muted py-8">No {filter === 'all' ? '' : filter} orders</p>}
      </div>
    </div>
  )
}
