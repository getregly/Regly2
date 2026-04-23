// src/pages/api/checkout.js
// Creates a Stripe Checkout session with automatic transfer to merchant
// Regly keeps 15%, merchant receives 85% automatically via Stripe Connect

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const REGLY_FEE_PERCENT = 15 // Regly takes 15%

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tierId, restaurantId, stripePriceId } = req.body

    if (!stripePriceId) {
      return res.status(400).json({ error: 'Missing Stripe price ID' })
    }

    // 1. Get and verify the authenticated user
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (!user || authErr) return res.status(401).json({ error: 'Unauthorized' })
    const userId = user.id

    // 2. Fetch the restaurant's Stripe Connect account ID
    const { data: restaurant, error: restErr } = await supabase
      .from('restaurants')
      .select('stripe_account_id, stripe_onboarding_complete, name')
      .eq('id', restaurantId)
      .single()

    if (restErr) throw restErr

    // 3. Fetch the tier price to calculate the application fee
    const { data: tier, error: tierErr } = await supabase
      .from('membership_tiers')
      .select('price_monthly')
      .eq('id', tierId)
      .single()

    if (tierErr) throw tierErr

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // 4. Calculate Regly's fee in cents
    const priceInCents = Math.round(tier.price_monthly * 100)
    const reglyFeeCents = Math.round(priceInCents * (REGLY_FEE_PERCENT / 100))

    // 5. Build the session — with or without Connect depending on setup status
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/success?tier=${tierId}&restaurant=${restaurantId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/customer`,
      metadata: {
        tierId,
        restaurantId,
        userId: userId || '',
      },
    }

    // 6. If merchant has completed Stripe Connect onboarding, route through their account
    if (restaurant.stripe_account_id && restaurant.stripe_onboarding_complete) {
      // application_fee_amount tells Stripe to keep this amount for Regly
      // The rest (85%) transfers automatically to the merchant's connected account
      sessionParams.subscription_data = {
        application_fee_percent: REGLY_FEE_PERCENT,
        transfer_data: {
          destination: restaurant.stripe_account_id,
        },
        metadata: {
          tierId,
          restaurantId,
          userId: userId || '',
        },
      }
    } else {
      // Merchant not yet connected — payments go to Regly account only
      // Flag this so we can handle it manually or prompt merchant to connect
      console.warn(`Restaurant ${restaurant.name} (${restaurantId}) does not have Stripe Connect set up. Payment will go to Regly account.`)
      sessionParams.subscription_data = {
        metadata: {
          tierId,
          restaurantId,
          userId: userId || '',
          connect_missing: 'true',
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return res.status(200).json({ url: session.url })

  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}
