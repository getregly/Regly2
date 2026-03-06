import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Sends to Tally form in background — replace with your Tally form ID
    try {
      await fetch('https://tally.so/r/eqBLKE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        mode: 'no-cors',
      })
    } catch (_) {}
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

      {/* Gold left bar */}
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      {/* Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
        <p className="text-9xl font-serif font-bold text-cream opacity-5 tracking-widest">REGLY</p>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <h1 className="font-serif text-6xl font-bold tracking-tight">
          <span className="text-cream">REGL</span><span className="text-gold">Y</span>
        </h1>
        <p className="text-muted italic mt-2 text-lg">Belong to Your Favorite Places</p>
      </div>

      {/* Divider */}
      <div className="w-16 h-0.5 bg-gold mx-auto my-8" />

      {/* Headline */}
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream max-w-lg leading-tight mb-4">
        Memberships for your neighborhood's best spots.
      </h2>
      <p className="text-muted text-lg max-w-md mb-12">
        We're putting the finishing touches on something special. Drop your email and you'll be the first to know when we launch in Chicago.
      </p>

      {/* Email capture */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-gold px-8 py-3 shrink-0"
          >
            {loading ? '...' : 'Notify Me'}
          </button>
        </form>
      ) : (
        <div className="bg-mid border border-gold border-opacity-40 rounded-lg px-8 py-5 max-w-md">
          <p className="text-gold font-serif text-xl font-bold mb-1">You're on the list ✦</p>
          <p className="text-muted text-sm">We'll reach out as soon as Regly launches in your city.</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-12 mt-16">
        {[
          { n: '$0',    l: 'Setup cost' },
          { n: '85%',   l: 'Revenue to you' },
          { n: '10min', l: 'To go live' },
        ].map(s => (
          <div key={s.n} className="text-center">
            <p className="font-serif text-2xl font-bold text-gold">{s.n}</p>
            <p className="text-muted text-xs mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-muted text-xs mt-16">
        Are you a business?{' '}
        <a href="/auth?role=business" className="text-gold hover:underline">
          Get early access →
        </a>
      </p>

    </div>
  )
}
