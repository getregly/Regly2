import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'sarrafian.josh@gmail.com'

export default function Admin() {
  const router = useRouter()
  const [authorized, setAuthorized]   = useState(false)
  const [loading, setLoading]         = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [expanded, setExpanded]       = useState(null)
  const [approving, setApproving]     = useState(null)
  const [message, setMessage]         = useState('')

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/')
      return
    }
    setAuthorized(true)
    await loadSubmissions()
    setLoading(false)
  }

  async function loadSubmissions() {
    const { data } = await supabase
      .from('onboarding_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubmissions(data || [])
  }

  async function handleApprove(sub) {
    setApproving(sub.id)
    setMessage('')

    try {
      // 1. Get the business owner's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', sub.user_id)
        .single()

      if (!profile) throw new Error('Could not find business owner profile')

      // 2. Create the restaurant row
      const { data: restaurant, error: restErr } = await supabase
        .from('restaurants')
        .insert({
          name:        sub.business_name,
          description: sub.description,
          address:     sub.address,
          city:        sub.city,
          owner_id:    sub.user_id,
        })
        .select()
        .single()

      if (restErr) throw restErr

      // 3. Create membership tier rows (stripe_price_id left blank for manual Stripe setup)
      const tiers = JSON.parse(sub.tiers)
      const tierRows = tiers.map(t => ({
        restaurant_id:   restaurant.id,
        name:            `${sub.business_name} - ${t.name}`,
        price_monthly:   Number(t.price),
        perks:           Array.isArray(t.perks) ? t.perks.join(' | ') : t.perks,
        stripe_price_id: '',
      }))

      const { error: tierErr } = await supabase
        .from('membership_tiers')
        .insert(tierRows)

      if (tierErr) throw tierErr

      // 4. Mark submission as approved
      await supabase
        .from('onboarding_submissions')
        .update({ status: 'approved' })
        .eq('id', sub.id)

      setMessage(`✓ ${sub.business_name} approved and live on Regly. Don't forget to add Stripe price IDs for their tiers.`)
      await loadSubmissions()

    } catch (err) {
      setMessage(`❌ Error: ${err.message}`)
    } finally {
      setApproving(null)
    }
  }

  async function handleReject(sub) {
    if (!confirm(`Reject ${sub.business_name}? This will update their status to rejected.`)) return
    await supabase
      .from('onboarding_submissions')
      .update({ status: 'rejected' })
      .eq('id', sub.id)
    await loadSubmissions()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function parseTiers(sub) {
    try { return JSON.parse(sub.tiers) } catch { return [] }
  }

  function statusColor(status) {
    if (status === 'pending')  return 'text-yellow-400 bg-yellow-900 bg-opacity-30'
    if (status === 'approved') return 'text-green-400 bg-green-900 bg-opacity-30'
    if (status === 'rejected') return 'text-red-400 bg-red-900 bg-opacity-30'
    return 'text-muted'
  }

  const pending  = submissions.filter(s => s.status === 'pending')
  const reviewed = submissions.filter(s => s.status !== 'pending')

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gold">Loading...</div>
  if (!authorized) return null

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-bold text-cream"><span className="text-gold">✦</span> Regly Admin</h1>
          <p className="text-muted mt-1">Business onboarding queue</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/business')} className="text-muted text-sm hover:text-gold">My Dashboard</button>
          <button onClick={logout} className="btn-outline text-sm py-2 px-4">Log Out</button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm mb-6 ${message.startsWith('✓') ? 'bg-green-900 bg-opacity-40 border border-green-500 text-green-300' : 'bg-red-900 bg-opacity-40 border border-red-500 text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Pending submissions */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-bold text-gold mb-4">
          Pending Review <span className="text-muted font-normal text-base">({pending.length})</span>
        </h2>

        {pending.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-muted">No pending submissions. You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(sub => {
              const tiers = parseTiers(sub)
              const isOpen = expanded === sub.id
              return (
                <div key={sub.id} className="card">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-xl font-bold text-cream">{sub.business_name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-muted text-sm">{sub.address}, {sub.city}</p>
                      <p className="text-muted text-xs mt-1">Submitted {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => setExpanded(isOpen ? null : sub.id)}
                      className="text-gold text-sm hover:underline shrink-0 ml-4">
                      {isOpen ? 'Hide details' : 'View details'}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="mt-6 pt-6 border-t border-muted border-opacity-20 space-y-6">

                      <div>
                        <p className="text-muted text-xs tracking-widest uppercase mb-1">Description</p>
                        <p className="text-cream text-sm">{sub.description}</p>
                      </div>

                      <div>
                        <p className="text-muted text-xs tracking-widest uppercase mb-3">Membership Tiers</p>
                        <div className="space-y-4">
                          {tiers.map((tier, i) => (
                            <div key={i} className="bg-dark rounded-lg p-4 border border-muted border-opacity-20">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-cream font-semibold">{tier.name}</p>
                                <p className="text-gold font-bold">${tier.price}/mo</p>
                              </div>
                              <ul className="space-y-1">
                                {(Array.isArray(tier.perks) ? tier.perks : [tier.perks]).map((perk, j) => (
                                  <li key={j} className="flex items-start gap-2 text-muted text-sm">
                                    <span className="text-gold mt-0.5">·</span> {perk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stripe reminder */}
                      <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 border-opacity-30 rounded-lg p-4">
                        <p className="text-yellow-300 text-xs font-semibold mb-1">⚠ After approving — add Stripe price IDs</p>
                        <p className="text-yellow-200 text-xs opacity-80">
                          Go to stripe.com → Products → create one product per tier with recurring monthly pricing → copy each price_... ID → paste into Supabase membership_tiers table for this business.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={approving === sub.id}
                          className="btn-gold px-8 py-3 flex-1">
                          {approving === sub.id ? 'Approving...' : '✓ Approve & Go Live'}
                        </button>
                        <button
                          onClick={() => handleReject(sub)}
                          className="btn-outline px-6 py-3 text-sm hover:border-red-400 hover:text-red-400">
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reviewed submissions */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-bold text-gold mb-4">
            Previously Reviewed <span className="text-muted font-normal text-base">({reviewed.length})</span>
          </h2>
          <div className="space-y-3">
            {reviewed.map(sub => (
              <div key={sub.id} className="card flex items-center justify-between py-4">
                <div>
                  <p className="text-cream font-semibold">{sub.business_name}</p>
                  <p className="text-muted text-xs">{sub.address}, {sub.city}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(sub.status)}`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
