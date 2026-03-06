import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function BusinessDashboard() {
  const router = useRouter()
  const [user, setUser]           = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [members, setMembers]     = useState([])
  const [phone, setPhone]         = useState('')
  const [lookup, setLookup]       = useState(null) // null | false | {object}
  const [loading, setLoading]     = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { router.push('/'); return }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    if (profile?.role !== 'business') { router.push('/'); return }
    setUser(profile)

    const { data: rest } = await supabase.from('restaurants').select('*').eq('owner_id', u.id).single()
    setRestaurant(rest)

    if (rest) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*, profiles(name, phone), membership_tiers(name, price_monthly)')
        .eq('restaurant_id', rest.id)
        .eq('status', 'active')
      setMembers(subs || [])
    }
    setLoading(false)
  }

  async function handlePhoneLookup(e) {
    e.preventDefault()
    if (!restaurant) return
    setSearching(true)
    setLookup(null)
    const { data } = await supabase
      .from('subscriptions')
      .select('*, profiles(name, phone), membership_tiers(name, price_monthly)')
      .eq('restaurant_id', restaurant.id)
      .eq('status', 'active')
      .eq('profiles.phone', phone)
      .single()
    setLookup(data || false)
    setSearching(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gold">Loading...</div>

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-bold text-cream">
            <span className="text-gold">✦</span> Business Dashboard
          </h1>
          <p className="text-muted mt-1">{restaurant?.name || 'Your Restaurant'}</p>
        </div>
        <button onClick={logout} className="btn-outline text-sm py-2 px-4">Log Out</button>
      </div>

      {!restaurant ? (
        <div className="card text-center py-12">
          <p className="text-muted text-lg">Your restaurant is not set up yet.</p>
          <p className="text-muted mt-2">Contact <span className="text-gold">hello@getregly.com</span> to get onboarded.</p>
        </div>
      ) : (
        <div className="space-y-10">

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
                <p className="text-muted">❌ No active Regly membership found for this number.</p>
              </div>
            )}
            {lookup && lookup.profiles && (
              <div className="mt-4 p-4 bg-dark rounded border border-gold border-opacity-40">
                <p className="text-gold font-semibold text-lg">✓ Active Member</p>
                <div className="mt-2 space-y-1 text-cream">
                  <p><span className="text-muted">Name:</span> {lookup.profiles.name}</p>
                  <p><span className="text-muted">Tier:</span> {lookup.membership_tiers?.name}</p>
                  <p><span className="text-muted">Price:</span> ${lookup.membership_tiers?.price_monthly}/mo</p>
                  <p><span className="text-muted">Status:</span> <span className="text-green-400">{lookup.status}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Member List */}
          <div className="card">
            <h2 className="font-serif text-xl font-bold text-gold mb-1">
              Active Members <span className="text-muted font-normal text-base">({members.length})</span>
            </h2>
            <p className="text-muted text-sm mb-5">All current Regly subscribers at {restaurant.name}.</p>

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
                      <th className="text-left text-muted pb-3">Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted divide-opacity-20">
                    {members.map(m => (
                      <tr key={m.id}>
                        <td className="py-3 pr-4 text-cream">{m.profiles?.name}</td>
                        <td className="py-3 pr-4 text-cream">{m.profiles?.phone}</td>
                        <td className="py-3 pr-4">
                          <span className="bg-gold bg-opacity-20 text-gold text-xs px-2 py-1 rounded">
                            {m.membership_tiers?.name}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-cream">${m.membership_tiers?.price_monthly}</td>
                        <td className="py-3 text-muted">{new Date(m.start_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
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
