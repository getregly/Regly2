import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function BusinessDashboard() {
  const router = useRouter()
  const [restaurant, setRestaurant]   = useState(null)
  const [members, setMembers]         = useState([])
  const [stripeData, setStripeData]   = useState({})
  const [phone, setPhone]             = useState('')
  const [lookup, setLookup]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [searching, setSearching]     = useState(false)
  const [stats, setStats]             = useState({ revenue: 0, tierBreakdown: [] })

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'business') { router.push('/'); return }

    const { data: rest } = await supabase.from('restaurants').select('*').eq('owner_id', user.id).single()
    setRestaurant(rest)

    if (rest) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*, membership_tiers(name, price_monthly)')
        .eq('restaurant_id', rest.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false })

      if (subs && subs.length > 0) {
        const customerIds = subs.map(s => s.customer_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, phone')
          .in('id', customerIds)

        const merged = subs.map(s => ({
          ...s,
          profile: profiles?.find(p => p.id === s.customer_id) || null
        }))
        setMembers(merged)

        // Calculate stats
        const revenue = subs.reduce((sum, s) => sum + (s.membership_tiers?.price_monthly || 0), 0)
        const tierMap = {}
        subs.forEach(s => {
          const name = s.membership_tiers?.name || 'Unknown'
          tierMap[name] = (tierMap[name] || 0) + 1
        })
        setStats({ revenue, tierBreakdown: Object.entries(tierMap).map(([name, count]) => ({ name, count })) })

        // Fetch Stripe renewal/cancellation data
        const stripeIds = subs.map(s => s.stripe_subscription_id).filter(Boolean)
        if (stripeIds.length > 0) {
          try {
            const res = await fetch('/api/subscription-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionIds: stripeIds }),
            })
            const data = await res.json()
            setStripeData(data)
          } catch (err) {
            console.error('Stripe fetch error:', err)
          }
        }
      } else {
        setMembers([])
        setStats({ revenue: 0, tierBreakdown: [] })
      }
    }
    setLoading(false)
  }

  async function handlePhoneLookup(e) {
    e.preventDefault()
    if (!restaurant) return
    setSearching(true)
    setLookup(null)

    const cleaned = phone.replace(/\D/g, '')
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, phone')
      .eq('role', 'customer')

    const matchedProfile = profiles?.find(p =>
      (p.phone || '').replace(/\D/g, '') === cleaned
    )

    if (!matchedProfile) {
      setLookup(false)
      setSearching(false)
      return
    }

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*, membership_tiers(name, price_monthly)')
      .eq('customer_id', matchedProfile.id)
      .eq('restaurant_id', restaurant.id)
      .order('start_date', { ascending: false })
      .limit(1)

    if (!subs || subs.length === 0) {
      setLookup(false)
      setSearching(false)
      return
    }

    // Fetch Stripe data for this subscription
    let stripeInfo = null
    const subId = subs[0].stripe_subscription_id
    if (subId && !subId.startsWith('test_sub_')) {
      try {
        const res = await fetch('/api/subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionIds: [subId] }),
        })
        const data = await res.json()
        stripeInfo = data[subId]
      } catch (err) {}
    }

    setLookup({ ...subs[0], profile: matchedProfile, stripeInfo })
    setSearching(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function formatDate(unix) {
    if (!unix) return '—'
    return new Date(unix * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function renewalInfo(sub) {
    const stripe = stripeData[sub.stripe_subscription_id]
    if (!stripe) return null
    if (stripe.cancel_at_period_end) {
      return { label: 'Cancels on', date: formatDate(stripe.current_period_end), color: 'text-red-400' }
    }
    return { label: 'Renews on', date: formatDate(stripe.current_period_end), color: 'text-green-400' }
  }

  const reglyFee    = (stats.revenue * 0.15).toFixed(2)
  const ownerRevenue = (stats.revenue * 0.85).toFixed(2)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gold">Loading...</div>

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-bold text-cream"><span className="text-gold">✦</span> Business Dashboard</h1>
          <p className="text-muted mt-1">{restaurant?.name || 'Your Restaurant'}</p>
        </div>
        <button onClick={logout} className="btn-outline text-sm py-2 px-4">Log Out</button>
      </div>

      {!restaurant ? (
        <div className="card text-center py-12">
          <p className="text-muted text-lg">Your restaurant is not set up yet.</p>
          <p className="text-muted mt-2">Contact <span className="text-gold">getregly@gmail.com</span> to get onboarded.</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center py-5">
              <p className="font-serif text-3xl font-bold text-gold">{members.length}</p>
              <p className="text-muted text-xs mt-1">Active Members</p>
            </div>
            <div className="card text-center py-5">
              <p className="font-serif text-3xl font-bold text-gold">${stats.revenue}</p>
              <p className="text-muted text-xs mt-1">Monthly Revenue</p>
            </div>
            <div className="card text-center py-5">
              <p className="font-serif text-3xl font-bold text-gold">${ownerRevenue}</p>
              <p className="text-muted text-xs mt-1">Your Earnings (85%)</p>
            </div>
            <div className="card text-center py-5">
              <p className="font-serif text-3xl font-bold text-gold">${reglyFee}</p>
              <p className="text-muted text-xs mt-1">Regly Fee (15%)</p>
            </div>
          </div>

          {/* Tier Breakdown */}
          {stats.tierBreakdown.length > 0 && (
            <div className="card">
              <h2 className="font-serif text-xl font-bold text-gold mb-4">Members by Tier</h2>
              <div className="space-y-3">
                {stats.tierBreakdown.map(t => {
                  const pct = Math.round((t.count / members.length) * 100)
                  return (
                    <div key={t.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cream text-sm">{t.name}</span>
                        <span className="text-muted text-xs">{t.count} member{t.count !== 1 ? 's' : ''} · {pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-dark overflow-hidden">
                        <div className="h-full rounded-full bg-gold" style={{width:`${pct}%`}} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Phone Lookup */}
          <div className="card">
            <h2 className="font-serif text-xl font-bold text-gold mb-1">Member Lookup</h2>
            <p className="text-muted text-sm mb-5">Enter a customer's phone number to verify their membership.</p>
            <form onSubmit={handlePhoneLookup} className="flex gap-3">
              <input
                className="input flex-1"
                placeholder="(312) 555-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <button type="submit" disabled={searching} className="btn-gold px-6">
                {searching ? '...' : 'Search'}
              </button>
            </form>

            {lookup === false && (
              <div className="mt-4 p-4 bg-dark rounded border border-muted border-opacity-30">
                <p className="text-muted">❌ No Regly membership found for this number.</p>
              </div>
            )}

            {lookup && lookup.profile && (
              <div className="mt-4 p-4 bg-dark rounded border border-gold border-opacity-40">
                <p className="font-semibold text-lg mb-3">
                  {lookup.status === 'active'
                    ? <span className="text-gold">✓ Active Member</span>
                    : <span className="text-red-400">✗ Cancelled Membership</span>}
                </p>
                <div className="space-y-1 text-cream text-sm">
                  <p><span className="text-muted">Name:</span> {lookup.profile.name}</p>
                  <p><span className="text-muted">Phone:</span> {lookup.profile.phone}</p>
                  <p><span className="text-muted">Tier:</span> {lookup.membership_tiers?.name}</p>
                  <p><span className="text-muted">Price:</span> ${lookup.membership_tiers?.price_monthly}/mo</p>
                  <p><span className="text-muted">Member since:</span> {new Date(lookup.start_date).toLocaleDateString()}</p>
                  {lookup.stripeInfo && (
                    <p>
                      <span className="text-muted">
                        {lookup.stripeInfo.cancel_at_period_end ? 'Cancels on:' : 'Renews on:'}
                      </span>{' '}
                      <span className={lookup.stripeInfo.cancel_at_period_end ? 'text-red-400' : 'text-green-400'}>
                        {formatDate(lookup.stripeInfo.current_period_end)}
                      </span>
                    </p>
                  )}
                  {lookup.status === 'cancelled' && (
                    <p className="text-red-300 mt-2 text-xs">⚠ This membership has been cancelled. Perks are no longer active.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Member List */}
          <div className="card">
            <h2 className="font-serif text-xl font-bold text-gold mb-1">
              Active Members <span className="text-muted font-normal text-base">({members.length})</span>
            </h2>
            <p className="text-muted text-sm mb-5">Sorted by most recent. All current Regly subscribers at {restaurant.name}.</p>

            {members.length === 0 ? (
              <p className="text-muted text-center py-8">No active members yet. Share your Regly link to get started!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted border-opacity-30">
                      <th className="text-left text-muted pb-3 pr-4">Name</th>
                      <th className="text-left text-muted pb-3 pr-4">Phone</th>
                      <th className="text-left text-muted pb-3 pr-4">Tier</th>
                      <th className="text-left text-muted pb-3 pr-4">$/mo</th>
                      <th className="text-left text-muted pb-3 pr-4">Since</th>
                      <th className="text-left text-muted pb-3">Renewal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted divide-opacity-20">
                    {members.map(m => {
                      const renewal = renewalInfo(m)
                      return (
                        <tr key={m.id}>
                          <td className="py-3 pr-4 text-cream">{m.profile?.name || '—'}</td>
                          <td className="py-3 pr-4 text-cream">{m.profile?.phone || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className="bg-gold bg-opacity-20 text-gold text-xs px-2 py-1 rounded">{m.membership_tiers?.name}</span>
                          </td>
                          <td className="py-3 pr-4 text-cream">${m.membership_tiers?.price_monthly}</td>
                          <td className="py-3 pr-4 text-muted">{new Date(m.start_date).toLocaleDateString()}</td>
                          <td className="py-3">
                            {renewal
                              ? <span className={`text-xs ${renewal.color}`}>{renewal.label} {renewal.date}</span>
                              : <span className="text-muted text-xs">—</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
