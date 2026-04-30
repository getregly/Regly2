// src/pages/browse.js
// Public browse page — no auth required
// Shows all live restaurants and their membership tiers
// Clicking a tier prompts login/signup then goes straight to checkout

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Browse() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Fetch all restaurants with full detail for debugging
      const { data: rests, error: restErr } = await supabase
        .from('restaurants')
        .select('id, name, address, city, description, stripe_onboarding_complete')
        .order('name')

      if (!rests || rests.length === 0) { setLoading(false); return }

      // Filter to only fully live restaurants
      const liveRests = rests.filter(r =>
        r.stripe_onboarding_complete === true || r.stripe_onboarding_complete === 'true'
      )

      if (liveRests.length === 0) {
        // Show all restaurants anyway in dev so we can see data
        // Remove this block before going live
        const { data: allTiers } = await supabase
          .from('membership_tiers')
          .select('id, name, price_monthly, perks, perks_config, restaurant_id, stripe_price_id, is_paused')
          .in('restaurant_id', rests.map(r => r.id))
          .order('price_monthly')
        setLoading(false)
        return
      }

      // Fetch tiers for all restaurants in one query
      const { data: tiers, error: tierErr } = await supabase
        .from('membership_tiers')
        .select('id, name, price_monthly, perks, perks_config, restaurant_id, stripe_price_id, is_paused')
        .in('restaurant_id', liveRests.map(r => r.id))
        .order('price_monthly')

      // Attach tiers to restaurants
      // Show approved tiers (has stripe_price_id) including paused ones
      // Paused tiers show with Limited Availability badge like the member dashboard
      const enriched = liveRests
        .map(r => ({
          ...r,
          tiers: (tiers || []).filter(t =>
            t.restaurant_id === r.id &&
            t.stripe_price_id &&
            t.stripe_price_id !== ''
          )
        }))
        .filter(r => r.tiers.length > 0)
      setRestaurants(enriched)
      setLoading(false)
    }
    load()
  }, [])

  function handleTierClick(restaurant, tier) {
    // Store intent in sessionStorage so auth page can pick it up after login/signup
    sessionStorage.setItem('regly_tier_intent', JSON.stringify({
      tierId: tier.id,
      restaurantId: restaurant.id,
      tierName: tier.name,
      restaurantName: restaurant.name,
      price: tier.price_monthly,
    }))
    // Go to auth in signup mode with customer role pre-selected
    // Pass tier/restaurant as params for direct access
    router.push(`/auth?mode=signup&role=customer&tierId=${tier.id}&restaurantId=${restaurant.id}`)
  }

  const filtered = restaurants

  return (
    <>
      <Head>
        <title>Browse Memberships — Regly</title>
        <meta name="description" content="Discover local business memberships in your area. Get exclusive perks and support the places you love." />
      </Head>

      <div style={{minHeight:'100vh', background:'#F5F0E8', fontFamily:"'Inter',system-ui,sans-serif"}}>

        {/* ── NAV ────────────────────────────────────────────── */}
        <nav style={{background:'white', borderBottom:'1px solid #F0EFEC', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
          <button onClick={() => router.push('/')}
            style={{display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0}}>
            <img src="/favicon.svg" width="22" height="26" alt="Regly" style={{display:'inline-block', verticalAlign:'middle'}}/>
            <span style={{fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontStyle:'italic', fontSize:20, color:'#1A0A06', letterSpacing:'-0.01em'}}>Regly</span>
          </button>
          <button onClick={() => router.push('/auth')}
            style={{padding:'9px 20px', background:'#1A0A06', color:'#F5F0E8', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}
            onMouseEnter={e => e.currentTarget.style.background='#C0442B'}
            onMouseLeave={e => e.currentTarget.style.background='#1A0A06'}>
            Log in
          </button>
        </nav>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{background:'#1A0A06', padding:'56px 24px 48px'}}>
          <div style={{maxWidth:860, margin:'0 auto'}}>
            <p style={{fontSize:11, fontWeight:700, color:'#C0442B', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12}}>Memberships</p>
            <h1 style={{fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontStyle:'italic', fontSize:'clamp(32px,5vw,52px)', color:'#F5F0E8', marginBottom:16, letterSpacing:'-0.02em', lineHeight:1.15}}>
              Support the places<br/>you already love.
            </h1>
            <p style={{fontSize:16, color:'rgba(245,240,232,0.6)', maxWidth:480, lineHeight:1.65, marginBottom:32, fontWeight:300}}>
              Subscribe to local business memberships and get real perks on every visit.
            </p>


          </div>
        </div>

        {/* ── CONTENT ────────────────────────────────────────── */}
        <div style={{maxWidth:860, margin:'0 auto', padding:'40px 24px 80px'}}>

          {loading && (
            <div style={{textAlign:'center', padding:'80px 0', color:'#9CA3AF', fontSize:14}}>
              Loading memberships...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{textAlign:'center', padding:'80px 0'}}>
              <p style={{fontSize:16, fontWeight:600, color:'#374151', marginBottom:8}}>
                'No memberships available yet'
              </p>
              <p style={{fontSize:14, color:'#9CA3AF'}}>
                'Check back soon. Businesses are joining Regly.'
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:24}}>
              {filtered.map(restaurant => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onTierClick={handleTierClick}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}

function RestaurantCard({ restaurant, onTierClick }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.07)'}}>

      {/* Restaurant header */}
      <div style={{padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F3F4F6', cursor:'pointer'}}
        onClick={() => setExpanded(e => !e)}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          {/* Initial avatar */}
          <div style={{width:48, height:48, background:'#C0442B', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <span style={{fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:22, color:'#F5F0E8'}}>
              {restaurant.name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 style={{fontSize:18, fontWeight:700, color:'#1A0A06', margin:0, letterSpacing:'-0.01em'}}>
              {restaurant.name}
            </h2>
            {(restaurant.address || restaurant.city) && (
              <p style={{fontSize:13, color:'#9CA3AF', margin:'3px 0 0', display:'flex', alignItems:'center', gap:4}}>
                <svg width="11" height="13" viewBox="0 0 110 132" fill="none" style={{opacity:0.5}}>
                  <path d="M55 3C27 3 5 25 5 53C5 81 55 129 55 129C55 129 105 81 105 53C105 25 83 3 55 3Z" fill="#9CA3AF"/>
                </svg>
                {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:12, color:'#9CA3AF'}}>
            {restaurant.tiers.length} tier{restaurant.tiers.length !== 1 ? 's' : ''}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s'}}>
            <path d="M4 6L8 10L12 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Description */}
      {expanded && restaurant.description && (
        <div style={{padding:'16px 28px 0', borderBottom:'none'}}>
          <p style={{fontSize:13, color:'#6B7280', lineHeight:1.65, margin:0}}>{restaurant.description}</p>
        </div>
      )}

      {/* Tier cards */}
      {expanded && (
        <div style={{padding:'16px 28px 24px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:14}}>
          {restaurant.tiers.map((tier, i) => (
            <TierCard
              key={tier.id}
              tier={tier}
              isPopular={i === 1 && restaurant.tiers.length >= 2}
              onSelect={() => onTierClick(restaurant, tier)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TierCard({ tier, isPopular, onSelect }) {
  const isPaused = tier.is_paused

  // Parse perks
  const perks = tier.perks_config && tier.perks_config.length > 0
    ? tier.perks_config
    : (tier.perks || '').split('|').map(p => ({ description: p.trim() })).filter(p => p.description)

  return (
    <div style={{
      border: isPaused ? '1.5px solid #E5E7EB' : isPopular ? '2px solid #C0442B' : '1.5px solid #F3F4F6',
      borderRadius:14,
      overflow:'hidden',
      display:'flex',
      flexDirection:'column',
      position:'relative',
      opacity: isPaused ? 0.85 : 1,
    }}>

      {/* Limited Availability badge — paused tiers */}
      {isPaused && (
        <div style={{position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', background:'#1A0A06', color:'#F5F0E8', fontSize:9, fontWeight:700, padding:'4px 12px', borderRadius:'0 0 8px 8px', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap'}}>
          Limited Availability
        </div>
      )}

      {/* Popular badge — only when not paused */}
      {isPopular && !isPaused && (
        <div style={{position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', background:'#C0442B', color:'#F5F0E8', fontSize:9, fontWeight:700, padding:'4px 12px', borderRadius:'0 0 8px 8px', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap'}}>
          Most Popular
        </div>
      )}

      {/* Tier info */}
      <div style={{padding:'20px 18px 14px'}}>
        <p style={{fontSize:14, fontWeight:700, color:'#1A0A06', marginBottom:4}}>{tier.name.replace(/^.* - /, '')}</p>
        <p style={{fontSize:24, fontWeight:700, color:'#1A0A06', fontFamily:"'Playfair Display',Georgia,serif", marginBottom:14}}>
          ${tier.price_monthly}<span style={{fontSize:12, fontWeight:400, color:'#9CA3AF'}}>/mo</span>
        </p>

        {/* Perks list */}
        <div style={{display:'flex', flexDirection:'column', gap:7}}>
          {perks.slice(0, 4).map((perk, i) => (
            <div key={i} style={{display:'flex', alignItems:'flex-start', gap:8}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0, marginTop:1}}>
                <circle cx="7" cy="7" r="6" fill="#C0442B" opacity="0.12"/>
                <path d="M4 7L6 9L10 5" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{fontSize:12, color:'#4B5563', lineHeight:1.5}}>
                {perk.description}
                {perk.type === 'limited' && perk.limit
                  ? <span style={{color:'#9CA3AF'}}> ({perk.limit}x/month)</span>
                  : <span style={{color:'#9CA3AF'}}> (unlimited)</span>
                }
              </span>
            </div>
          ))}
          {perks.length > 4 && (
            <p style={{fontSize:11, color:'#9CA3AF', margin:0}}>+{perks.length - 4} more perks</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:'0 18px 18px', marginTop:'auto'}}>
        <button
          onClick={isPaused ? undefined : onSelect}
          disabled={isPaused}
          style={{
            width:'100%', padding:'11px', borderRadius:9,
            background: isPaused ? '#F9FAFB' : isPopular ? '#C0442B' : '#1A0A06',
            color: isPaused ? '#9CA3AF' : '#F5F0E8',
            border: isPaused ? '1px solid #E5E7EB' : 'none',
            fontSize:13, fontWeight:700,
            cursor: isPaused ? 'default' : 'pointer',
            fontFamily:'inherit', letterSpacing:'0.02em',
          }}
          onMouseEnter={e => { if (!isPaused) e.currentTarget.style.opacity='0.88' }}
          onMouseLeave={e => { if (!isPaused) e.currentTarget.style.opacity='1' }}>
          {isPaused ? 'Currently Not Accepting New Members' : 'Get Started'}
        </button>
      </div>
    </div>
  )
}
