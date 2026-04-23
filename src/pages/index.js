import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const PASSCODE = 'PERKS'

// ─── SVG Icons ────────────────────────────────────────────────────
const IconStar = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M16 2L16 30M2 16L30 16M5.5 5.5L26.5 26.5M26.5 5.5L5.5 26.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="3" fill="#C9A84C"/>
  </svg>
)
const IconMembership = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 4C17.373 4 12 9.373 12 16C12 25 24 44 24 44C24 44 36 25 36 16C36 9.373 30.627 4 24 4Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="24" cy="16" r="5" stroke="#C9A84C" strokeWidth="1.5"/>
    <path d="M16 40C12 41 8 43 8 45H40C40 43 36 41 32 40" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconPerks = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 6L28.5 17H40L30.5 23.5L34 34L24 27.5L14 34L17.5 23.5L8 17H19.5L24 6Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M24 14L26.5 20.5H33L27.5 24.5L29.5 31L24 27.5L18.5 31L20.5 24.5L15 20.5H21.5L24 14Z" fill="#C9A84C" fillOpacity="0.15"/>
  </svg>
)
const IconPhone = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="14" y="4" width="20" height="40" rx="3" stroke="#C9A84C" strokeWidth="1.5"/>
    <path d="M14 36H34M14 12H34" stroke="#C9A84C" strokeWidth="1.5"/>
    <circle cx="24" cy="40" r="1.5" fill="#C9A84C"/>
    <path d="M20 8H28" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconShield = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L8 10V22C8 31 15 39 24 42C33 39 40 31 40 22V10L24 4Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M17 24L21 28L31 18" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconVIP = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M8 14L16 30L24 16L32 30L40 14" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 34H42" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 8V4M16 10L13 7M32 10L35 7" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IconArrow = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconGold = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1L8 15M1 8L15 8M3.05 3.05L12.95 12.95M12.95 3.05L3.05 12.95" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

