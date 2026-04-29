// src/pages/api/checkout.js
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

    // 3. Verify tier exists and is not paused
    const { data: tier, error: tierFetchErr } = await supabase
      .from('membership_tiers')
      .select('id, is_paused, stripe_price_id')
      .eq('id', tierId)
      .single()

    if (tierFetchErr || !tier) {
      return res.status(404).json({ error: 'Membership tier not found.' })
    }

    if (tier.is_paused) {
      return res.status(400).json({
        error: 'This membership is not currently accepting new members. Please check back soon.',
        code: 'TIER_PAUSED',
      })
    }

    // 4. Block if merchant has no Connect account at all
    if (!restaurant.stripe_account_id) {
      return res.status(400).json({
        error: 'This business has not completed payment setup yet.',
        code: 'CONNECT_INCOMPLETE',
      })
    }

    // 5. Block if merchant has not finished onboarding
    if (!restaurant.stripe_onboarding_complete) {
      return res.status(400).json({
        error: 'This business is still completing their payment setup.',
        code: 'CONNECT_INCOMPLETE',
      })
    }

    // 6. Verify Stripe account capabilities
    const account = await stripe.accounts.retrieve(restaurant.stripe_account_id)

    if (!account.charges_enabled || !account.payouts_enabled) {
      await supabase
        .from('restaurants')
        .update({ stripe_onboarding_complete: false })
        .eq('id', restaurantId)
      return res.status(400).json({
        error: 'This business is temporarily unavailable.',
        code: 'CONNECT_DEGRADED',
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getregly.com'

    // 6. For Express accounts use the correct Connect approach
    // Express accounts require the price to be retrieved or created
    // on the connected account — not the platform account
    // We create a one-time price on the connected account for this session

    // First retrieve the platform price to get the amount
    const platformPrice = await stripe.prices.retrieve(stripePriceId)
    console.log('Platform price:', JSON.stringify({
      id: platformPrice.id,
      unit_amount: platformPrice.unit_amount,
      currency: platformPrice.currency,
      recurring: platformPrice.recurring,
    }))

    // Create a product on the connected account
    const connectedProduct = await stripe.products.create(
      { name: restaurant.name },
      { stripeAccount: restaurant.stripe_account_id }
    )

    // Create a price on the connected account
    const connectedPrice = await stripe.prices.create(
      {
        product: connectedProduct.id,
        unit_amount: platformPrice.unit_amount,
        currency: platformPrice.currency,
        recurring: platformPrice.recurring,
      },
      { stripeAccount: restaurant.stripe_account_id }
    )


    // 7. Create checkout session on the connected account
    // application_fee_amount is in cents — 15% of the subscription amount
    const feeAmount = Math.round(platformPrice.unit_amount * (REGLY_FEE_PERCENT / 100))

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: connectedPrice.id, quantity: 1 }],
        success_url: `${appUrl}/success?tier=${tierId}&restaurant=${restaurantId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/customer`,
        metadata: { tierId, restaurantId, userId: user.id },
        subscription_data: {
          application_fee_percent: REGLY_FEE_PERCENT,
          metadata: { tierId, restaurantId, userId: user.id },
        },
      },
      { stripeAccount: restaurant.stripe_account_id }
    )

    return res.status(200).json({ url: session.url })

  } catch (err) {
    console.error('Checkout error:', err.message, err.type, err.code)
    return res.status(500).json({ error: err.message })
  }
}
