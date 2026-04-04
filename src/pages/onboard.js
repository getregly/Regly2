import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

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
    tiers: [
      { name: 'Bronze Tier', price: '', perks: '' },
      { name: 'Silver Tier', price: '', perks: '' },
      { name: 'Gold Tier',   price: '', perks: '' },
    ]
  })

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth?role=business'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single()
      if (profile?.role !== 'business') { router.push('/'); return }

      // Check if already submitted
      const { data: existing } = await supabase
        .from('onboarding_submissions')
        .select('id, status')
        .eq('user_id', u.id)
        .single()

      if (existing) {
        setDone(true)
      }

      setUser(u)
      setLoading(false)
    }
    init()
  }, [])

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function setTier(i, key, val) {
    setForm(f => {
      const tiers = [...f.tiers]
      tiers[i] = { ...tiers[i], [key]: val }
      return { ...f, tiers }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validate tiers
    for (let i = 0; i < form.tiers.length; i++) {
      const t = form.tiers[i]
      if (!t.price || isNaN(t.price) || Number(t.price) <= 0) {
        setError(`Please enter a valid price for ${t.name}`)
        return
      }
      if (!t.perks.trim()) {
        setError(`Please enter perks for ${t.name}`)
        return
      }
    }

    setSaving(true)
    try {
      const { error: err } = await supabase.from('onboarding_submissions').insert({
        user_id:       user.id,
        business_name: form.business_name,
        address:       form.address,
        city:          form.city,
        description:   form.description,
        tiers:         JSON.stringify(form.tiers),
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
            Our team will review your application and reach out to you at your registered email within 1–2 business days. Once approved, your membership tiers will go live on Regly.
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
        <p className="text-muted">Fill out the form below. Our team will review your details and get you live within 1–2 business days.</p>
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
            <p className="text-muted text-sm mt-1">Define your 3 membership tiers. Each tier should offer slightly more value than its monthly price.</p>
          </div>

          {form.tiers.map((tier, i) => (
            <div key={i} className="border-t border-muted border-opacity-20 pt-6 first:border-0 first:pt-0">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  i === 0 ? 'bg-amber-900 text-amber-300' :
                  i === 1 ? 'bg-gray-700 text-gray-200' :
                  'bg-yellow-800 text-yellow-300'
                }`}>
                  {tier.name}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Monthly Price ($)</label>
                  <input className="input" required type="number" min="1" value={tier.price}
                    onChange={e => setTier(i, 'price', e.target.value)}
                    placeholder={i === 0 ? '10' : i === 1 ? '20' : '35'} />
                  <p className="text-muted text-xs mt-1">Recommended: ${i === 0 ? '10' : i === 1 ? '20' : '35'}/month</p>
                </div>

                <div>
                  <label className="label">Perks Included</label>
                  <textarea className="input" required rows={3} value={tier.perks}
                    onChange={e => setTier(i, 'perks', e.target.value)}
                    placeholder={
                      i === 0 ? 'e.g. 1 free item per visit, 10% off every order' :
                      i === 1 ? 'e.g. 2 free items per visit, free delivery once a month, 10% off orders' :
                      'e.g. 3 free items per visit, unlimited free delivery, 15% off all orders'
                    } />
                  <p className="text-muted text-xs mt-1">Be specific — customers see exactly what they get before subscribing.</p>
                </div>
              </div>
            </div>
          ))}
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
