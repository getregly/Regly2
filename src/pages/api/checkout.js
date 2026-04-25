// src/pages/api/checkout.js
// Creates a Stripe Checkout session with automatic 85/15 split via Connect
// Blocks checkout if merchant has not completed Stripe Connect onboarding

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

    if (!tierId || !restaurantId || !stripePriceId) {
      return res.status(400).json({ error: 'Missing required fields' })
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

    // 3. Block checkout if merchant has never started Connect onboarding
    // This is a new merchant who has not set up payments at all
    if (!restaurant.stripe_account_id) {
      return res.status(400).json({
        error: 'This business has not completed payment setup yet. Please check back soon.',
        code: 'CONNECT_INCOMPLETE',
      })
    }

    // 4. Block checkout if merchant started but did not finish onboarding
    if (!restaurant.stripe_onboarding_complete) {
      return res.status(400).json({
        error: 'This business is still completing their payment setup. Please check back soon.',
        code: 'CONNECT_INCOMPLETE',
      })
    }

    // 5. Verify with Stripe directly that the account is actually capable
    // Guards against accounts that were complete but later had issues
    const account = await stripe.accounts.retrieve(restaurant.stripe_account_id)
    const connectReady = account.charges_enabled && account.payouts_enabled

    if (!connectReady) {
      // Update DB to reflect real state — business will disappear from customer browse
      await supabase
        .from('restaurants')
        .update({ stripe_onboarding_complete: false })
        .eq('id', restaurantId)

      // Log for manual follow-up with the merchant
      console.error(
        `CONNECT_DEGRADED: Restaurant "${restaurant.name}" (${restaurantId}) ` +
        `account ${restaurant.stripe_account_id} — ` +
        `charges_enabled=${account.charges_enabled}, payouts_enabled=${account.payouts_enabled}. ` +
        `Business hidden from customer browse until resolved.`
      )

      return res.status(400).json({
        error: 'This business is temporarily unavailable. Please check back soon.',
        code: 'CONNECT_DEGRADED',
      })
    }

    // 6. Full Connect checkout — 85/15 split
    // on_behalf_of: charges appear as merchant on customer statements
    // application_fee_percent: Regly keeps 15% automatically on every charge
    // transfer_data.destination: 85% goes directly to merchant bank account
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?tier=${tierId}&restaurant=${restaurantId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer`,
      metadata: { tierId, restaurantId, userId: user.id },
      subscription_data: {
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
      },
    })

    return res.status(200).json({ url: session.url })

  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}
