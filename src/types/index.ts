export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string; full_name: string; phone: string | null
  avatar_url: string | null; role: UserRole
  member_since: string; license_number: string | null
}
export interface Lane {
  id: string; name: string; type: 'pistol' | 'rifle' | 'mixed'
  max_distance_m: number; is_active: boolean; notes: string | null
}
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export interface Booking {
  id: string; user_id: string; lane_id: string; date: string
  start_time: string; end_time: string; status: BookingStatus; notes: string | null
  profiles?: Pick<Profile, 'full_name' | 'phone'>
  lanes?: Pick<Lane, 'name' | 'type'>
}
export interface Session {
  id: string; booking_id: string; user_id: string; date: string
  rounds_fired: number; weapon_type: string; notes: string | null
}
export interface Score {
  id: string; session_id: string; user_id: string; round_number: number
  score: number; distance_m: number; target_type: string
}
export type InventoryCategory = 'ammo' | 'equipment' | 'target'
export interface InventoryItem {
  id: string; name: string; category: InventoryCategory; caliber: string | null
  quantity: number; min_stock: number; unit_cost: number; last_restocked: string | null
}
export type ProductCategory = 'knife' | 'ammo' | 'target' | 'accessory' | 'safety'
export interface Product {
  id: string; name: string; category: ProductCategory; description: string | null
  price: number; image_url: string | null; stock: number; is_active: boolean
}
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
export interface Order {
  id: string; user_id: string; subtotal: number; discount_pct: number
  discount_amount: number; total: number; status: OrderStatus
  notes: string | null; created_at: string
  profiles?: Pick<Profile, 'full_name'>
  order_items?: OrderItem[]
}
export interface OrderItem {
  id: string; order_id: string; product_id: string; quantity: number; unit_price: number
  products?: Pick<Product, 'name' | 'category'>
}
export interface LoyaltyTier {
  name: string; min_points: number; discount_pct: number; color: string; badge_emoji: string
}
export interface UserLoyalty {
  total_points: number; tier_name: string; discount_pct: number
  tier_color: string; badge_emoji: string
  next_tier_name: string | null; next_tier_min: number | null; points_to_next: number
}
export interface LeaderboardEntry {
  user_id: string; full_name: string; total_score: number
  sessions_count: number; best_score: number; avg_score: number; rank: number
}
export interface CartItem { product: Product; quantity: number }
