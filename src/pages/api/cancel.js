// src/pages/api/cancel.js
// Sets subscription to cancel at period end
// Customer keeps access and perks until their billing period ends
// Webhook handles final status update when Stripe fires subscription.deleted

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // 1. Verify authenticated customer
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (!user || authErr) return res.status(401).json({ error: 'Unauthorized' })

  const { subscriptionId, subId } = req.body
  if (!subId) return res.status(400).json({ error: 'Missing subscription ID' })

  try {
    // 2. Verify ownership
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('id, customer_id, stripe_subscription_id, status, current_period_end')
      .eq('id', subId)
      .single()

    if (subErr || !sub) return res.status(404).json({ error: 'Subscription not found' })
    if (sub.customer_id !== user.id) return res.status(403).json({ error: 'Forbidden' })
    if (sub.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' })
    if (sub.cancel_at_period_end) return res.status(400).json({ error: 'Already pending cancellation' })

    // 3. Tell Stripe to cancel at period end — NOT immediately
    const stripeSubId = subscriptionId || sub.stripe_subscription_id
    if (stripeSubId && stripeSubId.startsWith('sub_')) {
      await stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: true,
      })
    }

    // 4. Mark as pending cancellation in Supabase
    // Status stays 'active' — customer keeps full access and perks
    // cancel_at_period_end = true signals the pending state
    // Webhook will set status = 'cancelled' when period actually ends
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subId)

    return res.status(200).json({
      ok: true,
      period_end: sub.current_period_end,
    })

  } catch (err) {
    console.error('Cancel error:', err)
    return res.status(500).json({ error: err.message })
  }
}
