import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const MAX_TIERS = 5
const MAX_PERKS = 8

function newTier() { return { name: '', price: '', perks: [''] } }

const inputStyle = (focused) => ({
  width:'100%', padding:'12px 14px',
  background:'white',
  border:`1.5px solid ${focused ? '#C9A84C' : '#E5E7EB'}`,
  borderRadius:10, fontSize:14, color:'#111827', outline:'none',
  boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.12)' : 'none',
  fontFamily:'inherit', transition:'all 0.2s ease',
})

export default function Onboard() {
  const router = useRouter()
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')
  const [focused, setFocused]   = useState(null)
  const [form, setForm] = useState({
    business_name:'', address:'', city:'Chicago', description:'', tiers:[newTier()],
  })

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth?role=business'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single()
      if (profile?.role !== 'business') { router.push('/'); return }
      const { data: existing } = await supabase.from('onboarding_submissions').select('id,status').eq('user_id', u.id).single()
      if (existing) setDone(true)
      setUser(u)
      setLoading(false)
    }
    init()
  }, [])

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }
  function setTierField(ti, key, val) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => i===ti ? {...t,[key]:val} : t) }))
  }
  function setPerk(ti, pi, val) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => i!==ti ? t : {...t, perks: t.perks.map((p,j) => j===pi ? val : p)}) }))
  }
  function addPerk(ti) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => i!==ti || t.perks.length>=MAX_PERKS ? t : {...t, perks:[...t.perks,'']}) }))
  }
  function removePerk(ti, pi) {
    setForm(f => ({ ...f, tiers: f.tiers.map((t,i) => {
      if (i!==ti) return t
      const perks = t.perks.filter((_,j) => j!==pi)
      return {...t, perks: perks.length===0 ? [''] : perks}
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
    for (let i=0; i<form.tiers.length; i++) {
      const t = form.tiers[i]
      if (!t.name.trim()) { setError(`Please enter a name for Tier ${i+1}`); return }
      if (!t.price || isNaN(t.price) || Number(t.price)<=0) { setError(`Please enter a valid price for "${t.name||`Tier ${i+1}`}"`); return }
      if (!t.perks.filter(p=>p.trim()).length) { setError(`Please add at least one perk for "${t.name||`Tier ${i+1}`}"`); return }
    }
    setSaving(true)
    try {
      const cleanedTiers = form.tiers.map(t => ({ ...t, perks: t.perks.filter(p=>p.trim()) }))
      const { error: err } = await supabase.from('onboarding_submissions').insert({
        user_id: user.id, business_name: form.business_name, address: form.address,
        city: form.city, description: form.description, tiers: JSON.stringify(cleanedTiers), status:'pending',
      })
      if (err) throw err
      setDone(true)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F9FAFB'}}>
      <p style={{color:'#9CA3AF', fontFamily:'system-ui, sans-serif'}}>Loading...</p>
    </div>
  )

  if (done) return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', fontFamily:"'Inter', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');`}</style>
      <div style={{background:'white', borderRadius:24, padding:'48px 40px', maxWidth:440, width:'100%', textAlign:'center', boxShadow:'0 4px 32px rgba(0,0,0,0.08)'}}>
        <div style={{width:64, height:64, background:'linear-gradient(135deg, #C9A84C, #8A6A20)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px'}}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{color:'#C9A84C', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:8}}>Submitted</p>
        <h2 style={{fontFamily:'Georgia, serif', fontSize:26, fontWeight:700, color:'#111827', marginBottom:12}}>Application Received</h2>
        <p style={{color:'#6B7280', fontSize:15, lineHeight:1.6, marginBottom:8}}>Our team will review your details and reach out within 1 to 2 business days.</p>
        <p style={{color:'#9CA3AF', fontSize:13, marginBottom:32}}>Questions? <span style={{color:'#C9A84C'}}>getregly@gmail.com</span></p>
        <button onClick={() => router.push('/dashboard/business')}
          style={{width:'100%', padding:'14px', background:'#111827', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing:border-box; }
        .ob-input::placeholder { color:#9CA3AF; }
        .perk-input::placeholder { color:#D1D5DB; }
      `}</style>

      {/* Nav */}
      <nav style={{background:'white', borderBottom:'1px solid #F3F4F6', padding:'0 24px'}}>
        <div style={{maxWidth:720, margin:'0 auto', display:'flex', alignItems:'center', height:60}}>
          <button onClick={() => router.push('/dashboard/business')}
            style={{display:'flex', alignItems:'center', gap:6, color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', fontSize:14, padding:0, fontFamily:'inherit'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <p style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', margin:'0 auto'}}>
            REGL<span style={{color:'#C9A84C'}}>Y</span>
          </p>
          <div style={{width:120}} />
        </div>
      </nav>

      <div style={{maxWidth:720, margin:'0 auto', padding:'40px 24px 80px'}}>
        {/* Header */}
        <div style={{marginBottom:40}}>
          <p style={{color:'#C9A84C', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:8}}>Business Setup</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:32, fontWeight:700, color:'#111827', marginBottom:8}}>Set Up Your Business</h1>
          <p style={{color:'#6B7280', fontSize:15}}>Our team reviews all submissions before going live. We'll be in touch within 1 to 2 business days.</p>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:24}}>

          {/* Business Info */}
          <div style={{background:'white', borderRadius:20, padding:'32px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Business Information</h2>
            <p style={{color:'#9CA3AF', fontSize:13, marginBottom:24}}>This is what customers will see on the Regly platform.</p>

            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              {[
                { key:'business_name', label:'Business Name', placeholder:'e.g. Vicenzo\'s Pizza' },
                { key:'address',       label:'Street Address', placeholder:'e.g. 123 N. Michigan Avenue' },
                { key:'city',          label:'City',           placeholder:'Chicago' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>{f.label}</label>
                  <input className="ob-input" style={inputStyle(focused===f.key)}
                    value={form[f.key]} onChange={e => setField(f.key, e.target.value)}
                    onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)}
                    required placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>Short Description</label>
                <textarea className="ob-input" style={{...inputStyle(focused==='description'), resize:'vertical', minHeight:80}}
                  value={form.description} onChange={e => setField('description', e.target.value)}
                  onFocus={() => setFocused('description')} onBlur={() => setFocused(null)}
                  required placeholder="One or two sentences about your business." />
              </div>
            </div>
          </div>

          {/* Tiers */}
          <div style={{background:'white', borderRadius:20, padding:'32px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Membership Tiers</h2>
            <p style={{color:'#9CA3AF', fontSize:13, marginBottom:24}}>Create up to {MAX_TIERS} tiers. Name them however makes sense for your business.</p>

            <div style={{display:'flex', flexDirection:'column', gap:24}}>
              {form.tiers.map((tier, ti) => (
                <div key={ti} style={{border:'1px solid #F3F4F6', borderRadius:16, padding:'24px', background:'#FAFAFA'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:28, height:28, background:'#C9A84C', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <span style={{color:'#0A0906', fontSize:12, fontWeight:700}}>{ti+1}</span>
                      </div>
                      <span style={{fontSize:14, fontWeight:600, color:'#374151'}}>Tier {ti+1}</span>
                    </div>
                    {form.tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(ti)}
                        style={{color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit'}}>
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{display:'grid', gridTemplateColumns:'1fr 140px', gap:12, marginBottom:16}}>
                    <div>
                      <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>Tier Name</label>
                      <input className="ob-input" style={inputStyle(focused===`name-${ti}`)}
                        value={tier.name} onChange={e => setTierField(ti,'name',e.target.value)}
                        onFocus={() => setFocused(`name-${ti}`)} onBlur={() => setFocused(null)}
                        required placeholder="e.g. Regular, VIP, Coffee Lover..." />
                    </div>
                    <div>
                      <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>Price / month</label>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14}}>$</span>
                        <input className="ob-input" style={{...inputStyle(focused===`price-${ti}`), paddingLeft:24}}
                          type="number" min="1" value={tier.price}
                          onChange={e => setTierField(ti,'price',e.target.value)}
                          onFocus={() => setFocused(`price-${ti}`)} onBlur={() => setFocused(null)}
                          required placeholder="0" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:4}}>Perks</label>
                    <p style={{fontSize:12, color:'#9CA3AF', marginBottom:10}}>Add each perk separately. Be specific — customers see this before subscribing.</p>
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      {tier.perks.map((perk, pi) => (
                        <div key={pi} style={{display:'flex', alignItems:'center', gap:8}}>
                          <div style={{width:6, height:6, borderRadius:'50%', background:'#C9A84C', flexShrink:0}} />
                          <input className="perk-input" style={{...inputStyle(focused===`perk-${ti}-${pi}`), flex:1}}
                            value={perk} onChange={e => setPerk(ti,pi,e.target.value)}
                            onFocus={() => setFocused(`perk-${ti}-${pi}`)} onBlur={() => setFocused(null)}
                            placeholder={`Perk ${pi+1}`} />
                          {tier.perks.length > 1 && (
                            <button type="button" onClick={() => removePerk(ti,pi)}
                              style={{color:'#D1D5DB', background:'none', border:'none', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px', flexShrink:0}}>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {tier.perks.length < MAX_PERKS && (
                      <button type="button" onClick={() => addPerk(ti)}
                        style={{marginTop:10, color:'#C9A84C', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:500, fontFamily:'inherit', padding:0}}>
                        + Add another perk
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {form.tiers.length < MAX_TIERS && (
                <button type="button" onClick={addTier}
                  style={{padding:'14px', border:'2px dashed #E5E7EB', borderRadius:16, background:'transparent', color:'#9CA3AF', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:500}}>
                  + Add Another Tier
                </button>
              )}
            </div>
          </div>

          {error && (
            <div style={{background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'14px 16px', display:'flex', gap:10, alignItems:'center'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                <path d="M8 5V8M8 11H8.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{color:'#DC2626', fontSize:14, margin:0}}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={saving}
            style={{padding:'16px', background: saving ? '#D1D5DB' : '#111827', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit'}}>
            {saving ? 'Submitting...' : 'Submit for Review'}
          </button>

          <p style={{textAlign:'center', color:'#9CA3AF', fontSize:12}}>
            By submitting you agree to Regly's revenue share. You keep the majority of all membership revenue.
          </p>
        </form>
      </div>
    </div>
  )
}
