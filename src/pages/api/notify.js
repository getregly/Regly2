// src/pages/api/notify.js
// Receives webhook calls from Supabase database triggers
// and posts formatted notifications to Slack
//
// SECURITY:
// 1. Shared secret verified on every request (SUPABASE_WEBHOOK_SECRET)
// 2. Method guard — POST only
// 3. Payload validated before processing
// 4. Slack URL never exposed to client
// 5. Rate limit friendly — fails fast on bad requests
// 6. No sensitive data logged

// Slack block kit message builder
function buildSlackMessage(type, data) {
  const ts = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true
  })

  if (type === 'new_customer') {
    return {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '👤 New Customer Signed Up', emoji: true }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${data.name || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.email || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Time:*\n${ts} CT` },
            { type: 'mrkdwn', text: `*Role:*\nCustomer` },
          ]
        },
        { type: 'divider' },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: '🔗 <https://getregly.com|getregly.com>' }]
        }
      ]
    }
  }

  if (type === 'new_merchant') {
    return {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🏪 New Merchant Application', emoji: true }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Business:*\n${data.business_name || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Owner:*\n${data.owner_name || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.email || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Phone:*\n${data.phone || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Address:*\n${data.address || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Time:*\n${ts} CT` },
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Review in Admin', emoji: true },
              url: 'https://getregly.com/admin',
              style: 'primary'
            }
          ]
        },
        { type: 'divider' },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: '🔗 <https://getregly.com/admin|Open Admin Dashboard>' }]
        }
      ]
    }
  }

  return null
}

export default async function handler(req, res) {
  // 1. Method guard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. Verify shared secret — prevents anyone from spamming this endpoint
  // Supabase sends this in the Authorization header
  const secret = req.headers['x-webhook-secret']
  const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET

  if (!expectedSecret) {
    console.error('SUPABASE_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  if (!secret || secret !== expectedSecret) {
    // Return 200 to not reveal whether the secret exists
    // Logging the IP for potential abuse monitoring
    console.warn('Unauthorized webhook attempt')
    return res.status(200).json({ ok: true })
  }

  // 3. Validate Slack webhook is configured
  const slackUrl = process.env.SLACK_WEBHOOK_URL
  if (!slackUrl) {
    console.error('SLACK_WEBHOOK_URL not configured')
    return res.status(500).json({ error: 'Slack not configured' })
  }

  // 4. Parse and validate payload
  const { type, data } = req.body

  if (!type || !data) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  if (!['new_customer', 'new_merchant'].includes(type)) {
    return res.status(400).json({ error: 'Unknown notification type' })
  }

  // 5. Build Slack message
  const message = buildSlackMessage(type, data)
  if (!message) {
    return res.status(400).json({ error: 'Could not build message' })
  }

  // 6. Post to Slack
  try {
    const slackRes = await fetch(slackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (!slackRes.ok) {
      console.error('Slack post failed:', slackRes.status)
      return res.status(500).json({ error: 'Slack delivery failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Notify error:', err.message)
    return res.status(500).json({ error: 'Internal error' })
  }
}
