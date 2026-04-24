// src/pages/api/checkout.js
// Creates a Stripe Checkout session with automatic transfer to merchant
// Regly keeps 15%, merchant receives 85% via Stripe Connect

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const REGLY_FEE_PERCENT = 15

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

    // 1. Verify authenticated user
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (!user || authErr) return res.status(401).json({ error: 'Unauthorized' })

    // 2. Fetch restaurant Stripe Connect details
    const { data: restaurant, error: restErr } = await supabase
      .from('restaurants')
      .select('stripe_account_id, stripe_onboarding_complete, name')
      .eq('id', restaurantId)
      .single()
    if (restErr) throw restErr

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getregly.com'

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/success?tier=${tierId}&restaurant=${restaurantId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/customer`,
      metadata: {
        tierId,
        restaurantId,
        userId: user.id,
      },
    }

    if (restaurant.stripe_account_id && restaurant.stripe_onboarding_complete) {
      // Stripe recommended approach for platforms:
      // - on_behalf_of: charges appear as being made by the merchant
      // - application_fee_percent: Regly keeps 15% automatically
      // - transfer_data.destination: remaining 85% routes to merchant's bank
      sessionParams.subscription_data = {
        application_fee_percent: REGLY_FEE_PERCENT,
        on_behalf_of: restaurant.stripe_account_id,
        transfer_data: {
          destination: restaurant.stripe_account_id,
        },
        metadata: {
          tierId,
          restaurantId,
          userId: user.id,
        },
      }
    } else {
      // Merchant has not completed Connect onboarding yet
      // Payment goes to Regly account — flag for manual reconciliation
      console.warn(`Restaurant ${restaurant.name} (${restaurantId}) missing Stripe Connect. Payment going to Regly account.`)
      sessionParams.subscription_data = {
        metadata: {
          tierId,
          restaurantId,
          userId: user.id,
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
