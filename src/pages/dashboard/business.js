import Head from 'next/head'
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
  const [tiers, setTiers]             = useState([])
  const [addingPerkTo, setAddingPerkTo] = useState(null) // tier id being expanded
  const [newPerkText, setNewPerkText]   = useState('')
  const [newPerkType, setNewPerkType]   = useState('unlimited')
  const [newPerkLimit, setNewPerkLimit] = useState(2)
  const [savingPerk, setSavingPerk]     = useState(false)
  const [addingTier, setAddingTier]     = useState(false)
  const [newTier, setNewTier]           = useState({ name:'', price:'', perks:[{ description:'', type:'unlimited', limit:2 }] })
  const [savingTier, setSavingTier]     = useState(false)
  const [connectStatus, setConnectStatus] = useState(null) // 'success'|'pending'|'error'|'refresh'
  const [connectLoading, setConnectLoading] = useState(false)
  const [stats, setStats]             = useState({
    revenue: 0,
    tierBreakdown: [],
    newThisMonth: 0,
    cancelledThisMonth: 0,
    retentionRate: null,
    avgTenureMonths: null,
  })

  useEffect(() => { init() }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const connect = params.get('connect')
      if (connect) setConnectStatus(connect)
    }
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'business') { router.push('/'); return }

    const { data: rest } = await supabase.from('restaurants').select('*, stripe_account_id, stripe_onboarding_complete').eq('owner_id', user.id).single()
    setRestaurant(rest)

    const { data: sub } = await supabase.from('onboarding_submissions').select('*').eq('user_id', user.id).maybeSingle()
    setSubmission(sub)

    if (rest) {
      // Fetch this restaurant's membership tiers
      const { data: tierRows } = await supabase
        .from('membership_tiers')
        .select('id, name, price_monthly, perks_config, perks')
        .eq('restaurant_id', rest.id)
        .order('price_monthly', { ascending: true })
      setTiers(tierRows || [])

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

        // Cancellations, count all cancelled subs for this restaurant
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
    // Query only the specific phone number, never fetch all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, phone')
      .eq('role', 'customer')
      .eq('phone', phone.trim())
    // Also try cleaned version in case formatting differs
    let matchedProfile = profiles?.[0] || null
    if (!matchedProfile) {
      const { data: profiles2 } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .eq('role', 'customer')
        .ilike('phone', `%${cleaned.slice(-10)}%`)
      matchedProfile = profiles2?.[0] || null
    }
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
    const billingMonth = new Date().toISOString().slice(0, 7)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('perk_usage').insert({
      subscription_id: lookup.id,
      customer_id: lookup.customer_id,
      restaurant_id: restaurant.id,
      tier_id: lookup.tier_id,
      perk_index: perkIndex,
      perk_description: perkDescription,
      billing_month: billingMonth,
      logged_by: user?.id,
    })
    if (!error) {
      // Flash "Logged!" state
      setLookup(prev => ({
        ...prev,
        loggingPerk: null,
        justLogged: perkIndex,
        perkUsage: [...(prev.perkUsage || []), { perk_index: perkIndex }],
      }))
      // Reset "Logged!" after 2 seconds
      setTimeout(() => {
        setLookup(prev => ({ ...prev, justLogged: null }))
      }, 2000)
    } else {
      setLookup(prev => ({ ...prev, loggingPerk: null }))
      console.error('Perk usage log error:', error)
    }
  }

  async function savePerk(tier) {
    if (!newPerkText.trim()) return
    setSavingPerk(true)
    const existingConfig = Array.isArray(tier.perks_config) ? tier.perks_config : []
    const updatedConfig = [
      ...existingConfig,
      {
        description: newPerkText.trim(),
        type: newPerkType,
        limit: newPerkType === 'limited' ? Number(newPerkLimit) : null,
      }
    ]
    const { data, error } = await supabase
      .from('membership_tiers')
      .update({ perks_config: updatedConfig })
      .eq('id', tier.id)
      .select()
    if (error) {
      console.error('savePerk error:', error)
      alert(`Could not save perk: ${error.message}`)
    } else {
      setTiers(prev => prev.map(t => t.id === tier.id ? { ...t, perks_config: updatedConfig } : t))
      setAddingPerkTo(null)
      setNewPerkText('')
      setNewPerkType('unlimited')
      setNewPerkLimit(2)
    }
    setSavingPerk(false)
  }

  function setNewTierPerkField(pi, k, v) {
    setNewTier(prev => ({ ...prev, perks: prev.perks.map((p,i) => i===pi ? {...p,[k]:v} : p) }))
  }
  function addNewTierPerk() {
    setNewTier(prev => ({ ...prev, perks: [...prev.perks, { description:'', type:'unlimited', limit:2 }] }))
  }
  function removeNewTierPerk(pi) {
    setNewTier(prev => ({ ...prev, perks: prev.perks.filter((_,i) => i!==pi) }))
  }

  async function saveNewTier() {
    if (!newTier.name.trim() || !newTier.price || isNaN(newTier.price)) return
    const validPerks = newTier.perks.filter(p => p.description.trim())
    if (!validPerks.length) return
    setSavingTier(true)
    const perksConfig = validPerks.map(p => ({
      description: p.description.trim(),
      type: p.type,
      limit: p.type === 'limited' ? Number(p.limit) : null,
    }))
    const perksText = validPerks.map(p => p.description.trim()).join(' | ')
    const { data, error } = await supabase
      .from('membership_tiers')
      .insert({
        restaurant_id: restaurant.id,
        name: `${restaurant.name} - ${newTier.name.trim()}`,
        price_monthly: Number(newTier.price),
        perks_config: perksConfig,
        perks: perksText,
        stripe_price_id: '',
      })
      .select()
      .single()
    if (!error && data) {
      setTiers(prev => [...prev, data].sort((a,b) => a.price_monthly - b.price_monthly))
      setAddingTier(false)
      setNewTier({ name:'', price:'', perks:[{ description:'', type:'unlimited', limit:2 }] })
    }
    setSavingTier(false)
  }

  async function startConnectOnboarding() {
    if (!restaurant) return
    setConnectLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          business_name: restaurant.name,
          email: user.email,
        }),
      })
      const data = await res.json()
      if (data.onboarding_url) {
        window.location.href = data.onboarding_url
      } else {
        alert('Could not start Stripe onboarding: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setConnectLoading(false)
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
    <Head>
      <title>Business Dashboard — Regly</title>
      <meta name="description" content="Manage your Regly membership program, members, and payouts." />
      <meta property="og:title" content="Business Dashboard — Regly" />
      <meta property="og:description" content="Manage your Regly membership program, members, and payouts." />
    </Head>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap'); *{box-sizing:border-box;} .hover-row:hover{background:#F9FAFB;} .search-btn:hover{opacity:0.88;} .logout-btn:hover{color:#111827;} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

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

        {/* STRIPE CONNECT BANNER */}
        {restaurant && (
          <>
            {/* Success banner */}
            {connectStatus === 'success' && (
              <div style={{background:'#D1FAE5', border:'1px solid #6EE7B7', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#059669"/>
                  <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{fontSize:14, color:'#065F46', margin:0, fontWeight:500}}>Stripe account connected! Payouts are now active for your memberships.</p>
              </div>
            )}

            {/* Pending banner */}
            {connectStatus === 'pending' && (
              <div style={{background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#F59E0B"/>
                    <path d="M8 5V8M8 11H8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p style={{fontSize:14, color:'#92400E', margin:0}}>Stripe still needs a bit more information to activate your payouts.</p>
                </div>
                <button onClick={startConnectOnboarding} disabled={connectLoading}
                  style={{padding:'7px 14px', background:'#F59E0B', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0}}>
                  {connectLoading ? 'Loading...' : 'Continue Setup'}
                </button>
              </div>
            )}

            {/* Error banner */}
            {connectStatus === 'error' && (
              <div style={{background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                  <path d="M8 5V8M8 11H8.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{fontSize:14, color:'#991B1B', margin:0}}>Something went wrong with Stripe setup. Please contact <span style={{color:'#C9A84C'}}>getregly@gmail.com</span></p>
              </div>
            )}

            {/* Not yet connected, prompt to set up */}
            {!restaurant.stripe_onboarding_complete && connectStatus !== 'success' && (
              <div style={{background:'white', border:'1px solid #E5E7EB', borderRadius:16, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex', alignItems:'center', gap:14}}>
                  <div style={{width:44, height:44, background:'#FEF9EC', border:'1px solid #FCD34D', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="2" y="6" width="18" height="13" rx="2" stroke="#F59E0B" strokeWidth="1.5"/>
                      <path d="M2 10H20" stroke="#F59E0B" strokeWidth="1.5"/>
                      <path d="M6 14H8M10 14H12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{fontSize:14, fontWeight:600, color:'#111827', marginBottom:3}}>Stripe Connect setup required to receive payouts</p>
                    <p style={{fontSize:13, color:'#6B7280'}}>You must complete Stripe Connect to begin accepting membership payouts. Payouts are deposited monthly directly to your bank account. Takes about 2 minutes.</p>
                  </div>
                </div>
                <button onClick={startConnectOnboarding} disabled={connectLoading}
                  style={{padding:'10px 20px', background: connectLoading ? '#D1D5DB' : '#111827', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor: connectLoading ? 'not-allowed' : 'pointer', fontFamily:'inherit', flexShrink:0, whiteSpace:'nowrap'}}>
                  {connectLoading ? 'Loading...' : 'Set Up Payouts'}
                </button>
              </div>
            )}
          </>
        )}

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

                  {/* Perk usage, only show for active members */}
                  {lookup.status === 'active' && lookup.perksConfig && lookup.perksConfig.length > 0 && (
                    <div style={{background:'white', border:'1px solid #E5E7EB', borderRadius:12, overflow:'hidden'}}>
                      {/* Header */}
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #F3F4F6', background:'#FAFAFA'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" fill="#C9A84C"/>
                          </svg>
                          <p style={{fontSize:13, fontWeight:600, color:'#111827', margin:0}}>Redeem Perks</p>
                        </div>
                        <p style={{fontSize:11, color:'#9CA3AF', margin:0}}>{new Date().toLocaleDateString('en-US',{month:'long', year:'numeric'})}</p>
                      </div>

                      {/* Perks list */}
                      <div style={{padding:'12px 18px', display:'flex', flexDirection:'column', gap:8}}>
                        {lookup.perksConfig.map((perk, pi) => {
                          const usedCount = (lookup.perkUsage || []).filter(u => u.perk_index === pi).length
                          const isLimited = perk.type === 'limited'
                          const limit = perk.limit || 0
                          const exhausted = isLimited && usedCount >= limit
                          const justLogged = lookup.justLogged === pi
                          const isLogging = lookup.loggingPerk === pi

                          return (
                            <div key={pi} style={{
                              display:'flex', alignItems:'center', gap:12,
                              padding:'12px 14px', borderRadius:10,
                              background: exhausted ? '#FEF2F2' : justLogged ? '#F0FDF4' : '#F9FAFB',
                              border:`1px solid ${exhausted ? '#FECACA' : justLogged ? '#6EE7B7' : '#F3F4F6'}`,
                              transition:'all 0.3s ease',
                            }}>
                              {/* Perk info */}
                              <div style={{flex:1, minWidth:0}}>
                                <p style={{
                                  fontSize:13, fontWeight:500, marginBottom:3,
                                  color: exhausted ? '#9CA3AF' : '#111827',
                                  textDecoration: exhausted ? 'line-through' : 'none',
                                }}>
                                  {perk.description}
                                </p>
                                <div style={{display:'flex', alignItems:'center', gap:6}}>
                                  {isLimited ? (
                                    <>
                                      {/* Usage dots for limited perks */}
                                      <div style={{display:'flex', gap:3}}>
                                        {Array.from({length: limit}).map((_, di) => (
                                          <div key={di} style={{
                                            width:7, height:7, borderRadius:'50%',
                                            background: di < usedCount ? '#EF4444' : '#D1FAE5',
                                            border:`1px solid ${di < usedCount ? '#FECACA' : '#6EE7B7'}`,
                                          }} />
                                        ))}
                                      </div>
                                      <span style={{fontSize:11, color: exhausted ? '#EF4444' : '#6B7280'}}>
                                        {exhausted ? 'Limit reached' : `${limit - usedCount} of ${limit} remaining`}
                                      </span>
                                    </>
                                  ) : (
                                    <span style={{fontSize:11, color:'#059669', fontWeight:500}}>∞ Unlimited</span>
                                  )}
                                </div>
                              </div>

                              {/* Action button */}
                              {exhausted ? (
                                <div style={{display:'flex', alignItems:'center', gap:4, padding:'6px 12px', background:'#FEE2E2', borderRadius:8, flexShrink:0}}>
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 3L9 9M9 3L3 9" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                  <span style={{fontSize:11, color:'#EF4444', fontWeight:600}}>Used up</span>
                                </div>
                              ) : justLogged ? (
                                <div style={{display:'flex', alignItems:'center', gap:4, padding:'6px 14px', background:'#D1FAE5', borderRadius:8, flexShrink:0, transition:'all 0.3s'}}>
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span style={{fontSize:11, color:'#059669', fontWeight:600}}>Logged!</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => logPerkUsage(pi, perk.description)}
                                  disabled={isLogging}
                                  style={{
                                    display:'flex', alignItems:'center', gap:6,
                                    padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600,
                                    cursor: isLogging ? 'not-allowed' : 'pointer',
                                    border:'none', fontFamily:'inherit', flexShrink:0,
                                    background: isLogging ? '#F3F4F6' : '#111827',
                                    color: isLogging ? '#9CA3AF' : 'white',
                                    transition:'all 0.2s',
                                  }}>
                                  {isLogging ? (
                                    <>
                                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{animation:'spin 0.8s linear infinite'}}>
                                        <circle cx="5" cy="5" r="4" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6 6"/>
                                      </svg>
                                      Logging...
                                    </>
                                  ) : (
                                    <>
                                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M5 1V5L7.5 7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                                        <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1.2"/>
                                      </svg>
                                      Use
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div style={{padding:'10px 18px', borderTop:'1px solid #F3F4F6', background:'#FAFAFA'}}>
                        <p style={{fontSize:11, color:'#9CA3AF', margin:0}}>All redemptions are logged and visible in member analytics. Usage resets monthly.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* Stats row */}
            {/* Stats, row 1 */}
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

            {/* Stats, row 2 */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16}}>
              {[
                {
                  label:'Retention Rate',
                  value: stats.retentionRate !== null ? `${stats.retentionRate}%` : 'N/A',
                  sub: 'members who renewed last month',
                  color: stats.retentionRate === null ? '#111827' : stats.retentionRate >= 80 ? '#059669' : stats.retentionRate >= 60 ? '#F59E0B' : '#EF4444',
                },
                {
                  label:'Avg Member Tenure',
                  value: stats.avgTenureMonths !== null ? `${stats.avgTenureMonths}mo` : 'N/A',
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

            {/* My Membership Tiers */}
            {tiers.length > 0 && (
              <div style={S.card}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                  <div>
                    <h2 style={S.h2}>Your Membership Tiers</h2>
                    <p style={{color:'#9CA3AF', fontSize:13, marginTop:4}}>Your current offerings, contact us to make major changes</p>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:16}}>
                  {tiers.map(tier => {
                    const perks = tier.perks_config && tier.perks_config.length > 0
                      ? tier.perks_config
                      : (tier.perks ? tier.perks.split(' | ').map(p => ({ description: p, type: 'unlimited', limit: null })) : [])
                    const isAdding = addingPerkTo === tier.id
                    const memberCount = stats.tierBreakdown.find(t => t.name === tier.name)?.count || 0
                    return (
                      <div key={tier.id} style={{border:'1px solid #F3F4F6', borderRadius:14, overflow:'hidden'}}>
                        {/* Tier header */}
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'#FAFAFA', borderBottom:'1px solid #F3F4F6'}}>
                          <div style={{display:'flex', alignItems:'center', gap:12}}>
                            <div>
                              <p style={{fontSize:15, fontWeight:700, color:'#111827', margin:0}}>{tier.name}</p>
                              <p style={{fontSize:12, color:'#9CA3AF', marginTop:2}}>
                                {memberCount} active member{memberCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:10}}>
                            <span style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827'}}>
                              ${tier.price_monthly}<span style={{fontSize:12, fontWeight:400, color:'#9CA3AF'}}>/mo</span>
                            </span>
                            <button
                              onClick={() => { setAddingPerkTo(isAdding ? null : tier.id); setNewPerkText(''); setNewPerkType('unlimited'); setNewPerkLimit(2) }}
                              style={{padding:'6px 14px', background: isAdding ? '#F3F4F6' : '#111827', color: isAdding ? '#6B7280' : 'white', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
                              {isAdding ? 'Cancel' : '+ Add Perk'}
                            </button>
                          </div>
                        </div>

                        {/* Perks list */}
                        <div style={{padding:'16px 20px'}}>
                          {perks.length === 0 ? (
                            <p style={{fontSize:13, color:'#D1D5DB'}}>No perks configured yet.</p>
                          ) : (
                            <div style={{display:'flex', flexDirection:'column', gap:8}}>
                              {perks.map((perk, pi) => (
                                <div key={pi} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                                    <div style={{width:6, height:6, borderRadius:'50%', background:'#C9A84C', flexShrink:0}} />
                                    <span style={{fontSize:13, color:'#374151'}}>{perk.description}</span>
                                  </div>
                                  <span style={{
                                    fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20,
                                    background: perk.type === 'unlimited' ? '#D1FAE5' : '#FEF9EC',
                                    color: perk.type === 'unlimited' ? '#065F46' : '#92400E',
                                  }}>
                                    {perk.type === 'unlimited' ? 'Unlimited' : `${perk.limit}x / month`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add perk form */}
                          {isAdding && (
                            <div style={{marginTop:16, paddingTop:16, borderTop:'1px solid #F3F4F6'}}>
                              <p style={{fontSize:12, fontWeight:600, color:'#374151', marginBottom:10}}>New Perk</p>
                              <input
                                value={newPerkText}
                                onChange={e => setNewPerkText(e.target.value)}
                                placeholder="e.g. Free appetizer, Size upgrade..."
                                style={{width:'100%', padding:'10px 12px', border:'1.5px solid #C9A84C', borderRadius:8, fontSize:13, color:'#111827', outline:'none', fontFamily:'inherit', marginBottom:10}}
                              />
                              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                                <span style={{fontSize:12, color:'#6B7280'}}>Uses per month:</span>
                                {['unlimited','limited'].map(t => (
                                  <button key={t} type="button"
                                    onClick={() => setNewPerkType(t)}
                                    style={{padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                                      border:`1.5px solid ${newPerkType===t ? '#C9A84C' : '#E5E7EB'}`,
                                      background: newPerkType===t ? 'rgba(201,168,76,0.1)' : 'white',
                                      color: newPerkType===t ? '#8A6A20' : '#9CA3AF',
                                    }}>
                                    {t.charAt(0).toUpperCase()+t.slice(1)}
                                  </button>
                                ))}
                                {newPerkType === 'limited' && (
                                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                                    <input type="number" min="1" max="31"
                                      value={newPerkLimit}
                                      onChange={e => setNewPerkLimit(e.target.value)}
                                      style={{width:48, padding:'4px 8px', border:'1.5px solid #C9A84C', borderRadius:8, fontSize:13, textAlign:'center', fontFamily:'inherit', outline:'none'}}
                                    />
                                    <span style={{fontSize:12, color:'#6B7280'}}>times</span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => savePerk(tier)}
                                disabled={savingPerk || !newPerkText.trim()}
                                style={{padding:'9px 20px', background: savingPerk || !newPerkText.trim() ? '#D1D5DB' : '#111827', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: savingPerk || !newPerkText.trim() ? 'not-allowed' : 'pointer', fontFamily:'inherit'}}>
                                {savingPerk ? 'Saving...' : 'Save Perk'}
                              </button>
                              <p style={{fontSize:11, color:'#9CA3AF', marginTop:8}}>This will immediately appear for all subscribers of this tier.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{marginTop:16, paddingTop:16, borderTop:'1px solid #F3F4F6'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <p style={{fontSize:12, color:'#9CA3AF'}}>
                      Need to change pricing or remove a tier? Email <span style={{color:'#C9A84C'}}>getregly@gmail.com</span>
                    </p>
                    <button onClick={() => setAddingTier(v => !v)}
                      style={{padding:'8px 16px', background: addingTier ? '#F3F4F6' : '#111827', color: addingTier ? '#6B7280' : 'white', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0, marginLeft:16}}>
                      {addingTier ? 'Cancel' : '+ New Tier'}
                    </button>
                  </div>

                  {/* New tier form */}
                  {addingTier && (
                    <div style={{marginTop:16, background:'#F9FAFB', borderRadius:12, padding:'20px', border:'1px solid #E5E7EB'}}>
                      <p style={{fontSize:13, fontWeight:600, color:'#111827', marginBottom:14}}>Create New Tier</p>

                      <div style={{display:'grid', gridTemplateColumns:'1fr 130px', gap:10, marginBottom:14}}>
                        <div>
                          <label style={{display:'block', fontSize:12, fontWeight:500, color:'#374151', marginBottom:5}}>Tier Name</label>
                          <input value={newTier.name} onChange={e => setNewTier(p => ({...p, name:e.target.value}))}
                            placeholder="e.g. Gold, Superfan..."
                            style={{width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit'}} />
                        </div>
                        <div>
                          <label style={{display:'block', fontSize:12, fontWeight:500, color:'#374151', marginBottom:5}}>Price / mo</label>
                          <div style={{position:'relative'}}>
                            <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:13}}>$</span>
                            <input type="number" min="1" value={newTier.price} onChange={e => setNewTier(p => ({...p, price:e.target.value}))}
                              placeholder="0"
                              style={{width:'100%', padding:'10px 12px 10px 22px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit'}} />
                          </div>
                        </div>
                      </div>

                      <label style={{display:'block', fontSize:12, fontWeight:500, color:'#374151', marginBottom:8}}>Perks</label>
                      <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:10}}>
                        {newTier.perks.map((perk, pi) => (
                          <div key={pi} style={{background:'white', border:'1px solid #E5E7EB', borderRadius:8, padding:'10px 12px'}}>
                            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                              <div style={{width:6, height:6, borderRadius:'50%', background:'#C9A84C', flexShrink:0}} />
                              <input value={perk.description} onChange={e => setNewTierPerkField(pi,'description',e.target.value)}
                                placeholder={`Perk ${pi+1}`}
                                style={{flex:1, padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:6, fontSize:12, outline:'none', fontFamily:'inherit'}} />
                              {newTier.perks.length > 1 && (
                                <button type="button" onClick={() => removeNewTierPerk(pi)}
                                  style={{color:'#D1D5DB', background:'none', border:'none', cursor:'pointer', fontSize:16, padding:'0 4px'}}>×</button>
                              )}
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:8, paddingLeft:14}}>
                              <span style={{fontSize:11, color:'#6B7280'}}>Uses:</span>
                              {['unlimited','limited'].map(t => (
                                <button key={t} type="button" onClick={() => setNewTierPerkField(pi,'type',t)}
                                  style={{padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                                    border:`1.5px solid ${perk.type===t ? '#C9A84C' : '#E5E7EB'}`,
                                    background: perk.type===t ? 'rgba(201,168,76,0.1)' : 'white',
                                    color: perk.type===t ? '#8A6A20' : '#9CA3AF',
                                  }}>
                                  {t.charAt(0).toUpperCase()+t.slice(1)}
                                </button>
                              ))}
                              {perk.type === 'limited' && (
                                <div style={{display:'flex', alignItems:'center', gap:4}}>
                                  <input type="number" min="1" max="31" value={perk.limit}
                                    onChange={e => setNewTierPerkField(pi,'limit',e.target.value)}
                                    style={{width:44, padding:'3px 6px', border:'1.5px solid #C9A84C', borderRadius:6, fontSize:12, textAlign:'center', fontFamily:'inherit', outline:'none'}} />
                                  <span style={{fontSize:11, color:'#6B7280'}}>x</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addNewTierPerk}
                        style={{color:'#C9A84C', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit', padding:0, marginBottom:14}}>
                        + Add another perk
                      </button>

                      <div style={{display:'flex', gap:10, alignItems:'center'}}>
                        <button onClick={saveNewTier} disabled={savingTier || !newTier.name.trim() || !newTier.price}
                          style={{padding:'10px 20px', background: savingTier || !newTier.name.trim() || !newTier.price ? '#D1D5DB' : '#111827', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: savingTier ? 'not-allowed' : 'pointer', fontFamily:'inherit'}}>
                          {savingTier ? 'Saving...' : 'Create Tier'}
                        </button>
                        <p style={{fontSize:11, color:'#9CA3AF'}}>New tiers are reviewed by the Regly team before going live. We'll activate it within 48 hours.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                            <td style={{padding:'14px 16px 14px 0', color:'#111827', fontWeight:500}}>{m.profile?.name || ', '}</td>
                            <td style={{padding:'14px 16px 14px 0', color:'#6B7280'}}>{m.profile?.phone || ', '}</td>
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
                              ) : <span style={{color:'#D1D5DB', fontSize:13}}>, </span>}
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
