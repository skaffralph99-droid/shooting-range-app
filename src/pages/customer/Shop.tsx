import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { Product, ProductCategory, UserLoyalty } from '../../types'
import { Link } from 'react-router-dom'

const CATEGORIES: { value: ProductCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all',       label: 'All',        icon: '🛍️' },
  { value: 'knife',     label: 'Knives',     icon: '🔪' },
  { value: 'ammo',      label: 'Ammo',       icon: '🔫' },
  { value: 'target',    label: 'Targets',    icon: '🎯' },
  { value: 'safety',    label: 'Safety',     icon: '🦺' },
  { value: 'accessory', label: 'Accessories',icon: '🎒' },
]

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  knife: '🔪', ammo: '🔫', target: '🎯', accessory: '🎒', safety: '🦺'
}

export default function Shop() {
  const { user } = useAuth()
  const { add, count, total } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loyalty, setLoyalty] = useState<UserLoyalty | null>(null)
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: pData }, { data: lData }] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('category').order('name'),
        supabase.rpc('get_user_loyalty', { uid: user!.id }),
      ])
      if (pData) setProducts(pData)
      if (lData?.[0]) setLoyalty(lData[0])
      setLoading(false)
    }
    load()
  }, [user])

  const discountPct = loyalty?.discount_pct ?? 5
  const discounted = (price: number) => (price * (1 - discountPct / 100)).toFixed(2)

  const handleAdd = (product: Product) => {
    add(product)
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1200)
  }

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)

  if (loading) return <div className="text-gray-400">Loading shop...</div>

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🛍️ Shop</h1>
          <p className="text-gray-400 mt-1">
            Your <span className="text-orange-400 font-semibold">{loyalty?.badge_emoji} {loyalty?.tier_name}</span> tier gives you{' '}
            <span className="text-green-400 font-bold">{discountPct}% off</span> everything
          </p>
        </div>
        <Link to="/cart"
          className="relative flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-colors">
          🛒 Cart
          {count > 0 && (
            <span className="bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Discount Banner */}
      {discountPct > 0 && (
        <div className="bg-green-900/20 border border-green-700 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <span className="text-green-400 text-xl">🏷️</span>
          <p className="text-green-300 text-sm font-medium">
            {discountPct}% loyalty discount applied to all prices below · <Link to="/loyalty" className="underline hover:text-green-200">View your loyalty status →</Link>
          </p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setFilter(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.value ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col hover:border-gray-700 transition-colors">
            {/* Category Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {CATEGORY_ICONS[product.category]} {product.category}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs text-orange-400">Only {product.stock} left</span>
              )}
              {product.stock === 0 && (
                <span className="text-xs text-red-400">Out of stock</span>
              )}
            </div>

            {/* Name & Description */}
            <h3 className="text-white font-semibold mb-1 leading-tight">{product.name}</h3>
            <p className="text-gray-500 text-xs mb-4 flex-1 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">${discounted(product.price)}</span>
                {discountPct > 0 && (
                  <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                )}
              </div>
              {discountPct > 0 && (
                <span className="text-xs text-green-400">You save ${(product.price * discountPct / 100).toFixed(2)}</span>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => handleAdd(product)}
              disabled={product.stock === 0}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                added === product.id
                  ? 'bg-green-600 text-white'
                  : product.stock === 0
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}>
              {added === product.id ? '✓ Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
