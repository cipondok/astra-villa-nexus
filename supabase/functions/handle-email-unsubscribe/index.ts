import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // GET: Show unsubscribe confirmation page
  if (req.method === 'GET' && token) {
    const { data: tokenRow } = await supabase
      .from('email_unsubscribe_tokens')
      .select('email')
      .eq('token', token)
      .single()

    if (!tokenRow) {
      return new Response(renderPage('Invalid Link', 'This unsubscribe link is invalid or has expired.', false), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new Response(renderPage('Unsubscribe', `Click the button below to unsubscribe <strong>${maskEmail(tokenRow.email)}</strong> from transactional emails.`, true, token), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // POST: Process unsubscribe
  if (req.method === 'POST') {
    try {
      let postToken: string | null = null
      const contentType = req.headers.get('content-type') || ''
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData()
        postToken = formData.get('token') as string
      } else {
        const body = await req.json()
        postToken = body.token
      }

      if (!postToken) {
        return new Response(renderPage('Error', 'Missing token.', false), {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      const { data: tokenRow } = await supabase
        .from('email_unsubscribe_tokens')
        .select('email')
        .eq('token', postToken)
        .single()

      if (!tokenRow) {
        return new Response(renderPage('Invalid Link', 'This unsubscribe link is invalid or has expired.', false), {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      // Add to suppression list
      await supabase.from('suppressed_emails').upsert(
        { email: tokenRow.email, reason: 'unsubscribe', source: 'one-click' },
        { onConflict: 'email,reason' }
      )

      // Log
      await supabase.from('email_send_log').insert({
        message_id: `unsub-${crypto.randomUUID()}`,
        template_name: 'unsubscribe',
        recipient_email: tokenRow.email,
        status: 'suppressed',
        metadata: { action: 'unsubscribe', source: 'one-click' },
      })

      console.log('Email unsubscribed:', tokenRow.email)

      return new Response(renderPage('Unsubscribed', `<strong>${maskEmail(tokenRow.email)}</strong> has been unsubscribed. You will no longer receive transactional emails from us.`, false), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    } catch (error) {
      console.error('Unsubscribe error:', error)
      return new Response(renderPage('Error', 'Something went wrong. Please try again.', false), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}${local[1]}***@${domain}`
}

function renderPage(title: string, message: string, showButton: boolean, token?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Astra Villa Realty</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; color: #0d1f2d; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #fff; border-radius: 12px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); text-align: center; }
    h1 { font-size: 22px; margin-bottom: 16px; color: #0d1f2d; }
    p { font-size: 14px; color: #5c6e7f; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background: #00A3F5; color: #fff; border: none; padding: 12px 32px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .btn:hover { background: #0090d9; }
    .logo { font-size: 18px; font-weight: 700; color: #00A3F5; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Astra Villa Realty</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${showButton && token ? `
    <form method="POST">
      <input type="hidden" name="token" value="${token}" />
      <button type="submit" class="btn">Unsubscribe</button>
    </form>` : ''}
  </div>
</body>
</html>`
}
