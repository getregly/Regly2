import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const router = useRouter()
  const { role } = router.query
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isB = role === 'business'
  const label = isB ? 'Business Owner' : 'Customer'
  const dash  = isB ? '/dashboard/business' : '/dashboard/customer'

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: sErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        })
        if (sErr) throw sErr
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: form.name,
          phone: form.phone,
          role: role,
        })
        router.push(dash)
      } else {
        const { data, error: lErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (lErr) throw lErr
        // Verify role
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', data.user.id).single()
        if (profile?.role !== role) {
          await supabase.auth.signOut()
          throw new Error(`This account is not registered as a ${label}.`)
        }
        router.push(dash)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <button onClick={() => router.push('/')} className="text-muted text-sm mb-6 block hover:text-gold">
            ← Back
          </button>
          <h1 className="font-serif text-3xl font-bold text-cream">
            {mode === 'login' ? 'Welcome back' : 'Join Regly'}
          </h1>
          <p className="text-muted mt-2">
            {mode === 'login' ? `${label} login` : `Create your ${label} account`}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-900 bg-opacity-40 border border-red-500 text-red-300 rounded px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(312) 555-0000" />
                </div>
              </>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@email.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-gold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
