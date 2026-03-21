import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role key so webhook can write regardless of RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
  api: { bodyParser: false }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Extract metadata we passed during checkout
      const { userId, tierId, restaurantId } = session.metadata || {}

      if (!userId || !tierId || !restaurantId) {
        console.error('Missing metadata in checkout session:', session.id)
        return res.status(200).json({ received: true })
      }

      // Check if subscription already exists (avoid duplicates)
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('customer_id', userId)
        .eq('tier_id', tierId)
        .eq('status', 'active')
        .single()

      if (!existing) {
        const { error } = await supabase.from('subscriptions').insert({
          customer_id: userId,
          restaurant_id: restaurantId,
          tier_id: tierId,
          stripe_subscription_id: session.subscription || session.id,
          stripe_customer_id: session.customer,
          status: 'active',
          start_date: new Date().toISOString(),
        })

        if (error) {
          console.error('Supabase insert error:', error)
          return res.status(500).json({ error: error.message })
        }

        console.log(`✓ Subscription created for user ${userId} tier ${tierId}`)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('Supabase cancel error:', error)
        return res.status(500).json({ error: error.message })
      }

      console.log(`✓ Subscription cancelled: ${subscription.id}`)
    }

  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: err.message })
  }

  return res.status(200).json({ received: true })
}
