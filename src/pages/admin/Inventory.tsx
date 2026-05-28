import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { InventoryItem } from '../../types'

const categoryColors = {
  ammo: 'bg-caliber-gold/20 text-caliber-gold-light border-caliber-gold/60',
  equipment: 'bg-blue-900/40 text-blue-300 border-blue-700',
  target: 'bg-purple-900/40 text-purple-300 border-purple-700',
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'ammo', caliber: '', quantity: 0, min_stock: 5, unit_cost: 0 })

  useEffect(() => {
    supabase.from('inventory').select('*').order('category')
      .then(({ data }) => { if (data) setItems(data); setLoading(false) })
  }, [])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('inventory').insert(form).select().single()
    if (!error && data) { setItems(prev => [...prev, data]); setShowForm(false) }
  }

  const updateQty = async (id: string, qty: number) => {
    await supabase.from('inventory').update({ quantity: qty }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  if (loading) return <div className="text-caliber-dim">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-caliber-steel">Inventory</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-caliber-gold hover:bg-caliber-gold-light text-caliber-dark rounded-lg text-sm font-medium transition-colors">
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-caliber-surface border border-caliber-gold/60 rounded-xl p-5 mb-6">
          <h2 className="text-caliber-steel font-semibold mb-4">New Item</h2>
          <form onSubmit={addItem} className="grid grid-cols-2 gap-3">
            <input placeholder="Item name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="col-span-2 bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm focus:outline-none focus:border-caliber-gold" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm focus:outline-none focus:border-caliber-gold">
              <option value="ammo">Ammo</option>
              <option value="equipment">Equipment</option>
              <option value="target">Target</option>
            </select>
            <input placeholder="Caliber (optional)" value={form.caliber} onChange={e => setForm({...form, caliber: e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm focus:outline-none focus:border-caliber-gold" />
            <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})} required
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm focus:outline-none focus:border-caliber-gold" />
            <input type="number" placeholder="Min stock alert" value={form.min_stock} onChange={e => setForm({...form, min_stock: +e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm focus:outline-none focus:border-caliber-gold" />
            <input type="number" step="0.01" placeholder="Unit cost ($)" value={form.unit_cost} onChange={e => setForm({...form, unit_cost: +e.target.value})}
              className="bg-caliber-elevated border border-caliber-muted rounded-lg px-3 py-2 text-caliber-steel text-sm focus:outline-none focus:border-caliber-gold" />
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
            <tr>{['Item', 'Category', 'Caliber', 'Qty', 'Min Stock', 'Unit Cost', 'Adjust'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-caliber-border">
            {items.map(item => (
              <tr key={item.id} className={`hover:bg-caliber-elevated/50 ${item.quantity <= item.min_stock ? 'bg-red-900/10' : ''}`}>
                <td className="px-4 py-3 text-caliber-steel font-medium">
                  {item.name}
                  {item.quantity <= item.min_stock && <span className="ml-2 text-xs text-red-400">⚠ Low stock</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${categoryColors[item.category]}`}>
                    {item.category.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-caliber-dim">{item.caliber ?? '—'}</td>
                <td className="px-4 py-3 text-caliber-steel font-bold">{item.quantity}</td>
                <td className="px-4 py-3 text-caliber-dim">{item.min_stock}</td>
                <td className="px-4 py-3 text-caliber-steel/80">${item.unit_cost}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))}
                      className="w-6 h-6 bg-caliber-muted hover:bg-caliber-dim text-caliber-steel rounded text-xs flex items-center justify-center">−</button>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-caliber-muted hover:bg-caliber-dim text-caliber-steel rounded text-xs flex items-center justify-center">+</button>
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
