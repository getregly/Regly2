import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const CUSTOMERS = [
  { id:"0ea1f3da-431d-4059-9caf-a4dff4a7ef4c", name:"Marcus Johnson",  phone:"3125550101", email:"marcus.johns@testregly.com" },
  { id:"6db1e919-a421-4cee-9ef6-bf8def3325fa", name:"Sofia Rivera",    phone:"3125550102", email:"sofia.rivera@testregly.com" },
  { id:"9bdb51d2-c247-4970-b767-f5aeb19c46a9", name:"Derek Williams",  phone:"3125550103", email:"derek.willia@testregly.com" },
  { id:"32402122-ae59-4a52-9132-e17d77deab20", name:"Amara Osei",      phone:"3125550104", email:"amara.osei@testregly.com" },
  { id:"43d93f6b-810b-4c30-a7e6-256ef83813e7", name:"Tyler Brooks",    phone:"3125550105", email:"tyler.brooks@testregly.com" },
  { id:"6c014605-ce02-4614-b0fd-a8a304054158", name:"Priya Patel",     phone:"3125550106", email:"priya.patel@testregly.com" },
  { id:"a4e9e0e9-3330-4282-b4e9-fa9ec53b90e4", name:"James Kowalski", phone:"3125550107", email:"james.kowals@testregly.com" },
  { id:"b7b9fa82-dcee-4e13-89df-87fd4ccadf83", name:"Layla Hassan",   phone:"3125550108", email:"layla.hassan@testregly.com" },
  { id:"7e5d7662-9ba4-4438-bb5a-f06582ed1419", name:"Carlos Mendez",  phone:"3125550109", email:"carlos.mende@testregly.com" },
  { id:"2608a475-6016-4ac9-85d1-ec04fcae61b0", name:"Brianna Scott",  phone:"3125550110", email:"brianna.scot@testregly.com" },
]

const SUBSCRIPTIONS = [
  { id:"abdedfa2-d998-4a88-aa44-a9ecfb4a06eb", customer_id:"0ea1f3da-431d-4059-9caf-a4dff4a7ef4c", restaurant_id:"60441eef-8b70-4da5-a47f-81cf0bd242d7", tier_id:"4be1bc71-9d3f-497d-aaec-5771542ca2d1", start_date:"2026-02-19 15:29:43" },
  { id:"54fa1a8c-2253-417c-a149-62d5de11ffac", customer_id:"6db1e919-a421-4cee-9ef6-bf8def3325fa", restaurant_id:"954b4c2f-b7fc-4a5e-be63-47cdb23605e1", tier_id:"aac1ba0f-4563-4826-81e3-3212cc88d746", start_date:"2026-02-20 15:29:43" },
  { id:"c77acc66-aa80-4535-88cd-ade56990eeca", customer_id:"9bdb51d2-c247-4970-b767-f5aeb19c46a9", restaurant_id:"60441eef-8b70-4da5-a47f-81cf0bd242d7", tier_id:"ffc82228-eb63-48e3-a60b-af594e4369b8", start_date:"2026-03-04 15:29:43" },
  { id:"3394f111-b81a-4894-8962-4093d4b87816", customer_id:"32402122-ae59-4a52-9132-e17d77deab20", restaurant_id:"3f7947e3-ff79-4816-8e46-6fbd20658a9b", tier_id:"ca8916c4-af81-4658-8a87-466b397a685e", start_date:"2026-02-06 15:29:43" },
  { id:"29b256c3-239d-43f7-854f-76c4610e9595", customer_id:"43d93f6b-810b-4c30-a7e6-256ef83813e7", restaurant_id:"3f7947e3-ff79-4816-8e46-6fbd20658a9b", tier_id:"efdb7292-c2d2-47f9-b695-625c944c183f", start_date:"2026-03-05 15:29:43" },
  { id:"c4a351c3-d94c-488b-ac58-434c86ee7be1", customer_id:"6c014605-ce02-4614-b0fd-a8a304054158", restaurant_id:"3f7947e3-ff79-4816-8e46-6fbd20658a9b", tier_id:"b27f54d9-872b-423c-86fa-673291242d8c", start_date:"2026-03-02 15:29:43" },
  { id:"244271e5-910b-4767-ae8c-99b312743af7", customer_id:"a4e9e0e9-3330-4282-b4e9-fa9ec53b90e4", restaurant_id:"27bc1d93-e28a-48ef-803f-3fda28cef21f", tier_id:"5671d169-f6db-4fac-912e-45ccf19bf3b5", start_date:"2026-03-01 15:29:43" },
  { id:"42f63b4d-6f80-463b-a638-5606844619e3", customer_id:"b7b9fa82-dcee-4e13-89df-87fd4ccadf83", restaurant_id:"27bc1d93-e28a-48ef-803f-3fda28cef21f", tier_id:"a4b85fbd-306d-4686-be1f-697e165bb187", start_date:"2026-03-08 15:29:43" },
  { id:"a6f19351-436c-4bfc-9145-348b458832dc", customer_id:"7e5d7662-9ba4-4438-bb5a-f06582ed1419", restaurant_id:"27bc1d93-e28a-48ef-803f-3fda28cef21f", tier_id:"d8f65e21-0e97-462d-b5c6-f0cf505076c7", start_date:"2026-01-27 15:29:43" },
  { id:"4f4fcdad-2920-4f47-ad8f-7063ec7c89ca", customer_id:"2608a475-6016-4ac9-85d1-ec04fcae61b0", restaurant_id:"c48caa8a-fe49-4314-83ba-a8a0c0a84225", tier_id:"a791b8ba-9a75-43cd-9eaf-7b72aadb2559", start_date:"2026-03-11 15:29:43" },
]

