import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Home, Package, Leaf } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import type { Listing } from '../types'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const listingId = params.get('listing_id')

  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    if (!listingId) return
    supabase
      .from('listings')
      .select('title, price, listing_images(url, order_index)')
      .eq('id', listingId)
      .single()
      .then(({ data }) => { if (data) setListing(data as Listing) })
  }, [listingId])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-border bg-background px-4 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">EcoConecta</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-foreground">¡Pago exitoso!</h1>
          <p className="mb-6 text-muted-foreground">
            Tu compra ha sido procesada correctamente. Recibirás un correo de confirmación pronto.
          </p>

          {listing && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{listing.title}</p>
                <p className="text-sm text-muted-foreground">${listing.price?.toFixed(2)} USD</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/">
                <Home className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            {listingId && (
              <Button asChild variant="outline" className="w-full">
                <Link to={`/listing/${listingId}`}>Ver publicación</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
