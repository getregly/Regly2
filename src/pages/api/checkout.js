import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { tierId, restaurantId, stripePriceId } = req.body

  if (!stripePriceId) {
    return res.status(400).json({ error: 'Stripe not configured for this tier yet.' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/success?tier=${tierId}&restaurant=${restaurantId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/customer`,
    metadata: {
      customer_user_id: user.id,
      tier_id: tierId,
      restaurant_id: restaurantId,
    },
  })

  res.json({ url: session.url })
}
