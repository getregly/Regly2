import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

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
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    // ── New subscription created via checkout ────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, tierId, restaurantId } = session.metadata || {}

      if (!userId || !tierId || !restaurantId) {
        console.error('Missing metadata in checkout session:', session.id)
        return res.status(200).json({ received: true })
      }

      const stripeSubscriptionId = session.subscription
      if (!stripeSubscriptionId) {
        console.error('No subscription ID on session:', session.id)
        return res.status(200).json({ received: true })
      }

      // Fetch the full subscription from Stripe to get period end
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)

      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('customer_id', userId)
        .eq('tier_id', tierId)
        .eq('status', 'active')
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('subscriptions').insert({
          customer_id: userId,
          restaurant_id: restaurantId,
          tier_id: tierId,
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: session.customer,
          status: 'active',
          start_date: new Date().toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
        })
        if (error) console.error('Supabase insert error:', error)
        else console.log(`✓ Subscription created: ${stripeSubscriptionId}`)
      } else {
        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          })
          .eq('customer_id', userId)
          .eq('tier_id', tierId)
      }
    }

    // ── Subscription updated — handles cancel_at_period_end ──────
    // Fires when customer cancels (sets cancel_at_period_end=true)
    // Also fires on renewal (updates current_period_end)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      const updateData = {
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      }

      // If cancellation was reversed (customer resubscribed)
      if (!subscription.cancel_at_period_end && subscription.status === 'active') {
        updateData.status = 'active'
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', subscription.id)

      if (error) console.error('Supabase update error on subscription.updated:', error)
      else console.log(`✓ Subscription updated: ${subscription.id} cancel_at_period_end=${subscription.cancel_at_period_end}`)
    }

    // ── Subscription fully deleted — period has ended ────────────
    // Fires when cancel_at_period_end subscription finally expires
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancel_at_period_end: false,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) console.error('Supabase cancel error:', error)
      else console.log(`✓ Subscription fully cancelled: ${subscription.id}`)
    }

    // ── Payment failed on renewal — card declined ────────────────
    // Mark subscription as past_due so business knows and customer loses perks
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
      if (invoice.subscription) {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription)

        if (error) console.error('Supabase past_due error:', error)
        else console.log(`✓ Subscription marked past_due: ${invoice.subscription}`)
      }
    }

    // ── Payment succeeded on renewal — reactivate if past_due ────
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object
      if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            cancel_at_period_end: false,
          })
          .eq('stripe_subscription_id', invoice.subscription)

        if (error) console.error('Supabase renewal error:', error)
        else console.log(`Subscription renewed: ${invoice.subscription}`)
      }
    }

    // ── Chargeback / dispute created ─────────────────────────────
    // Fires when a customer disputes a charge with their bank
    // Marks the subscription as disputed for manual review
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object

      console.error(
        `DISPUTE CREATED: charge ${dispute.charge}, ` +
        `amount $${(dispute.amount / 100).toFixed(2)}, ` +
        `reason: ${dispute.reason}. Manual review required.`
      )

      try {
        // Trace back from charge to subscription
        const charge = await stripe.charges.retrieve(dispute.charge)
        if (charge.invoice) {
          const invoice = await stripe.invoices.retrieve(charge.invoice)
          if (invoice.subscription) {
            const { error } = await supabase
              .from('subscriptions')
              .update({ status: 'disputed' })
              .eq('stripe_subscription_id', invoice.subscription)

            if (error) console.error('Supabase dispute update error:', error)
            else console.log(`Subscription marked disputed: ${invoice.subscription}`)
          }
        }
      } catch (disputeErr) {
        console.error('Error processing dispute:', disputeErr.message)
      }
    }

  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: err.message })
  }

  return res.status(200).json({ received: true })
}
