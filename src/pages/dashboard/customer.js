import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

// Category icons as SVG
const CategoryIcon = ({ type }) => {
  const icons = {
    pizza:    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor"/>,
    coffee:   <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" fill="currentColor"/>,
    burger:   <path d="M20 9H4c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2zM4 5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2s-.9-2-2-2H6c-1.1 0-2 .9-2 2zm16 12H4c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor"/>,
    taco:     <path d="M12 3C7 3 3 7 3 12h18c0-5-4-9-9-9zM3 14c0 2.21 1.79 4 4 4h10c2.21 0 4-1.79 4-4H3z" fill="currentColor"/>,
    bar:      <path d="M20 3H4l8 9.46V19H8v2h8v-2h-4v-6.54L20 3z" fill="currentColor"/>,
    book:     <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" fill="currentColor"/>,
    record:   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>,
    smoothie: <path d="M20 3H4l3 9H4l1 9h14l1-9h-3l3-9zm-4.83 7l-1.5-5h.83l2 5h-1.33zm-6.34 0l2-5h.83l-1.5 5H8.83z" fill="currentColor"/>,
    bakery:   <path d="M18.5 3c-1.74 0-3.41.81-4.5 2.09C12.91 3.81 11.24 3 9.5 3 6.42 3 4 5.42 4 8.5c0 3.77 3.4 6.86 8.55 11.53L14 21.35l1.45-1.32C20.6 15.36 24 12.27 24 8.5 24 5.42 21.58 3 18.5 3zm-4.4 15.55l-.1.1-.1-.1C9.14 14.24 6 11.39 6 8.5 6 6.5 7.5 5 9.5 5c1.54 0 3.04.99 3.57 2.36h1.87C15.46 5.99 16.96 5 18.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="currentColor"/>,
    default:  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
  }
  const d = icons[type] || icons.default
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:'#C0442B'}}>
      {d}
    </svg>
  )
}

function getCategoryType(name) {
  const n = name?.toLowerCase() || ''
  if (n.includes('pizza') || n.includes('vicenz')) return 'pizza'
  if (n.includes('coffee') || n.includes('jen') || n.includes('brew')) return 'coffee'
  if (n.includes('burger') || n.includes('stack')) return 'burger'
  if (n.includes('taco') || n.includes('compadre')) return 'taco'
  if (n.includes('bar') || n.includes('taproom') || n.includes('tap')) return 'bar'
  if (n.includes('book')) return 'book'
  if (n.includes('record') || n.includes('groove') || n.includes('vinyl')) return 'record'
  if (n.includes('smoothie') || n.includes('blend') || n.includes('juice')) return 'smoothie'
  if (n.includes('bake') || n.includes('bakery') || n.includes('honey') || n.includes('rye')) return 'bakery'
  return 'default'
}