export default function Seed() {
  const router = useRouter()
  const [log, setLog]         = useState([])
  const [running, setRunning] = useState(false)
  const [done, setDone]       = useState(false)

  function addLog(msg, type = 'info') {
    setLog(prev => [...prev, { msg, type, t: new Date().toLocaleTimeString() }])
  }

  async function runSeed() {
    setRunning(true)
    setLog([])
    addLog('Starting seed — creating 10 test customers...')

    let successCount = 0

    for (let i = 0; i < CUSTOMERS.length; i++) {
      const c = CUSTOMERS[i]
      const s = SUBSCRIPTIONS[i]

      addLog(`Creating ${c.name}...`)

      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: c.email,
        password: 'TestPassword123!',
        options: { data: { id: c.id } }
      })

      if (authErr && !authErr.message.includes('already registered')) {
        addLog(`⚠ ${c.name} auth: ${authErr.message}`, 'warn')
        continue
      }

      const userId = authData?.user?.id || c.id

      // 2. Insert profile
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        name: c.name,
        phone: c.phone,
        role: 'customer',
      })
      if (profileErr) addLog(`⚠ ${c.name} profile: ${profileErr.message}`, 'warn')

      // 3. Insert subscription using actual auth user ID
      const { error: subErr } = await supabase.from('subscriptions').upsert({
        id: s.id,
        customer_id: userId,
        restaurant_id: s.restaurant_id,
        tier_id: s.tier_id,
        stripe_subscription_id: `test_sub_${userId.slice(0,8)}`,
        stripe_customer_id: `test_cus_${userId.slice(0,8)}`,
        status: 'active',
        start_date: s.start_date,
      })

      if (subErr) {
        addLog(`⚠ ${c.name} subscription: ${subErr.message}`, 'warn')
      } else {
        addLog(`✓ ${c.name} created successfully`, 'success')
        successCount++
      }

      await new Promise(r => setTimeout(r, 400))
    }

    addLog(`\n🎉 Done! ${successCount}/10 customers seeded.`)
    addLog('⚠ Delete src/pages/seed.js from GitHub now.')
    setDone(true)
    setRunning(false)
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <div className="fixed left-0 top-0 w-1.5 h-full bg-gold" />
      <h1 className="font-serif text-3xl font-bold text-cream mb-2">
        <span className="text-gold">✦</span> Test Data Seeder
      </h1>
      <p className="text-muted text-sm mb-8">
        Creates 10 fake customers with auth accounts, profiles, and subscriptions across your restaurants.
        <strong className="text-gold"> Delete this file after running.</strong>
      </p>

      {!running && !done && (
        <button onClick={runSeed} className="btn-gold px-8 py-3">
          Run — Create 10 Test Customers
        </button>
      )}

      {running && (
        <div className="text-gold text-sm mb-4 animate-pulse">Running... do not close this page</div>
      )}

      {log.length > 0 && (
        <div className="mt-6 bg-dark rounded-lg border border-gold border-opacity-20 p-4 space-y-1 font-mono text-xs max-h-96 overflow-y-auto">
          {log.map((l, i) => (
            <div key={i} className={
              l.type === 'success' ? 'text-green-400' :
              l.type === 'error'   ? 'text-red-400' :
              l.type === 'warn'    ? 'text-yellow-400' :
              'text-muted'
            }>
              <span className="opacity-40 mr-2">{l.t}</span>{l.msg}
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="mt-6 space-y-3">
          <button onClick={() => router.push('/dashboard/business')} className="btn-gold px-8 py-3 w-full">
            Go to Business Dashboard
          </button>
          <p className="text-red-400 text-xs text-center">
            Remember to delete src/pages/seed.js from GitHub now.
          </p>
        </div>
      )}
    </div>
  )
}
