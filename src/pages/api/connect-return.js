// src/pages/api/connect-return.js
// Stripe redirects merchants here after completing Connect onboarding
// Verifies the account is fully set up and updates Supabase

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const { restaurant_id } = req.query

  if (!restaurant_id) {
    return res.redirect('/dashboard/business?connect=error')
  }

  try {
    // 1. Fetch the restaurant's Stripe account ID from Supabase
    const { data: restaurant, error: fetchErr } = await supabase
      .from('restaurants')
      .select('stripe_account_id, name')
      .eq('id', restaurant_id)
      .single()

    if (fetchErr || !restaurant?.stripe_account_id) {
      return res.redirect('/dashboard/business?connect=error')
    }

    // 2. Ask Stripe if the account has completed onboarding
    const account = await stripe.accounts.retrieve(restaurant.stripe_account_id)

    const isComplete = (
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled
    )

    // 3. Update Supabase with the onboarding status
    await supabase
      .from('restaurants')
      .update({ stripe_onboarding_complete: isComplete })
      .eq('id', restaurant_id)

    // 4. Redirect back to the business dashboard with a status flag
    if (isComplete) {
      return res.redirect('/dashboard/business?connect=success')
    } else {
      // Account created but not fully verified yet — Stripe may need more info
      return res.redirect('/dashboard/business?connect=pending')
    }

  } catch (err) {
    console.error('Connect return error:', err)
    return res.redirect('/dashboard/business?connect=error')
  }
}
