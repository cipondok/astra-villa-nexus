import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface EmailPayload {
  run_id?: string
  message_id: string
  to: string
  from: string
  sender_domain: string
  subject: string
  html: string
  text: string
  purpose: string
  label: string
  queued_at: string
}

interface QueueMessage {
  msg_id: number
  read_ct: number
  enqueued_at: string
  vt: string
  message: EmailPayload
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!lovableApiKey) {
    console.error('LOVABLE_API_KEY not configured')
    return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Read config from email_send_state
  const { data: stateRow } = await supabase
    .from('email_send_state')
    .select('*')
    .eq('id', 1)
    .single()

  const batchSize = stateRow?.batch_size || 10
  const sendDelayMs = stateRow?.send_delay_ms || 200
  const authTtlMin = stateRow?.auth_email_ttl_minutes || 15
  const transactionalTtlMin = stateRow?.transactional_email_ttl_minutes || 60

  // Check rate limit
  if (stateRow?.is_rate_limited && stateRow?.rate_limited_until) {
    const until = new Date(stateRow.rate_limited_until)
    if (until > new Date()) {
      console.log('Rate limited until', until.toISOString())
      return new Response(JSON.stringify({ skipped: true, reason: 'rate_limited' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    // Clear rate limit
    await supabase.from('email_send_state').update({
      is_rate_limited: false,
      rate_limited_until: null,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
  }

  let totalSent = 0
  let totalFailed = 0
  let totalExpired = 0

  // Process auth_emails first (higher priority), then transactional_emails
  for (const queueName of ['auth_emails', 'transactional_emails']) {
    const ttlMinutes = queueName === 'auth_emails' ? authTtlMin : transactionalTtlMin

    // Read a batch of messages with 30s visibility timeout
    const { data: messages, error: readError } = await supabase.rpc('pgmq_read', {
      queue_name: queueName,
      vt: 30,
      qty: batchSize,
    })

    if (readError) {
      console.error(`Error reading from ${queueName}:`, readError)
      continue
    }

    if (!messages || messages.length === 0) continue

    for (const msg of messages as QueueMessage[]) {
      const payload = msg.message

      // Check TTL — expire old messages
      if (payload.queued_at) {
        const queuedAt = new Date(payload.queued_at)
        const ageMinutes = (Date.now() - queuedAt.getTime()) / 60000
        if (ageMinutes > ttlMinutes) {
          console.log('Message expired', { message_id: payload.message_id, ageMinutes, ttlMinutes })
          await supabase.from('email_send_log').insert({
            message_id: payload.message_id,
            template_name: payload.label || 'unknown',
            recipient_email: payload.to,
            status: 'dlq',
            error_message: `TTL expired (${Math.round(ageMinutes)}m > ${ttlMinutes}m)`,
          })
          // Archive (delete) from queue
          await supabase.rpc('pgmq_archive', { queue_name: queueName, msg_id: msg.msg_id })
          totalExpired++
          continue
        }
      }

      // Send email via Lovable Email API
      try {
        const emailApiUrl = `https://${payload.sender_domain}/api/send`
        const response = await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            from: payload.from,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            purpose: payload.purpose,
          }),
        })

        if (response.status === 429) {
          // Rate limited — stop processing, record retry-after
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10)
          const until = new Date(Date.now() + retryAfter * 1000)
          console.warn('Rate limited by email API', { retryAfter, until: until.toISOString() })

          await supabase.from('email_send_state').update({
            is_rate_limited: true,
            rate_limited_until: until.toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', 1)

          // Don't archive — message stays in queue for retry
          await response.text() // consume body
          break
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Email send failed', { message_id: payload.message_id, status: response.status, error: errorText })

          if (response.status >= 500) {
            // Server error — don't archive, let visibility timeout handle retry
            totalFailed++
            continue
          }

          // Client error (4xx) — permanent failure, move to DLQ
          await supabase.from('email_send_log').insert({
            message_id: payload.message_id,
            template_name: payload.label || 'unknown',
            recipient_email: payload.to,
            status: 'dlq',
            error_message: `HTTP ${response.status}: ${errorText.substring(0, 500)}`,
          })
          await supabase.rpc('pgmq_archive', { queue_name: queueName, msg_id: msg.msg_id })
          totalFailed++
          continue
        }

        // Success
        await response.text() // consume body
        await supabase.from('email_send_log').insert({
          message_id: payload.message_id,
          template_name: payload.label || 'unknown',
          recipient_email: payload.to,
          status: 'sent',
        })
        await supabase.rpc('pgmq_archive', { queue_name: queueName, msg_id: msg.msg_id })
        totalSent++

        // Delay between sends to smooth out bursts
        if (sendDelayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, sendDelayMs))
        }
      } catch (err) {
        console.error('Email send exception', { message_id: payload.message_id, error: err })
        totalFailed++
        // Don't archive — let visibility timeout handle retry
      }
    }
  }

  console.log('Queue processing complete', { totalSent, totalFailed, totalExpired })

  return new Response(JSON.stringify({ sent: totalSent, failed: totalFailed, expired: totalExpired }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
