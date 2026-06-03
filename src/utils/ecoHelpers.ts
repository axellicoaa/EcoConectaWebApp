import type { EcoObject, Listing } from '../types'

export function getDefaultImage(name: string, categorySlug: string): string {
  const n = name.toLowerCase()
  const c = categorySlug.toLowerCase()

  if (c === 'electronicos' || n.includes('laptop') || n.includes('celular') || n.includes('tablet'))
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'

  if (c === 'hogar' || n.includes('mesa') || n.includes('silla') || n.includes('sofa'))
    return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400'

  if (c === 'libros' || n.includes('libro') || n.includes('novela'))
    return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'

  if (c === 'ropa' || n.includes('camisa') || n.includes('pantalon') || n.includes('chaqueta'))
    return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400'

  return 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400'
}

export function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Ahora mismo'
  if (m < 60)  return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `Hace ${h} ${h === 1 ? 'hora' : 'horas'}`
  const d = Math.floor(h / 24)
  if (d < 7)   return `Hace ${d} ${d === 1 ? 'día' : 'días'}`
  const w = Math.floor(d / 7)
  return `Hace ${w} ${w === 1 ? 'semana' : 'semanas'}`
}

export function mapListingToEcoObject(listing: Listing): EcoObject {
  const firstImage = listing.listing_images
    ?.sort((a, b) => a.order_index - b.order_index)[0]?.url

  const categorySlug = listing.categories?.slug ?? ''
  const image = firstImage ?? getDefaultImage(listing.title, categorySlug)

  return {
    id:           listing.id,
    title:        listing.title,
    description:  listing.description,
    category:     listing.categories?.name ?? '',
    categorySlug,
    type:         listing.type,
    price:        listing.price ?? undefined,
    image,
    location:     listing.location ?? '',
    timeAgo:      formatTimeAgo(listing.created_at),
    seller: {
      name: listing.profiles?.full_name ?? listing.profiles?.username ?? 'Usuario',
      id:   listing.user_id,
    },
  }
}

export function filterObjects(objects: EcoObject[], category: string, search: string): EcoObject[] {
  return objects.filter(obj => {
    const matchCat = category === 'all' || obj.categorySlug === category
    const q = search.toLowerCase()
    const matchSearch = !q || obj.title.toLowerCase().includes(q) || obj.description.toLowerCase().includes(q)
    return matchCat && matchSearch
  })
}
