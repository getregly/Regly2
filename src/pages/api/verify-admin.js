// src/pages/api/verify-admin.js
// Called by the admin page on load to verify the user is admin server-side
// Returns 200 if authorized, 403 if not

import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'sarrafian.josh@gmail.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (!user || error) return res.status(401).json({ error: 'Unauthorized' })
  if (user.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' })

  return res.status(200).json({ authorized: true })
}
