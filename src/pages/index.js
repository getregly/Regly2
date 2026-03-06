import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Gold left bar */}
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      {/* Logo */}
      <div className="mb-4">
        <h1 className="font-serif text-6xl font-bold tracking-tight">
          <span className="text-cream">REGL</span><span className="text-gold">Y</span>
        </h1>
        <p className="text-muted italic mt-2 text-lg">Belong to Your Favorite Places</p>
      </div>

      <div className="w-16 h-0.5 bg-gold mx-auto my-8" />

      <p className="text-cream text-xl mb-12 max-w-md">
        The membership layer for your neighborhood's best spots.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={() => router.push('/auth?role=business')}
          className="btn-gold flex-1 text-lg py-4"
        >
          I'm a Business
        </button>
        <button
          onClick={() => router.push('/auth?role=customer')}
          className="btn-outline flex-1 text-lg py-4"
        >
          I'm a Customer
        </button>
      </div>

      <p className="text-muted text-sm mt-16 italic">
        "Become a Regular."
      </p>
    </div>
  )
}
