import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { subscriptionIds } = req.body
  if (!subscriptionIds || !subscriptionIds.length) {
    return res.status(400).json({ error: 'No subscription IDs provided' })
  }

  const results = {}

  for (const id of subscriptionIds) {
    // Skip test/fake IDs from seeded data
    if (!id || id.startsWith('test_sub_')) {
      results[id] = null
      continue
    }
    try {
      const sub = await stripe.subscriptions.retrieve(id)
      results[id] = {
        status:               sub.status,
        current_period_end:   sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at:          sub.canceled_at,
      }
    } catch (err) {
      results[id] = null
    }
  }

  return res.status(200).json(results)
}
