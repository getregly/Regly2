import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const MAX_TIERS = 5
const MAX_PERKS = 8

function newPerk() { return { description: '', type: 'unlimited', limit: 2 } }
function newTier() { return { name: '', price: '', perks: [newPerk()] } }

const inp = (focused) => ({
  width:'100%', padding:'11px 14px',
  background:'white',
  border:`1.5px solid ${focused ? '#C0442B' : '#E8E5DF'}`,
  borderRadius:8, fontSize:13, color:'#1A0A06', outline:'none',
  boxShadow: focused ? '0 0 0 3px rgba(192,68,43,0.1)' : 'none',
  fontFamily:'inherit', transition:'all 0.15s',
})

export default function Onboard() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState(null)
  const [agreed, setAgreed]   = useState(false)
  const [form, setForm] = useState({
    business_name:'', address:'', city:'Chicago', description:'', tiers:[newTier()],
  })

  useEffect(() => {
    async function init() {
      const { data:{ user:u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth?role=business'); return }
      const { data:profile } = await supabase.from('profiles').select('role').eq('id', u.id).single()
      if (profile?.role !== 'business') { router.push('/'); return }
      const { data:existing } = await supabase.from('onboarding_submissions').select('id,status').eq('user_id', u.id).single()
      if (existing) setDone(true)
      setUser(u)
      setLoading(false)
    }
    init()
  }, [])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function setTierField(ti, k, v) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => i===ti ? {...t,[k]:v} : t) }))
  }

  function setPerkField(ti, pi, k, v) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => {
      if (i !== ti) return t
      return { ...t, perks: t.perks.map((p,j) => j===pi ? {...p,[k]:v} : p) }
    })}))
  }

  function addPerk(ti) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) =>
      i!==ti || t.perks.length>=MAX_PERKS ? t : {...t, perks:[...t.perks, newPerk()]}
    )}))
  }

  function removePerk(ti, pi) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => {
      if (i!==ti) return t
      const p = t.perks.filter((_,j) => j!==pi)
      return {...t, perks: p.length===0 ? [newPerk()] : p}
    })}))
  }

  function addTier() {
    if (form.tiers.length >= MAX_TIERS) return
    setForm(f => ({ ...f, tiers: [...f.tiers, newTier()] }))
  }

  function removeTier(ti) {
    if (form.tiers.length <= 1) return
    setForm(f => ({ ...f, tiers: f.tiers.filter((_,i) => i!==ti) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!agreed) { setError('Please agree to the Regly Merchant Terms of Service.'); return }
    for (let i=0; i<form.tiers.length; i++) {
      const t = form.tiers[i]
      if (!t.name.trim()) { setError(`Please enter a name for Tier ${i+1}`); return }
      if (!t.price || isNaN(t.price) || Number(t.price)<=0) { setError(`Please enter a valid price for Tier ${i+1}`); return }
      const validPerks = t.perks.filter(p => p.description.trim())
      if (!validPerks.length) { setError(`Please add at least one perk for "${t.name}"`); return }
      for (const p of t.perks.filter(p => p.description.trim())) {
        if (p.type === 'limited' && (!p.limit || isNaN(p.limit) || Number(p.limit) < 1)) {
          setError(`Please set a valid usage limit for perk "${p.description}" in "${t.name}"`); return
        }
      }
    }
    setSaving(true)
    try {
      const cleanedTiers = form.tiers.map(t => ({
        ...t,
        perks: t.perks
          .filter(p => p.description.trim())
          .map(p => ({
            description: p.description.trim(),
            type: p.type,
            limit: p.type === 'limited' ? Number(p.limit) : null,
          }))
      }))
      const { error:err } = await supabase.from('onboarding_submissions').insert({
        user_id: user.id, business_name: form.business_name,
        address: form.address, city: form.city,
        description: form.description,
        tiers: JSON.stringify(cleanedTiers),
        status: 'pending',
      })
      if (err) throw err

      setDone(true)
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F0E8'}}>
      <p style={{color:'#8A7A6A', fontFamily:'system-ui'}}>Loading...</p>
    </div>
  )

  if (done) return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', fontFamily:"'DM Sans', system-ui, sans-serif"}}>
      <div style={{background:'white', borderRadius:16, padding:'48px 40px', maxWidth:440, width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
        <div style={{width:64, height:64, background:'linear-gradient(135deg,#C0442B,#8A2A14)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px'}}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{color:'#C0442B', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:8}}>Submitted</p>
        <h2 style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#1A0A06', marginBottom:12}}>Application Received</h2>
        <p style={{color:'#6A5A50', fontSize:14, lineHeight:1.6, marginBottom:24}}>Our team will review your details and reach out within 1 to 2 business days.</p>
        <button onClick={() => router.push('/dashboard/business')}
          style={{width:'100%', padding:'13px', background:'#1A0A06', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', fontFamily:"'DM Sans', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        .ob-input::placeholder { color:#9CA3AF; }
        .perk-desc::placeholder { color:#D1D5DB; }
      `}</style>

      {/* Nav */}
      <nav style={{background:'white', borderBottom:'1px solid #F3F4F6', padding:'0 24px'}}>
        <div style={{maxWidth:740, margin:'0 auto', display:'flex', alignItems:'center', height:60}}>
          <button onClick={() => router.push('/dashboard/business')}
            style={{display:'flex', alignItems:'center', gap:6, color:'#8A7A6A', background:'none', border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <p style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#1A0A06', margin:'0 auto'}}>
            <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:"inherit",letterSpacing:"-0.01em"}}>Regly</span>
          </p>
          <div style={{width:60}} />
        </div>
      </nav>

      <div style={{maxWidth:740, margin:'0 auto', padding:'36px 24px 80px'}}>
        <div style={{marginBottom:32}}>
          <p style={{color:'#C0442B', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:6}}>Business Setup</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#1A0A06', marginBottom:6}}>Set Up Your Business</h1>
          <p style={{color:'#6A5A50', fontSize:14}}>Reviewed and approved within 24 hours. No setup cost.</p>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:20}}>

          {/* Business Info */}
          <div style={{background:'white', borderRadius:16, padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color:'#1A0A06', marginBottom:20}}>Business Information</h2>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {[
                {k:'business_name', label:'Business Name', ph:'e.g. Vicenzo\'s Pizza'},
                {k:'address',       label:'Street Address', ph:'e.g. 123 N. Michigan Ave'},
                {k:'city',          label:'City',           ph:'Chicago'},
              ].map(f => (
                <div key={f.k}>
                  <label style={{display:'block', fontSize:12, fontWeight:500, color:'#2A1A10', marginBottom:5}}>{f.label}</label>
                  <input className="ob-input" style={inp(focused===f.k)}
                    value={form[f.k]} onChange={e => setField(f.k, e.target.value)}
                    onFocus={() => setFocused(f.k)} onBlur={() => setFocused(null)}
                    required placeholder={f.ph} />
                </div>
              ))}
              <div>
                <label style={{display:'block', fontSize:12, fontWeight:500, color:'#2A1A10', marginBottom:5}}>Short Description</label>
                <textarea className="ob-input" style={{...inp(focused==='desc'), resize:'vertical', minHeight:72}}
                  value={form.description} onChange={e => setField('description', e.target.value)}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
                  required placeholder="One or two sentences about your business." />
              </div>
            </div>
          </div>

          {/* Tiers */}
          <div style={{background:'white', borderRadius:16, padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color:'#1A0A06', marginBottom:4}}>Membership Tiers</h2>
            <p style={{color:'#8A7A6A', fontSize:13, marginBottom:24}}>Up to {MAX_TIERS} tiers. Each perk can be unlimited or limited to a set number of uses per month.</p>

            <div style={{display:'flex', flexDirection:'column', gap:24}}>
              {form.tiers.map((tier, ti) => (
                <div key={ti} style={{border:'1px solid #F3F4F6', borderRadius:14, padding:'22px', background:'#FAFAFA'}}>

                  {/* Tier header */}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:26, height:26, background:'#C0442B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <span style={{color:'#1A0A06', fontSize:11, fontWeight:700}}>{ti+1}</span>
                      </div>
                      <span style={{fontSize:13, fontWeight:600, color:'#2A1A10'}}>Tier {ti+1}</span>
                    </div>
                    {form.tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(ti)}
                        style={{color:'#8A7A6A', background:'none', border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit'}}>
                        Remove tier
                      </button>
                    )}
                  </div>

                  {/* Name + Price */}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 130px', gap:10, marginBottom:18}}>
                    <div>
                      <label style={{display:'block', fontSize:12, fontWeight:500, color:'#2A1A10', marginBottom:5}}>Tier Name</label>
                      <input className="ob-input" style={inp(focused===`n-${ti}`)}
                        value={tier.name} onChange={e => setTierField(ti,'name',e.target.value)}
                        onFocus={() => setFocused(`n-${ti}`)} onBlur={() => setFocused(null)}
                        required placeholder="e.g. Regular, VIP..." />
                    </div>
                    <div>
                      <label style={{display:'block', fontSize:12, fontWeight:500, color:'#2A1A10', marginBottom:5}}>Price / mo</label>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#8A7A6A', fontSize:13}}>$</span>
                        <input className="ob-input" style={{...inp(focused===`p-${ti}`), paddingLeft:22}}
                          type="number" min="1" value={tier.price}
                          onChange={e => setTierField(ti,'price',e.target.value)}
                          onFocus={() => setFocused(`p-${ti}`)} onBlur={() => setFocused(null)}
                          required placeholder="0" />
                      </div>
                    </div>
                  </div>

                  {/* Perks */}
                  <div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                      <label style={{fontSize:12, fontWeight:500, color:'#2A1A10'}}>Perks</label>
                      <span style={{fontSize:11, color:'#8A7A6A'}}>Set unlimited or limited uses per month</span>
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                      {tier.perks.map((perk, pi) => (
                        <div key={pi} style={{background:'white', border:'1px solid #E5E7EB', borderRadius:10, padding:'12px 14px'}}>

                          {/* Perk description */}
                          <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:10}}>
                            <div style={{width:6, height:6, borderRadius:'50%', background:'#C0442B', flexShrink:0}} />
                            <input className="perk-desc"
                              style={{...inp(focused===`d-${ti}-${pi}`), marginBottom:0}}
                              value={perk.description}
                              onChange={e => setPerkField(ti, pi, 'description', e.target.value)}
                              onFocus={() => setFocused(`d-${ti}-${pi}`)}
                              onBlur={() => setFocused(null)}
                              placeholder={`Perk ${pi+1}, e.g. Free appetizer, Size upgrade...`} />
                            {tier.perks.length > 1 && (
                              <button type="button" onClick={() => removePerk(ti, pi)}
                                style={{color:'#D1D5DB', background:'none', border:'none', cursor:'pointer', fontSize:18, lineHeight:1, flexShrink:0, padding:'0 4px'}}>
                                ×
                              </button>
                            )}
                          </div>

                          {/* Usage type toggle */}
                          <div style={{display:'flex', alignItems:'center', gap:10, paddingLeft:14}}>
                            <span style={{fontSize:12, color:'#6A5A50', marginRight:4}}>Uses per month:</span>

                            {/* Unlimited toggle */}
                            <button type="button"
                              onClick={() => setPerkField(ti, pi, 'type', 'unlimited')}
                              style={{
                                padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600,
                                border:`1.5px solid ${perk.type==='unlimited' ? '#C0442B' : '#E8E5DF'}`,
                                background: perk.type==='unlimited' ? 'rgba(192,68,43,0.1)' : 'white',
                                color: perk.type==='unlimited' ? '#1A0A06' : '#8A7A6A',
                                cursor:'pointer', fontFamily:'inherit',
                              }}>
                              Unlimited
                            </button>

                            {/* Limited toggle */}
                            <button type="button"
                              onClick={() => setPerkField(ti, pi, 'type', 'limited')}
                              style={{
                                padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600,
                                border:`1.5px solid ${perk.type==='limited' ? '#C0442B' : '#E8E5DF'}`,
                                background: perk.type==='limited' ? 'rgba(192,68,43,0.1)' : 'white',
                                color: perk.type==='limited' ? '#1A0A06' : '#8A7A6A',
                                cursor:'pointer', fontFamily:'inherit',
                              }}>
                              Limited
                            </button>

                            {/* Limit number input */}
                            {perk.type === 'limited' && (
                              <div style={{display:'flex', alignItems:'center', gap:6}}>
                                <input
                                  type="number" min="1" max="31"
                                  value={perk.limit}
                                  onChange={e => setPerkField(ti, pi, 'limit', e.target.value)}
                                  style={{
                                    width:52, padding:'4px 8px', border:'1.5px solid #C0442B',
                                    borderRadius:8, fontSize:13, color:'#1A0A06', outline:'none',
                                    textAlign:'center', fontFamily:'inherit', background:'white',
                                  }} />
                                <span style={{fontSize:12, color:'#6A5A50'}}>times</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {tier.perks.length < MAX_PERKS && (
                      <button type="button" onClick={() => addPerk(ti)}
                        style={{marginTop:10, color:'#C0442B', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit', padding:0}}>
                        + Add another perk
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {form.tiers.length < MAX_TIERS && (
                <button type="button" onClick={addTier}
                  style={{padding:'13px', border:'2px dashed #E5E7EB', borderRadius:14, background:'transparent', color:'#8A7A6A', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:500}}>
                  + Add Another Tier
                </button>
              )}
            </div>
          </div>

          {error && (
            <div style={{background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                <path d="M8 5V8M8 11H8.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{color:'#DC2626', fontSize:13, margin:0}}>{error}</p>
            </div>
          )}

          {/* Terms checkbox */}
          <div style={{background:'white', borderRadius:14, padding:'18px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', display:'flex', alignItems:'flex-start', gap:12}}>
            <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{marginTop:3, width:16, height:16, accentColor:'#C0442B', cursor:'pointer', flexShrink:0}} />
            <label htmlFor="terms" style={{fontSize:13, color:'#2A1A10', lineHeight:1.6, cursor:'pointer'}}>
              I have read and agree to the{' '}
              <a href="/merchant-terms" target="_blank" style={{color:'#C0442B', fontWeight:600, textDecoration:'none'}}>
                Regly Merchant Terms of Service
              </a>
              {' '}including the 85/15 revenue split, regular payouts via Stripe, and my obligation to honor all membership perks I define.
            </label>
          </div>

          <button type="submit" disabled={saving}
            style={{padding:'15px', background: saving ? '#D1D5DB' : '#1A0A06', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit'}}>
            {saving ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