// Card color palettes per category
function getCardAccent(type) {
  const map = {
    pizza:    { bg:'#FFF7ED', accent:'#EA580C', light:'#FFEDD5' },
    coffee:   { bg:'#FDF8F0', accent:'#92400E', light:'#FEF3C7' },
    burger:   { bg:'#FFF1F2', accent:'#BE123C', light:'#FFE4E6' },
    taco:     { bg:'#F0FDF4', accent:'#15803D', light:'#DCFCE7' },
    bar:      { bg:'#F5F3FF', accent:'#6D28D9', light:'#EDE9FE' },
    book:     { bg:'#EFF6FF', accent:'#1D4ED8', light:'#DBEAFE' },
    record:   { bg:'#1A0A06', accent:'#C0442B', light:'#1A1410' },
    smoothie: { bg:'#F0FDF4', accent:'#059669', light:'#D1FAE5' },
    bakery:   { bg:'#FDF4FF', accent:'#9333EA', light:'#F3E8FF' },
    default:  { bg:'#F9FAFB', accent:'#374151', light:'#F3F4F6' },
  }
  return map[type] || map.default
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser]                   = useState(null)
  const [restaurants, setRestaurants]     = useState([])
  const [selected, setSelected]           = useState(null)
  const [tiers, setTiers]                 = useState([])
  const [myMemberships, setMyMemberships] = useState([])
  const [perkUsageMap, setPerkUsageMap] = useState({})
  const [visitLog, setVisitLog] = useState([])
  const [loading, setLoading]             = useState(true)
  const [subscribing, setSubscribing]     = useState(null)
  const [highlightTierId, setHighlightTierId] = useState(null)
  const [hoveredCard, setHoveredCard]     = useState(null)

  useEffect(() => {
    init()

    // Real-time subscription — update perk usage immediately when merchant redeems a perk
    // This means the customer sees remaining uses update live without refreshing
    let channel
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      channel = supabase
        .channel('perk-usage-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'perk_usage',
        }, async () => {
          // Re-fetch active subscriptions then refresh usage
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('customer_id', user.id)
            .in('status', ['active', 'past_due'])
          if (subs && subs.length > 0) {
            // Fetch full sub data including period end for billing month calc
            const { data: fullSubs } = await supabase
              .from('subscriptions')
              .select('id, current_period_end')
              .eq('customer_id', user.id)
              .in('status', ['active', 'past_due'])
            await refreshPerkUsage(
              (fullSubs || subs).map(s => s.id),
              fullSubs || subs
            )
          }
        })
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // Standalone perk usage refresh — called on init and via real-time subscription
  // Accepts subs array with current_period_end so billing month matches merchant
  async function refreshPerkUsage(subIds, subsWithPeriods) {
    if (!subIds || subIds.length === 0) return

    // Fetch ALL perk_usage rows for these subs — no month filter
    const { data: usage } = await supabase
      .from('perk_usage')
      .select('subscription_id, perk_index, billing_month')
      .in('subscription_id', subIds)

    console.log('[Regly] perk_usage rows fetched:', usage)
    console.log('[Regly] subsWithPeriods:', subsWithPeriods?.map(s => ({
      id: s.id,
      current_period_end: s.current_period_end
    })))

    // Build billing month per subscription from current_period_end
    const billingMonthBySub = {}
    if (subsWithPeriods) {
      subsWithPeriods.forEach(sub => {
        if (sub.current_period_end) {
          const periodEnd = new Date(sub.current_period_end)
          const periodStart = new Date(periodEnd)
          periodStart.setMonth(periodStart.getMonth() - 1)
          billingMonthBySub[sub.id] = periodStart.toISOString().slice(0, 7)
        } else {
          billingMonthBySub[sub.id] = new Date().toISOString().slice(0, 7)
        }
      })
    }

    console.log('[Regly] billingMonthBySub:', billingMonthBySub)
    console.log('[Regly] usage billing_months in DB:', (usage || []).map(u => u.billing_month))

    const usageMap = {}
    ;(usage || []).forEach(u => {
      const expectedMonth = billingMonthBySub[u.subscription_id]
        || new Date().toISOString().slice(0, 7)
      console.log('[Regly] row billing_month:', u.billing_month, 'expected:', expectedMonth, 'match:', u.billing_month === expectedMonth)
      if (u.billing_month !== expectedMonth) return
      const key = u.subscription_id
      if (!usageMap[key]) usageMap[key] = {}
      usageMap[key][u.perk_index] = (usageMap[key][u.perk_index] || 0) + 1
    })

    console.log('[Regly] final usageMap:', usageMap)
    setPerkUsageMap(usageMap)
  }

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { router.push('/'); return }

    // Retry profile fetch up to 5 times
    // Handles race condition where profile insert hasn't committed yet after signup
    let profile = null
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', u.id).maybeSingle()
      if (data) { profile = data; break }
      await new Promise(r => setTimeout(r, 600))
    }

    if (!profile) { router.push('/'); return }
    if (profile.role !== 'customer') { router.push('/'); return }
    setUser(profile)
    const { data: rests } = await supabase
      .from('restaurants')
      .select('*')
      .eq('stripe_onboarding_complete', true)
      .order('name')
    setRestaurants(rests || [])

    // Auto-select restaurant if coming from browse page with tier intent
    const { tierId: intentTierId, restaurantId: intentRestaurantId } = router.query
    if (intentRestaurantId && rests) {
      const target = rests.find(r => r.id === intentRestaurantId)
      if (target) {
        // selectRestaurant is defined below — call after state settles
        setTimeout(() => selectRestaurant(target, intentTierId), 100)
      }
    }

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*, restaurants(name), membership_tiers(name, price_monthly, perks, perks_config)')
      .in('status', ['active', 'past_due'])
      .eq('customer_id', u.id)
      .eq('status', 'active')
    const activeSubs = subs || []
    setMyMemberships(activeSubs)

    // Fetch perk usage for all active subs this billing month
    if (activeSubs.length > 0) {
      const billingMonth = new Date().toISOString().slice(0, 7)
      const subIds = activeSubs.map(s => s.id)
      await refreshPerkUsage(subIds, activeSubs)

      // Fetch full visit log — all perk redemptions across all subscriptions
      const { data: log } = await supabase
        .from('perk_usage')
        .select('perk_description, billing_month, used_at, subscription_id, restaurants(name)')
        .in('subscription_id', subIds)
        .order('used_at', { ascending: false })
        .limit(50)
      setVisitLog(log || [])
    }
    setLoading(false)
  }

  async function selectRestaurant(rest, autoTierId = null) {
    // Fetch full restaurant details including Connect status
    const { data: fullRest } = await supabase
      .from('restaurants')
      .select('*, stripe_account_id, stripe_onboarding_complete')
      .eq('id', rest.id)
      .single()
    setSelected(fullRest || rest)
    const { data } = await supabase.from('membership_tiers').select('*, perks_config').eq('restaurant_id', rest.id).neq('stripe_price_id', '').order('price_monthly')
    setTiers(data || [])

    // If coming from browse with a specific tier — scroll to tiers and highlight
    if (autoTierId) {
      setTimeout(() => {
        document.getElementById('tiers-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Store the highlighted tier ID so the tier card can show a brief highlight ring
        setHighlightTierId(autoTierId)
        setTimeout(() => setHighlightTierId(null), 3000)
      }, 300)
    }

    setTimeout(() => document.getElementById('tiers-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  async function handleSubscribe(tier) {
    setSubscribing(tier.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ tierId: tier.id, restaurantId: selected.id, stripePriceId: tier.stripe_price_id }),
      })
      const { url, error, code } = await res.json()
      if (code === 'CONNECT_INCOMPLETE' || code === 'CONNECT_NOT_READY') {
        alert('This business is still completing their payment setup and is not yet accepting memberships. Please check back soon.')
        return
      }
      if (code === 'TIER_PAUSED') {
        alert('This membership is not currently accepting new members. Please check back soon.')
        return
      }
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      alert('Something went wrong: ' + err.message)
    } finally {
      setSubscribing(null)
    }
  }

  async function handleCancel(sub) {
    const endDate = sub.current_period_end
      ? new Date(sub.current_period_end).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
      : 'the end of your billing period'
    const confirmed = confirm(`Cancel your ${sub.membership_tiers?.name} membership at ${sub.restaurants?.name}? You will keep full access to all your perks until ${endDate}.`)
    if (!confirmed) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ subscriptionId: sub.stripe_subscription_id, subId: sub.id }),
      })
      const data = await res.json()
      if (data.ok) {
        // Update local state to show pending cancellation — do not remove the card
        setMyMemberships(m => m.map(s => s.id === sub.id ? { ...s, cancel_at_period_end: true } : s))
      } else {
        alert('Could not cancel membership: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const activeSubForRestaurant = (restaurantId) => myMemberships.find(m => m.restaurant_id === restaurantId)
  const activeSubForTier = (tierId) => myMemberships.find(m => m.tier_id === tierId)
  const hasNoMemberships = myMemberships.length === 0

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F9FAFB'}}>
      <div style={{textAlign:'center'}}>
        <p style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#1A0A06', marginBottom:8}}><span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:"inherit",letterSpacing:"-0.01em"}}>Regly</span></p>
        <p style={{color:'#9CA3AF', fontSize:14}}>Loading your memberships...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif"}}>
    <Head>
      <title>My Memberships — Regly</title>
      <meta name="description" content="Manage your Regly memberships and browse local businesses." />
      <meta property="og:title" content="My Memberships — Regly" />
      <meta property="og:description" content="Manage your Regly memberships and browse local businesses." />
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .rest-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; }
        .rest-card { transition: all 0.25s ease; }
        .tier-card-new:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important; }
        .tier-card-new { transition: all 0.3s ease; }
        .sub-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .sub-btn { transition: all 0.2s ease; }
        .nav-link:hover { color: #111827; }
        .nav-link { transition: color 0.2s; }
        .cancel-btn:hover { color: #EF4444 !important; }
        .cancel-btn { transition: color 0.2s; }
      `}</style>

      {/* TOP NAV */}
      <nav style={{background:'white', borderBottom:'1px solid #F3F4F6', position:'sticky', top:0, zIndex:40, padding:'0 24px'}}>
        <div style={{maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64}}>
          <p style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#1A0A06', margin:0}}>
            <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:"inherit",letterSpacing:"-0.01em"}}>Regly</span>
          </p>
          <div style={{display:'flex', alignItems:'center', gap:20}}>
            <p style={{color:'#6B7280', fontSize:14, margin:0}}>
              Hi, <span style={{color:'#1A0A06', fontWeight:600}}>{user?.name?.split(' ')[0]}</span>
            </p>
            <button onClick={logout} className="nav-link"
              style={{color:'#9CA3AF', background:'none', border:'1px solid #E5E7EB', borderRadius:8, padding:'8px 16px', fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'40px 24px'}}>

        {/* HERO PROMPT, no memberships */}
        {hasNoMemberships && (
          <div style={{background:'linear-gradient(135deg, #0A0906 0%, #1A1410 100%)', borderRadius:24, padding:'48px 40px', marginBottom:40, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', right:-40, top:-40, width:240, height:240, borderRadius:'50%', background:'rgba(192,68,43,0.08)'}} />
            <div style={{position:'absolute', right:40, bottom:-60, width:160, height:160, borderRadius:'50%', background:'rgba(201,168,76,0.05)'}} />
            <div style={{position:'relative', zIndex:1}}>
              <p style={{color:'#C0442B', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:12}}>Welcome to Regly</p>
              <h2 style={{fontFamily:'Georgia, serif', fontSize:36, fontWeight:700, color:'#F5F0E8', marginBottom:12, lineHeight:1.2}}>
                {user?.name?.split(' ')[0] ? `Hi, ${user.name.split(' ')[0]}.` : 'Welcome.'}<br />
                <span style={{color:'#C0442B', fontStyle:'italic'}}>Your memberships are waiting.</span>
              </h2>
              <p style={{color:'rgba(245,240,232,0.6)', fontSize:15, maxWidth:480, lineHeight:1.6, marginBottom:28, fontWeight:300}}>
                Browse the local businesses below and subscribe to your first membership. Real perks, every visit, starting today.
              </p>
              <button onClick={() => document.getElementById('browse')?.scrollIntoView({behavior:'smooth'})}
                style={{background:'#C0442B', color:'#1A0A06', border:'none', borderRadius:10, padding:'14px 28px', fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.05em', display:'inline-flex', alignItems:'center', gap:8}}>
                Browse Spots Near Me
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE MEMBERSHIPS */}
        {!hasNoMemberships && (
          <div style={{marginBottom:40}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
              <div>
                <h2 style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#1A0A06', margin:0}}>Your Memberships</h2>
                <p style={{color:'#9CA3AF', fontSize:14, marginTop:4}}>{myMemberships.length} active membership{myMemberships.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16}}>
              {myMemberships.map(sub => {
                const type = getCategoryType(sub.restaurants?.name)
                const accent = getCardAccent(type)
                const isRecord = type === 'record'
                return (
                  <div key={sub.id} style={{background: isRecord ? '#1A0A06' : 'white', borderRadius:20, padding:'24px', border:`1px solid ${isRecord ? 'rgba(192,68,43,0.3)' : '#F3F4F6'}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden'}}>
                    <div style={{position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'0 20px 0 80px', background: isRecord ? 'rgba(192,68,43,0.1)' : accent.light, opacity:0.8}} />
                    <div style={{position:'relative', zIndex:1}}>
                      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16}}>
                        <div style={{width:40, height:40, borderRadius:10, background: isRecord ? 'rgba(192,68,43,0.15)' : accent.light, display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <CategoryIcon type={type} />
                        </div>
                        <span style={{fontSize:11, color: isRecord ? '#C0442B' : accent.accent, background: isRecord ? 'rgba(192,68,43,0.1)' : accent.light, padding:'4px 10px', borderRadius:20, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>
                          Active
                        </span>
                      </div>
                      <p style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color: isRecord ? '#F5F0E8' : '#1A0A06', marginBottom:4}}>{sub.restaurants?.name}</p>
                      <p style={{color: isRecord ? '#C0442B' : accent.accent, fontSize:13, fontWeight:500, marginBottom:8}}>{sub.membership_tiers?.name}</p>
                      {/* Perk usage tracker */}
                      {(() => {
                        const perksConfig = sub.membership_tiers?.perks_config
                        const usageThisMonth = perkUsageMap[sub.id] || {}
                        if (perksConfig && perksConfig.length > 0) {
                          return (
                            <div style={{marginBottom:16}}>
                              {perksConfig.map((perk, pi) => {
                                const used = usageThisMonth[pi] || 0
                                const isLimited = perk.type === 'limited'
                                const limit = perk.limit || 0
                                const remaining = isLimited ? Math.max(0, limit - used) : null
                                const exhausted = isLimited && remaining === 0
                                return (
                                  <div key={pi} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${isRecord ? 'rgba(192,68,43,0.1)' : '#F9FAFB'}`}}>
                                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                                      <div style={{width:16, height:16, borderRadius:'50%', background: exhausted ? '#FEE2E2' : '#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                          <path d="M1.5 4L3 5.5L6.5 2" stroke={exhausted ? '#EF4444' : '#059669'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <span style={{fontSize:12, color: exhausted ? '#9CA3AF' : isRecord ? 'rgba(245,240,232,0.8)' : '#374151', textDecoration: exhausted ? 'line-through' : 'none'}}>{perk.description}</span>
                                    </div>
                                    <span style={{fontSize:11, fontWeight:600, color: exhausted ? '#EF4444' : isLimited ? (isRecord ? '#C0442B' : '#6B7280') : '#059669', whiteSpace:'nowrap', marginLeft:8}}>
                                      {isLimited ? (exhausted ? `Used up (${limit} total)` : `${remaining} of ${limit} left`) : 'Unlimited'}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        // Fallback to plain text perks
                        return <p style={{color: isRecord ? 'rgba(245,240,232,0.75)' : '#9CA3AF', fontSize:12, marginBottom:16, lineHeight:1.5}}>{sub.membership_tiers?.perks?.split(' | ')[0]}</p>
                      })()}
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${isRecord ? 'rgba(192,68,43,0.15)' : '#F3F4F6'}`}}>
                        <span style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color: isRecord ? '#C0442B' : '#1A0A06'}}>${sub.membership_tiers?.price_monthly}<span style={{fontSize:12, fontWeight:400, color: isRecord ? 'rgba(245,240,232,0.4)' : '#9CA3AF'}}>/mo</span></span>
                        {sub.cancel_at_period_end ? (
                          <div style={{textAlign:'right'}}>
                            <p style={{fontSize:11, color:'#EF4444', fontWeight:600, marginBottom:1}}>Cancels on</p>
                            <p style={{fontSize:11, color:'#EF4444'}}>
                              {sub.current_period_end
                                ? new Date(sub.current_period_end).toLocaleDateString('en-US', {month:'short', day:'numeric'})
                                : 'period end'}
                            </p>
                          </div>
                        ) : (
                          <button onClick={() => handleCancel(sub)} className="cancel-btn"
                            style={{color:'#D1D5DB', background:'none', border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', padding:0}}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* VISIT LOG */}
        {visitLog.length > 0 && (
            <div style={{marginBottom:40}}>
              <div style={{marginBottom:20}}>
                <h2 style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#1A0A06', margin:0}}>Visit History</h2>
                <p style={{color:'#9CA3AF', fontSize:14, marginTop:4}}>Every perk you have redeemed, most recent first</p>
              </div>
              <div style={{background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #F3F4F6'}}>
                {visitLog.map((entry, i) => {
                  const date = new Date(entry.used_at)
                  const isToday = new Date().toDateString() === date.toDateString()
                  const dateLabel = isToday ? 'Today' : date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
                  const timeLabel = date.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
                  const [year, month] = (entry.billing_month || '').split('-')
                  const monthLabel = year && month ? new Date(year, parseInt(month)-1).toLocaleDateString('en-US', { month:'long', year:'numeric' }) : ''
                  return (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:16, padding:'16px 24px', borderBottom: i < visitLog.length - 1 ? '1px solid #F9FAFB' : 'none'}}>
                      <div style={{width:40, height:40, borderRadius:10, background:'rgba(192,68,43,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="9" r="7.5" stroke="#C0442B" strokeWidth="1.2"/>
                          <path d="M9 5.5V9L11.5 11" stroke="#C0442B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{flex:1, minWidth:0}}>
                        <p style={{fontSize:14, fontWeight:600, color:'#1A0A06', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{entry.perk_description}</p>
                        <p style={{fontSize:12, color:'#9CA3AF'}}>{entry.restaurants?.name}{monthLabel ? ` · ${monthLabel}` : ''}</p>
                      </div>
                      <div style={{textAlign:'right', flexShrink:0}}>
                        <p style={{fontSize:13, fontWeight:500, color:'#374151'}}>{dateLabel}</p>
                        <p style={{fontSize:11, color:'#9CA3AF'}}>{timeLabel}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        {/* BROWSE RESTAURANTS */}
        <div id="browse">
          <div style={{marginBottom:24}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#1A0A06', margin:0}}>
              {hasNoMemberships ? 'Browse Memberships Near You' : 'Explore More Spots'}
            </h2>
            <p style={{color:'#9CA3AF', fontSize:14, marginTop:4}}>
              {restaurants.length} local businesses · Chicago, IL
            </p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16}}>
            {restaurants.map(rest => {
              const type = getCategoryType(rest.name)
              const accent = getCardAccent(type)
              const activeSub = activeSubForRestaurant(rest.id)
              const isSelected = selected?.id === rest.id
              const isRecord = type === 'record'

              return (
                <button key={rest.id} onClick={() => selectRestaurant(rest)} className="rest-card"
                  style={{textAlign:'left', background: isSelected ? (isRecord ? '#1A0A06' : accent.bg) : 'white', borderRadius:20, padding:'24px', border:`2px solid ${isSelected ? (isRecord ? '#C0442B' : accent.accent) : '#F3F4F6'}`, cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden', width:'100%', fontFamily:'inherit'}}>
                  <div style={{position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'0 20px 0 80px', background: isRecord ? 'rgba(192,68,43,0.1)' : accent.light, opacity:0.6}} />
                  <div style={{position:'relative', zIndex:1}}>
                    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14}}>
                      <div style={{width:44, height:44, borderRadius:12, background: isRecord ? 'rgba(192,68,43,0.15)' : accent.light, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <CategoryIcon type={type} />
                      </div>
                      {activeSub && (
                        <span style={{fontSize:11, color:'#059669', background:'#D1FAE5', padding:'4px 10px', borderRadius:20, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>
                          Member
                        </span>
                      )}
                    </div>
                    <p style={{fontFamily:'Georgia, serif', fontSize:17, fontWeight:700, color: isRecord ? '#F5F0E8' : '#1A0A06', marginBottom:4}}>{rest.name}</p>
                    <p style={{color: isRecord ? '#C0442B' : accent.accent, fontSize:12, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em'}}>{rest.city}</p>
                    <p style={{color: isRecord ? 'rgba(245,240,232,0.75)' : '#6B7280', fontSize:13, lineHeight:1.5, marginBottom:12}}>{rest.description}</p>
                    <p style={{color: isRecord ? 'rgba(245,240,232,0.6)' : '#9CA3AF', fontSize:12}}>{rest.address}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* TIERS */}
        {selected && (
          <div id="tiers-section" style={{marginTop:48}}>

            <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:8}}>
              <div style={{width:48, height:48, borderRadius:14, background: getCardAccent(getCategoryType(selected.name)).light, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <CategoryIcon type={getCategoryType(selected.name)} />
              </div>
              <div>
                <h3 style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#1A0A06', margin:0}}>{selected.name}</h3>
                <p style={{color:'#9CA3AF', fontSize:13, marginTop:2}}>Choose your membership tier</p>
              </div>
            </div>

            <div style={{height:2, background:'linear-gradient(to right, #C0442B, transparent)', marginBottom:32, maxWidth:200}} />

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20}}>
              {tiers.map((tier, i) => {
                const isThisTierActive  = !!activeSubForTier(tier.id)
                const hasOtherActive    = !isThisTierActive && !!activeSubForRestaurant(selected.id)
                const isPopular         = i === 1 && tiers.length >= 2
                const isPaused          = tier.is_paused && !isThisTierActive

                // Use perks_config (structured) if available, fall back to plain text
                const perksConfig = tier.perks_config && tier.perks_config.length > 0
                  ? tier.perks_config
                  : tier.perks
                    ? tier.perks.split(' | ').map(p => ({ description: p.trim(), type: 'unlimited', limit: null }))
                    : []

                return (
                  <div key={tier.id} className="tier-card-new"
                    style={{background: isPaused ? '#FAFAFA' : 'white', borderRadius:20, padding:'28px', border:`2px solid ${isThisTierActive ? '#059669' : isPopular && !isPaused ? '#C0442B' : isPaused ? '#E5E7EB' : '#F3F4F6'}`, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', opacity: isPaused ? 0.75 : 1, position:'relative', display:'flex', flexDirection:'column'}}>

                    {tier.is_paused && !isThisTierActive && (
                      <div style={{position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:'#1A0A06', color:'#F5F0E8', fontSize:10, fontWeight:700, padding:'5px 14px', borderRadius:20, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap', zIndex:1}}>
                        Limited Availability
                      </div>
                    )}

                    {isPopular && !tier.is_paused && (
                      <div style={{position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg, #C0442B, #8A2A14)', color:'white', fontSize:10, fontWeight:700, padding:'5px 14px', borderRadius:20, letterSpacing:'0.12em', textTransform:'uppercase', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(192,68,43,0.4)'}}>
                        Most Popular
                      </div>
                    )}

                    <div style={{marginBottom:20}}>
                      <p style={{color: '#9CA3AF', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8}}>
                        {tier.name}
                      </p>
                      <div style={{display:'flex', alignItems:'baseline', gap:4, marginBottom:4}}>
                        <span style={{fontFamily:'Georgia, serif', fontSize:40, fontWeight:900, color: '#1A0A06', lineHeight:1}}>${tier.price_monthly}</span>
                        <span style={{color: '#9CA3AF', fontSize:14}}>/month</span>
                      </div>
                      <p style={{color: '#9CA3AF', fontSize:12}}>Cancel anytime</p>
                    </div>

                    <div style={{flex:1, marginBottom:24}}>
                      {perksConfig.map((perk, pi) => {
                        const isLimited = perk.type === 'limited'
                        return (
                          <div key={pi} style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:10}}>
                            <div style={{display:'flex', alignItems:'flex-start', gap:10, flex:1}}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginTop:2, flexShrink:0}}>
                                <circle cx="8" cy="8" r="7" fill='#F0FDF4'/>
                                <path d="M5 8L7 10L11 6" stroke='#059669' strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{color:'#374151', fontSize:14, lineHeight:1.4, fontWeight:300}}>{perk.description}</span>
                            </div>
                            <span style={{
                              fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, whiteSpace:'nowrap', flexShrink:0, marginTop:2,
                              background: isLimited ? '#FEF9EC' : '#F0FDF4',
                              color: isLimited ? '#92400E' : '#065F46',
                            }}>
                              {isLimited ? `${perk.limit}x / mo` : 'Unlimited'}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => !isThisTierActive && !tier.is_paused && handleSubscribe(tier)}
                      disabled={subscribing === tier.id || isThisTierActive || tier.is_paused}
                      className="sub-btn"
                      style={{
                        width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:700,
                        cursor: isThisTierActive || tier.is_paused ? 'default' : 'pointer',
                        border: tier.is_paused ? '1.5px solid #E5E7EB' : 'none',
                        letterSpacing:'0.02em', fontFamily:'inherit',
                        background: isThisTierActive ? '#D1FAE5' : tier.is_paused ? '#F9FAFB' : isPopular ? '#C0442B' : '#1A0A06',
                        color: isThisTierActive ? '#059669' : tier.is_paused ? '#9CA3AF' : isPopular ? '#1A0A06' : '#F9FAFB',
                      }}>
                      {isThisTierActive ? '✓ Current Plan' : tier.is_paused ? 'Currently Not Accepting New Members' : hasOtherActive ? 'Switch Plan' : subscribing === tier.id ? 'Redirecting...' : 'Get Started'}
                    </button>
                    {tier.is_paused && !isThisTierActive && (
                      <p style={{fontSize:11, color:'#9CA3AF', textAlign:'center', marginTop:8, letterSpacing:'0.03em'}}>
                        Check back soon — spots may open up.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
