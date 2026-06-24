import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Clock, Phone, MessageCircle, Mail,
  Tag, Star, ShoppingCart, Heart, Leaf, AlertCircle,
  ChevronLeft, ChevronRight, CheckCircle,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import type { Listing } from '../types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} días`
}

function buildWhatsAppLink(phone: string, title: string) {
  let clean = phone.replace(/\D/g, '')
  // Número ecuatoriano local (0XXXXXXXXX → 593XXXXXXXXX)
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '593' + clean.slice(1)
  }
  const msg = encodeURIComponent(
    `Hola, vi tu publicación "${title}" en EcoConecta y me interesa. ¿Podemos coordinar?`
  )
  return `https://wa.me/${clean}?text=${msg}`
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, session } = useAuth()

  const [listing, setListing]   = useState<Listing | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [imageIdx, setImageIdx] = useState(0)
  const [purchasing, setPurchasing] = useState(false)
  const [isLiked, setIsLiked]   = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    supabase
      .from('listings')
      .select(`
        *,
        profiles(id, full_name, username, avatar_url, phone, location, created_at),
        categories(id, name, slug, icon),
        conditions(id, name, slug, description),
        listing_images(id, url, order_index)
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Publicación no encontrada.')
        } else {
          const sorted = {
            ...data,
            listing_images: [...(data.listing_images ?? [])].sort(
              (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
            ),
          }
          setListing(sorted as Listing)
        }
        setLoading(false)
      })
  }, [id])

  async function handleBuy() {
    if (!user || !session) {
      navigate('/login')
      return
    }
    if (!listing) return

    setPurchasing(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/swift-handler`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ listing_id: listing.id }),
        }
      )
      const { url, error: fnError } = await res.json()
      if (fnError || !url) throw new Error(fnError ?? 'Error al crear la sesión de pago')
      window.location.href = url
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setPurchasing(false)
    }
  }

  async function toggleFavorite() {
    if (!user) { navigate('/login'); return }
    if (isLiked) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listing!.id)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: listing!.id })
    }
    setIsLiked(v => !v)
  }

  const images: string[] = listing?.listing_images?.map(img => img.url) ?? []
  const mainImage = images[imageIdx] ?? 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando publicación…</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">{error ?? 'Publicación no encontrada'}</h2>
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
    )
  }

  const seller = listing.profiles
  const isDonation = listing.type === 'donation'
  const sellerName = seller?.full_name ?? seller?.username ?? 'Usuario'
  const sellerInitials = sellerName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const memberSince = seller?.created_at
    ? new Date(seller.created_at).toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">EcoConecta</span>
          </Link>
          <button
            onClick={toggleFavorite}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
          >
            <Heart className={cn('h-5 w-5 transition-colors', isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary">
              <img
                src={mainImage}
                alt={listing.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop'
                }}
              />

              <Badge
                className={cn(
                  'absolute left-3 top-3 border-0 font-medium',
                  listing.status === 'completed'
                    ? 'bg-gray-700 text-white'
                    : isDonation
                    ? 'bg-[var(--donation)] text-white'
                    : 'bg-[var(--sale)] text-black',
                )}
              >
                {listing.status === 'completed' ? 'Vendido' : isDonation ? 'Donación' : 'Venta'}
              </Badge>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIdx(i => Math.max(0, i - 1))}
                    disabled={imageIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImageIdx(i => Math.min(images.length - 1, i + 1))}
                    disabled={imageIdx === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={cn(
                      'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                      i === imageIdx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ── */}
          <div className="flex flex-col gap-5">
            {/* Title + Price */}
            <div>
              <div className="mb-1 flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold leading-tight text-foreground">{listing.title}</h1>
                {isDonation ? (
                  <span className="shrink-0 text-2xl font-bold text-primary">Gratis</span>
                ) : (
                  <span className="shrink-0 text-2xl font-bold text-foreground">
                    ${listing.price?.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(listing.created_at)}
                </span>
              </div>
            </div>

            {/* Category + Condition chips */}
            <div className="flex flex-wrap gap-2">
              {listing.categories && (
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                  <Tag className="h-3 w-3" />
                  {listing.categories.name}
                </span>
              )}
              {listing.conditions && (
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                  <Star className="h-3 w-3" />
                  {listing.conditions.name}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Descripción</h2>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Seller info */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Publicado por</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {sellerInitials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{sellerName}</p>
                  {seller?.username && (
                    <p className="text-xs text-muted-foreground">@{seller.username}</p>
                  )}
                  {memberSince && (
                    <p className="text-xs text-muted-foreground">Miembro desde {memberSince}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Action section ── */}
            {listing.status === 'completed' ? (
              /* SOLD: item already purchased */
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="mb-1 text-lg font-semibold text-foreground">Artículo vendido</h2>
                <p className="text-sm text-muted-foreground">
                  Este artículo ya no está disponible. Fue vendido por{' '}
                  <span className="font-medium text-foreground">{sellerName}</span>.
                </p>
              </div>
            ) : isDonation ? (
              /* DONATION: contact info */
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <h2 className="mb-1 font-semibold text-foreground">¿Te interesa esta donación?</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Contacta directamente al publicador para coordinar la entrega. Este artículo es gratuito.
                </p>

                <div className="space-y-2">
                  {seller?.phone ? (
                    <>
                      <a
                        href={buildWhatsAppLink(seller.phone, listing.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Contactar por WhatsApp
                      </a>
                      <a
                        href={`tel:${seller.phone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <Phone className="h-5 w-5" />
                        Llamar: {seller.phone}
                      </a>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          El publicador no tiene teléfono registrado.
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          Puedes ingresar a su perfil o volver más tarde.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-1 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium">Contacto:</span> {sellerName}
                    {seller?.location && <> · {seller.location}</>}
                  </div>
                </div>
              </div>
            ) : (
              /* SALE: Stripe checkout */
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="text-3xl font-bold text-foreground">${listing.price?.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    Pago seguro
                  </div>
                </div>

                <Button
                  onClick={handleBuy}
                  disabled={purchasing}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold"
                >
                  {purchasing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Procesando…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Comprar ahora · ${listing.price?.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  Recibirás confirmación al email registrado
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
