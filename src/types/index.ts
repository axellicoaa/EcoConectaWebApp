// ── Legacy display type (used in UI components) ──────────────
export interface EcoObject {
  id: string
  title: string
  description: string
  category: string
  categorySlug: string
  type: 'donation' | 'sale'
  price?: number
  image: string
  location: string
  timeAgo: string
  seller: { name: string; id: string }
}

// ── Database types ────────────────────────────────────────────
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Condition {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  type: 'donation' | 'sale'
  price: number | null
  category_id: string | null
  condition_id: string | null
  location: string | null
  status: 'active' | 'reserved' | 'completed'
  created_at: string
  updated_at: string
  profiles?: Profile
  categories?: Category
  conditions?: Condition
  listing_images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  order_index: number
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}
