import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { format, subDays, startOfDay } from 'date-fns'
import { BookingStatus, OrderStatus } from '../../types'

interface DashStats {
  totalMembers: number; activeBookings: number; pendingOrders: number
  lowStock: number; totalRevenue: number; todayBookings: number
  pendingBookings: number; totalScores: number
}
interface RecentBooking {
  id: string; date: string; start_time: string; status: BookingStatus
  profiles: { full_name: string } | null; lanes: { name: string } | null
}
interface RecentOrder {
  id: string; total: number; status: OrderStatus; created_at: string
  profiles: { full_name: string } | null
}
interface LowStockItem { id: string; name: string; category: string; quantity: number; min_stock: number }
interface TopMember { user_id: string; full_name: string; total_score: number; rank: number }

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  confirmed: 'bg-green-900/50 text-green-300 border-green-700',
  cancelled: 'bg-red-900/50 text-red-300 border-red-700',
  ready:     'bg-purple-900/50 text-purple-300 border-purple-700',
  completed: 'bg-blue-900/50 text-blue-300 border-blue-700',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats>({
    totalMembers: 0, activeBookings: 0, pendingOrders: 0,
    lowStock: 0, totalRevenue: 0, todayBookings: 0,
    pendingBookings: 0, totalScores: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [topMembers, setTopMembers] = useState<TopMember[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [
      { count: members },
      { count: activeBook },
      { count: pendingOrders },
      { count: lowStock },
      { data: revenue },
      { count: todayBook },
      { count: pendingBook },
      { count: scores },
      { data: bookings },
      { data: orders },
      { data: stock },
      { data: leaderboard },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('inventory').select('*', { count: 'exact', head: true }).filter('quantity', 'lte', 'min_stock'),
      supabase.from('orders').select('total').in('status', ['completed', 'confirmed', 'ready']),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('date', today),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('scores').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('id, date, start_time, status, profiles(full_name), lanes(name)').order('created_at', { ascending: false }).limit(6),
      supabase.from('orders').select('id, total, status, created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('inventory').select('id, name, category, quantity, min_stock').lte('quantity', 10).order('quantity').limit(5),
      supabase.rpc('get_leaderboard'),
    ])

    const totalRevenue = (revenue ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)
    setStats({
      totalMembers: members ?? 0,
      activeBookings: activeBook ?? 0,
      pendingOrders: pendingOrders ?? 0,
      lowStock: lowStock ?? 0,
      totalRevenue,
      todayBookings: todayBook ?? 0,
      pendingBookings: pendingBook ?? 0,
      totalScores: scores ?? 0,
    })
    if (bookings) setRecentBookings(bookings as RecentBooking[])
    if (orders) setRecentOrders(orders as RecentOrder[])
    if (stock) setLowStockItems(stock)
    if (leaderboard) setTopMembers(leaderboard.slice(0, 5))
    setLoading(false)
  }

  const updateBooking = async (id: string, status: BookingStatus) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setRecentBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const updateOrder = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-caliber-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-caliber-steel">Admin Dashboard</h1>
          <p className="text-caliber-dim text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM dd yyyy')}</p>
        </div>
        <button onClick={loadAll} className="px-3 py-1.5 bg-caliber-elevated hover:bg-caliber-muted text-caliber-steel/80 text-sm rounded-lg transition-colors">
          ↻ Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Members",      value: stats.totalMembers,                icon: '👥', color: 'border-blue-500',   link: '/admin/members',   sub: 'registered users' },
          { label: "Active Bookings",    value: stats.activeBookings,              icon: '📅', color: 'border-caliber-gold', link: '/admin/bookings',  sub: `${stats.pendingBookings} pending` },
          { label: "Pending Orders",     value: stats.pendingOrders,               icon: '📦', color: 'border-purple-500', link: '/admin/orders',    sub: 'need processing' },
          { label: "Today's Bookings",   value: stats.todayBookings,               icon: '🎯', color: 'border-green-500',  link: '/admin/bookings',  sub: format(new Date(), 'MMM dd') },
          { label: "Total Revenue",      value: `$${stats.totalRevenue.toFixed(0)}`,icon: '💰', color: 'border-yellow-500',link: '/admin/orders',    sub: 'all time orders' },
          { label: "Scores Logged",      value: stats.totalScores,                 icon: '🏆', color: 'border-caliber-gold', link: '/admin/scores',    sub: 'all time' },
          { label: "Low Stock Alerts",   value: stats.lowStock,                    icon: '⚠️', color: 'border-red-500',    link: '/admin/inventory', sub: 'items below min' },
          { label: "Total Points Given", value: '—',                               icon: '💎', color: 'border-pink-500',   link: '/admin/loyalty',   sub: 'loyalty program' },
        ].map((kpi, i) => (
          <Link key={i} to={kpi.link}
            className={`bg-caliber-surface border-l-4 ${kpi.color} border border-caliber-border rounded-xl p-4 hover:bg-caliber-elevated/60 transition-colors group`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caliber-dim text-xs font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-caliber-steel mt-1 group-hover:text-caliber-gold transition-colors">
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </p>
                <p className="text-caliber-dim/70 text-xs mt-0.5">{kpi.sub}</p>
              </div>
              <span className="text-2xl">{kpi.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Bookings — 2 cols */}
        <div className="lg:col-span-2 bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-caliber-border">
            <h2 className="text-caliber-steel font-bold">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-xs text-caliber-gold hover:text-caliber-gold-light">View all →</Link>
          </div>
          <div className="divide-y divide-caliber-border">
            {recentBookings.length === 0
              ? <p className="text-center text-caliber-muted py-8 text-sm">No bookings yet</p>
              : recentBookings.map(b => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-caliber-steel text-sm font-medium truncate">{b.profiles?.full_name ?? '—'}</p>
                  <p className="text-caliber-muted text-xs">{b.lanes?.name} · {b.date} {b.start_time}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusColors[b.status]}`}>
                  {b.status}
                </span>
                {b.status === 'pending' && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => updateBooking(b.id, 'confirmed')}
                      className="px-2 py-0.5 bg-green-800 hover:bg-green-700 text-green-300 rounded text-xs transition-colors">✓</button>
                    <button onClick={() => updateBooking(b.id, 'cancelled')}
                      className="px-2 py-0.5 bg-red-900 hover:bg-red-800 text-red-300 rounded text-xs transition-colors">✗</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Shooters */}
        <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-caliber-border">
            <h2 className="text-caliber-steel font-bold">🏆 Top Shooters</h2>
            <Link to="/leaderboard" className="text-xs text-caliber-gold hover:text-caliber-gold-light">Full →</Link>
          </div>
          <div className="divide-y divide-caliber-border">
            {topMembers.length === 0
              ? <p className="text-center text-caliber-muted py-8 text-sm">No scores yet</p>
              : topMembers.map((m, i) => (
              <div key={m.user_id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <span className="text-sm text-caliber-steel font-medium">{m.full_name}</span>
                </div>
                <span className="text-caliber-gold font-bold text-sm">{m.total_score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-caliber-border">
            <h2 className="text-caliber-steel font-bold">Recent Shop Orders</h2>
            <Link to="/admin/orders" className="text-xs text-caliber-gold hover:text-caliber-gold-light">View all →</Link>
          </div>
          <div className="divide-y divide-caliber-border">
            {recentOrders.length === 0
              ? <p className="text-center text-caliber-muted py-8 text-sm">No orders yet</p>
              : recentOrders.map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-caliber-steel text-sm font-medium">{o.profiles?.full_name ?? '—'}</p>
                  <p className="text-caliber-muted text-xs">{format(new Date(o.created_at), 'MMM dd · HH:mm')}</p>
                </div>
                <span className="text-caliber-steel font-bold text-sm">${o.total.toFixed(2)}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusColors[o.status]}`}>
                  {o.status}
                </span>
                {o.status === 'pending' && (
                  <button onClick={() => updateOrder(o.id, 'confirmed')}
                    className="px-2 py-0.5 bg-blue-900 hover:bg-blue-800 text-blue-300 rounded text-xs flex-shrink-0">Confirm</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-caliber-border">
            <h2 className="text-caliber-steel font-bold">⚠️ Low Stock</h2>
            <Link to="/admin/inventory" className="text-xs text-caliber-gold hover:text-caliber-gold-light">Manage →</Link>
          </div>
          <div className="divide-y divide-caliber-border">
            {lowStockItems.length === 0
              ? <p className="text-center text-caliber-muted py-8 text-sm">All stock levels OK ✅</p>
              : lowStockItems.map(item => (
              <div key={item.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-caliber-steel text-sm font-medium truncate">{item.name}</p>
                  <span className={`text-xs font-bold ${item.quantity === 0 ? 'text-red-400' : 'text-caliber-gold'}`}>
                    {item.quantity === 0 ? 'OUT' : item.quantity}
                  </span>
                </div>
                <div className="h-1.5 bg-caliber-elevated rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, (item.quantity / item.min_stock) * 100)}%` }} />
                </div>
                <p className="text-caliber-dim/70 text-xs mt-1">Min: {item.min_stock}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="bg-caliber-surface border border-caliber-border rounded-xl p-5">
        <h2 className="text-caliber-steel font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { to: '/admin/bookings',  icon: '📅', label: 'Bookings' },
            { to: '/admin/members',   icon: '👥', label: 'Members' },
            { to: '/admin/scores',    icon: '🎯', label: 'Scores' },
            { to: '/admin/lanes',     icon: '🏗️', label: 'Lanes' },
            { to: '/admin/products',  icon: '🔪', label: 'Products' },
            { to: '/admin/orders',    icon: '📦', label: 'Orders' },
            { to: '/admin/inventory', icon: '📋', label: 'Inventory' },
            { to: '/admin/loyalty',   icon: '💎', label: 'Loyalty' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex flex-col items-center gap-1.5 p-3 bg-caliber-elevated hover:bg-caliber-muted rounded-xl transition-colors group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{a.icon}</span>
              <span className="text-xs text-caliber-dim group-hover:text-caliber-steel font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
