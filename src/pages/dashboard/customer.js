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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:'#C9A84C'}}>
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
    record:   { bg:'#0A0906', accent:'#C9A84C', light:'#1A1410' },
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
  const [loading, setLoading]             = useState(true)
  const [subscribing, setSubscribing]     = useState(null)
  const [hoveredCard, setHoveredCard]     = useState(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { router.push('/'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    if (profile?.role !== 'customer') { router.push('/'); return }
    setUser(profile)
    const { data: rests } = await supabase.from('restaurants').select('*').order('name')
    setRestaurants(rests || [])
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*, restaurants(name), membership_tiers(name, price_monthly, perks)')
      .eq('customer_id', u.id)
      .eq('status', 'active')
    setMyMemberships(subs || [])
    setLoading(false)
  }

  async function selectRestaurant(rest) {
    setSelected(rest)
    const { data } = await supabase.from('membership_tiers').select('*').eq('restaurant_id', rest.id).order('price_monthly')
    setTiers(data || [])
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
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      alert('Something went wrong: ' + err.message)
    } finally {
      setSubscribing(null)
    }
  }

  async function handleCancel(sub) {
    if (!confirm('Cancel this membership?')) return
    await fetch('/api/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: sub.stripe_subscription_id, subId: sub.id }),
    })
    setMyMemberships(m => m.filter(s => s.id !== sub.id))
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
        <p style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#111827', marginBottom:8}}>REGL<span style={{color:'#C9A84C'}}>Y</span></p>
        <p style={{color:'#9CA3AF', fontSize:14}}>Loading your memberships...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif"}}>
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
          <p style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#111827', margin:0}}>
            REGL<span style={{color:'#C9A84C'}}>Y</span>
          </p>
          <div style={{display:'flex', alignItems:'center', gap:20}}>
            <p style={{color:'#6B7280', fontSize:14, margin:0}}>
              Hi, <span style={{color:'#111827', fontWeight:600}}>{user?.name?.split(' ')[0]}</span>
            </p>
            <button onClick={logout} className="nav-link"
              style={{color:'#9CA3AF', background:'none', border:'1px solid #E5E7EB', borderRadius:8, padding:'8px 16px', fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'40px 24px'}}>

        {/* HERO PROMPT — no memberships */}
        {hasNoMemberships && (
          <div style={{background:'linear-gradient(135deg, #0A0906 0%, #1A1410 100%)', borderRadius:24, padding:'48px 40px', marginBottom:40, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', right:-40, top:-40, width:240, height:240, borderRadius:'50%', background:'rgba(201,168,76,0.08)'}} />
            <div style={{position:'absolute', right:40, bottom:-60, width:160, height:160, borderRadius:'50%', background:'rgba(201,168,76,0.05)'}} />
            <div style={{position:'relative', zIndex:1}}>
              <p style={{color:'#C9A84C', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:12}}>Get Started</p>
              <h2 style={{fontFamily:'Georgia, serif', fontSize:36, fontWeight:700, color:'#F5F0E8', marginBottom:12, lineHeight:1.2}}>
                Become a member at<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>your favorite places.</span>
              </h2>
              <p style={{color:'rgba(245,240,232,0.6)', fontSize:15, maxWidth:480, lineHeight:1.6, marginBottom:28, fontWeight:300}}>
                Pick a spot below, choose a membership tier, and start getting real perks every time you visit. Cancel anytime.
              </p>
              <button onClick={() => document.getElementById('browse')?.scrollIntoView({behavior:'smooth'})}
                style={{background:'#C9A84C', color:'#0A0906', border:'none', borderRadius:10, padding:'14px 28px', fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.05em', display:'inline-flex', alignItems:'center', gap:8}}>
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
                <h2 style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#111827', margin:0}}>Your Memberships</h2>
                <p style={{color:'#9CA3AF', fontSize:14, marginTop:4}}>{myMemberships.length} active membership{myMemberships.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16}}>
              {myMemberships.map(sub => {
                const type = getCategoryType(sub.restaurants?.name)
                const accent = getCardAccent(type)
                const isRecord = type === 'record'
                return (
                  <div key={sub.id} style={{background: isRecord ? '#0A0906' : 'white', borderRadius:20, padding:'24px', border:`1px solid ${isRecord ? 'rgba(201,168,76,0.3)' : '#F3F4F6'}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden'}}>
                    <div style={{position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'0 20px 0 80px', background: isRecord ? 'rgba(201,168,76,0.1)' : accent.light, opacity:0.8}} />
                    <div style={{position:'relative', zIndex:1}}>
                      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16}}>
                        <div style={{width:40, height:40, borderRadius:10, background: isRecord ? 'rgba(201,168,76,0.15)' : accent.light, display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <CategoryIcon type={type} />
                        </div>
                        <span style={{fontSize:11, color: isRecord ? '#C9A84C' : accent.accent, background: isRecord ? 'rgba(201,168,76,0.1)' : accent.light, padding:'4px 10px', borderRadius:20, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>
                          Active
                        </span>
                      </div>
                      <p style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color: isRecord ? '#F5F0E8' : '#111827', marginBottom:4}}>{sub.restaurants?.name}</p>
                      <p style={{color: isRecord ? '#C9A84C' : accent.accent, fontSize:13, fontWeight:500, marginBottom:8}}>{sub.membership_tiers?.name}</p>
                      <p style={{color: isRecord ? 'rgba(245,240,232,0.5)' : '#9CA3AF', fontSize:12, marginBottom:16, lineHeight:1.5}}>{sub.membership_tiers?.perks?.split(' | ')[0]}</p>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:16, borderTop:`1px solid ${isRecord ? 'rgba(201,168,76,0.15)' : '#F3F4F6'}`}}>
                        <span style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color: isRecord ? '#C9A84C' : '#111827'}}>${sub.membership_tiers?.price_monthly}<span style={{fontSize:12, fontWeight:400, color: isRecord ? 'rgba(245,240,232,0.4)' : '#9CA3AF'}}>/mo</span></span>
                        <button onClick={() => handleCancel(sub)} className="cancel-btn"
                          style={{color:'#D1D5DB', background:'none', border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', padding:0}}>
                          Cancel
                        </button>
                      </div>
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
            <h2 style={{fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color:'#111827', margin:0}}>
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
                  style={{textAlign:'left', background: isSelected ? (isRecord ? '#0A0906' : accent.bg) : 'white', borderRadius:20, padding:'24px', border:`2px solid ${isSelected ? (isRecord ? '#C9A84C' : accent.accent) : '#F3F4F6'}`, cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden', width:'100%', fontFamily:'inherit'}}>
                  <div style={{position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'0 20px 0 80px', background: isRecord ? 'rgba(201,168,76,0.1)' : accent.light, opacity:0.6}} />
                  <div style={{position:'relative', zIndex:1}}>
                    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14}}>
                      <div style={{width:44, height:44, borderRadius:12, background: isRecord ? 'rgba(201,168,76,0.15)' : accent.light, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <CategoryIcon type={type} />
                      </div>
                      {activeSub && (
                        <span style={{fontSize:11, color:'#059669', background:'#D1FAE5', padding:'4px 10px', borderRadius:20, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>
                          Member
                        </span>
                      )}
                    </div>
                    <p style={{fontFamily:'Georgia, serif', fontSize:17, fontWeight:700, color: isRecord ? '#F5F0E8' : '#111827', marginBottom:4}}>{rest.name}</p>
                    <p style={{color: isRecord ? '#C9A84C' : accent.accent, fontSize:12, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em'}}>{rest.city}</p>
                    <p style={{color: isRecord ? 'rgba(245,240,232,0.5)' : '#6B7280', fontSize:13, lineHeight:1.5, marginBottom:12}}>{rest.description}</p>
                    <p style={{color: isRecord ? 'rgba(245,240,232,0.3)' : '#9CA3AF', fontSize:12}}>{rest.address}</p>
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
                <h3 style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#111827', margin:0}}>{selected.name}</h3>
                <p style={{color:'#9CA3AF', fontSize:13, marginTop:2}}>Choose your membership tier</p>
              </div>
            </div>

            <div style={{height:2, background:'linear-gradient(to right, #C9A84C, transparent)', marginBottom:32, maxWidth:200}} />

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20}}>
              {tiers.map((tier, i) => {
                const isThisTierActive  = !!activeSubForTier(tier.id)
                const hasOtherActive    = !isThisTierActive && !!activeSubForRestaurant(selected.id)
                const isPopular         = i === 1 && tiers.length >= 2
                const perksArr = tier.perks ? tier.perks.split(' | ') : [tier.perks]

                return (
                  <div key={tier.id} className="tier-card-new"
                    style={{background: isPopular ? '#0A0906' : 'white', borderRadius:20, padding:'28px', border:`2px solid ${isThisTierActive ? '#059669' : isPopular ? '#C9A84C' : '#F3F4F6'}`, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', position:'relative', display:'flex', flexDirection:'column'}}>

                    {isPopular && (
                      <div style={{position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#C9A84C', color:'#0A0906', fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap'}}>
                        Most Popular
                      </div>
                    )}

                    <div style={{marginBottom:20}}>
                      <p style={{color: isPopular ? 'rgba(201,168,76,0.7)' : '#9CA3AF', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8}}>
                        {tier.name}
                      </p>
                      <div style={{display:'flex', alignItems:'baseline', gap:4, marginBottom:4}}>
                        <span style={{fontFamily:'Georgia, serif', fontSize:40, fontWeight:900, color: isPopular ? '#C9A84C' : '#111827', lineHeight:1}}>${tier.price_monthly}</span>
                        <span style={{color: isPopular ? 'rgba(245,240,232,0.4)' : '#9CA3AF', fontSize:14}}>/month</span>
                      </div>
                      <p style={{color: isPopular ? 'rgba(245,240,232,0.4)' : '#9CA3AF', fontSize:12}}>Cancel anytime</p>
                    </div>

                    <div style={{flex:1, marginBottom:24}}>
                      {perksArr.map((perk, pi) => (
                        <div key={pi} style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:10}}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginTop:2, flexShrink:0}}>
                            <circle cx="8" cy="8" r="7" fill={isPopular ? 'rgba(201,168,76,0.2)' : '#F0FDF4'}/>
                            <path d="M5 8L7 10L11 6" stroke={isPopular ? '#C9A84C' : '#059669'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{color: isPopular ? 'rgba(245,240,232,0.8)' : '#374151', fontSize:14, lineHeight:1.4, fontWeight:300}}>{perk}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => !isThisTierActive && handleSubscribe(tier)}
                      disabled={subscribing === tier.id || isThisTierActive}
                      className="sub-btn"
                      style={{
                        width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:700, cursor: isThisTierActive ? 'default' : 'pointer', border:'none', letterSpacing:'0.02em', fontFamily:'inherit',
                        background: isThisTierActive ? '#D1FAE5' : isPopular ? '#C9A84C' : '#111827',
                        color: isThisTierActive ? '#059669' : isPopular ? '#0A0906' : '#F9FAFB',
                      }}>
                      {isThisTierActive ? '✓ Current Plan' : hasOtherActive ? 'Switch Plan' : subscribing === tier.id ? 'Redirecting...' : 'Get Started'}
                    </button>
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
