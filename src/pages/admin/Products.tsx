import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Product, ProductCategory } from '../../types'

const CATS: ProductCategory[] = ['knife','ammo','target','accessory','safety']
const ICONS: Record<ProductCategory, string> = { knife:'🔪', ammo:'🔫', target:'🎯', accessory:'🎒', safety:'🦺' }

const empty = { name:'', category:'knife' as ProductCategory, description:'', price:0, stock:0, is_active:true, image_url:'' }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('products').select('*').order('category').order('name')
      .then(({ data }) => { if (data) setProducts(data); setLoading(false) })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const { data } = await supabase.from('products').update(form).eq('id', editing).select().single()
      if (data) setProducts(prev => prev.map(p => p.id === editing ? data : p))
    } else {
      const { data } = await supabase.from('products').insert(form).select().single()
      if (data) setProducts(prev => [...prev, data])
    }
    setShowForm(false); setEditing(null); setForm(empty)
  }

  const toggleActive = async (id: string, val: boolean) => {
    await supabase.from('products').update({ is_active: !val }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !val } : p))
  }

  const startEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, description: p.description ?? '', price: p.price, stock: p.stock, is_active: p.is_active, image_url: p.image_url ?? '' })
    setEditing(p.id); setShowForm(true)
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Shop Products <span className="text-gray-500 text-base">({products.length})</span></h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty) }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium">+ Add Product</button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-orange-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={save} className="grid grid-cols-2 gap-3">
            <input placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value as ProductCategory})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
              {CATS.map(c => <option key={c} value={c}>{ICONS[c]} {c}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Price ($)" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <input type="number" placeholder="Stock qty" value={form.stock} onChange={e => setForm({...form, stock: +e.target.value})} required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <input placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
              className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>{['Product','Category','Price','Stock','Status','Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.map(p => (
              <tr key={p.id} className={`hover:bg-gray-800/50 ${!p.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-gray-500 text-xs truncate max-w-xs">{p.description}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{ICONS[p.category]} {p.category}</td>
                <td className="px-4 py-3 text-white font-bold">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${p.stock <= 5 ? 'text-red-400' : 'text-gray-300'}`}>{p.stock}</span>
                  {p.stock <= 5 && p.stock > 0 && <span className="text-xs text-orange-400 ml-1">⚠ Low</span>}
                  {p.stock === 0 && <span className="text-xs text-red-400 ml-1">Out</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(p.id, p.is_active)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border transition-colors ${p.is_active ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                    {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(p)} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
