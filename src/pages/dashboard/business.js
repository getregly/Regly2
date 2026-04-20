import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

const S = {
  page:     { minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif" },
  nav:      { background:'white', borderBottom:'1px solid #F3F4F6', padding:'0 24px', position:'sticky', top:0, zIndex:40 },
  navInner: { maxWidth:960, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 },
  logo:     { fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#111827' },
  body:     { maxWidth:960, margin:'0 auto', padding:'40px 24px' },
  card:     { background:'white', borderRadius:20, padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:0 },
  label:    { fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:600, color:'#9CA3AF' },
  h2:       { fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', margin:0 },
  btn:      { border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s ease' },
}

export default function BusinessDashboard() {
  const router = useRouter()
  const [restaurant, setRestaurant]   = useState(null)
  const [submission, setSubmission]   = useState(null)
  const [members, setMembers]         = useState([])
  const [stripeData, setStripeData]   = useState({})
  const [phone, setPhone]             = useState('')
  const [lookup, setLookup]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [searching, setSearching]     = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [stats, setStats]             = useState({
    revenue: 0,
    tierBreakdown: [],
    newThisMonth: 0,
    cancelledThisMonth: 0,
    retentionRate: null,
    avgTenureMonths: null,
  })

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'business') { router.push('/'); return }

    const { data: rest } = await supabase.from('restaurants').select('*').eq('owner_id', user.id).single()
    setRestaurant(rest)

    const { data: sub } = await supabase.from('onboarding_submissions').select('*').eq('user_id', user.id).maybeSingle()
    setSubmission(sub)

    if (rest) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*, membership_tiers(name, price_monthly)')
        .eq('restaurant_id', rest.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false })

      if (subs && subs.length > 0) {
        const customerIds = subs.map(s => s.customer_id)
        const { data: profiles } = await supabase.from('profiles').select('id, name, phone').in('id', customerIds)
        const merged = subs.map(s => ({ ...s, profile: profiles?.find(p => p.id === s.customer_id) || null }))
        setMembers(merged)

        const revenue = subs.reduce((sum, s) => sum + (s.membership_tiers?.price_monthly || 0), 0)
        const tierMap = {}
        subs.forEach(s => { const n = s.membership_tiers?.name || 'Unknown'; tierMap[n] = (tierMap[n] || 0) + 1 })

        // New members this month
        const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0)
        const newThisMonth = subs.filter(s => new Date(s.start_date) >= thisMonthStart).length

        // Avg tenure in months
        const now = new Date()
        const tenures = subs.map(s => {
          const start = new Date(s.start_date)
          return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
        })
        const avgTenureMonths = tenures.length > 0
          ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length * 10) / 10
          : null

        // Cancellations — count all cancelled subs for this restaurant
        // No date filtering since updated_at/end_date may not exist on the table
        const { count: cancelledCount } = await supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', rest.id)
          .eq('status', 'cancelled')
        const cancelledThisMonth = cancelledCount || 0

        // Retention: members who were active last month and are still active
        const lastMonthStart = new Date(thisMonthStart); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
        const activeLastMonth = subs.filter(s => new Date(s.start_date) <= lastMonthStart).length
        const retentionRate = activeLastMonth > 0
          ? Math.round(((activeLastMonth - cancelledThisMonth) / activeLastMonth) * 100)
          : null

        setStats({
          revenue,
          tierBreakdown: Object.entries(tierMap).map(([name, count]) => ({ name, count })),
          newThisMonth,
          cancelledThisMonth,
          retentionRate,
          avgTenureMonths,
        })

        const stripeIds = subs.map(s => s.stripe_subscription_id).filter(Boolean)
        if (stripeIds.length > 0) {
          try {
            const res = await fetch('/api/subscription-status', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ subscriptionIds: stripeIds }) })
            setStripeData(await res.json())
          } catch {}
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
    const { data: profiles } = await supabase.from('profiles').select('id, name, phone').eq('role', 'customer')
    const matchedProfile = profiles?.find(p => (p.phone || '').replace(/\D/g, '') === cleaned)
    if (!matchedProfile) { setLookup(false); setSearching(false); return }

    const { data: subs } = await supabase
      .from('subscriptions').select('*, membership_tiers(name, price_monthly)')
      .eq('customer_id', matchedProfile.id).eq('restaurant_id', restaurant.id)
      .order('start_date', { ascending: false }).limit(1)
    if (!subs || subs.length === 0) { setLookup(false); setSearching(false); return }

    let stripeInfo = null
    const subId = subs[0].stripe_subscription_id
    if (subId && subId.startsWith('sub_')) {
      try {
        const res = await fetch('/api/subscription-status', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ subscriptionIds: [subId] }) })
        const data = await res.json()
        stripeInfo = data[subId]
      } catch {}
    }
    // Fetch perks_config for this tier
    const { data: tierData } = await supabase
      .from('membership_tiers')
      .select('perks_config')
      .eq('id', subs[0].tier_id)
      .single()

    // Fetch perk usage for this subscription this billing month
    const billingMonth = new Date().toISOString().slice(0, 7)
    const { data: usageData } = await supabase
      .from('perk_usage')
      .select('perk_index')
      .eq('subscription_id', subs[0].id)
      .eq('billing_month', billingMonth)

    const perksConfig = tierData?.perks_config || []
    setLookup({ ...subs[0], profile: matchedProfile, stripeInfo, perksConfig, perkUsage: usageData || [] })
    setSearching(false)
  }

  async function logPerkUsage(perkIndex, perkDescription) {
    if (!lookup || !restaurant) return
    setLookup(prev => ({ ...prev, loggingPerk: perkIndex }))
    const billingMonth = new Date().toISOString().slice(0, 7) // "2026-04"
    const { error } = await supabase.from('perk_usage').insert({
      subscription_id: lookup.id,
      customer_id: lookup.customer_id,
      restaurant_id: restaurant.id,
      tier_id: lookup.tier_id,
      perk_index: perkIndex,
      perk_description: perkDescription,
      billing_month: billingMonth,
      logged_by: (await supabase.auth.getUser()).data.user?.id,
    })
    if (!error) {
      setLookup(prev => ({
        ...prev,
        loggingPerk: null,
        perkUsage: [...(prev.perkUsage || []), { perk_index: perkIndex }],
      }))
    } else {
      setLookup(prev => ({ ...prev, loggingPerk: null }))
      console.error('Perk usage log error:', error)
    }
  }

  async function logout() { await supabase.auth.signOut(); router.push('/') }

  function formatDate(unix) {
    if (!unix) return null
    return new Date(unix * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function renewalInfo(sub) {
    const stripe = stripeData[sub.stripe_subscription_id]
    if (!stripe) return null
    return stripe.cancel_at_period_end
      ? { label: 'Cancels', date: formatDate(stripe.current_period_end), color: '#EF4444', bg: '#FEE2E2' }
      : { label: 'Renews',  date: formatDate(stripe.current_period_end), color: '#059669', bg: '#D1FAE5' }
  }

  const displayName = restaurant?.name || submission?.business_name || 'Your Business'
  const isPending   = !restaurant && submission?.status === 'pending'
  const isNew       = !restaurant && !submission
  const reglyFee    = (stats.revenue * 0.15).toFixed(2)
  const ownerRevenue= (stats.revenue * 0.85).toFixed(2)

  if (loading) return (
    <div style={{...S.page, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <p style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#111827'}}>REGL<span style={{color:'#C9A84C'}}>Y</span></p>
      <p style={{color:'#9CA3AF', fontSize:14, marginTop:8}}>Loading your dashboard...</p>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap'); *{box-sizing:border-box;} .hover-row:hover{background:#F9FAFB;} .search-btn:hover{opacity:0.88;} .logout-btn:hover{color:#111827;}`}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <p style={S.logo}>REGL<span style={{color:'#C9A84C'}}>Y</span></p>
            <span style={{color:'#E5E7EB'}}>|</span>
            <p style={{fontSize:14, color:'#6B7280', margin:0}}>{displayName}</p>
          </div>
          <button onClick={logout} className="logout-btn"
            style={{...S.btn, background:'none', color:'#9CA3AF', border:'1px solid #E5E7EB', padding:'8px 16px', fontSize:13}}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={S.body}>

        {/* Page title */}
        <div style={{marginBottom:32}}>
          <p style={{...S.label, marginBottom:6}}>Business Dashboard</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#111827', margin:0}}>
            {isPending ? 'Application Status' : isNew ? 'Welcome to Regly' : `Welcome back`}
          </h1>
        </div>

        {/* PENDING STATE */}
        {isPending && (
          <div style={{background:'white', borderRadius:24, padding:'48px 40px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:24}}>
            <div style={{width:72, height:72, background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px'}}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.5"/>
                <circle cx="16" cy="16" r="1.5" fill="#F59E0B"/>
                <path d="M16 10V16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 16L20 19" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{...S.label, color:'#92400E', marginBottom:8}}>Under Review</p>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:26, fontWeight:700, color:'#111827', marginBottom:8}}>Application Received</h2>
            <p style={{color:'#374151', fontSize:16, fontWeight:500, marginBottom:4}}>{submission.business_name}</p>
            <p style={{color:'#6B7280', fontSize:14, lineHeight:1.6, maxWidth:420, margin:'0 auto 24px'}}>
              Our team is reviewing your details. We'll reach out within 1 to 2 business days to get you live on Regly.
            </p>
            <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:10, padding:'10px 16px'}}>
              <span style={{fontSize:13, color:'#6B7280'}}>Questions?</span>
              <span style={{fontSize:13, color:'#C9A84C', fontWeight:500}}>getregly@gmail.com</span>
            </div>
          </div>
        )}

        {/* NEW STATE */}
        {isNew && (
          <div style={{background:'white', borderRadius:24, padding:'48px 40px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:24}}>
            <div style={{width:72, height:72, background:'linear-gradient(135deg, #C9A84C, #8A6A20)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px'}}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm1 17h-2v-6h2v6zm0-8h-2V9h2v4z" fill="white"/>
              </svg>
            </div>
            <p style={{...S.label, color:'#C9A84C', marginBottom:8}}>Get Started</p>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:26, fontWeight:700, color:'#111827', marginBottom:8}}>Set Up Your Business</h2>
            <p style={{color:'#6B7280', fontSize:15, lineHeight:1.6, maxWidth:420, margin:'0 auto 28px'}}>
              Create your membership tiers, set your perks, and start earning from the customers who already love your business.
            </p>
            <button onClick={() => router.push('/onboard')}
              style={{...S.btn, background:'#111827', color:'white', padding:'14px 32px', fontSize:15, display:'inline-flex', alignItems:'center', gap:8}}>
              Set Up My Business
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* APPROVED DASHBOARD */}
        {restaurant && (
          <div style={{display:'flex', flexDirection:'column', gap:24}}>

            {/* Stats row */}
            {/* Stats — row 1 */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16}}>
              {[
                { label:'Active Members',        value: members.length,          prefix:'',  suffix:'',   sub: null },
                { label:'Membership Revenue',     value: stats.revenue,           prefix:'$', suffix:'/mo', sub:'subscription income this month' },
                { label:'Your Earnings',          value: ownerRevenue,            prefix:'$', suffix:'/mo', sub:'after 15% Regly fee' },
                { label:'New This Month',         value: stats.newThisMonth,      prefix:'',  suffix:'',   sub: stats.newThisMonth === 1 ? 'new subscriber' : 'new subscribers' },
              ].map(s => (
                <div key={s.label} style={{...S.card, textAlign:'center', padding:'22px'}}>
                  <p style={{fontFamily:'Georgia, serif', fontSize:30, fontWeight:700, color:'#111827', marginBottom:2}}>
                    {s.prefix}{s.value}{s.suffix}
                  </p>
                  <p style={{...S.label, fontSize:10, marginBottom: s.sub ? 4 : 0}}>{s.label}</p>
                  {s.sub && <p style={{fontSize:11, color:'#D1D5DB'}}>{s.sub}</p>}
                </div>
              ))}
            </div>

            {/* Stats — row 2 */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16}}>
              {[
                {
                  label:'Retention Rate',
                  value: stats.retentionRate !== null ? `${stats.retentionRate}%` : '—',
                  sub: 'members who renewed last month',
                  color: stats.retentionRate === null ? '#111827' : stats.retentionRate >= 80 ? '#059669' : stats.retentionRate >= 60 ? '#F59E0B' : '#EF4444',
                },
                {
                  label:'Avg Member Tenure',
                  value: stats.avgTenureMonths !== null ? `${stats.avgTenureMonths}mo` : '—',
                  sub: 'average months a member stays',
                  color: '#111827',
                },
                {
                  label:'Cancellations',
                  value: stats.cancelledThisMonth,
                  sub: 'cancelled this month',
                  color: stats.cancelledThisMonth === 0 ? '#059669' : stats.cancelledThisMonth <= 2 ? '#F59E0B' : '#EF4444',
                },
                {
                  label:'Total MRR',
                  value: `$${stats.revenue}`,
                  sub: 'gross monthly recurring revenue',
                  color: '#111827',
                },
              ].map(s => (
                <div key={s.label} style={{...S.card, textAlign:'center', padding:'22px'}}>
                  <p style={{fontFamily:'Georgia, serif', fontSize:30, fontWeight:700, color: s.color, marginBottom:2}}>
                    {s.value}
                  </p>
                  <p style={{...S.label, fontSize:10, marginBottom:4}}>{s.label}</p>
                  <p style={{fontSize:11, color:'#D1D5DB'}}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Tier breakdown */}
            {stats.tierBreakdown.length > 0 && (
              <div style={S.card}>
                <div style={{marginBottom:20}}>
                  <h2 style={S.h2}>Members by Tier</h2>
                  <p style={{color:'#9CA3AF', fontSize:13, marginTop:4}}>{members.length} active member{members.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:14}}>
                  {stats.tierBreakdown.map(t => {
                    const pct = Math.round((t.count / members.length) * 100)
                    return (
                      <div key={t.name}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                          <span style={{fontSize:14, color:'#374151', fontWeight:500}}>{t.name}</span>
                          <span style={{fontSize:13, color:'#9CA3AF'}}>{t.count} member{t.count !== 1 ? 's' : ''} · {pct}%</span>
                        </div>
                        <div style={{height:6, background:'#F3F4F6', borderRadius:10, overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${pct}%`, background:'linear-gradient(to right, #C9A84C, #8A6A20)', borderRadius:10}} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Phone Lookup */}
            <div style={S.card}>
              <div style={{marginBottom:20}}>
                <h2 style={S.h2}>Member Lookup</h2>
                <p style={{color:'#9CA3AF', fontSize:13, marginTop:4}}>Enter a customer's phone number to verify their membership.</p>
              </div>
              <form onSubmit={handlePhoneLookup} style={{display:'flex', gap:12}}>
                <input
                  value={phone} onChange={e => setPhone(e.target.value)}
                  onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)}
                  required placeholder="(312) 555-0000"
                  style={{flex:1, padding:'12px 14px', border:`1.5px solid ${phoneFocused ? '#C9A84C' : '#E5E7EB'}`, borderRadius:10, fontSize:14, color:'#111827', outline:'none', fontFamily:'inherit', boxShadow: phoneFocused ? '0 0 0 3px rgba(201,168,76,0.12)' : 'none', transition:'all 0.2s'}}
                />
                <button type="submit" disabled={searching} className="search-btn"
                  style={{...S.btn, background:'#111827', color:'white', padding:'12px 24px', opacity: searching ? 0.7 : 1}}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </form>

              {lookup === false && (
                <div style={{marginTop:16, padding:'16px', background:'#F9FAFB', borderRadius:12, border:'1px solid #F3F4F6', display:'flex', alignItems:'center', gap:10}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
                    <path d="M5 8h6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p style={{fontSize:14, color:'#6B7280', margin:0}}>No Regly membership found for this number.</p>
                </div>
              )}

              {lookup && lookup.profile && (
                <div style={{marginTop:16}}>
                  {/* Member header */}
                  <div style={{padding:'16px 20px', background: lookup.status === 'active' ? '#F0FDF4' : '#FEF2F2', borderRadius:12, border:`1px solid ${lookup.status === 'active' ? '#6EE7B7' : '#FECACA'}`, marginBottom:12}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                      <div style={{width:30, height:30, background: lookup.status === 'active' ? '#059669' : '#EF4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          {lookup.status === 'active'
                            ? <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            : <path d="M4 4L10 10M10 4L4 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>}
                        </svg>
                      </div>
                      <span style={{fontSize:14, fontWeight:600, color: lookup.status === 'active' ? '#065F46' : '#991B1B'}}>
                        {lookup.status === 'active' ? 'Active Member' : 'Cancelled Membership'}
                      </span>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 20px'}}>
                      {[
                        ['Name', lookup.profile.name],
                        ['Phone', lookup.profile.phone],
                        ['Tier', lookup.membership_tiers?.name],
                        ['Member since', new Date(lookup.start_date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})],
                        lookup.stripeInfo ? [lookup.stripeInfo.cancel_at_period_end ? 'Cancels on' : 'Renews on', formatDate(lookup.stripeInfo.current_period_end)] : null,
                      ].filter(Boolean).map(([label, val]) => (
                        <div key={label}>
                          <p style={{fontSize:10, color:'#6B7280', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:1}}>{label}</p>
                          <p style={{fontSize:13, color:'#111827', fontWeight:500}}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Perk usage — only show for active members */}
                  {lookup.status === 'active' && lookup.perksConfig && lookup.perksConfig.length > 0 && (
                    <div style={{background:'white', border:'1px solid #E5E7EB', borderRadius:12, padding:'16px 20px'}}>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
                        <p style={{fontSize:13, fontWeight:600, color:'#111827'}}>Perk Usage This Month</p>
                        <p style={{fontSize:11, color:'#9CA3AF'}}>{new Date().toLocaleDateString('en-US',{month:'long', year:'numeric'})}</p>
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        {lookup.perksConfig.map((perk, pi) => {
                          const usedCount = (lookup.perkUsage || []).filter(u => u.perk_index === pi).length
                          const isLimited = perk.type === 'limited'
                          const limit = perk.limit || 0
                          const exhausted = isLimited && usedCount >= limit
                          return (
                            <div key={pi} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background: exhausted ? '#FEF2F2' : '#F9FAFB', borderRadius:8, border:`1px solid ${exhausted ? '#FECACA' : '#F3F4F6'}`}}>
                              <div style={{flex:1}}>
                                <p style={{fontSize:13, color: exhausted ? '#9CA3AF' : '#111827', fontWeight:500, marginBottom:2, textDecoration: exhausted ? 'line-through' : 'none'}}>{perk.description}</p>
                                <p style={{fontSize:11, color: exhausted ? '#EF4444' : isLimited ? '#6B7280' : '#059669'}}>
                                  {isLimited ? (exhausted ? `Limit reached (${limit}/${limit})` : `${usedCount} of ${limit} used this month`) : 'Unlimited'}
                                </p>
                              </div>
                              {!exhausted && (
                                <button
                                  onClick={() => logPerkUsage(pi, perk.description)}
                                  disabled={lookup.loggingPerk === pi}
                                  style={{padding:'6px 14px', background: lookup.loggingPerk===pi ? '#D1D5DB' : '#111827', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor: lookup.loggingPerk===pi ? 'not-allowed' : 'pointer', fontFamily:'inherit', flexShrink:0}}>
                                  {lookup.loggingPerk === pi ? '...' : 'Use'}
                                </button>
                              )}
                              {exhausted && (
                                <div style={{padding:'4px 10px', background:'#FEE2E2', borderRadius:8}}>
                                  <p style={{fontSize:11, color:'#EF4444', fontWeight:600}}>Done</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <p style={{fontSize:11, color:'#9CA3AF', marginTop:12}}>Tap "Use" when a customer redeems a perk. Usage resets at the start of each billing month.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Member List */}
            <div style={S.card}>
              <div style={{marginBottom:20}}>
                <h2 style={S.h2}>
                  Active Members <span style={{fontSize:15, fontWeight:400, color:'#9CA3AF'}}>({members.length})</span>
                </h2>
                <p style={{color:'#9CA3AF', fontSize:13, marginTop:4}}>Sorted by most recent. All current Regly subscribers at {restaurant.name}.</p>
              </div>

              {members.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px 0'}}>
                  <p style={{color:'#6B7280', fontSize:15, fontWeight:500, marginBottom:4}}>No members yet</p>
                  <p style={{color:'#9CA3AF', fontSize:13}}>Share your Regly link to get your first subscriber.</p>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%', borderCollapse:'collapse', fontSize:14}}>
                    <thead>
                      <tr style={{borderBottom:'2px solid #F3F4F6'}}>
                        {['Name','Phone','Tier','$/mo','Since','Renewal'].map(h => (
                          <th key={h} style={{textAlign:'left', padding:'0 16px 12px 0', color:'#9CA3AF', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => {
                        const renewal = renewalInfo(m)
                        return (
                          <tr key={m.id} className="hover-row" style={{borderBottom:'1px solid #F9FAFB'}}>
                            <td style={{padding:'14px 16px 14px 0', color:'#111827', fontWeight:500}}>{m.profile?.name || '—'}</td>
                            <td style={{padding:'14px 16px 14px 0', color:'#6B7280'}}>{m.profile?.phone || '—'}</td>
                            <td style={{padding:'14px 16px 14px 0'}}>
                              <span style={{background:'rgba(201,168,76,0.1)', color:'#8A6A20', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap'}}>
                                {m.membership_tiers?.name}
                              </span>
                            </td>
                            <td style={{padding:'14px 16px 14px 0', color:'#111827', fontWeight:600}}>${m.membership_tiers?.price_monthly}</td>
                            <td style={{padding:'14px 16px 14px 0', color:'#9CA3AF', whiteSpace:'nowrap'}}>{new Date(m.start_date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</td>
                            <td style={{padding:'14px 0 14px 0'}}>
                              {renewal ? (
                                <span style={{background:renewal.bg, color:renewal.color, fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap'}}>
                                  {renewal.label} {renewal.date}
                                </span>
                              ) : <span style={{color:'#D1D5DB', fontSize:13}}>—</span>}
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
    </div>
  )
}
