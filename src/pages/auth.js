import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const router = useRouter()
  const [role, setRole] = useState(router.query.role || 'customer')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [businessSignedUp, setBusinessSignedUp] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const isB = role === 'business'
  const dash = isB ? '/dashboard/business' : '/dashboard/customer'
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Sync role from query param and auto-switch to signup for direct links
  useState(() => {
    if (router.query.role) {
      setRole(router.query.role)
      // If coming from a direct signup link, start in signup mode
      if (router.query.mode === 'signup') setMode('signup')
    }
  }, [router.query.role, router.query.mode])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        // 1. Create auth user
        const { data, error: sErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        })
        if (sErr) throw sErr
        if (!data?.user?.id) throw new Error('Signup failed. Please try again.')

        // 2. Sign in immediately so we have a valid session before inserting profile
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (signInErr) throw signInErr

        // 3. Insert profile now that we have a valid session
        const { error: pErr } = await supabase.from('profiles').upsert({
          id: signInData.user.id,
          name: form.name,
          phone: form.phone.replace(/\D/g, ''),
          email: form.email,
          role,
        }, { onConflict: 'id' })

        // 4. Business signup shows confirmation screen
        if (isB) {
          setBusinessSignedUp(true)
          setLoading(false)
          return
        }

        // 5. Verify profile was created before redirecting
        const { data: checkProfile } = await supabase
          .from('profiles').select('id, role').eq('id', signInData.user.id).maybeSingle()

                router.push(dash)

      } else {
        // LOGIN
        const { data, error: lErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (lErr) throw lErr

        // Fetch profile to verify role
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()

        // If no profile exists yet (race condition on signup) create it
        if (!profile && !profileErr) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: form.email,
            role,
          }, { onConflict: 'id' })
          router.push(dash)
          return
        }

        // If profile exists but role doesn't match
        if (profile && profile.role !== role) {
          await supabase.auth.signOut()
          const correctRole = profile.role === 'business' ? 'merchant' : 'customer'
          throw new Error(`This account is registered as a ${correctRole}. Please switch the tab above.`)
        }

        router.push(dash)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '14px 16px',
    background: '#fff',
    border: `1.5px solid ${focusedField === field ? '#C0442B' : '#E5E7EB'}`,
    borderRadius: 10, fontSize: 15, color: '#1A0A06', outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(201,168,76,0.12)' : 'none',
    fontFamily: 'inherit',
  })

  if (businessSignedUp) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F9FAFB', padding:'24px', fontFamily:'system-ui, sans-serif'}}>
        <div style={{background:'white', borderRadius:20, padding:'48px 40px', maxWidth:440, width:'100%', textAlign:'center', boxShadow:'0 4px 32px rgba(0,0,0,0.08)'}}>
          <div style={{width:64, height:64, background:'rgba(192,68,43,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px'}}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 14L11 20L23 8" stroke="#C0442B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{fontSize:24, fontWeight:700, color:'#1A0A06', marginBottom:8, fontFamily:'Georgia, serif'}}>Welcome to Regly</h2>
          <p style={{color:'#6B7280', fontSize:15, lineHeight:1.6, marginBottom:24}}>Your account has been created. Our team will reach out shortly to get your business set up.</p>
          <p style={{color:'#9CA3AF', fontSize:13, marginBottom:32}}>Questions? <span style={{color:'#C0442B'}}>getregly@gmail.com</span></p>
          <button onClick={() => router.push('/dashboard/business')} style={{width:'100%', padding:'14px', background:'#C0442B', color:'#1A0A06', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.05em', textTransform:'uppercase'}}>
            Go to My Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', fontFamily:'system-ui, -apple-system, sans-serif', background:'#F9FAFB'}}>
    <Head>
      <title>Sign In — Regly</title>
      <meta name="description" content="Sign in or create your Regly account." />
      <meta property="og:title" content="Sign In — Regly" />
      <meta property="og:description" content="Sign in or create your Regly account." />
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .auth-input::placeholder { color: #9CA3AF; }
        .auth-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .auth-btn { transition: all 0.2s ease; }
        .toggle-btn:hover { color: #8A6A20; }
        .back-btn:hover { color: #374151; }
        .role-tab { transition: all 0.2s ease; cursor: pointer; border: none; }
        @media (min-width: 768px) { .auth-grid { grid-template-columns: 1fr 1fr !important; } .md-photo-panel { display: block !important; } }
      `}</style>

      <div className="auth-grid" style={{display:'grid', gridTemplateColumns:'1fr', minHeight:'100vh'}}>

        {/* LEFT, Photo panel */}
        <div style={{position:'relative', overflow:'hidden', display:'none', background:'#1A0A06'}} className="md-photo-panel">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85&fit=crop"
            alt="Restaurant"
            style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', position:'absolute', inset:0}}
          />
          <div style={{position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(10,9,6,0.7) 0%, rgba(10,9,6,0.4) 100%)'}} />
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px'}}>
            <button onClick={() => router.push('/')} style={{display:'inline-flex', alignItems:'center', gap:8, color:'rgba(245,240,232,0.8)', background:'none', border:'none', cursor:'pointer', fontSize:14, fontFamily:'Georgia, serif', fontWeight:700, letterSpacing:2}}>
              <svg width="18" height="22" viewBox="0 0 110 132" fill="none" style={{display:'inline-block',verticalAlign:'middle',marginRight:6}}><path d="M55 3C27 3 5 25 5 53C5 81 55 129 55 129C55 129 105 81 105 53C105 25 83 3 55 3Z" fill="#C0442B"/><path d="M38 76L38 22Q58 22 58 22Q78 22 78 38Q78 54 58 54L38 54M56 54L80 76" stroke="#F5F0E8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg><span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:'italic',fontSize:20,letterSpacing:'-0.01em'}}>Regly</span>
            </button>
            <div>
              <p style={{color:'rgba(201,168,76,0.8)', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:16, fontFamily:'system-ui', fontWeight:600}}>
                {mode === 'login' ? 'Welcome back' : 'Join Regly'}
              </p>
              <p style={{color:'#F5F0E8', fontSize:36, fontFamily:'Georgia, serif', fontStyle:'italic', fontWeight:400, lineHeight:1.2, maxWidth:320}}>
                "Become a member at your favorite places."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT, Form panel */}
        <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px 24px', background:'white', minHeight:'100vh'}}>
          <div style={{width:'100%', maxWidth:400}}>

            {/* Back button */}
            <button onClick={() => router.push('/')} className="back-btn"
              style={{display:'flex', alignItems:'center', gap:6, color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', fontSize:14, marginBottom:32, padding:0, transition:'color 0.2s'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            {/* Header — changes based on mode */}
            <div style={{marginBottom:28}}>
              <p style={{fontSize:26, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontStyle:'italic', color:'#1A0A06', marginBottom:6, letterSpacing:'-0.01em'}}>
                {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
              </p>
              <p style={{color:'#6B7280', fontSize:14, lineHeight:1.6}}>
                {mode === 'login'
                  ? 'Sign in to access your Regly dashboard.'
                  : 'Join Regly and start building loyalty with your regulars.'}
              </p>
            </div>

            {/* Role selection — signup only */}
            {mode === 'signup' && (
              <div style={{marginBottom:20}}>
                <p style={{fontSize:12, fontWeight:600, color:'#6B7280', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>I am a</p>
                <div style={{display:'flex', background:'#F3F4F6', borderRadius:12, padding:4, gap:4}}>
                  {['customer', 'business'].map(r => (
                    <button key={r} className="role-tab"
                      onClick={() => { setRole(r); setError('') }}
                      style={{
                        flex:1, padding:'10px', borderRadius:9, fontSize:14, fontWeight:600,
                        background: role === r ? 'white' : 'transparent',
                        color: role === r ? '#1A0A06' : '#9CA3AF',
                        boxShadow: role === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        fontFamily:'inherit',
                      }}>
                      {r === 'customer' ? 'Customer' : 'Business Owner'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:14}}>

              {mode === 'signup' && (
                <div>
                  <label style={{display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6, letterSpacing:'0.03em'}}>Full name</label>
                  <input className="auth-input" type="text" value={form.name} onChange={e => set('name', e.target.value)} required
                    placeholder="Your name"
                    onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                    style={{width:'100%', padding:'12px 14px', border:`1.5px solid ${focusedField==='name' ? '#1A0A06' : '#E5E7EB'}`, borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#1A0A06', transition:'border-color 0.2s'}}/>
                </div>
              )}

              <div>
                <label style={{display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6, letterSpacing:'0.03em'}}>Email address</label>
                <input className="auth-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                  placeholder="you@example.com"
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  style={{width:'100%', padding:'12px 14px', border:`1.5px solid ${focusedField==='email' ? '#1A0A06' : '#E5E7EB'}`, borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#1A0A06', transition:'border-color 0.2s'}}/>
              </div>

              <div>
                <label style={{display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6, letterSpacing:'0.03em'}}>Password</label>
                <input className="auth-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required
                  placeholder={mode === 'login' ? 'Your password' : 'Create a password'}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  style={{width:'100%', padding:'12px 14px', border:`1.5px solid ${focusedField==='password' ? '#1A0A06' : '#E5E7EB'}`, borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#1A0A06', transition:'border-color 0.2s'}}/>
              </div>

              {mode === 'signup' && (
                <div>
                  <label style={{display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6, letterSpacing:'0.03em'}}>Phone number</label>
                  <input className="auth-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="Your phone number"
                    onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                    style={{width:'100%', padding:'12px 14px', border:`1.5px solid ${focusedField==='phone' ? '#1A0A06' : '#E5E7EB'}`, borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#1A0A06', transition:'border-color 0.2s'}}/>
                </div>
              )}

              {error && (
                <div style={{background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px'}}>
                  <p style={{color:'#991B1B', fontSize:13, margin:0}}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="auth-btn"
                style={{width:'100%', padding:'14px', background: loading ? '#D1D5DB' : '#1A0A06', color:'#F5F0E8', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginTop:4}}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : role === 'business' ? 'Apply to join' : 'Create account'}
              </button>

            </form>

            {/* Divider */}
            <div style={{display:'flex', alignItems:'center', gap:12, margin:'20px 0'}}>
              <div style={{flex:1, height:'1px', background:'#F3F4F6'}}/>
              <span style={{fontSize:12, color:'#D1D5DB', fontWeight:500}}>
                {mode === 'login' ? 'New to Regly?' : 'Already have an account?'}
              </span>
              <div style={{flex:1, height:'1px', background:'#F3F4F6'}}/>
            </div>

            {/* Toggle mode */}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setRole('customer') }}
              style={{width:'100%', padding:'13px', background:'white', color:'#1A0A06', border:'1.5px solid #E5E7EB', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.borderColor='#1A0A06'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#E5E7EB'}>
              {mode === 'login' ? 'Create a free account' : 'Sign in instead'}
            </button>

            {/* Footer */}
            <p style={{textAlign:'center', color:'#D1D5DB', fontSize:12, marginTop:32}}>
              By continuing you agree to Regly&apos;s{' '}
              <a href={isB ? '/merchant-terms' : '/terms'} target="_blank" style={{color:'#D1D5DB', textDecoration:'underline'}}>terms of service</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
