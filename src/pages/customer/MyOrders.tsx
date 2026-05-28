import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Order, OrderStatus } from '../../types'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

const statusStyles: Record<OrderStatus, string> = {
  pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  confirmed: 'bg-blue-900/40 text-blue-300 border-blue-700',
  ready:     'bg-purple-900/40 text-purple-300 border-purple-700',
  completed: 'bg-green-900/40 text-green-300 border-green-700',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700',
}
const statusLabels: Record<OrderStatus, string> = {
  pending: '⏳ Pending', confirmed: '✅ Confirmed', ready: '📦 Ready for pickup',
  completed: '✓ Completed', cancelled: '✗ Cancelled',
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*, products(name, category))')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data as Order[]); setLoading(false) })
  }, [user])

  if (loading) return <div className="text-caliber-dim">Loading orders...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-caliber-steel mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-caliber-muted mb-4">No orders yet.</p>
          <Link to="/shop" className="px-4 py-2 bg-caliber-gold text-caliber-dark rounded-lg text-sm">Visit Shop</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-caliber-surface border border-caliber-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-caliber-dim text-xs">Order · {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</p>
                  <p className="text-caliber-steel font-bold text-lg mt-0.5">${order.total.toFixed(2)}</p>
                  {order.discount_pct > 0 && (
                    <p className="text-green-400 text-xs">Saved ${order.discount_amount.toFixed(2)} ({order.discount_pct}% off)</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusStyles[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.order_items?.map(item => (
                  <span key={item.id} className="text-xs bg-caliber-elevated text-caliber-steel/80 px-2 py-1 rounded">
                    {item.products?.name} ×{item.quantity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
