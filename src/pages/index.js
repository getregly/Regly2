export default function Home() {
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
        We're putting the finishing touches on something special. Check back soon — launching in Chicago shortly.
      </p>

      {/* Coming Soon badge */}
      <div className="bg-mid border border-gold border-opacity-40 rounded-lg px-8 py-5">
        <p className="text-gold font-serif text-xl font-bold mb-1">Coming Soon ✦</p>
        <p className="text-muted text-sm">Regly is launching in Chicago. Stay tuned.</p>
      </div>

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

    </div>
  )
}
