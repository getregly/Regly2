import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

const PASSCODE = 'PERKS'

// ─── Custom SVG Icons ───────────────────────────────────────────────
const IconStar = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M16 2L16 30M2 16L30 16M5.5 5.5L26.5 26.5M26.5 5.5L5.5 26.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="3" fill="#C9A84C"/>
  </svg>
)
const IconMembership = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="4" y="12" width="40" height="26" rx="3" stroke="#C9A84C" strokeWidth="1.5"/>
    <path d="M4 20H44" stroke="#C9A84C" strokeWidth="1.5"/>
    <circle cx="14" cy="31" r="3" stroke="#C9A84C" strokeWidth="1.5"/>
    <path d="M20 29H36M20 33H30" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 12V8M28 12V6M20 12V8" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
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
    <path d="M14 36H34" stroke="#C9A84C" strokeWidth="1.5"/>
    <path d="M14 12H34" stroke="#C9A84C" strokeWidth="1.5"/>
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"}} />
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="w-8 h-0.5 bg-gold opacity-40" />
          <IconGold size={12} />
          <div className="w-8 h-0.5 bg-gold opacity-40" />
        </div>
        <h1 className="font-serif text-6xl font-bold tracking-tight mb-3">
          <span className="text-cream">REGL</span><span className="text-gold">Y</span>
        </h1>
        <p className="text-muted text-sm tracking-widest uppercase mb-12">Members Only</p>
        <form onSubmit={handle}>
          <div className={`transition-transform ${shake ? 'translate-x-2' : ''}`}>
            <input
              className="input text-center text-lg tracking-[0.4em] uppercase mb-4 w-64"
              placeholder="· · · · ·"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
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
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-editorial { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-body { font-family: 'Montserrat', system-ui, sans-serif; }
        .grain { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E"); }
        .hero-text { font-size: clamp(3.5rem, 10vw, 9rem); line-height: 0.9; letter-spacing: -0.03em; }
        .section-label { font-family: 'Montserrat', sans-serif; font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; font-weight: 600; }
        .gold-line { width: 40px; height: 1px; background: #C9A84C; display: inline-block; opacity: 0.6; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        .fade-up { animation: fadeUp 0.9s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.9s ease 0.15s forwards; opacity:0; }
        .fade-up-3 { animation: fadeUp 0.9s ease 0.3s forwards; opacity:0; }
        .fade-up-4 { animation: fadeUp 0.9s ease 0.45s forwards; opacity:0; }
        .shimmer { animation: shimmer 3s ease-in-out infinite; }
        .tier-card:hover { transform: translateY(-4px); transition: all 0.3s ease; }
        .nav-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .divider-ornament { display:flex; align-items:center; gap:16px; }
        .divider-ornament::before, .divider-ornament::after { content:''; flex:1; height:1px; background:linear-gradient(90deg, transparent, #C9A84C44); }
      `}</style>

      <div className="fixed left-0 top-0 w-1.5 h-full z-50" style={{background:'#C9A84C'}} />
      <div className="grain fixed inset-0 opacity-5 pointer-events-none z-10" />

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'nav-blur border-b py-3' : 'py-5'}`}
        style={{borderColor:'rgba(201,168,76,0.12)', background: scrolled ? 'rgba(10,9,6,0.92)' : 'transparent'}}>
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="font-display text-2xl font-bold tracking-tight">
            <span style={{color:'#F5F0E8'}}>REGL</span><span style={{color:'#C9A84C'}}>Y</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body text-xs tracking-widest uppercase px-6 py-2.5 rounded border transition-all duration-300 hover:bg-gold hover:text-black"
              style={{borderColor:'#C9A84C', color:'#C9A84C'}}>
              Join
            </button>
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body text-xs tracking-widest uppercase px-6 py-2.5 rounded transition-all duration-300"
              style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
              Log In
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-start justify-end px-8 sm:px-16 pb-20 pt-32 max-w-7xl mx-auto">
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden">
          <span className="font-display font-black opacity-4 shimmer"
            style={{fontSize:'55vw', color:'#C9A84C', lineHeight:1, marginRight:'-12vw'}}>R</span>
        </div>

        <div className="fade-up flex items-center gap-3 mb-8">
          <div className="gold-line" />
          <span className="section-label">Now in Chicago</span>
          <div className="gold-line" />
        </div>

        <h1 className="font-display hero-text text-left fade-up-2 relative z-10 mb-8" style={{color:'#F5F0E8'}}>
          Get more from<br />
          <span style={{color:'#C9A84C', fontStyle:'italic'}}>places you</span><br />
          <span style={{fontStyle:'italic'}}>already love.</span>
        </h1>

        <p className="fade-up-3 font-body text-lg max-w-lg mb-10 leading-relaxed relative z-10" style={{color:'#8A7A6A', fontWeight:300}}>
          Regly is a monthly membership that gets you real, tangible perks at your favorite coffee shops, pizza spots, and restaurants — every single visit. Pay once a month. Get something every time you walk in.
        </p>

        <div className="fade-up-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
          <button
            onClick={() => router.push('/auth?role=customer')}
            className="font-body group flex items-center gap-3 px-10 py-4 rounded text-sm tracking-widest uppercase transition-all duration-300 hover:gap-5"
            style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
            See What's Near Me
            <IconArrow />
          </button>
          <button
            onClick={() => { const el=document.getElementById('how'); el?.scrollIntoView({behavior:'smooth'}) }}
            className="font-body text-xs tracking-widest uppercase transition-all duration-300 hover:text-gold"
            style={{color:'#8A7A6A'}}>
            See how it works ↓
          </button>
        </div>

        <div className="absolute bottom-8 right-16 hidden sm:flex flex-col items-center gap-2">
          <div className="w-px h-16 opacity-20" style={{background:'#C9A84C'}} />
          <span className="section-label" style={{writingMode:'vertical-rl'}}>Scroll</span>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y py-10" style={{borderColor:'rgba(201,168,76,0.12)'}}>
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { n: 'Up to $40+', l: 'In value for a\n$20/month membership' },
            { n: '$10',        l: 'Starting price\nper month' },
            { n: '100%',       l: 'Secure payments\nvia Stripe' },
            { n: '∞',          l: 'Cancel anytime\nno commitment' },
          ].map(s => (
            <div key={s.n}>
              <p className="font-display text-4xl font-bold" style={{color:'#C9A84C'}}>{s.n}</p>
              <p className="font-body text-xs mt-2 leading-relaxed whitespace-pre-line" style={{color:'#8A7A6A', fontWeight:300}}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IS REGLY */}
      <section id="how" className="py-32 px-8 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-20 items-center">
          <div>
            <p className="section-label mb-5">What is Regly</p>
            <h2 className="font-display text-5xl font-bold leading-tight mb-6" style={{color:'#F5F0E8'}}>
              A membership that<br />pays you back<br />
              <span style={{color:'#C9A84C', fontStyle:'italic'}}>every visit.</span>
            </h2>
            <p className="font-body text-base leading-relaxed mb-6" style={{color:'#8A7A6A', fontWeight:300}}>
              You already spend money at your favorite spots. Regly lets you pay a small monthly fee in exchange for real perks — free items, discounts, and bonuses — every time you go. No points to track. No apps to open. Just show up and give your phone number.
            </p>
            <p className="font-body text-base leading-relaxed mb-10" style={{color:'#8A7A6A', fontWeight:300}}>
              A $20/month Gold membership at a pizza place could get you free breadsticks every visit, two free deliveries, and 5% off every order. That's up to $40+ in value for $20. The math works in your favor.
            </p>
            <button onClick={() => router.push('/auth?role=customer')}
              className="font-body text-xs tracking-widest uppercase px-8 py-3.5 rounded border transition-all hover:bg-gold hover:text-black"
              style={{borderColor:'#C9A84C', color:'#C9A84C'}}>
              Browse Memberships
            </button>
          </div>
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
                  <p className="font-body text-xs tracking-widest uppercase mb-1" style={{color:'#8A7A6A'}}>Member</p>
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

      {/* HOW IT WORKS */}
      <section className="py-32 px-8" style={{background:'#0F0D0A'}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="section-label mb-4">How It Works</p>
            <h2 className="font-display text-5xl font-bold" style={{color:'#F5F0E8'}}>
              Three steps.<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>That's it.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { icon: <IconMembership />, step:'01', title:'Pick a spot', body:'Browse Regly-partnered coffee shops, pizza places, burger joints, and taco shops near you. See exactly what each membership includes and what it costs before you sign up.' },
              { icon: <IconPerks />,      step:'02', title:'Choose your perks', body:'Select a membership tier starting at $10/month. Each tier has specific, defined perks — no vague promises. You know exactly what you get before you pay.' },
              { icon: <IconPhone />,      step:'03', title:'Give your number', body:'Walk in and give your phone number at the counter. The business looks you up instantly and applies your perks. No app to open. No card to show. Done.' },
            ].map(c => (
              <div key={c.step} className="relative">
                <p className="font-display text-7xl font-black opacity-8 mb-4 leading-none" style={{color:'#C9A84C'}}>{c.step}</p>
                <div className="mb-5">{c.icon}</div>
                <h3 className="font-display text-2xl font-bold mb-3" style={{color:'#F5F0E8'}}>{c.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{color:'#8A7A6A', fontWeight:300}}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERKS SHOWCASE */}
      <section className="py-32 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Why It's Worth It</p>
          <h2 className="font-display text-5xl font-bold mb-4" style={{color:'#F5F0E8'}}>
            Real perks.<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>Real value.</span>
          </h2>
          <p className="font-body text-base max-w-xl mx-auto" style={{color:'#8A7A6A', fontWeight:300}}>
            Every perk on Regly is set by the business and locked in when you subscribe. No bait and switch. No expiring points. Just consistent benefits every time you visit.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <IconVIP />,    title:'Defined perks, every visit',  body:'Your membership spells out exactly what you get — a free item, a discount, a free delivery. It\'s the same every visit. You know what to expect before you walk in.' },
            { icon: <IconPerks />,  title:'The math works in your favor', body:'A $20 membership at a coffee shop with a free drink every visit pays for itself in 4 visits. Most members visit 6–10 times a month. The savings add up fast.' },
            { icon: <IconShield />, title:'No risk to try it',            body:'Cancel anytime from your dashboard with one click. No cancellation fees. No questions asked. If a membership isn\'t worth it to you, you\'re out immediately.' },
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

      {/* PULL QUOTE */}
      <section className="py-24 px-8 text-center" style={{borderTop:'1px solid rgba(201,168,76,0.1)', borderBottom:'1px solid rgba(201,168,76,0.1)'}}>
        <div className="max-w-3xl mx-auto">
          <div className="divider-ornament mb-10 opacity-40"><IconGold /></div>
          <blockquote className="font-editorial text-4xl sm:text-5xl italic font-light leading-tight mb-6" style={{color:'#F5F0E8'}}>
            "Become a member at your favorite places."
          </blockquote>
          <p className="section-label">Regly · Chicago 2025</p>
          <div className="divider-ornament mt-10 opacity-40"><IconGold /></div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section className="py-32 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Membership Tiers</p>
          <h2 className="font-display text-5xl font-bold mb-4" style={{color:'#F5F0E8'}}>
            Pick your <span style={{color:'#C9A84C', fontStyle:'italic'}}>level.</span>
          </h2>
          <p className="font-body text-sm" style={{color:'#8A7A6A', fontWeight:300}}>
            Each business sets their own perks. These are the typical tiers you'll find across Regly locations.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { name:'Regular',      price:'$10', label:'Entry',   perks:['1 free item per visit','Members-only discount','Free delivery once a month'],                                    border:'rgba(201,168,76,0.2)', bg:'rgba(26,20,16,0.8)', badge:null },
            { name:'Gold Regular', price:'$20', label:'Popular', perks:['1 free item every visit','2 free deliveries per month','5% off every order','Up to $40+ value monthly'],         border:'rgba(201,168,76,0.7)', bg:'rgba(201,168,76,0.06)', badge:'MOST POPULAR' },
            { name:'VIP Regular',  price:'$35', label:'Elite',   perks:['1 premium free item every visit','Unlimited free deliveries','10% off every order','Up to $80+ value monthly'], border:'rgba(201,168,76,0.3)', bg:'rgba(26,20,16,0.8)', badge:null },
          ].map((tier, i) => (
            <div key={tier.name} className="tier-card rounded-2xl p-8 flex flex-col border relative" style={{borderColor:tier.border, background:tier.bg}}>
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-body text-xs px-4 py-1 rounded-full font-semibold tracking-widest" style={{background:'#C9A84C', color:'#0A0906'}}>
                  {tier.badge}
                </span>
              )}
              <p className="font-body text-xs tracking-widest uppercase mb-3" style={{color:'#8A7A6A'}}>{tier.label}</p>
              <p className="font-display text-2xl font-bold mb-1" style={{color:'#F5F0E8'}}>{tier.name}</p>
              <p className="font-display text-5xl font-black mb-1" style={{color:'#C9A84C'}}>{tier.price}</p>
              <p className="font-body text-xs mb-8" style={{color:'#8A7A6A'}}>/month · cancel anytime</p>
              <div className="flex-1 space-y-3 mb-8">
                {tier.perks.map(p => (
                  <div key={p} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0"><IconGold size={12} /></div>
                    <span className="font-body text-sm" style={{color:'#F5F0E8', fontWeight:300}}>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/auth?role=customer')}
                className="font-body text-xs tracking-widest uppercase py-3 rounded border transition-all hover:bg-gold hover:text-black w-full"
                style={{borderColor:'#C9A84C', color:'#C9A84C'}}>
                Get Started
              </button>
            </div>
          ))}
        </div>
        <p className="text-center font-body text-xs mt-6" style={{color:'#8A7A6A', fontWeight:300}}>
          Actual perks are defined by each business and displayed before you subscribe.
        </p>
      </section>

      {/* CUSTOMER CTA */}
      <section className="py-32 px-8 text-center relative overflow-hidden" style={{background:'#0F0D0A'}}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display font-black" style={{fontSize:'40vw', color:'#C9A84C', opacity:0.03, lineHeight:1}}>R</span>
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <p className="section-label mb-6">Join Regly</p>
          <h2 className="font-display text-6xl font-bold leading-tight mb-6" style={{color:'#F5F0E8'}}>
            Start getting<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>more.</span>
          </h2>
          <p className="font-body text-base mb-12 leading-relaxed" style={{color:'#8A7A6A', fontWeight:300}}>
            Create your account in 60 seconds. Browse memberships at Chicago's best coffee shops and restaurants. Subscribe to the ones you visit anyway. Cancel anytime.
          </p>
          <button onClick={() => router.push('/auth?role=customer')}
            className="font-body group inline-flex items-center gap-4 px-14 py-5 rounded text-sm tracking-widest uppercase transition-all hover:gap-6"
            style={{background:'#C9A84C', color:'#0A0906', fontWeight:600}}>
            See What's Near Me
            <IconArrow />
          </button>
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section className="py-24 px-8 border-t" style={{borderColor:'rgba(201,168,76,0.1)'}}>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label mb-4">For Business Owners</p>
            <h2 className="font-display text-4xl font-bold mb-4" style={{color:'#F5F0E8'}}>
              Turn your regulars into<br /><span style={{color:'#C9A84C', fontStyle:'italic'}}>recurring revenue.</span>
            </h2>
            <p className="font-body text-sm leading-relaxed mb-8" style={{color:'#8A7A6A', fontWeight:300}}>
              Set up a membership program in 10 minutes. No hardware. No upfront cost. You define the perks, set the price, and keep 85% of every dollar. Regly handles the payments and member tracking.
            </p>
            <button onClick={() => router.push('/auth?role=business')}
              className="font-body text-xs tracking-widest uppercase px-8 py-3.5 rounded border transition-all hover:bg-gold hover:text-black"
              style={{borderColor:'#C9A84C', color:'#C9A84C'}}>
              List My Business
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n:'85%', l:'Revenue to you' },
              { n:'$0',  l:'Setup cost' },
              { n:'10m', l:'To go live' },
              { n:'∞',   l:'Members possible' },
            ].map(s => (
              <div key={s.n} className="rounded-xl p-5 border text-center" style={{borderColor:'rgba(201,168,76,0.15)', background:'rgba(26,20,16,0.6)'}}>
                <p className="font-display text-3xl font-bold" style={{color:'#C9A84C'}}>{s.n}</p>
                <p className="font-body text-xs mt-1" style={{color:'#8A7A6A', fontWeight:300}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 border-t text-center" style={{borderColor:'rgba(201,168,76,0.1)'}}>
        <p className="font-display text-2xl font-bold mb-2"><span style={{color:'#F5F0E8'}}>REGL</span><span style={{color:'#C9A84C'}}>Y</span></p>
        <p className="font-body text-xs" style={{color:'#8A7A6A', fontWeight:300}}>© 2025 Regly · Chicago, IL · hello@getregly.com</p>
      </footer>
    </div>
  )
}
