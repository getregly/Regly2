// src/pages/api/cancel.js
// Cancels a Stripe subscription at period end and updates Supabase
// Customers keep access until the end of their current billing period

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Service role needed to update subscriptions table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // 1. Verify the customer is authenticated
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (!user || authErr) return res.status(401).json({ error: 'Unauthorized' })

  const { subscriptionId, subId } = req.body
  if (!subId) return res.status(400).json({ error: 'Missing subscription ID' })

  try {
    // 2. Verify this subscription belongs to the requesting customer
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('id, customer_id, stripe_subscription_id, status')
      .eq('id', subId)
      .single()

    if (subErr || !sub) return res.status(404).json({ error: 'Subscription not found' })
    if (sub.customer_id !== user.id) return res.status(403).json({ error: 'Forbidden' })
    if (sub.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' })

    // 3. Cancel in Stripe at period end — customer keeps access until billing period ends
    const stripeSubId = subscriptionId || sub.stripe_subscription_id
    if (stripeSubId && stripeSubId.startsWith('sub_')) {
      await stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: true,
      })
    }

    // 4. Mark as cancelled in Supabase
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subId)

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('Cancel error:', err)
    return res.status(500).json({ error: err.message })
  }
}
