// src/pages/api/create-stripe-price.js
// Called by admin dashboard when approving a business or activating a new tier
// Creates a Stripe Product + recurring Price, returns the price_id

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tier_id, tier_name, price_monthly, business_name } = req.body


  // ── Admin-only guard ────────────────────────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(token)
  if (!caller || authErr) return res.status(401).json({ error: 'Unauthorized' })
  if (caller.email !== 'sarrafian.josh@gmail.com') return res.status(403).json({ error: 'Forbidden — admin only' })

  if (!tier_id || !tier_name || !price_monthly || !business_name) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Create a Stripe Product
    const product = await stripe.products.create({
      name: `${business_name} — ${tier_name}`,
      metadata: {
        tier_id,
        business_name,
        source: 'regly',
      },
    })

    // 2. Create a recurring Price on that Product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price_monthly * 100), // convert dollars to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier_id,
        business_name,
        source: 'regly',
      },
    })

    // 3. Write the price ID back to membership_tiers in Supabase
    const { error: dbError } = await supabase
      .from('membership_tiers')
      .update({ stripe_price_id: price.id })
      .eq('id', tier_id)

    if (dbError) throw dbError

    return res.status(200).json({
      success: true,
      stripe_price_id: price.id,
      stripe_product_id: product.id,
    })

  } catch (err) {
    console.error('Stripe price creation error:', err)
    return res.status(500).json({ error: err.message })
  }
}