// ─── Passcode Gate ────────────────────────────────────────────────
function PasscodeGate({ onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handle(e) {
    e.preventDefault()
    if (input.toUpperCase() === PASSCODE) { onUnlock() }
    else {
      setError(true); setShake(true)
      setTimeout(() => setShake(false), 500)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden" style={{background:'#0A0906'}}>
      <div className="fixed left-0 top-0 w-1.5 h-full" style={{background:'#C9A84C'}} />
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"}} />
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="w-8 h-0.5 opacity-40" style={{background:'#C9A84C'}} />
          <IconGold size={12} />
          <div className="w-8 h-0.5 opacity-40" style={{background:'#C9A84C'}} />
        </div>
        <h1 className="font-serif text-6xl font-bold tracking-tight mb-3">
          <span className="text-cream">REGL</span><span className="text-gold">Y</span>
        </h1>
        <p className="text-muted text-sm tracking-widest uppercase mb-12">Members Only</p>
        <form onSubmit={handle}>
          <div className={`transition-transform ${shake ? 'translate-x-2' : ''}`}>
            <input className="input text-center text-lg tracking-[0.4em] uppercase mb-4 w-64" placeholder="· · · · ·"
              value={input} onChange={e => setInput(e.target.value)} autoFocus />
          </div>
          {error && <p className="text-red-400 text-xs mb-4 tracking-widest uppercase">Invalid passcode</p>}
          <button type="submit" className="btn-gold w-64 py-3 tracking-widest text-sm uppercase">Enter</button>
        </form>
      </div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────
export default function Home() {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('regly_unlocked') === 'true') setUnlocked(true)
    setChecking(false)
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function unlock() {
    sessionStorage.setItem('regly_unlocked', 'true')
    setUnlocked(true)
  }

  if (checking) return null
  if (!unlocked) return <PasscodeGate onUnlock={unlock} />

  return (
    <div className="min-h-screen overflow-x-hidden" style={{background:'#0A0906'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-display  { font-family: 'Playfair Display', Georgia, serif; }
        .font-editorial{ font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-body     { font-family: 'Montserrat', system-ui, sans-serif; }
        .hero-text     { font-size: clamp(3.2rem, 9vw, 8.5rem); line-height: 0.92; letter-spacing: -0.03em; }
        .section-label { font-family: 'Montserrat', sans-serif; font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; font-weight: 600; }
        .gold-line     { width: 40px; height: 1px; background: #C9A84C; display: inline-block; opacity: 0.6; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.03; } 50% { opacity:0.07; } }
        .fade-up  { animation: fadeUp 1s ease forwards; }
        .fade-up-2{ animation: fadeUp 1s ease 0.2s forwards; opacity:0; }
        .fade-up-3{ animation: fadeUp 1s ease 0.4s forwards; opacity:0; }
        .fade-up-4{ animation: fadeUp 1s ease 0.6s forwards; opacity:0; }
        .shimmer  { animation: shimmer 4s ease-in-out infinite; }
        .tier-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(201,168,76,0.1); transition: all 0.35s ease; }
        .nav-blur { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .divider-ornament { display:flex; align-items:center; gap:16px; }
        .divider-ornament::before,.divider-ornament::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,#C9A84C44); }
        .photo-overlay { background: linear-gradient(to bottom, rgba(10,9,6,0.3) 0%, rgba(10,9,6,0.55) 50%, rgba(10,9,6,0.92) 100%); }
        .light-section { background: #F5F0E8; }
        .light-section .section-label { color: #8A6A20; }
        .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        .btn-dark { background: #0A0906; color: #C9A84C; border: 1px solid rgba(201,168,76,0.5); font-family: 'Montserrat', sans-serif; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.25s ease; }
        .btn-dark:hover { background: #C9A84C; color: #0A0906; }
      `}</style>

      <div className="fixed left-0 top-0 w-1.5 h-full z-50" style={{background:'#C9A84C'}} />

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'nav-blur border-b py-3' : 'py-5'}`}
        style={{borderColor:'rgba(201,168,76,0.12)', background: scrolled ? 'rgba(10,9,6,0.92)' : 'transparent'}}>
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="font-display text-2xl font-bold tracking-tight">
            <span style={{color:'#F5F0E8'}}>REGL</span><span style={{color:'#C9A84C'}}>Y</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body text-xs tracking-widest uppercase px-6 py-2.5 rounded border transition-all duration-300"
              style={{borderColor:'rgba(245,240,232,0.3)', color:'#F5F0E8', background:'transparent'}}
              onMouseEnter={e => { e.target.style.borderColor='#C9A84C'; e.target.style.color='#C9A84C'; }}
              onMouseLeave={e => { e.target.style.borderColor='rgba(245,240,232,0.3)'; e.target.style.color='#F5F0E8'; }}>
              Log In
            </button>
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body text-xs tracking-widest uppercase px-6 py-2.5 rounded transition-all duration-300"
              style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
              Join Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO full bleed photo ───────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Hero background photo editorial overhead restaurant */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1653795164352-6f4ba840f525?q=80&w=2670&auto=format&fit=crop"
            alt="Restaurant"
            className="w-full h-full object-cover"
            style={{objectPosition:'center 40%'}}
          />
          <div className="photo-overlay absolute inset-0" />
          {/* Extra dark vignette at top for nav readability */}
          <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, rgba(10,9,6,0.5) 0%, transparent 30%)'}} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-16 pb-24 pt-40">
          <div className="fade-up flex items-center gap-3 mb-8">
            <div className="gold-line" />
            <span className="section-label" style={{color:'rgba(201,168,76,0.9)'}}>Now in Chicago</span>
            <div className="gold-line" />
          </div>

          <h1 className="font-display hero-text text-left fade-up-2 mb-8 max-w-4xl" style={{color:'#F5F0E8'}}>
            Your favorite spots<br />
            <span style={{color:'#C9A84C', fontStyle:'italic'}}>rewarding you</span><br />
            <span style={{fontStyle:'italic'}}>every visit.</span>
          </h1>

          <p className="fade-up-3 font-body text-lg max-w-xl mb-10 leading-relaxed" style={{color:'rgba(245,240,232,0.75)', fontWeight:300}}>
            Regly is a membership platform that lets local businesses offer their own monthly memberships — with real, defined perks their customers get every single visit. Not points. Not punch cards. Actual value, every time you walk in.
          </p>

          <div className="fade-up-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body group flex items-center gap-3 px-10 py-4 rounded text-sm tracking-widest uppercase transition-all duration-300"
              style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
              See What's Near Me <IconArrow />
            </button>
            <button
              onClick={() => { document.getElementById('how')?.scrollIntoView({behavior:'smooth'}) }}
              className="font-body text-xs tracking-widest uppercase transition-all duration-300"
              style={{color:'rgba(245,240,232,0.6)'}}>
              See how it works ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-16 hidden sm:flex flex-col items-center gap-2 z-10">
          <div className="w-px h-16 opacity-20" style={{background:'#C9A84C'}} />
          <span className="section-label" style={{writingMode:'vertical-rl', color:'rgba(201,168,76,0.5)'}}>Scroll</span>
        </div>
      </section>

      {/* ── TRUST BAR light section ─────────────────────────────── */}
      <section className="light-section py-16 border-y" style={{borderColor:'rgba(201,168,76,0.2)'}}>
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { n: 'Local',  l: 'Built for the places\nin your neighborhood' },
            { n: 'Yours',  l: 'For the spots\nyou already go' },
            { n: '100%',   l: 'Secure payments\nvia Stripe' },
            { n: '∞',      l: 'Cancel anytime\nno commitment' },
          ].map(s => (
            <div key={s.n}>
              <p className="font-display text-4xl font-bold" style={{color:'#8A6A20'}}>{s.n}</p>
              <p className="font-body text-xs mt-2 leading-relaxed whitespace-pre-line" style={{color:'#6B5A3E', fontWeight:400}}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT IS REGLY dark, split layout with photo ─────────── */}
      <section id="how" className="py-32 px-8 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-20 items-center">
          <div>
            <p className="section-label mb-5">What is Regly</p>
            <h2 className="font-display text-5xl font-bold leading-tight mb-6" style={{color:'#F5F0E8'}}>
              A platform that turns<br />local businesses into<br />
              <span style={{color:'#C9A84C', fontStyle:'italic'}}>membership destinations.</span>
            </h2>
            <p className="font-body text-base leading-relaxed mb-6" style={{color:'#8A7A6A', fontWeight:300}}>
              Regly gives independent restaurants, coffee shops, and local businesses the tools to offer their own monthly memberships — complete with custom perks, defined benefits, and recurring value for their most loyal customers.
            </p>
            <p className="font-body text-base leading-relaxed mb-10" style={{color:'#8A7A6A', fontWeight:300}}>
              As a customer, you subscribe to the businesses you already visit. No points to track. No apps to open. Just give your phone number at the counter and your perks are applied instantly.
            </p>
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body text-xs tracking-widest uppercase px-8 py-3.5 rounded border transition-all"
              style={{borderColor:'#C9A84C', color:'#C9A84C', background:'transparent'}}
              onMouseEnter={e => { e.currentTarget.style.background='#C9A84C'; e.currentTarget.style.color='#0A0906'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#C9A84C'; }}>
              Browse Memberships
            </button>
          </div>

          {/* Membership card illustration */}
          <div className="relative">
            <div className="relative mx-auto" style={{width:320, height:400}}>
              <div className="absolute rounded-2xl border" style={{width:280, height:360, top:30, left:30, borderColor:'rgba(201,168,76,0.15)', background:'rgba(201,168,76,0.04)', transform:'rotate(6deg)'}} />
              <div className="absolute rounded-2xl border" style={{width:280, height:360, top:15, left:20, borderColor:'rgba(201,168,76,0.25)', background:'rgba(201,168,76,0.06)', transform:'rotate(3deg)'}} />
              <div className="absolute rounded-2xl border p-8 flex flex-col justify-between" style={{width:280, height:360, top:0, left:10, borderColor:'rgba(201,168,76,0.5)', background:'#1A1410'}}>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-xl font-bold" style={{color:'#F5F0E8'}}>REGL<span style={{color:'#C9A84C'}}>Y</span></span>
                    <IconStar />
                  </div>
                  <div className="h-px mb-6" style={{background:'rgba(201,168,76,0.2)'}} />
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
                    <p className="font-body text-xs tracking-widest uppercase" style={{color:'#8A7A6A'}}>Member</p>
                    <span className="font-body" style={{fontSize:'0.55rem', letterSpacing:'0.15em', textTransform:'uppercase', background:'rgba(201,168,76,0.15)', color:'#C9A84C', padding:'2px 8px', borderRadius:20, fontWeight:600}}>Example</span>
                  </div>
                  <p className="font-display text-2xl font-bold" style={{color:'#F5F0E8'}}>Gold Regular</p>
                  <p className="font-body text-xs mt-1" style={{color:'#C9A84C'}}>Vicenzo's Pizza · Chicago</p>
                </div>
                <div>
                  <div className="h-px mb-4" style={{background:'rgba(201,168,76,0.2)'}} />
                  <p className="font-body text-xs tracking-widest uppercase mb-2" style={{color:'#8A7A6A'}}>Your Perks</p>
                  {['Free breadsticks every visit','2 free deliveries/month','5% off every order'].map(p => (
                    <div key={p} className="flex items-center gap-2 mb-1.5">
                      <IconGold size={10} />
                      <span className="font-body text-xs" style={{color:'#F5F0E8', fontWeight:300}}>{p}</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{borderColor:'rgba(201,168,76,0.15)'}}>
                    <span className="font-body text-xs" style={{color:'#8A7A6A'}}>Monthly</span>
                    <span className="font-display text-xl font-bold" style={{color:'#C9A84C'}}>$20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS light section ─────────────────────────── */}
      <section className="light-section py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="section-label mb-4">How It Works</p>
            <h2 className="font-display text-5xl font-bold" style={{color:'#1A1410'}}>
              Three steps.<br /><span style={{color:'#8A6A20', fontStyle:'italic'}}>That's it.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { icon: <IconMembership />, step:'01', title:'Pick a spot', body:'Browse Regly-partnered coffee shops, pizza places, burger joints, and more near you. See exactly what each membership includes before you sign up.' },
              { icon: <IconPerks />,      step:'02', title:'Choose your perks', body:'Select a membership tier. Each tier has specific, defined perks no vague promises. You know exactly what you get before you pay a cent.' },
              { icon: <IconPhone />,      step:'03', title:'Access rewards instantly', body:'When ordering, simply confirm your membership with your phone number. Staff verify and apply your perks on the spot. As Regly grows, expect even faster access through our app and membership cards.' },
            ].map(c => (
              <div key={c.step} className="relative hover-lift rounded-2xl p-8" style={{background:'white', boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
                <p className="font-display text-6xl font-black mb-4 leading-none" style={{color:'rgba(138,106,32,0.12)'}}>{c.step}</p>
                <div className="mb-5">{c.icon}</div>
                <h3 className="font-display text-2xl font-bold mb-3" style={{color:'#1A1410'}}>{c.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{color:'#6B5A3E', fontWeight:300}}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO BREAK full width editorial photo ─────────────── */}
      <section className="relative h-96 sm:h-screen overflow-hidden" style={{maxHeight:600}}>
        <img
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1800&q=85&fit=crop"
          alt="Restaurant dining"
          className="w-full h-full object-cover"
          style={{objectPosition:'center 50%'}}
        />
        <div className="absolute inset-0" style={{background:'linear-gradient(to right, rgba(10,9,6,0.7) 0%, rgba(10,9,6,0.2) 60%, rgba(10,9,6,0.4) 100%)'}} />
        <div className="absolute inset-0 flex items-center px-8 sm:px-16">
          <div className="max-w-lg">
            <div className="divider-ornament mb-6 opacity-60" style={{maxWidth:200}}><IconGold /></div>
            <blockquote className="font-editorial text-4xl sm:text-5xl italic font-light leading-tight mb-4" style={{color:'#F5F0E8'}}>
              "Become a member at your favorite places."
            </blockquote>
            <p className="section-label" style={{color:'rgba(201,168,76,0.7)'}}>Regly · Chicago 2025</p>
          </div>
        </div>
      </section>

      {/* ── WHY IT'S WORTH IT dark ──────────────────────────────── */}
      <section className="py-32 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Why It's Worth It</p>
          <h2 className="font-display text-5xl font-bold mb-4" style={{color:'#F5F0E8'}}>
            Real perks.<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>Real value.</span>
          </h2>
          <p className="font-body text-base max-w-xl mx-auto" style={{color:'#8A7A6A', fontWeight:300}}>
            Every perk on Regly is set by the business and locked in when you subscribe. No bait and switch. No expiring points.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <IconVIP />,    title:'Defined perks, every visit',    body:'Your membership spells out exactly what you get. It\'s the same every visit. You know what to expect before you walk in.' },
            { icon: <IconPerks />,  title:'No points. No punch cards.',    body:'Your perks don\'t expire, accumulate, or require an app. You show up, give your number, get your perk. Every time.' },
            { icon: <IconShield />, title:'No risk to try it',             body:'Cancel anytime from your dashboard with one click. No cancellation fees. No questions asked.' },
          ].map((c, i) => (
            <div key={c.title} className="tier-card rounded-2xl p-8 border" style={{
              borderColor: i===1 ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.15)',
              background: i===1 ? 'rgba(201,168,76,0.06)' : 'rgba(26,20,16,0.8)'
            }}>
              <div className="mb-6">{c.icon}</div>
              <h3 className="font-display text-2xl font-bold mb-3" style={{color:'#F5F0E8'}}>{c.title}</h3>
              <p className="font-body text-sm leading-relaxed" style={{color:'#8A7A6A', fontWeight:300}}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── POSSIBILITIES section ──────────────────────────────── */}
      <section className="light-section py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4">The Possibilities</p>
            <h2 className="font-display text-5xl font-bold mb-4" style={{color:'#1A1410'}}>
              A membership can be<br /><span style={{color:'#8A6A20', fontStyle:'italic'}}>anything you can imagine.</span>
            </h2>
            <p className="font-body text-base max-w-2xl mx-auto" style={{color:'#6B5A3E', fontWeight:300}}>
              Every business on Regly designs their own membership. There are no templates, no boxes to fit into. The only limit is your creativity. Here are just a few ideas to get you thinking.
            </p>
          </div>

          {/* Perk idea grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {[
              { emoji:'🍕', label:'Free slice every visit',       cat:'Restaurant' },
              { emoji:'☕', label:'Free coffee every morning',    cat:'Coffee Shop' },
              { emoji:'🤫', label:'Access to the secret menu',    cat:'Any Business' },
              { emoji:'👕', label:'Free branded shirt on signup', cat:'Any Business' },
              { emoji:'🪑', label:'Reserved seating, always',     cat:'Bar / Lounge' },
              { emoji:'🎂', label:'Free dessert on your birthday',cat:'Restaurant' },
              { emoji:'🚚', label:'Free delivery every order',    cat:'Restaurant' },
              { emoji:'🎵', label:'Skip the line on event nights',cat:'Venue / Bar' },
              { emoji:'🥤', label:'Free drink upgrade every visit',cat:'Cafe' },
              { emoji:'📦', label:'Monthly exclusive merch drop', cat:'Retail / Brand' },
              { emoji:'🍷', label:'Members-only wine list',       cat:'Wine Bar' },
              { emoji:'✨', label:'Early access to new items',    cat:'Any Business' },
            ].map(p => (
              <div key={p.label} className="hover-lift rounded-2xl p-5 border text-center" style={{background:'white', borderColor:'rgba(138,106,32,0.15)', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
                <p style={{fontSize:'2rem', marginBottom:8}}>{p.emoji}</p>
                <p className="font-body text-sm font-semibold mb-1" style={{color:'#1A1410'}}>{p.label}</p>
                <p className="font-body" style={{fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#8A6A20', fontWeight:600}}>{p.cat}</p>
              </div>
            ))}
          </div>

          {/* Bottom callout */}
          <div className="rounded-2xl p-10 text-center border" style={{background:'#1A1410', borderColor:'rgba(201,168,76,0.2)'}}>
            <p className="section-label mb-4" style={{color:'rgba(201,168,76,0.7)'}}>The point</p>
            <h3 className="font-display text-3xl font-bold mb-4" style={{color:'#F5F0E8'}}>
              Your membership is yours to define.<br />
              <span style={{color:'#C9A84C', fontStyle:'italic'}}>Make it irresistible.</span>
            </h3>
            <p className="font-body text-sm max-w-xl mx-auto mb-8" style={{color:'#8A7A6A', fontWeight:300}}>
              Regly gives you the platform. You bring the creativity. The businesses on Regly aren't just offering discounts — they are building relationships, creating habits, and giving customers a real reason to choose them over everyone else.
            </p>
            <button onClick={() => router.push('/auth?role=business')}
              className="font-body text-xs tracking-widest uppercase px-10 py-4 rounded transition-all"
              style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
              Build My Membership Program
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA dark with photo tint ─────────────────────── */}
      <section className="py-32 px-8 text-center relative overflow-hidden" style={{background:'#0F0D0A'}}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display font-black shimmer" style={{fontSize:'40vw', color:'#C9A84C', lineHeight:1}}>R</span>
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <p className="section-label mb-6">Join Regly</p>
          <h2 className="font-display text-6xl font-bold leading-tight mb-6" style={{color:'#F5F0E8'}}>
            Start getting<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>more.</span>
          </h2>
          <p className="font-body text-base mb-12 leading-relaxed" style={{color:'#8A7A6A', fontWeight:300}}>
            Browse local businesses on Regly, choose a membership that fits how you already spend, and start getting real perks from day one. No points. No waiting. Cancel anytime.
          </p>
          <button onClick={() => router.push('/auth?role=customer')}
            className="font-body inline-flex items-center gap-4 px-14 py-5 rounded text-sm tracking-widest uppercase transition-all"
            style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
            See What's Near Me <IconArrow />
          </button>
        </div>
      </section>

      {/* ── FOR BUSINESSES ────────────────────────────────────────── */}
      <section className="py-24 px-8 border-t" style={{borderColor:'rgba(201,168,76,0.1)'}}>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label mb-4">For Business Owners</p>
            <h2 className="font-display text-4xl font-bold mb-4" style={{color:'#F5F0E8'}}>
              Give your regulars a reason<br />to <span style={{color:'#C9A84C', fontStyle:'italic'}}>always choose you.</span>
            </h2>
            <p className="font-body text-sm leading-relaxed mb-8" style={{color:'#8A7A6A', fontWeight:300}}>
              Regly is the platform that powers your membership program. You design the experience — the perks, the tiers, the price. Regly handles payments, member tracking, and monthly payouts directly to your bank. No hardware. No upfront cost. Live in 48 hours.
            </p>
            <button onClick={() => router.push('/auth?role=business')}
              className="font-body text-xs tracking-widest uppercase px-8 py-3.5 rounded border transition-all"
              style={{borderColor:'#C9A84C', color:'#C9A84C', background:'transparent'}}
              onMouseEnter={e => { e.currentTarget.style.background='#C9A84C'; e.currentTarget.style.color='#0A0906'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#C9A84C'; }}>
              List My Business
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n:'Low', l:'Flat monthly fee' },
              { n:'$0',  l:'Setup cost' },
              { n:'10 min', l:'To go live' },
              { n:'∞',   l:'Members possible' },
            ].map(s => (
              <div key={s.n} className="rounded-xl p-5 border text-center hover-lift" style={{borderColor:'rgba(201,168,76,0.15)', background:'rgba(26,20,16,0.6)'}}>
                <p className="font-display text-3xl font-bold" style={{color:'#C9A84C'}}>{s.n}</p>
                <p className="font-body text-xs mt-1" style={{color:'#8A7A6A', fontWeight:300}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0A0906', borderTop:'1px solid rgba(201,168,76,0.15)', padding:'48px 24px 32px'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>

          {/* Top row */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'40px 32px', marginBottom:48}}>

            {/* Brand */}
            <div>
              <p style={{fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#F5F0E8', marginBottom:8}}>
                REGL<span style={{color:'#C9A84C'}}>Y</span>
              </p>
              <p style={{fontSize:13, color:'#8A7A6A', lineHeight:1.6, marginBottom:16}}>
                Monthly memberships for the local businesses you already love.
              </p>
              <a href="mailto:getregly@gmail.com" style={{fontSize:13, color:'#C9A84C', textDecoration:'none'}}>
                getregly@gmail.com
              </a>
            </div>

            {/* Members */}
            <div>
              <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9A84C', marginBottom:16}}>Members</p>
              {[
                { label:'Browse Memberships', href:'/auth?role=customer' },
                { label:'Sign In', href:'/auth' },
                { label:'Create Account', href:'/auth' },
                { label:'Customer Terms', href:'/terms' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{display:'block', fontSize:14, color:'#8A7A6A', textDecoration:'none', marginBottom:10, transition:'color 0.2s'}}
                  onMouseEnter={e => e.target.style.color='#F5F0E8'}
                  onMouseLeave={e => e.target.style.color='#8A7A6A'}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Businesses */}
            <div>
              <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9A84C', marginBottom:16}}>Businesses</p>
              {[
                { label:'Apply to Join', href:'/auth?role=business' },
                { label:'Merchant Sign In', href:'/auth?role=business' },
                { label:'How It Works', href:'/#how-it-works' },
                { label:'Merchant Agreement', href:'/merchant-terms' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{display:'block', fontSize:14, color:'#8A7A6A', textDecoration:'none', marginBottom:10, transition:'color 0.2s'}}
                  onMouseEnter={e => e.target.style.color='#F5F0E8'}
                  onMouseLeave={e => e.target.style.color='#8A7A6A'}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Legal */}
            <div>
              <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9A84C', marginBottom:16}}>Legal</p>
              {[
                { label:'Privacy Policy', href:'/privacy' },
                { label:'Customer Terms', href:'/terms' },
                { label:'Merchant Agreement', href:'/merchant-terms' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{display:'block', fontSize:14, color:'#8A7A6A', textDecoration:'none', marginBottom:10, transition:'color 0.2s'}}
                  onMouseEnter={e => e.target.style.color='#F5F0E8'}
                  onMouseLeave={e => e.target.style.color='#8A7A6A'}>
                  {l.label}
                </a>
              ))}
            </div>

          </div>

          {/* Bottom bar */}
          <div style={{borderTop:'1px solid rgba(201,168,76,0.1)', paddingTop:24, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12}}>
            <p style={{fontSize:12, color:'#5A4A3A'}}>© 2026 Regly · Chicago, IL · All rights reserved</p>
            <div style={{display:'flex', gap:20}}>
              {[
                { label:'Privacy', href:'/privacy' },
                { label:'Terms', href:'/terms' },
                { label:'Merchant Agreement', href:'/merchant-terms' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{fontSize:12, color:'#5A4A3A', textDecoration:'none', transition:'color 0.2s'}}
                  onMouseEnter={e => e.target.style.color='#8A7A6A'}
                  onMouseLeave={e => e.target.style.color='#5A4A3A'}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
