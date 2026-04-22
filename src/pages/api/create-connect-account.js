// src/pages/api/create-connect-account.js
// Called after a merchant is approved — creates their Stripe Connect account
// and returns a hosted onboarding URL for them to enter bank + identity details

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { restaurant_id, business_name, email } = req.body

  if (!restaurant_id || !business_name || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Check if this restaurant already has a Stripe account
    const { data: restaurant, error: fetchErr } = await supabase
      .from('restaurants')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', restaurant_id)
      .single()

    if (fetchErr) throw fetchErr

    let accountId = restaurant.stripe_account_id

    // 2. If no account yet, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',           // Express = Stripe-hosted onboarding, least friction
        email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
        metadata: {
          restaurant_id,
          business_name,
          source: 'regly',
        },
      })

      accountId = account.id

      // 3. Save the account ID to Supabase immediately
      const { error: saveErr } = await supabase
        .from('restaurants')
        .update({ stripe_account_id: accountId })
        .eq('id', restaurant_id)

      if (saveErr) throw saveErr
    }

    // 4. Generate a fresh onboarding link
    // (can be called again if merchant didn't finish the first time)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/business?connect=refresh`,
      return_url:  `${process.env.NEXT_PUBLIC_APP_URL}/api/connect-return?restaurant_id=${restaurant_id}`,
      type: 'account_onboarding',
    })

    return res.status(200).json({
      success: true,
      onboarding_url: accountLink.url,
      account_id: accountId,
    })

  } catch (err) {
    console.error('Stripe Connect error:', err)
    return res.status(500).json({ error: err.message })
  }
}
