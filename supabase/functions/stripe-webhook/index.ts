// Supabase Edge Function – Stripe Webhook
// Escucha el evento checkout.session.completed y marca el listing como vendido
//
// Deploy:  supabase functions deploy stripe-webhook
// Secret:  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// En Stripe Dashboard → Developers → Webhooks → Add endpoint:
//   URL: https://ieafehifrurvgslfddvs.supabase.co/functions/v1/stripe-webhook
//   Evento: checkout.session.completed

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  const body      = await req.text()

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2025-05-28.basil',
    httpClient: Stripe.createFetchHttpClient(),
  })

  // Verificar que la petición realmente viene de Stripe
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? '',
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook signature invalid'
    return new Response(`Webhook error: ${msg}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object as Stripe.Checkout.Session
    const listingId = session.metadata?.listing_id

    if (listingId) {
      // Usar service_role para bypassear RLS (el webhook actúa como sistema)
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )

      const { error } = await supabase
        .from('listings')
        .update({ status: 'completed' })
        .eq('id', listingId)

      if (error) {
        console.error('Error actualizando listing:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      console.log(`Listing ${listingId} marcado como vendido`)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
