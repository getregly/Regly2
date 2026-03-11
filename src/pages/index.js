import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const PASSCODE = 'PERKS'

export default function Home() {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('regly_unlocked')
      if (saved === 'true') setUnlocked(true)
    }
    setChecking(false)
  }, [])

  function handlePasscode(e) {
    e.preventDefault()
    if (input.toUpperCase() === PASSCODE) {
      sessionStorage.setItem('regly_unlocked', 'true')
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setInput('')
    }
  }

  if (checking) return null

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
          <p className="text-9xl font-serif font-bold text-cream opacity-5 tracking-widest">REGLY</p>
        </div>
        <h1 className="font-serif text-5xl font-bold mb-2">
          <span className="text-cream">REGL</span><span className="text-gold">Y</span>
        </h1>
        <p className="text-muted italic mb-10">Private Access Only</p>
        <form onSubmit={handlePasscode} className="w-full max-w-xs">
          <input
            className="input text-center text-xl tracking-widest uppercase mb-3"
            placeholder="Enter passcode"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">Incorrect passcode. Try again.</p>}
          <button type="submit" className="btn-gold w-full">Enter</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold z-50" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-black bg-opacity-90 backdrop-blur border-b border-gold border-opacity-10">
        <h1 className="font-serif text-2xl font-bold">
          <span className="text-cream">REGL</span><span className="text-gold">Y</span>
        </h1>
        <div className="flex gap-3">
          <button onClick={() => router.push('/auth?role=business')} className="btn-outline text-sm py-2 px-4">For Businesses</button>
          <button onClick={() => router.push('/auth?role=customer')} className="btn-gold text-sm py-2 px-4">Join Now</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
          <p className="text-cream opacity-5 font-serif font-bold tracking-widest" style={{fontSize:'20vw'}}>R</p>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-block bg-gold bg-opacity-20 border border-gold border-opacity-40 text-gold text-xs tracking-widest px-4 py-2 rounded-full mb-8 font-semibold">
            ✦ NOW LAUNCHING IN CHICAGO
          </div>
          <h2 className="font-serif text-5xl sm:text-7xl font-bold text-cream leading-tight mb-6">
            Belong to Your<br /><span className="text-gold">Favorite Places.</span>
          </h2>
          <p className="text-muted text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Regly is the membership platform that turns your neighborhood's best restaurants, gyms, and shops into places that actually know your name.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/auth?role=customer')} className="btn-gold text-lg px-10 py-4">Become a Regular</button>
            <button onClick={() => router.push('/auth?role=business')} className="btn-outline text-lg px-10 py-4">I Own a Business</button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted text-xs tracking-widest">↓ SCROLL</div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-gold border-opacity-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { n: '4.2×', l: 'More spending from members vs walk-ins' },
            { n: '85%',  l: 'Of every dollar goes directly to the business' },
            { n: '$0',   l: 'Setup cost. No hardware required' },
            { n: '10min',l: 'Average time to launch a membership program' },
          ].map(s => (
            <div key={s.n}>
              <p className="font-serif text-4xl font-bold text-gold">{s.n}</p>
              <p className="text-muted text-sm mt-2 leading-snug">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR CUSTOMERS */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-widest mb-3 font-semibold">FOR CUSTOMERS</p>
          <h3 className="font-serif text-4xl font-bold text-cream">Stop being a stranger.</h3>
          <p className="text-muted mt-4 text-lg max-w-xl mx-auto">Subscribe to the spots you already love. Get perks, feel like a regular, and support local businesses in your neighborhood.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: '🍕', title: 'Pick your spot', body: 'Browse local restaurants, gyms, barbershops and more. See exactly what each membership includes.' },
            { icon: '📱', title: 'Subscribe in seconds', body: 'Choose your tier — $10, $20, or $35/month. Cancel anytime. No commitment required.' },
            { icon: '✦', title: 'Just give your number', body: 'At checkout give your phone number. Staff verify your membership instantly and apply your perks.' },
          ].map(c => (
            <div key={c.title} className="card text-center">
              <div className="text-4xl mb-4">{c.icon}</div>
              <h4 className="font-serif text-lg font-bold text-cream mb-2">{c.title}</h4>
              <p className="text-muted text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => router.push('/auth?role=customer')} className="btn-gold px-10 py-4 text-lg">Browse Memberships</button>
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section className="py-24 px-6 bg-mid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-widest mb-3 font-semibold">FOR BUSINESS OWNERS</p>
            <h3 className="font-serif text-4xl font-bold text-cream">Turn regulars into revenue.</h3>
            <p className="text-muted mt-4 text-lg max-w-xl mx-auto">Stop starting every week from zero. Regly gives you predictable monthly income from the customers who already love you.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {[
              { icon: '💰', title: 'Recurring monthly income', body: 'Members pay every month automatically. 85% goes directly to you via Stripe weekly.' },
              { icon: '📋', title: 'Know your best customers', body: 'See your full member list. Look up any customer by phone number in seconds.' },
              { icon: '⚡', title: 'Live in 10 minutes', body: 'No hardware. No setup fee. Just create your tiers, share your link, and start earning.' },
              { icon: '🎯', title: 'You set the perks', body: 'Design membership tiers that work for your business. Free items, discounts, priority service — your call.' },
            ].map(c => (
              <div key={c.title} className="card flex gap-4">
                <div className="text-3xl shrink-0">{c.icon}</div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-cream mb-1">{c.title}</h4>
                  <p className="text-muted text-sm leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => router.push('/auth?role=business')} className="btn-gold px-10 py-4 text-lg">Set Up My Restaurant</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-widest mb-3 font-semibold">HOW IT WORKS</p>
          <h3 className="font-serif text-4xl font-bold text-cream">Simple for everyone.</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-12">
          <div>
            <p className="text-gold font-semibold text-sm tracking-widest mb-6">FOR THE BUSINESS</p>
            {[
              { n: '01', t: 'Create your tiers', b: 'Set up membership levels with your own perks in 10 minutes.' },
              { n: '02', t: 'Share your Regly link', b: 'Send it to your regulars. Post it on your door or Instagram.' },
              { n: '03', t: 'Look up members at checkout', b: 'Customer gives their phone number. Verify instantly on your dashboard.' },
              { n: '04', t: 'Get paid weekly', b: '85% of all membership revenue hits your bank every week via Stripe.' },
            ].map(s => (
              <div key={s.n} className="flex gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-black font-bold text-xs shrink-0">{s.n}</div>
                <div>
                  <p className="text-cream font-semibold">{s.t}</p>
                  <p className="text-muted text-sm mt-0.5">{s.b}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-gold font-semibold text-sm tracking-widest mb-6">FOR THE CUSTOMER</p>
            {[
              { n: '01', t: 'Find your spot', b: 'Browse all Regly restaurants and businesses in your city.' },
              { n: '02', t: 'Pick a tier', b: 'Choose the membership level that works for how often you visit.' },
              { n: '03', t: 'Pay monthly', b: 'Secure checkout via Stripe. Cancel anytime from your dashboard.' },
              { n: '04', t: 'Give your number', b: 'At checkout just give your phone number. Staff verify and apply your perks.' },
            ].map(s => (
              <div key={s.n} className="flex gap-4 mb-6">
                <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center text-gold font-bold text-xs shrink-0">{s.n}</div>
                <div>
                  <p className="text-cream font-semibold">{s.t}</p>
                  <p className="text-muted text-sm mt-0.5">{s.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-mid">
        <div className="max-w-2xl mx-auto">
          <h3 className="font-serif text-5xl font-bold text-cream mb-4">Every neighborhood<br />has regulars.</h3>
          <p className="text-gold italic text-xl mb-10 font-serif">We give them a home.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/auth?role=customer')} className="btn-gold text-lg px-10 py-4">Become a Regular</button>
            <button onClick={() => router.push('/auth?role=business')} className="btn-outline text-lg px-10 py-4">List My Business</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-gold border-opacity-10 text-center">
        <p className="font-serif text-xl font-bold mb-1"><span className="text-cream">REGL</span><span className="text-gold">Y</span></p>
        <p className="text-muted text-xs">© 2025 Regly. Chicago, IL · hello@getregly.com</p>
      </footer>
    </div>
  )
}
