import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser]               = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected]       = useState(null)
  const [tiers, setTiers]             = useState([])
  const [myMemberships, setMyMemberships] = useState([])
  const [loading, setLoading]         = useState(true)
  const [subscribing, setSubscribing] = useState(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { router.push('/'); return }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    if (profile?.role !== 'customer') { router.push('/'); return }
    setUser(profile)

    const { data: rests } = await supabase.from('restaurants').select('*').order('name')
    setRestaurants(rests || [])

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*, restaurants(name), membership_tiers(name, price_monthly, perks)')
      .eq('customer_id', u.id)
      .eq('status', 'active')
    setMyMemberships(subs || [])
    setLoading(false)
  }

  async function selectRestaurant(rest) {
    setSelected(rest)
    const { data } = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('restaurant_id', rest.id)
      .order('price_monthly')
    setTiers(data || [])
  }

  async function handleSubscribe(tier) {
    setSubscribing(tier.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tierId: tier.id,
          restaurantId: selected.id,
          stripePriceId: tier.stripe_price_id,
        }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setSubscribing(null)
    }
  }

  async function handleCancel(sub) {
    if (!confirm('Cancel this membership?')) return
    await fetch('/api/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: sub.stripe_subscription_id, subId: sub.id }),
    })
    setMyMemberships(m => m.filter(s => s.id !== sub.id))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isSubscribed = (restaurantId) =>
    myMemberships.some(m => m.restaurant_id === restaurantId)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gold">Loading...</div>

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-bold text-cream">
            <span className="text-gold">✦</span> Your Memberships
          </h1>
          <p className="text-muted mt-1">Welcome back, {user?.name}</p>
        </div>
        <button onClick={logout} className="btn-outline text-sm py-2 px-4">Log Out</button>
      </div>

      {/* My Active Memberships */}
      {myMemberships.length > 0 && (
        <div className="card mb-10">
          <h2 className="font-serif text-xl font-bold text-gold mb-5">Active Memberships</h2>
          <div className="space-y-3">
            {myMemberships.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-dark rounded border border-gold border-opacity-20">
                <div>
                  <p className="text-cream font-semibold">{sub.restaurants?.name}</p>
                  <p className="text-muted text-sm">{sub.membership_tiers?.name} · ${sub.membership_tiers?.price_monthly}/mo</p>
                  <p className="text-muted text-xs mt-1">{sub.membership_tiers?.perks}</p>
                </div>
                <button
                  onClick={() => handleCancel(sub)}
                  className="text-muted text-xs hover:text-red-400 transition-colors ml-4 shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restaurant Browser */}
      <div className="card">
        <h2 className="font-serif text-xl font-bold text-gold mb-1">Browse Restaurants</h2>
        <p className="text-muted text-sm mb-6">Click a restaurant to see membership options.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {restaurants.map(rest => (
            <button
              key={rest.id}
              onClick={() => selectRestaurant(rest)}
              className={`text-left p-5 rounded-lg border transition-all ${
                selected?.id === rest.id
                  ? 'border-gold bg-dark'
                  : 'border-muted border-opacity-30 hover:border-gold hover:border-opacity-60 bg-dark'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-cream font-semibold text-lg">{rest.name}</p>
                  <p className="text-gold text-sm">{rest.city}</p>
                  <p className="text-muted text-sm mt-2">{rest.description}</p>
                  <p className="text-muted text-xs mt-1">{rest.address}</p>
                </div>
                {isSubscribed(rest.id) && (
                  <span className="bg-gold bg-opacity-20 text-gold text-xs px-2 py-1 rounded ml-2 shrink-0">Member</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Tiers for selected restaurant */}
        {selected && (
          <div className="mt-8 border-t border-muted border-opacity-20 pt-8">
            <h3 className="font-serif text-lg font-bold text-cream mb-5">
              {selected.name} — Membership Tiers
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {tiers.map((tier, i) => (
                <div
                  key={tier.id}
                  className={`rounded-lg border p-5 flex flex-col ${
                    i === 2
                      ? 'border-gold bg-gold bg-opacity-10'
                      : 'border-muted border-opacity-30 bg-dark'
                  }`}
                >
                  {i === 2 && (
                    <span className="text-xs text-black bg-gold px-2 py-0.5 rounded self-start mb-3 font-semibold">
                      BEST VALUE
                    </span>
                  )}
                  <p className="font-serif text-lg font-bold text-cream">{tier.name}</p>
                  <p className="text-gold text-2xl font-bold mt-1">${tier.price_monthly}<span className="text-muted text-sm font-normal">/mo</span></p>
                  <p className="text-muted text-sm mt-3 flex-1">{tier.perks}</p>
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={subscribing === tier.id || isSubscribed(selected.id)}
                    className={`mt-5 w-full py-2.5 rounded font-semibold text-sm transition-all ${
                      isSubscribed(selected.id)
                        ? 'bg-green-900 text-green-400 cursor-default'
                        : 'btn-gold'
                    }`}
                  >
                    {isSubscribed(selected.id)
                      ? '✓ Already a Member'
                      : subscribing === tier.id
                      ? 'Redirecting...'
                      : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
