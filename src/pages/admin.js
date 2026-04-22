import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'sarrafian.josh@gmail.com'

const S = {
  page:    { minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif" },
  nav:     { background:'white', borderBottom:'1px solid #F3F4F6', padding:'0 24px' },
  navInner:{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 },
  logo:    { fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#111827' },
  card:    { background:'white', borderRadius:20, padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:16 },
  label:   { fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:600 },
  btn:     { border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', padding:'12px 24px', transition:'all 0.2s ease' },
}

export default function Admin() {
  const router = useRouter()
  const [authorized, setAuthorized]   = useState(false)
  const [loading, setLoading]         = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [expanded, setExpanded]       = useState(null)
  const [approving, setApproving]     = useState(null)
  const [message, setMessage]         = useState(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
    setAuthorized(true)
    await loadSubmissions()
    setLoading(false)
  }

  async function loadSubmissions() {
    const { data } = await supabase.from('onboarding_submissions').select('*').order('created_at', { ascending: false })
    setSubmissions(data || [])
  }

  async function handleApprove(sub) {
    setApproving(sub.id)
    setMessage(null)
    try {
      // 1. Create restaurant
      const { data: restaurant, error: restErr } = await supabase.from('restaurants').insert({
        name: sub.business_name, description: sub.description,
        address: sub.address, city: sub.city, owner_id: sub.user_id,
      }).select().single()
      if (restErr) throw restErr

      // 2. Parse tiers — support both old (string perks) and new (perks_config) format
      const tiers = JSON.parse(sub.tiers)
      const stripeResults = []
      const tierErrors = []

      for (const t of tiers) {
        // Build perks_config — handle both old and new onboarding format
        let perksConfig = []
        let perksText = ''
        if (Array.isArray(t.perks) && t.perks.length > 0 && typeof t.perks[0] === 'object') {
          // New format: perks is already array of {description, type, limit}
          perksConfig = t.perks
          perksText = t.perks.map(p => p.description).join(' | ')
        } else if (Array.isArray(t.perks)) {
          // Old format: perks is array of strings
          perksConfig = t.perks.map(p => ({ description: p, type: 'unlimited', limit: null }))
          perksText = t.perks.join(' | ')
        } else if (typeof t.perks === 'string') {
          perksConfig = t.perks.split(' | ').map(p => ({ description: p.trim(), type: 'unlimited', limit: null }))
          perksText = t.perks
        }

        // 3. Insert tier row first (without stripe_price_id)
        const { data: tierRow, error: tierErr } = await supabase
          .from('membership_tiers')
          .insert({
            restaurant_id: restaurant.id,
            name: `${sub.business_name} - ${t.name}`,
            price_monthly: Number(t.price),
            perks: perksText,
            perks_config: perksConfig,
            stripe_price_id: '',
          })
          .select()
          .single()

        if (tierErr) { tierErrors.push(`${t.name}: ${tierErr.message}`); continue }

        // 4. Auto-create Stripe Product + Price
        try {
          const stripeRes = await fetch('/api/create-stripe-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier_id: tierRow.id,
              tier_name: t.name,
              price_monthly: Number(t.price),
              business_name: sub.business_name,
            }),
          })
          const stripeData = await stripeRes.json()
          if (stripeData.success) {
            stripeResults.push({ name: t.name, price_id: stripeData.stripe_price_id })
          } else {
            tierErrors.push(`${t.name} Stripe: ${stripeData.error}`)
          }
        } catch (stripeErr) {
          tierErrors.push(`${t.name} Stripe: ${stripeErr.message}`)
        }
      }

      // 5. Mark submission as approved
      await supabase.from('onboarding_submissions').update({ status: 'approved' }).eq('id', sub.id)

      const successMsg = `${sub.business_name} is live on Regly. ${stripeResults.length} of ${tiers.length} Stripe price${tiers.length !== 1 ? 's' : ''} created automatically.`
      const errorSuffix = tierErrors.length > 0 ? ` Issues: ${tierErrors.join(', ')}` : ''
      setMessage({ type: tierErrors.length > 0 ? 'warning' : 'success', text: successMsg + errorSuffix })
      await loadSubmissions()
    } catch (err) {
      setMessage({ type:'error', text: err.message })
    } finally {
      setApproving(null)
    }
  }

  async function handleReject(sub) {
    if (!confirm(`Reject ${sub.business_name}?`)) return
    await supabase.from('onboarding_submissions').update({ status: 'rejected' }).eq('id', sub.id)
    await loadSubmissions()
  }

  async function logout() { await supabase.auth.signOut(); router.push('/') }

  function parseTiers(sub) { try { return JSON.parse(sub.tiers) } catch { return [] } }

  function statusChip(status) {
    const map = {
      pending:  { bg:'#FEF9EC', color:'#92400E', label:'Pending' },
      approved: { bg:'#D1FAE5', color:'#065F46', label:'Approved' },
      rejected: { bg:'#FEE2E2', color:'#991B1B', label:'Rejected' },
    }
    const s = map[status] || map.pending
    return (
      <span style={{background:s.bg, color:s.color, fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, letterSpacing:'0.08em', textTransform:'uppercase'}}>
        {s.label}
      </span>
    )
  }

  const pending  = submissions.filter(s => s.status === 'pending')
  const reviewed = submissions.filter(s => s.status !== 'pending')

  if (loading) return (
    <div style={{...S.page, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#9CA3AF'}}>Loading...</p>
    </div>
  )
  if (!authorized) return null

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap'); *{box-sizing:border-box;} .hover-row:hover{background:#F9FAFB;}`}</style>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <p style={S.logo}>REGL<span style={{color:'#C9A84C'}}>Y</span> <span style={{fontSize:13, color:'#9CA3AF', fontFamily:'system-ui', fontWeight:400}}>Admin</span></p>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <button onClick={() => router.push('/dashboard/business')}
              style={{...S.btn, background:'none', color:'#6B7280', border:'1px solid #E5E7EB', padding:'8px 16px', fontSize:13}}>
              My Dashboard
            </button>
            <button onClick={logout}
              style={{...S.btn, background:'none', color:'#9CA3AF', border:'none', padding:'8px 12px', fontSize:13}}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:900, margin:'0 auto', padding:'40px 24px'}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <p style={{...S.label, color:'#C9A84C', marginBottom:6}}>Business Onboarding</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#111827', marginBottom:4}}>Review Queue</h1>
          <p style={{color:'#9CA3AF', fontSize:14}}>{pending.length} pending review</p>
        </div>

        {/* Message */}
        {message && (
          <div style={{background: message.type==='success' ? '#D1FAE5' : '#FEE2E2', border:`1px solid ${message.type==='success' ? '#6EE7B7' : '#FECACA'}`, borderRadius:12, padding:'14px 18px', marginBottom:24, display:'flex', gap:10, alignItems:'flex-start'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginTop:1, flexShrink:0}}>
              {message.type==='success'
                ? <><circle cx="8" cy="8" r="7" fill="#059669"/><path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
                : <><circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/><path d="M8 5V8M8 11H8.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></>}
            </svg>
            <p style={{fontSize:14, color: message.type==='success' ? '#065F46' : message.type==='warning' ? '#92400E' : '#991B1B', margin:0}}>{message.text}</p>
          </div>
        )}

        {/* Pending */}
        <div style={{marginBottom:40}}>
          <h2 style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', marginBottom:16}}>
            Pending Review <span style={{fontSize:15, fontWeight:400, color:'#9CA3AF'}}>({pending.length})</span>
          </h2>

          {pending.length === 0 ? (
            <div style={{...S.card, textAlign:'center', padding:'48px'}}>
              <div style={{width:48, height:48, background:'#F3F4F6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4H9V6h2v4z" fill="#9CA3AF"/>
                </svg>
              </div>
              <p style={{color:'#6B7280', fontSize:15, fontWeight:500, marginBottom:4}}>All caught up</p>
              <p style={{color:'#9CA3AF', fontSize:13}}>No pending submissions right now.</p>
            </div>
          ) : (
            <div>
              {pending.map(sub => {
                const tiers = parseTiers(sub)
                const isOpen = expanded === sub.id
                return (
                  <div key={sub.id} style={S.card}>
                    {/* Summary row */}
                    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                          <h3 style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', margin:0}}>{sub.business_name}</h3>
                          {statusChip(sub.status)}
                        </div>
                        <p style={{color:'#6B7280', fontSize:14, marginBottom:2}}>{sub.address}, {sub.city}</p>
                        <p style={{color:'#9CA3AF', fontSize:12}}>
                          Submitted {new Date(sub.created_at).toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}
                        </p>
                      </div>
                      <button onClick={() => setExpanded(isOpen ? null : sub.id)}
                        style={{...S.btn, background:'#F9FAFB', color:'#374151', border:'1px solid #E5E7EB', padding:'8px 16px', fontSize:13, marginLeft:16, flexShrink:0}}>
                        {isOpen ? 'Hide' : 'Review'}
                      </button>
                    </div>

                    {/* Expanded */}
                    {isOpen && (
                      <div style={{marginTop:24, paddingTop:24, borderTop:'1px solid #F3F4F6'}}>
                        <div style={{marginBottom:20}}>
                          <p style={{...S.label, color:'#9CA3AF', marginBottom:6}}>Description</p>
                          <p style={{color:'#374151', fontSize:14, lineHeight:1.6}}>{sub.description}</p>
                        </div>

                        <div style={{marginBottom:24}}>
                          <p style={{...S.label, color:'#9CA3AF', marginBottom:12}}>Membership Tiers</p>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12}}>
                            {tiers.map((tier, i) => (
                              <div key={i} style={{background:'#F9FAFB', borderRadius:14, padding:'16px', border:'1px solid #F3F4F6'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                                  <p style={{fontSize:15, fontWeight:600, color:'#111827', margin:0}}>{tier.name}</p>
                                  <span style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color:'#C9A84C'}}>${tier.price}<span style={{fontSize:11, color:'#9CA3AF', fontWeight:400}}>/mo</span></span>
                                </div>
                                {(Array.isArray(tier.perks) ? tier.perks : [tier.perks]).map((perk, j) => {
                                  const isObj = perk && typeof perk === 'object'
                                  const label = isObj ? perk.description : perk
                                  const badge = isObj ? (perk.type === 'limited' ? `${perk.limit}x/mo` : 'Unlimited') : null
                                  return (
                                    <div key={j} style={{display:'flex', gap:8, marginBottom:6, alignItems:'flex-start'}}>
                                      <div style={{width:16, height:16, background:'#D1FAE5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1}}>
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                          <path d="M1.5 4L3 5.5L6.5 2" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <span style={{fontSize:13, color:'#6B7280', lineHeight:1.4, flex:1}}>{label}</span>
                                      {badge && (
                                        <span style={{fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background: perk.type === 'unlimited' ? '#D1FAE5' : '#FEF9EC', color: perk.type === 'unlimited' ? '#065F46' : '#92400E', flexShrink:0}}>
                                          {badge}
                                        </span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stripe auto-creation notice */}
                        <div style={{background:'#F0FDF4', border:'1px solid #6EE7B7', borderRadius:12, padding:'14px 16px', marginBottom:20, display:'flex', gap:10}}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0, marginTop:1}}>
                            <circle cx="8" cy="8" r="7" fill="#059669"/>
                            <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p style={{fontSize:13, color:'#065F46', margin:0, lineHeight:1.5}}>
                            Stripe Products and Prices will be created automatically when you approve. No manual setup needed.
                          </p>
                        </div>

                        <div style={{display:'flex', gap:12}}>
                          <button onClick={() => handleApprove(sub)} disabled={approving===sub.id}
                            style={{...S.btn, background: approving===sub.id ? '#D1D5DB' : '#111827', color:'white', flex:1}}>
                            {approving===sub.id ? 'Approving...' : 'Approve and Go Live'}
                          </button>
                          <button onClick={() => handleReject(sub)}
                            style={{...S.btn, background:'white', color:'#EF4444', border:'1px solid #FECACA'}}>
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

        {/* Reviewed */}
        {reviewed.length > 0 && (
          <div>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', marginBottom:16}}>
              Previously Reviewed <span style={{fontSize:15, fontWeight:400, color:'#9CA3AF'}}>({reviewed.length})</span>
            </h2>
            <div style={{background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              {reviewed.map((sub, i) => (
                <div key={sub.id} className="hover-row" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom: i<reviewed.length-1 ? '1px solid #F9FAFB' : 'none'}}>
                  <div>
                    <p style={{fontSize:15, fontWeight:600, color:'#111827', marginBottom:2}}>{sub.business_name}</p>
                    <p style={{fontSize:13, color:'#9CA3AF'}}>{sub.address}, {sub.city}</p>
                  </div>
                  {statusChip(sub.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
