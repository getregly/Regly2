import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// ─── Responsive hook ──────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(768)
  useEffect(() => {
    setWidth(window.innerWidth)
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

// ─── Icons ────────────────────────────────────────────────────────
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ─── Main Landing Page ────────────────────────────────────────────
export default function Home() {
  const router = useRouter()
  const width = useWindowWidth()
  const isMobile = width < 768
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{minHeight:'100vh', background:'#FFFFFF', fontFamily:"'DM Sans', system-ui, sans-serif", overflowX:'hidden'}}>
    <Head>
      <title>Regly — Memberships for the Places You Love</title>
      <meta name="description" content="Regly lets you subscribe to the local businesses you love and get real perks every visit. No points. No punch cards. Actual value, instantly." />
      <meta property="og:title" content="Regly — Memberships for the Places You Love" />
      <meta property="og:description" content="Regly lets you subscribe to the local businesses you love and get real perks every visit. No points. No punch cards. Actual value, instantly." />
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp 0.8s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.8s ease 0.15s forwards; opacity:0; }
        .fade-up-3 { animation: fadeUp 0.8s ease 0.3s forwards; opacity:0; }
        .fade-up-4 { animation: fadeUp 0.8s ease 0.45s forwards; opacity:0; }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); }
        .perk-card:hover { border-color: rgba(192,68,43,0.4) !important; }
        .nav-link { color: #374151; font-size: 14px; font-weight: 500; background: none; border: none; cursor: pointer; font-family: inherit; transition: color 0.2s; }
        .nav-link:hover { color: #111827; }
        @keyframes shimmer { 0%,100% { opacity:0.04; } 50% { opacity:0.08; } }
        .shimmer { animation: shimmer 5s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'nav-blur' : ''}`}
        style={{background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid #F3F4F6', padding: isMobile ? '0 20px' : '0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button onClick={() => router.push('/')}
          style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#1A0A06', background:'none', border:'none', cursor:'pointer'}}>
          <img src="/favicon.svg" width="20" height="24" alt="Regly" style={{display:"inline-block",verticalAlign:"middle"}}/><span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:'italic',fontSize:20,color:'#1A0A06',letterSpacing:'-0.01em'}}>Regly</span>
        </button>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <button onClick={() => router.push('/browse')}
            style={{padding:'10px 20px', background:'none', color:'#1A0A06', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', marginRight:8}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1A0A06' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#E8E5DF' }}>
            Browse
          </button>
          <button onClick={() => router.push('/auth')}
            style={{padding:'10px 20px', background:'#1A0A06', color:'#F5F0E8', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s'}}
            onMouseEnter={e => e.currentTarget.style.background='#C0442B'}
            onMouseLeave={e => e.currentTarget.style.background='#1A0A06'}>
            Log in
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{minHeight:'100vh', position:'relative', display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden'}}>
        <img
          src="https://images.unsplash.com/photo-1653795164352-6f4ba840f525?q=80&w=2670&auto=format&fit=crop"
          alt="Restaurant"
          style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 40%'}}
        />
        <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.88) 100%)'}} />

        <div className="fade-up" style={{position:'relative', zIndex:10, maxWidth:1100, margin:'0 auto', padding: isMobile ? '0 24px 60px' : '0 40px 80px', width:'100%'}}>
          <p style={{fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(192,68,43,0.9)', fontWeight:600, marginBottom:20}}>Built for local businesses</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:'clamp(3rem, 7vw, 6.5rem)', fontWeight:700, color:'#FFFFFF', lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:28, maxWidth:800}}>
            Your favorite spots,<br />
            <span style={{color:'#C0442B', fontStyle:'italic'}}>rewarding you</span><br />
            every visit.
          </h1>
          <p className="fade-up-2" style={{fontSize:18, color:'rgba(255,255,255,0.75)', fontWeight:300, maxWidth:520, lineHeight:1.65, marginBottom:40}}>
            Regly is the membership platform for local businesses. Subscribe to the spots you already love and get real perks every time you walk in. Not points. Not punch cards. Actual value, instantly.
          </p>
          <div className="fade-up-3" style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <button onClick={() => router.push('/browse')}
              style={{display:'flex', alignItems:'center', gap:10, padding:'14px 28px', background:'#C0442B', color:'#1A0A06', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'opacity 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              Browse memberships <ArrowRight />
            </button>
            <button onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}
              style={{padding:'14px 24px', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit', backdropFilter:'blur(8px)'}}>
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* ── STAT BAR ────────────────────────────────────────────── */}
      <section style={{background:'#1A0A06', padding:'32px 40px'}}>
        <div style={{maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 24 : 32}}>
          {[
            { n:'Day one',   l:'Perks start from your first visit' },
            { n:'No app',    l:'Required. Just your phone number' },
            { n:'Unlimited', l:'Perks every single visit' },
            { n:'Cancel',    l:'Anytime. No questions asked' },
          ].map(s => (
            <div key={s.n} style={{textAlign:'center'}}>
              <p style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#C0442B', marginBottom:4}}>{s.n}</p>
              <p style={{fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:400, letterSpacing:'0.02em'}}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how" style={{padding: isMobile ? '72px 24px' : '120px 40px', background:'#FFFFFF'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{marginBottom: isMobile ? 48 : 72}}>
            <p style={{fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'#C0442B', fontWeight:600, marginBottom:16}}>How it works</p>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:'clamp(2rem, 4vw, 3.5rem)', fontWeight:700, color:'#1A0A06', lineHeight:1.1, maxWidth:600}}>
              Simple for businesses.<br />
              <span style={{fontStyle:'italic', color:'#1A0A06'}}>Effortless for customers.</span>
            </h2>
          </div>

          {/* Split steps */}
          <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:2}}>
            {[
              {
                n:'01', title:'Find a business you love,',
                body:'Browse local businesses on Regly and see exactly what each membership includes before you commit. Perks, pricing, and everything in between.',
                img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&fit=crop',
                dark: true,
              },
              {
                n:'02', title:'Customer subscribes in two minutes',
                body:'Customers browse local businesses on Regly, pick a membership tier, and subscribe with their credit card. They see exactly what they get before they pay a cent.',
                img:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&fit=crop',
                dark: false,
              },
              {
                n:'03', title:'Phone number at the counter',
                body:'When a member visits, they give their phone number at the counter. Staff look them up instantly in the Regly dashboard and apply their perks. No app. No card. No hardware.',
                img:'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80&fit=crop',
                dark: false,
              },
              {
                n:'04', title:'Perks that reset automatically,',
                body:'Your membership is automatically renewed and your perks reset each cycle. No action needed. Just show up and enjoy the benefits you signed up for.',
                img:'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80&fit=crop',
                dark: true,
              },
            ].map((step, i) => (
              <div key={step.n} style={{position:'relative', height:420, overflow:'hidden', cursor:'default'}}>
                <img src={step.img} alt={step.title} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}} />
                <div style={{position:'absolute', inset:0, background: step.dark ? 'rgba(10,9,6,0.72)' : 'rgba(245,240,232,0.88)'}} />
                <div style={{position:'absolute', inset:0, padding:'40px', display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
                  <p style={{fontFamily:'Georgia, serif', fontSize:48, fontWeight:700, color: step.dark ? 'rgba(201,168,76,0.25)' : 'rgba(138,106,32,0.2)', lineHeight:1, marginBottom:12}}>{step.n}</p>
                  <h3 style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color: step.dark ? '#F5F0E8' : '#1A0A06', marginBottom:12, lineHeight:1.2}}>{step.title}</h3>
                  <p style={{fontSize:14, color: step.dark ? 'rgba(245,240,232,0.65)' : '#4B5563', lineHeight:1.65, fontWeight:300, maxWidth:360}}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO BREAK with quote ───────────────────────────────── */}
      <section style={{position:'relative', height:480, overflow:'hidden'}}>
        <img
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1800&q=85&fit=crop"
          alt="Restaurant"
          style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 50%'}}
        />
        <div style={{position:'absolute', inset:0, background:'linear-gradient(105deg, rgba(10,9,6,0.82) 0%, rgba(10,9,6,0.3) 100%)'}} />
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', padding: isMobile ? '0 28px' : '0 80px'}}>
          <div style={{maxWidth:560}}>
            <div style={{width:32, height:2, background:'#C0442B', marginBottom:24}} />
            <p style={{fontFamily:'Georgia, serif', fontSize:'clamp(1.6rem, 3.5vw, 2.8rem)', fontStyle:'italic', fontWeight:400, color:'#F5F0E8', lineHeight:1.3, marginBottom:20}}>
              "Your regulars are already there. Regly gives them a reason to never go anywhere else."
            </p>
            <p style={{fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(192,68,43,0.7)', fontWeight:600}}>Regly</p>
          </div>
        </div>
      </section>

      {/* ── THE POSSIBILITIES ───────────────────────────────────── */}
      <section style={{padding: isMobile ? '72px 24px' : '120px 40px', background:'#FAFAF8'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 80, alignItems:'start', marginBottom: isMobile ? 48 : 80}}>
            <div>
              <p style={{fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'#C0442B', fontWeight:600, marginBottom:16}}>The possibilities</p>
              <h2 style={{fontFamily:'Georgia, serif', fontSize:'clamp(2rem, 4vw, 3.2rem)', fontWeight:700, color:'#1A0A06', lineHeight:1.1}}>
                What could be<br />
                <span style={{fontStyle:'italic', color:'#1A0A06'}}>waiting for you.</span>
              </h2>
            </div>
            <div style={{paddingTop:8}}>
              <p style={{fontSize:16, color:'#6A5A50', lineHeight:1.7, fontWeight:300}}>
                Every business on Regly designs their own membership from scratch. There are no templates and no boxes to fit into. The only limit is creativity. A few ideas to get you thinking:
              </p>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16}}>
            {[
              { title:'Free item every visit',        sub:'Restaurant',       icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 15C3 15 4.5 10 12 10C19.5 10 21 15 21 15" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 10V6" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/><circle cx="12" cy="4.5" r="1.5" stroke="#C0442B" strokeWidth="1.4"/><path d="M3 17H21" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Free coffee every morning',    sub:'Coffee Shop',      icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 10H17V19C17 19.55 16.55 20 16 20H6C5.45 20 5 19.55 5 19V10Z" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><path d="M17 12H19C19.83 12 20.5 12.67 20.5 13.5V14.5C20.5 15.33 19.83 16 19 16H17" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 7C8 7 8 5.5 10 5.5C12 5.5 12 4 12 4" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Access to the secret menu',    sub:'Any Business',     icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="14" height="12" rx="1.5" stroke="#C0442B" strokeWidth="1.4"/><path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="#C0442B" strokeWidth="1.4"/><circle cx="12" cy="13" r="1.5" stroke="#C0442B" strokeWidth="1.4"/></svg> },
              { title:'Free merch on signup',         sub:'Any Business',     icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 3H15L17 7H21L19 10H15V21H9V10H5L3 7H7L9 3Z" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
              { title:'Reserved seating, always',     sub:'Bar / Lounge',     icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="9" width="14" height="8" rx="1.5" stroke="#C0442B" strokeWidth="1.4"/><path d="M3 13H5M19 13H21" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/><path d="M9 17V21M15 17V21" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Birthday month bonus',         sub:'Restaurant',       icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="12" width="14" height="9" rx="1.5" stroke="#C0442B" strokeWidth="1.4"/><path d="M7 12V10C7 8.9 7.9 8 9 8H15C16.1 8 17 8.9 17 10V12" stroke="#C0442B" strokeWidth="1.4"/><path d="M9 8V7M12 8V5M15 8V7" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Free delivery every order',    sub:'Restaurant',       icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="12" height="8" rx="1.5" stroke="#C0442B" strokeWidth="1.4"/><path d="M15 12H19.5L21 16H15V12Z" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="7.5" cy="19" r="1.5" stroke="#C0442B" strokeWidth="1.4"/><circle cx="18.5" cy="19" r="1.5" stroke="#C0442B" strokeWidth="1.4"/></svg> },
              { title:'Skip the line on event nights',sub:'Venue / Bar',      icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 5H18L20 9H5L7 5Z" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5 9V20H19V9" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 14L12 16L16 12" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { title:'Free drink upgrade every visit',sub:'Cafe',            icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 7H17L15.5 19H8.5L7 7Z" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5 7H19" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/><path d="M9 7V5M12 7V4M15 7V5" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Monthly exclusive merch drop',  sub:'Retail / Brand',  icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="9" width="14" height="12" rx="1.5" stroke="#C0442B" strokeWidth="1.4"/><path d="M9 9V7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7V9" stroke="#C0442B" strokeWidth="1.4"/><path d="M5 14H19" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Members-only wine list',        sub:'Wine Bar',        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 3H15L14 12C14 14 13.1 16 12 16C10.9 16 10 14 10 12L9 3Z" stroke="#C0442B" strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 16V21" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/><path d="M9 21H15" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 8H14" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { title:'Early access to new items',     sub:'Any Business',    icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#C0442B" strokeWidth="1.4"/><path d="M12 7V12L15 14" stroke="#C0442B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            ].map(p => (
              <div key={p.title} className="perk-card hover-lift" style={{background:'white', border:'1px solid #F3F4F6', borderRadius:12, padding:'24px', transition:'border-color 0.2s'}}>
                <div style={{width:44, height:44, background:'rgba(192,68,43,0.07)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16}}>
                  {p.icon}
                </div>
                <p style={{fontSize:14, fontWeight:600, color:'#1A0A06', lineHeight:1.35, marginBottom:6}}>{p.title}</p>
                <p style={{fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'#C0442B', fontWeight:600}}>{p.sub}</p>
              </div>
            ))}
          </div>

          {/* Callout */}
          <div style={{marginTop:48, padding: isMobile ? '32px 24px' : '48px', background:'#1A0A06', borderRadius:16, display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'space-between', gap:32}}>
            <div>
              <h3 style={{fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:'#F5F0E8', marginBottom:10}}>
                The places you love,<br />
                <span style={{color:'#C0442B', fontStyle:'italic'}}>rewarding you back.</span>
              </h3>
              <p style={{fontSize:14, color:'rgba(255,255,255,0.5)', fontWeight:300, maxWidth:480, lineHeight:1.65}}>
                Regly gives you the platform. You bring the creativity. Build a membership your regulars will talk about.
              </p>
            </div>
            <button onClick={() => router.push('/browse')}
              style={{display:'flex', alignItems:'center', gap:10, padding:'14px 28px', background:'#C0442B', color:'#1A0A06', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'opacity 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              Browse memberships <ArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY REGLY ───────────────────────────────────────────── */}
      <section style={{padding: isMobile ? '72px 24px' : '120px 40px', background:'#FFFFFF'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom: isMobile ? 48 : 72}}>
            <p style={{fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'#C0442B', fontWeight:600, marginBottom:16}}>Why Regly</p>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:'clamp(2rem, 4vw, 3.2rem)', fontWeight:700, color:'#1A0A06', lineHeight:1.1}}>
              Real perks. Real value.<br />
              <span style={{fontStyle:'italic', color:'#1A0A06'}}>Every single visit.</span>
            </h2>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24}}>
            {[
              {
                title:'Immediate value, not deferred rewards',
                body:'Punch cards give you a free coffee after 10 visits. A Regly membership gives you a free coffee every visit from day one. The value is immediate, defined, and guaranteed.',
                accent:'#C0442B',
              },
              {
                title:'No app. No hardware. No friction.',
                body:'Members verify with their phone number at the counter. No downloads, no scanning, no extra devices. The simplest possible experience for customers and staff alike.',
                accent:'#C0442B',
              },
              {
                title:'Cancel anytime. No questions asked.',
                body:'No cancellation fees, no contracts, no commitments. Members stay because the value is real, not because leaving is hard.',
                accent:'#C0442B',
              },
            ].map((c, i) => (
              <div key={c.title} style={{padding:'36px', background: i === 1 ? '#1A0A06' : '#FAFAF8', borderRadius:16, border: i === 1 ? 'none' : '1px solid #F3F4F6'}}>
                <div style={{width:4, height:32, background:'#C0442B', borderRadius:2, marginBottom:24}} />
                <h3 style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color: i === 1 ? '#F5F0E8' : '#1A0A06', marginBottom:14, lineHeight:1.3}}>{c.title}</h3>
                <p style={{fontSize:14, color: i === 1 ? 'rgba(245,240,232,0.6)' : '#6A5A50', lineHeight:1.7, fontWeight:300}}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESSES ──────────────────────────────────────── */}
      <section style={{padding: isMobile ? '72px 24px' : '120px 40px', background:'#1A0A06', position:'relative', overflow:'hidden'}}>
        <div className="shimmer" style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
          <span style={{fontFamily:'Georgia, serif', fontSize:'60vw', fontWeight:700, color:'#C0442B', lineHeight:1}}>R</span>
        </div>
        <div style={{maxWidth:1100, margin:'0 auto', position:'relative', zIndex:2}}>
          <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 48 : 80, alignItems:'center'}}>
            <div>
              <p style={{fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(192,68,43,0.7)', fontWeight:600, marginBottom:16}}>For business owners</p>
              <h2 style={{fontFamily:'Georgia, serif', fontSize:'clamp(2rem, 4vw, 3.2rem)', fontWeight:700, color:'#F5F0E8', lineHeight:1.1, marginBottom:24}}>
                Give your regulars a reason<br />
                to <span style={{color:'#C0442B', fontStyle:'italic'}}>always choose you.</span>
              </h2>
              <p style={{fontSize:16, color:'rgba(245,240,232,0.55)', fontWeight:300, lineHeight:1.7, marginBottom:40, maxWidth:440}}>
                Regly powers your membership program. You design the experience. Regly handles payments, member tracking, and regular payouts directly to your bank. No hardware. No upfront cost. Live within 24 hours.
              </p>
              <button onClick={() => router.push('/auth?role=business')}
                style={{display:'flex', alignItems:'center', gap:10, padding:'14px 28px', background:'#C0442B', color:'#1A0A06', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'opacity 0.2s'}}
                onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                List my business <ArrowRight />
              </button>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {[
                { n:'$0',     l:'Setup cost' },
                { n:'Simple', l:'One transparent fee' },
                { n:'24 hrs', l:'Time to go live' },
                { n:'Direct', l:'Payouts via Stripe' },
              ].map(s => (
                <div key={s.n} style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(192,68,43,0.15)', borderRadius:12, padding:'28px', textAlign:'center'}}>
                  <p style={{fontFamily:'Georgia, serif', fontSize:30, fontWeight:700, color:'#C0442B', marginBottom:6}}>{s.n}</p>
                  <p style={{fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:400}}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section style={{padding: isMobile ? '72px 24px' : '120px 40px', background:'#FAFAF8', textAlign:'center'}}>
        <div style={{maxWidth:680, margin:'0 auto'}}>
          <p style={{fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'#C0442B', fontWeight:600, marginBottom:20}}>Start today</p>
          <h2 style={{fontFamily:'Georgia, serif', fontSize:'clamp(2.5rem, 5vw, 4rem)', fontWeight:700, color:'#1A0A06', lineHeight:1.05, marginBottom:24}}>
            Your neighborhood spots.<br />
            <span style={{fontStyle:'italic', color:'#1A0A06'}}>Waiting for you.</span>
          </h2>
          <p style={{fontSize:16, color:'#6A5A50', fontWeight:300, lineHeight:1.7, marginBottom:40}}>
            Browse local businesses on Regly, choose a membership that fits how you already spend, and start getting real perks from day one.
          </p>
          <button onClick={() => router.push('/browse')}
            style={{display:'inline-flex', alignItems:'center', gap:10, padding:'16px 36px', background:'#1A0A06', color:'white', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s'}}
            onMouseEnter={e => e.currentTarget.style.background='#C0442B'}
            onMouseLeave={e => e.currentTarget.style.background='#1A0A06'}>
            Browse memberships near me <ArrowRight />
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{background:'#1A0A06', borderTop:'1px solid rgba(192,68,43,0.1)', padding: isMobile ? '48px 24px 32px' : '64px 40px 40px'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? '40px 24px' : '48px 32px', marginBottom: isMobile ? 48 : 64}}>
            <div>
              <p style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#F5F0E8', marginBottom:12}}>
                <img src="/favicon.svg" width="16" height="19" alt="Regly" style={{display:"inline-block",verticalAlign:"middle"}}/><span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:'italic',letterSpacing:'-0.01em'}}>Regly</span>
              </p>
              <p style={{fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.7, maxWidth:260, fontWeight:300, marginBottom:20}}>
                Memberships for the local businesses you already love.
              </p>
              <a href="mailto:getregly@gmail.com" style={{fontSize:13, color:'#C0442B', textDecoration:'none'}}>getregly@gmail.com</a>
            </div>
            {[
              { heading:'Members', links:[
                { label:'Browse memberships', href:'/browse' },
                { label:'Sign in', href:'/auth' },
                { label:'Create account', href:'/auth' },
                { label:'Customer terms', href:'/terms' },
              ]},
              { heading:'Businesses', links:[
                { label:'Apply to join', href:'/auth?role=business' },
                { label:'Merchant sign in', href:'/auth?role=business' },
                { label:'How it works', href:'#how' },
                { label:'Merchant agreement', href:'/merchant-terms' },
              ]},
              { heading:'Legal', links:[
                { label:'Privacy policy', href:'/privacy' },
                { label:'Customer terms', href:'/terms' },
                { label:'Merchant agreement', href:'/merchant-terms' },
              ]},
            ].map(col => (
              <div key={col.heading}>
                <p style={{fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(192,68,43,0.7)', fontWeight:600, marginBottom:20}}>{col.heading}</p>
                {col.links.map(l => (
                  <a key={l.label} href={l.href} style={{display:'block', fontSize:13, color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:12, fontWeight:300, transition:'color 0.2s'}}
                    onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.8)'}
                    onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.4)'}>
                    {l.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
            <p style={{fontSize:12, color:'rgba(255,255,255,0.2)'}}>2026 Regly. All rights reserved.</p>
            <div style={{display:'flex', gap:24}}>
              {[['Privacy', '/privacy'],['Terms', '/terms'],['Merchant Agreement', '/merchant-terms']].map(([l,h]) => (
                <a key={l} href={h} style={{fontSize:12, color:'rgba(255,255,255,0.2)', textDecoration:'none', transition:'color 0.2s'}}
                  onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.5)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.2)'}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
