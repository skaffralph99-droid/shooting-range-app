export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  member_since: string
  license_number: string | null
}

export interface Lane {
  id: string
  name: string
  type: 'pistol' | 'rifle' | 'mixed'
  max_distance_m: number
  is_active: boolean
  notes: string | null
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  user_id: string
  lane_id: string
  date: string
  start_time: string
  end_time: string
  status: BookingStatus
  notes: string | null
  profiles?: Pick<Profile, 'full_name' | 'phone'>
  lanes?: Pick<Lane, 'name' | 'type'>
}

export interface Session {
  id: string
  booking_id: string
  user_id: string
  date: string
  rounds_fired: number
  weapon_type: string
  notes: string | null
}

export interface Score {
  id: string
  session_id: string
  user_id: string
  round_number: number
  score: number
  distance_m: number
  target_type: string
}

export type InventoryCategory = 'ammo' | 'equipment' | 'target'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  caliber: string | null
  quantity: number
  min_stock: number
  unit_cost: number
  last_restocked: string | null
}
