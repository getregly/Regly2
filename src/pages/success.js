import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Success() {
  const router = useRouter()
  const { tier, restaurant, session_id } = router.query
  const [done, setDone] = useState(false)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!tier || !restaurant || !session_id || done) return
    recordSubscription()
  }, [tier, restaurant, session_id])

  async function recordSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('subscriptions').select('id').eq('customer_id', user.id).eq('tier_id', tier).eq('status', 'active').single()

    if (!existing) {
      await supabase.from('subscriptions').insert({
        customer_id: user.id,
        restaurant_id: restaurant,
        tier_id: tier,
        stripe_subscription_id: session_id,
        status: 'active',
        start_date: new Date().toISOString(),
      })
    }

    const { data: tierData } = await supabase
      .from('membership_tiers').select('name, perks, restaurants(name)').eq('id', tier).single()
    setInfo(tierData)
    setDone(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />
      <div className="max-w-md w-full">
        <div className="text-6xl mb-6">✦</div>
        <h1 className="font-serif text-4xl font-bold text-gold mb-4">You're a Regular!</h1>
        {info && <p className="text-cream text-lg mb-2">Welcome to <strong>{info.restaurants?.name}</strong></p>}
        {info && (
          <div className="card my-6 text-left">
            <p className="text-gold font-semibold mb-1">{info.name} Membership</p>
            <p className="text-muted text-sm">{info.perks}</p>
            <div className="mt-4 pt-4 border-t border-muted border-opacity-20">
              <p className="text-cream text-sm font-semibold mb-1">How to redeem your perks:</p>
              <p className="text-muted text-sm leading-relaxed">
                Simply give your <span className="text-gold font-semibold">phone number</span> at the counter when you visit. 
                Staff will look you up and apply your membership perks instantly — no app, no card, no QR code needed.
              </p>
            </div>
          </div>
        )}
        {!info && <p className="text-muted mb-8">Your membership is now active.</p>}
        <button onClick={() => router.push('/dashboard/customer')} className="btn-gold w-full py-4">
          Go to My Dashboard
        </button>
      </div>
    </div>
  )
}
