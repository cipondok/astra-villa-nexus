import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { BookingConfirmationEmail } from '../_shared/email-templates/transactional/booking-confirmation.tsx'
import { BookingCancelledEmail } from '../_shared/email-templates/transactional/booking-cancelled.tsx'
import { NewReviewEmail } from '../_shared/email-templates/transactional/new-review.tsx'
import { InquiryConfirmationEmail } from '../_shared/email-templates/transactional/inquiry-confirmation.tsx'
import { GeneralEmail } from '../_shared/email-templates/transactional/general.tsx'
import { VerificationApprovedEmail } from '../_shared/email-templates/transactional/verification-approved.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'Astra Villa Realty'
const SENDER_DOMAIN = 'notify.astravilla.com'
const FROM_DOMAIN = 'astravilla.com'

interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((vars: Record<string, string>) => string)
}

const TEMPLATES: Record<string, TemplateEntry> = {
  booking_confirmation: {
    component: BookingConfirmationEmail,
    subject: (v) => `Viewing confirmed: ${v.property_title}`,
  },
  booking_cancelled: {
    component: BookingCancelledEmail,
    subject: (v) => `Viewing cancelled: ${v.property_title}`,
  },
  new_review: {
    component: NewReviewEmail,
    subject: (v) => `New ${v.rating}★ review on ${v.property_title}`,
  },
  verification_approved: {
    component: VerificationApprovedEmail,
    subject: (v) => `${v.verification_type} verification approved`,
  },
  foreign_investment_inquiry: {
    component: InquiryConfirmationEmail,
    subject: 'We received your investment inquiry',
  },
  general: {
    component: GeneralEmail,
    subject: 'Message from Astra Villa Realty',
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, template, variables, subject: customSubject, html: rawHtml, text: rawText } = await req.json()

    if (!to) {
      return new Response(JSON.stringify({ error: 'Recipient (to) is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const recipients = Array.isArray(to) ? to : [to]

    // Authenticate caller
    const authHeader = req.headers.get('authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify the user is authenticated (unless it's a service-role call)
    if (authHeader && !authHeader.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)) {
      const token = authHeader.replace('Bearer ', '')
      const { error: authError } = await supabase.auth.getUser(token)
      if (authError) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    let emailHtml: string
    let emailText: string
    let emailSubject: string

    if (template && TEMPLATES[template]) {
      const entry = TEMPLATES[template]
      const vars = variables || {}
      emailSubject = customSubject || (typeof entry.subject === 'function' ? entry.subject(vars) : entry.subject)
      emailHtml = await renderAsync(React.createElement(entry.component, vars))
      emailText = await renderAsync(React.createElement(entry.component, vars), { plainText: true })
    } else if (rawHtml) {
      emailHtml = rawHtml
      emailText = rawText || ''
      emailSubject = customSubject || 'Notification'
    } else {
      return new Response(JSON.stringify({ error: 'Either template or html is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Enqueue for each recipient
    const results = []
    for (const recipient of recipients) {
      const messageId = crypto.randomUUID()

      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: template || 'custom',
        recipient_email: recipient,
        status: 'pending',
      })

      const { error: enqueueError } = await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: {
          message_id: messageId,
          to: recipient,
          from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
          sender_domain: SENDER_DOMAIN,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
          purpose: 'transactional',
          label: template || 'custom',
          queued_at: new Date().toISOString(),
        },
      })

      if (enqueueError) {
        console.error('Failed to enqueue email', { error: enqueueError, recipient })
        await supabase.from('email_send_log').insert({
          message_id: messageId,
          template_name: template || 'custom',
          recipient_email: recipient,
          status: 'failed',
          error_message: 'Failed to enqueue email',
        })
        results.push({ recipient, success: false, error: 'Failed to enqueue' })
      } else {
        results.push({ recipient, success: true, messageId })
      }
    }

    const allSuccess = results.every(r => r.success)
    return new Response(JSON.stringify({ success: allSuccess, results }), {
      status: allSuccess ? 200 : 207,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-transactional-email error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
