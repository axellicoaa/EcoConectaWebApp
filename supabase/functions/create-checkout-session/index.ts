// Supabase Edge Function – Stripe Checkout Session
// Deploy: supabase functions deploy create-checkout-session
// Secret:  supabase secrets set STRIPE_SECRET_KEY=sk_test_...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2025-05-28.basil',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Build authenticated Supabase client from the caller's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { listing_id } = await req.json()
    if (!listing_id) {
      return new Response(JSON.stringify({ error: 'listing_id requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the listing with images
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('*, listing_images(url, order_index)')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: 'Publicación no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (listing.type !== 'sale' || !listing.price) {
      return new Response(JSON.stringify({ error: 'Esta publicación no está disponible para compra' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sortedImages = (listing.listing_images ?? [])
      .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    const imageUrls = sortedImages.map((img: { url: string }) => img.url).slice(0, 1)

    const origin = req.headers.get('origin') ?? 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: listing.title,
              description: listing.description?.slice(0, 500) ?? undefined,
              images: imageUrls.length > 0 ? imageUrls : undefined,
            },
            unit_amount: Math.round(Number(listing.price) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?listing_id=${listing_id}`,
      cancel_url: `${origin}/listing/${listing_id}`,
      metadata: { listing_id },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
