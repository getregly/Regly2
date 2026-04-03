import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { subscriptionId, subId } = req.body
  try {
    // Only cancel in Stripe if it's a real sub_... ID, not a session ID
    if (subscriptionId && subscriptionId.startsWith('sub_')) {
      await stripe.subscriptions.cancel(subscriptionId)
    }
    await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', subId)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
