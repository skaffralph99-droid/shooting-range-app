import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { UserLoyalty } from '../../types'

export default function Cart() {
  const { user } = useAuth()
  const { items, remove, updateQty, clear, total } = useCart()
  const navigate = useNavigate()
  const [loyalty, setLoyalty] = useState<UserLoyalty | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.rpc('get_user_loyalty', { uid: user!.id }).then(({ data }) => {
      if (data?.[0]) setLoyalty(data[0])
    })
  }, [user])

  const discountPct = loyalty?.discount_pct ?? 5
  const subtotal = total
  const discountAmount = subtotal * discountPct / 100
  const finalTotal = subtotal - discountAmount

  const placeOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user!.id,
        subtotal,
        discount_pct: discountPct,
        discount_amount: discountAmount,
        total: finalTotal,
        notes: notes || null,
      })
      .select().single()

    if (error || !order) { setLoading(false); return }

    await supabase.from('order_items').insert(
      items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))
    )
    clear()
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
      <p className="text-gray-400 mb-2">You also earned <span className="text-orange-400 font-bold">+{Math.round(finalTotal)} loyalty points</span>!</p>
      <p className="text-gray-500 text-sm mb-8">Our team will prepare your order. You'll be notified when it's ready.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/my-orders" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">View Orders</Link>
        <Link to="/shop" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">Continue Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🛒 Your Cart</h1>
        <Link to="/shop" className="text-sm text-orange-400 hover:text-orange-300">← Back to Shop</Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-gray-400 mb-4">Your cart is empty</p>
          <Link to="/shop" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Browse Shop</Link>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {items.map(item => {
            const discounted = item.product.price * (1 - discountPct / 100)
            return (
              <div key={item.product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-white font-medium">{item.product.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{item.product.category}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-orange-400 font-bold">${(discounted * item.quantity).toFixed(2)}</span>
                    {discountPct > 0 && <span className="text-gray-600 text-xs line-through">${(item.product.price * item.quantity).toFixed(2)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 bg-gray-800 text-white rounded hover:bg-gray-700">−</button>
                  <span className="text-white w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 bg-gray-800 text-white rounded hover:bg-gray-700">+</button>
                </div>
                <button onClick={() => remove(item.product.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-2">✕</button>
              </div>
            )
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>{loyalty?.badge_emoji} {loyalty?.tier_name} discount ({discountPct}%)</span>
              <span>−${discountAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-base">
              <span>Total</span><span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-orange-400 mb-4">🎁 You'll earn +{Math.round(finalTotal)} loyalty points for this purchase</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Order notes (optional)..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-orange-500" />
          <button onClick={placeOrder} disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
            {loading ? 'Placing Order...' : `Place Order · $${finalTotal.toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  )
}
