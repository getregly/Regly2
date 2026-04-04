import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const MAX_TIERS = 5
const MAX_PERKS = 8

function newTier() {
  return { name: '', price: '', perks: [''] }
}

export default function Onboard() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    business_name: '',
    address: '',
    city: 'Chicago',
    description: '',
    tiers: [newTier()],
  })

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth?role=business'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single()
      if (profile?.role !== 'business') { router.push('/'); return }

      const { data: existing } = await supabase
        .from('onboarding_submissions')
        .select('id, status')
        .eq('user_id', u.id)
        .single()

      if (existing) setDone(true)
      setUser(u)
      setLoading(false)
    }
    init()
  }, [])

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function setTierField(ti, key, val) {
    setForm(f => {
      const tiers = f.tiers.map((t, i) => i === ti ? { ...t, [key]: val } : t)
      return { ...f, tiers }
    })
  }

  function setPerk(ti, pi, val) {
    setForm(f => {
      const tiers = f.tiers.map((t, i) => {
        if (i !== ti) return t
        const perks = t.perks.map((p, j) => j === pi ? val : p)
        return { ...t, perks }
      })
      return { ...f, tiers }
    })
  }

  function addPerk(ti) {
    setForm(f => {
      const tiers = f.tiers.map((t, i) => {
        if (i !== ti || t.perks.length >= MAX_PERKS) return t
        return { ...t, perks: [...t.perks, ''] }
      })
      return { ...f, tiers }
    })
  }

  function removePerk(ti, pi) {
    setForm(f => {
      const tiers = f.tiers.map((t, i) => {
        if (i !== ti) return t
        const perks = t.perks.filter((_, j) => j !== pi)
        return { ...t, perks: perks.length === 0 ? [''] : perks }
      })
      return { ...f, tiers }
    })
  }

  function addTier() {
    if (form.tiers.length >= MAX_TIERS) return
    setForm(f => ({ ...f, tiers: [...f.tiers, newTier()] }))
  }

  function removeTier(ti) {
    if (form.tiers.length <= 1) return
    setForm(f => ({ ...f, tiers: f.tiers.filter((_, i) => i !== ti) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    for (let i = 0; i < form.tiers.length; i++) {
      const t = form.tiers[i]
      if (!t.name.trim()) {
        setError(`Please enter a name for Tier ${i + 1}`)
        return
      }
      if (!t.price || isNaN(t.price) || Number(t.price) <= 0) {
        setError(`Please enter a valid price for "${t.name || `Tier ${i + 1}`}"`)
        return
      }
      const filledPerks = t.perks.filter(p => p.trim())
      if (filledPerks.length === 0) {
        setError(`Please add at least one perk for "${t.name || `Tier ${i + 1}`}"`)
        return
      }
    }

    setSaving(true)
    try {
      // Clean empty perks before saving
      const cleanedTiers = form.tiers.map(t => ({
        ...t,
        perks: t.perks.filter(p => p.trim())
      }))

      const { error: err } = await supabase.from('onboarding_submissions').insert({
        user_id:       user.id,
        business_name: form.business_name,
        address:       form.address,
        city:          form.city,
        description:   form.description,
        tiers:         JSON.stringify(cleanedTiers),
        status:        'pending',
      })
      if (err) throw err
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gold">Loading...</div>

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />
        <div className="max-w-md w-full card">
          <div className="text-5xl mb-4">✦</div>
          <h2 className="font-serif text-2xl font-bold text-gold mb-3">Submission Received</h2>
          <p className="text-cream mb-2">Thank you for submitting your business details.</p>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Our team will review your application and reach out within 1–2 business days. Once approved your membership tiers will go live on Regly.
          </p>
          <p className="text-muted text-sm mb-6">
            Questions? Email us at <span className="text-gold">getregly@gmail.com</span>
          </p>
          <button onClick={() => router.push('/dashboard/business')} className="btn-gold w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      <div className="mb-10">
        <button onClick={() => router.push('/dashboard/business')} className="text-muted text-sm hover:text-gold mb-4 block">← Back to Dashboard</button>
        <h1 className="font-serif text-3xl font-bold text-cream mb-2"><span className="text-gold">✦</span> Set Up Your Business</h1>
        <p className="text-muted">Fill out the details below. Our team will review and get you live within 1–2 business days.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Business Info */}
        <div className="card space-y-4">
          <h2 className="font-serif text-xl font-bold text-gold">Business Information</h2>
          <div>
            <label className="label">Business Name</label>
            <input className="input" required value={form.business_name}
              onChange={e => setField('business_name', e.target.value)}
              placeholder="e.g. Vicenzo's Pizza" />
          </div>
          <div>
            <label className="label">Street Address</label>
            <input className="input" required value={form.address}
              onChange={e => setField('address', e.target.value)}
              placeholder="e.g. 123 N. Michigan Avenue" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" required value={form.city}
              onChange={e => setField('city', e.target.value)}
              placeholder="Chicago" />
          </div>
          <div>
            <label className="label">Short Description</label>
            <textarea className="input" required rows={3} value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="One or two sentences about your business — this appears on the Regly customer dashboard." />
          </div>
        </div>

        {/* Membership Tiers */}
        <div className="card space-y-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-gold">Membership Tiers</h2>
            <p className="text-muted text-sm mt-1">
              Create between 1 and {MAX_TIERS} membership tiers. Name them however makes sense for your business and set your own pricing.
            </p>
          </div>

          {form.tiers.map((tier, ti) => (
            <div key={ti} className="border-t border-muted border-opacity-20 pt-6 first:border-0 first:pt-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gold font-semibold text-sm">Tier {ti + 1}</span>
                {form.tiers.length > 1 && (
                  <button type="button" onClick={() => removeTier(ti)}
                    className="text-muted text-xs hover:text-red-400 transition-colors">
                    Remove tier
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Tier Name</label>
                  <input className="input" required value={tier.name}
                    onChange={e => setTierField(ti, 'name', e.target.value)}
                    placeholder="e.g. Regular, VIP, Early Bird, Coffee Lover..." />
                </div>

                <div>
                  <label className="label">Monthly Price ($)</label>
                  <input className="input" required type="number" min="1" value={tier.price}
                    onChange={e => setTierField(ti, 'price', e.target.value)}
                    placeholder="0" />
                </div>

                <div>
                  <label className="label">Perks</label>
                  <p className="text-muted text-xs mb-3">Add each perk separately. Be specific — customers see exactly what they get before subscribing.</p>
                  <div className="space-y-2">
                    {tier.perks.map((perk, pi) => (
                      <div key={pi} className="flex gap-2 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        <input
                          className="input flex-1"
                          value={perk}
                          onChange={e => setPerk(ti, pi, e.target.value)}
                          placeholder={`Perk ${pi + 1}`}
                        />
                        {tier.perks.length > 1 && (
                          <button type="button" onClick={() => removePerk(ti, pi)}
                            className="text-muted hover:text-red-400 text-lg leading-none shrink-0 transition-colors">
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {tier.perks.length < MAX_PERKS && (
                    <button type="button" onClick={() => addPerk(ti)}
                      className="mt-3 text-gold text-xs hover:underline">
                      + Add another perk
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {form.tiers.length < MAX_TIERS && (
            <button type="button" onClick={addTier}
              className="btn-outline w-full py-3 text-sm">
              + Add Another Tier
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-40 border border-red-500 text-red-300 rounded px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-gold w-full py-4 text-base">
          {saving ? 'Submitting...' : 'Submit for Review'}
        </button>

        <p className="text-muted text-xs text-center">
          By submitting you agree to Regly's 85/15 revenue split. You'll keep 85% of all membership revenue.
        </p>
      </form>
    </div>
  )
}
