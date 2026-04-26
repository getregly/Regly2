import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Success() {
  const router = useRouter()
  const { tier, restaurant, session_id } = router.query
  const [done, setDone] = useState(false)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!tier || !restaurant || !session_id || done) return
    recordSubscription()
  }, [tier, restaurant, session_id])

  async function recordSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch tier info immediately for display
    const { data: tierData } = await supabase
      .from('membership_tiers').select('name, perks, perks_config, restaurants(name)').eq('id', tier).single()
    setInfo(tierData)

    // Poll for subscription created by webhook — may take a few seconds
    let attempts = 0
    const poll = async () => {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('customer_id', user.id)
        .eq('tier_id', tier)
        .in('status', ['active', 'past_due'])
        .maybeSingle()
      if (sub || attempts >= 8) {
        setDone(true)
      } else {
        attempts++
        setTimeout(poll, 2000)
      }
    }
    poll()
  }

  // Use perks_config if available, fall back to plain text
  const perks = (() => {
    if (info?.perks_config && info.perks_config.length > 0) return info.perks_config
    if (info?.perks) return info.perks.split(' | ').map(p => ({ description: p.trim(), type: 'unlimited', limit: null }))
    return []
  })()

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', fontFamily:"'Inter', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Card */}
      <div style={{background:'white', borderRadius:24, padding:'48px 40px', maxWidth:480, width:'100%', boxShadow:'0 4px 32px rgba(0,0,0,0.08)', textAlign:'center'}}>

        {/* Success icon */}
        <div style={{width:72, height:72, background:'linear-gradient(135deg, #C0442B, #8A2A14)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px'}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16L13 23L26 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p style={{color:'#C0442B', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:600, marginBottom:8}}>Membership Confirmed</p>
        <h1 style={{fontFamily:'Georgia, serif', fontSize:32, fontWeight:700, color:'#1A0A06', marginBottom:8, lineHeight:1.2}}>
          You're a Regular!
        </h1>
        {info && (
          <p style={{color:'#6B7280', fontSize:16, marginBottom:32}}>
            Welcome to <span style={{color:'#1A0A06', fontWeight:600}}>{info.restaurants?.name}</span>
          </p>
        )}

        {/* Membership details */}
        {info && (
          <div style={{background:'#F9FAFB', borderRadius:16, padding:'24px', textAlign:'left', marginBottom:24}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:16, borderBottom:'1px solid #F3F4F6'}}>
              <div>
                <p style={{fontSize:11, color:'#9CA3AF', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, marginBottom:4}}>Your Plan</p>
                <p style={{fontSize:18, fontFamily:'Georgia, serif', fontWeight:700, color:'#1A0A06'}}>{info.name}</p>
              </div>
              <div style={{width:40, height:40, background:'rgba(192,68,43,0.1)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 1L10 19M1 10L19 10M3.05 3.05L16.95 16.95M16.95 3.05L3.05 16.95" stroke="#C0442B" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {perks.length > 0 && (
              <div>
                <p style={{fontSize:11, color:'#9CA3AF', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, marginBottom:12}}>Your Perks</p>
                {perks.map((perk, i) => {
                  const isLimited = perk.type === 'limited'
                  return (
                    <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:10, padding:'10px 12px', background:'white', borderRadius:10, border:'1px solid #F3F4F6'}}>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{width:8, height:8, borderRadius:'50%', background:'#C0442B', flexShrink:0}} />
                        <span style={{fontSize:14, color:'#374151', lineHeight:1.5}}>{perk.description}</span>
                      </div>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, whiteSpace:'nowrap', flexShrink:0,
                        background: isLimited ? '#FEF9EC' : '#F0FDF4',
                        color: isLimited ? '#92400E' : '#065F46',
                      }}>
                        {isLimited ? `${perk.limit}x / month` : 'Unlimited'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* How to redeem */}
        <div style={{background:'rgba(201,168,76,0.06)', border:'1px solid rgba(192,68,43,0.2)', borderRadius:16, padding:'20px', textAlign:'left', marginBottom:32}}>
          <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
            <div style={{width:36, height:36, background:'rgba(192,68,43,0.15)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="5" y="1" width="8" height="16" rx="1.5" stroke="#C0442B" strokeWidth="1.2"/>
                <path d="M5 13H13M5 5H13" stroke="#C0442B" strokeWidth="1.2"/>
                <circle cx="9" cy="15" r="0.8" fill="#C0442B"/>
              </svg>
            </div>
            <div>
              <p style={{fontSize:13, fontWeight:600, color:'#92400E', marginBottom:4}}>How to use your membership</p>
              <p style={{fontSize:13, color:'#78350F', lineHeight:1.6}}>
                Give your phone number at the counter when you visit. Staff will verify your membership and apply your perks instantly.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/customer')}
          style={{width:'100%', padding:'15px', background:'#1A0A06', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.01em'}}>
          Go to My Dashboard
        </button>

        <p style={{color:'#9CA3AF', fontSize:12, marginTop:16}}>
          Manage or cancel anytime from your dashboard
        </p>
      </div>

      {/* Logo */}
      <p style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color:'#9CA3AF', marginTop:32}}>
        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:"inherit",letterSpacing:"-0.01em"}}>Regly</span>
      </p>
    </div>
  )
}
