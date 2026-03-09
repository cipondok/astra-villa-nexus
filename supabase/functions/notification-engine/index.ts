import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type Action = 'send_email' | 'push_notification' | 'schedule_email' | 'lease_alert' | 'visit_reminder';

const log = (step: string, details?: unknown) => {
  console.log(`[NOTIFICATION-ENGINE] ${step}`, details ? JSON.stringify(details) : '');
};

// ─── Default branding & templates ───────────────────────────────────
const defaultBranding = {
  companyName: 'ASTRA Villa', companyLogoUrl: '', companyWebsite: 'https://astravilla.com',
  companyAddress: 'Jakarta, Indonesia', companyPhone: '+62 857 1600 8080',
  supportEmail: 'support@astravilla.com', primaryColor: '#B8860B',
  secondaryColor: '#0066FF', accentColor: '#D4AF37',
  socialFacebook: '', socialInstagram: '', socialTwitter: '', socialLinkedin: '',
  footerText: 'Thank you for choosing ASTRA Villa - Your trusted partner in luxury real estate.',
  copyrightText: '© 2024 ASTRA Villa. All rights reserved.',
};

const builtInTemplates: Record<string, Record<string, any>> = {
  booking_confirmation: { subject: 'Booking Confirmed – {{property_title}}', headerText: 'Booking Confirmed ✅', body: 'Dear {{user_name}},\n\nYour booking for <strong>{{property_title}}</strong> has been submitted.\n\n📅 Date: {{booking_date}}\n🕐 Time: {{booking_time}}\n📍 Address: {{property_address}}', buttonText: 'View My Bookings', buttonUrl: '{{site_url}}/profile?tab=bookings', showSocialLinks: true },
  booking_cancelled: { subject: 'Booking Cancelled – {{property_title}}', headerText: 'Booking Cancelled', body: 'Dear {{user_name}},\n\nYour booking for <strong>{{property_title}}</strong> on {{booking_date}} has been cancelled.\n\n📝 Reason: {{cancellation_reason}}', buttonText: 'Browse Properties', buttonUrl: '{{site_url}}/properties', showSocialLinks: true },
  verification_approved: { subject: 'Verification Approved – {{verification_type}}', headerText: 'Verification Approved ✅', body: 'Dear {{user_name}},\n\nYour <strong>{{verification_type}}</strong> verification has been approved.', buttonText: 'Explore Benefits', buttonUrl: '{{site_url}}/dashboard', showSocialLinks: true },
  general: { subject: 'Message from ASTRA Villa', body: '{{message}}', showSocialLinks: true, showUnsubscribe: true },
  system_health_alert: { subject: '🚨 System Alert: {{alert_type}}', headerText: '⚠️ System Health Alert', body: '<strong>Severity:</strong> {{severity}}\n<strong>Issue:</strong> {{message}}\n\n<strong>Details:</strong>\n<pre style="background:#f5f0eb;padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;">{{details}}</pre>\n\n<strong>Detected at:</strong> {{timestamp}}', buttonText: 'Open Command Center', buttonUrl: '{{dashboard_url}}', showSocialLinks: false },
};

function replaceVariables(str: string, vars: Record<string, string>): string {
  let result = str;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}

function buildEmailHtml(branding: any, headerText: string, bodyContent: string, buttonText: string, buttonUrl: string, showSocial: boolean): string {
  const socialHtml = showSocial && (branding.socialFacebook || branding.socialInstagram) ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #E8E0D5;">
    ${branding.socialFacebook ? `<a href="${branding.socialFacebook}" style="display:inline-block;margin:0 8px;color:${branding.primaryColor};text-decoration:none;font-size:13px;">Facebook</a>` : ''}
    ${branding.socialInstagram ? `<a href="${branding.socialInstagram}" style="display:inline-block;margin:0 8px;color:${branding.primaryColor};text-decoration:none;font-size:13px;">Instagram</a>` : ''}
  </div>` : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#FFFBF5 0%,#FFF8F0 50%,#FFFDF9 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#FFFFFF;border-radius:16px;overflow:hidden;max-width:100%;box-shadow:0 4px 24px rgba(184,134,11,0.08);">
<tr><td style="height:4px;background:linear-gradient(90deg,${branding.primaryColor} 0%,${branding.accentColor} 50%,${branding.primaryColor} 100%);"></td></tr>
<tr><td align="center" style="padding:32px 24px 24px 24px;">
  ${branding.companyLogoUrl ? `<img src="${branding.companyLogoUrl}" alt="${branding.companyName}" style="max-height:56px;max-width:200px;">` :
    `<div><span style="color:${branding.primaryColor};font-size:32px;font-weight:600;letter-spacing:2px;">ASTRA</span><span style="color:#2D2A26;font-size:32px;font-weight:400;letter-spacing:2px;"> Villa</span></div>`}
</td></tr>
<tr><td style="padding:40px 40px 32px 40px;">
  ${headerText ? `<h1 style="margin:0 0 24px 0;color:#2D2A26;font-size:26px;font-weight:600;text-align:center;">${headerText}</h1>` : ''}
  <div style="color:#4A4540;font-size:15px;line-height:1.7;white-space:pre-wrap;">${bodyContent}</div>
  ${buttonText && buttonUrl ? `<div style="margin-top:32px;text-align:center;"><a href="${buttonUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,${branding.primaryColor},${branding.accentColor});color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${buttonText}</a></div>` : ''}
</td></tr>
<tr><td style="padding:24px 40px;background:#FDFAF6;border-top:1px solid #F0E8DC;">
  <p style="color:#8B7355;font-size:13px;text-align:center;margin:0;">${branding.footerText}</p>
  ${socialHtml}
  <p style="color:#B8A88A;font-size:11px;text-align:center;margin:12px 0 0 0;">${branding.copyrightText}</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ─── send_email ─────────────────────────────────────────────────────
async function sendEmail(params: Record<string, any>, supabase: any, req: Request) {
  const { to, subject, template, variables, html, skipAuth } = params;

  // Auth check for non-system emails
  if (!skipAuth) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization required');
    const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) throw new Error('Invalid token');
    const userId = userData.user.id;
    const userEmail = userData.user.email?.toLowerCase();
    const toAddresses = Array.isArray(to) ? to : [to];
    const { data: isAdmin } = await supabase.rpc('has_role', { user_id: userId, role: 'admin' });
    if (!isAdmin && !toAddresses.every((addr: string) => addr.toLowerCase() === userEmail)) {
      throw new Error('You can only send emails to your own address');
    }
  }

  // Fetch configs
  const { data: configRows } = await supabase.from('system_settings').select('key, value, category')
    .or('and(category.eq.smtp,key.eq.config),and(category.eq.email,key.eq.branding),and(category.eq.email,key.eq.templates)');

  let smtp: any = { fromName: 'ASTRA Villa', fromEmail: 'noreply@astravilla.com', encryption: 'tls', port: '587', isEnabled: false };
  let branding = { ...defaultBranding };
  let dbTemplates: any[] = [];
  let siteUrl = 'https://astravilla.com';

  configRows?.forEach((item: any) => {
    if (item.category === 'smtp' && item.key === 'config' && item.value) smtp = { ...smtp, ...item.value };
    if (item.category === 'email' && item.key === 'branding' && item.value) branding = { ...branding, ...item.value };
    if (item.category === 'email' && item.key === 'templates' && Array.isArray(item.value)) dbTemplates = item.value;
  });

  const { data: emailConfigRow } = await supabase.from('system_settings').select('value').eq('category', 'email').eq('key', 'config').maybeSingle();
  if (emailConfigRow?.value) {
    const ec = emailConfigRow.value as any;
    if (ec.siteUrl) siteUrl = ec.siteUrl;
    if (!smtp.isEnabled && ec.isEnabled !== undefined) smtp.isEnabled = ec.isEnabled;
  }

  if (!smtp.isEnabled) return { success: false, error: 'Email sending disabled' };
  if (!smtp.host || !smtp.username || !smtp.password) return { success: false, error: 'SMTP not configured' };

  const allVars: Record<string, string> = {
    company_name: branding.companyName, company_logo_url: branding.companyLogoUrl,
    company_website: branding.companyWebsite, company_address: branding.companyAddress,
    primary_color: branding.primaryColor, accent_color: branding.accentColor,
    site_url: siteUrl, support_email: branding.supportEmail, ...variables,
  };

  let emailHtml = html;
  let emailSubject = subject;

  if (template) {
    const dbTpl = dbTemplates.find((t: any) => t.id === template);
    const builtIn = builtInTemplates[template];
    const tpl = dbTpl || (builtIn ? { ...builtIn } : { body: variables?.message || '', showSocialLinks: true });
    emailSubject = replaceVariables(emailSubject || tpl.subject || 'Notification', allVars);
    const bodyContent = replaceVariables(tpl.body || '', allVars);
    const headerText = replaceVariables(tpl.headerText || '', allVars);
    const buttonText = replaceVariables(tpl.buttonText || '', allVars);
    const buttonUrl = replaceVariables(tpl.buttonUrl || '', allVars);
    emailHtml = buildEmailHtml(branding, headerText, bodyContent, buttonText, buttonUrl, tpl.showSocialLinks);
  }

  const recipients = Array.isArray(to) ? to : [to];
  const client = new SMTPClient({
    connection: { hostname: smtp.host, port: parseInt(smtp.port || '587'), tls: smtp.encryption === 'tls' || smtp.encryption === 'ssl', auth: { username: smtp.username, password: smtp.password } },
  });
  try {
    for (const recipient of recipients) {
      await client.send({ from: `${smtp.fromName} <${smtp.fromEmail}>`, to: recipient, subject: emailSubject || 'Notification', html: emailHtml || '' });
    }
  } finally { await client.close(); }

  return { success: true, sent: recipients.length };
}

// ─── push_notification ──────────────────────────────────────────────
async function pushNotification(params: Record<string, any>, supabase: any) {
  const { push_action = 'send_to_user', userId, notification, subscription } = params;

  if (push_action === 'subscribe') {
    if (!userId || !subscription) throw new Error('userId and subscription required');
    const { endpoint, keys, deviceType, browser } = subscription;
    const { data: existing } = await supabase.from('push_subscriptions').select('id').eq('endpoint', endpoint).maybeSingle();
    if (existing) {
      await supabase.from('push_subscriptions').update({ user_id: userId, p256dh_key: keys.p256dh, auth_key: keys.auth, device_type: deviceType || 'web', browser, is_active: true, updated_at: new Date().toISOString() }).eq('id', existing.id);
      return { success: true, subscription_id: existing.id, updated: true };
    }
    const { data, error } = await supabase.from('push_subscriptions').insert({ user_id: userId, endpoint, p256dh_key: keys.p256dh, auth_key: keys.auth, device_type: deviceType || 'web', browser, is_active: true }).select().single();
    if (error) throw error;
    return { success: true, subscription_id: data.id };
  }

  if (push_action === 'unsubscribe') {
    if (!userId || !subscription?.endpoint) throw new Error('userId and endpoint required');
    await supabase.from('push_subscriptions').update({ is_active: false }).eq('user_id', userId).eq('endpoint', subscription.endpoint);
    return { success: true };
  }

  if (push_action === 'get_stats') {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: notifications } = await supabase.from('notification_history').select('*').gte('created_at', thirtyDaysAgo.toISOString()).limit(500);
    const total = notifications?.length || 0;
    const sent = notifications?.filter((n: any) => n.is_sent).length || 0;
    const read = notifications?.filter((n: any) => n.is_read).length || 0;
    return { success: true, total, sent, read, clickRate: sent > 0 ? ((read / sent) * 100).toFixed(1) : '0' };
  }

  // send_to_user / send_bulk
  if (!userId && !params.userIds) throw new Error('userId or userIds required');
  if (!notification) throw new Error('notification required');

  const targetIds = params.userIds || [userId];
  let totalSent = 0;

  for (const uid of targetIds) {
    // Check preferences
    const { data: prefs } = await supabase.from('notification_preferences').select('*').eq('user_id', uid).maybeSingle();
    if (prefs?.push_enabled === false) continue;

    // Check quiet hours
    if (prefs?.quiet_hours_enabled && prefs.quiet_start_time && prefs.quiet_end_time) {
      const now = new Date();
      const idTime = new Date(now.getTime() + 7 * 3600000);
      const mins = idTime.getUTCHours() * 60 + idTime.getUTCMinutes();
      const [sh, sm] = prefs.quiet_start_time.split(':').map(Number);
      const [eh, em] = prefs.quiet_end_time.split(':').map(Number);
      const start = sh * 60 + sm, end = eh * 60 + em;
      if (start > end ? (mins >= start || mins < end) : (mins >= start && mins < end)) continue;
    }

    const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', uid).eq('is_active', true);
    if (!subs?.length) continue;

    // Save to history
    await supabase.from('notification_history').insert({ user_id: uid, title: notification.title, body: notification.body, icon: notification.icon, image: notification.image, action_url: notification.actionUrl, notification_type: notification.type, metadata: notification.metadata, is_sent: true, sent_at: new Date().toISOString() });

    for (const sub of subs) {
      try {
        await fetch(sub.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'TTL': '86400' }, body: JSON.stringify({ title: notification.title, body: notification.body, icon: notification.icon || '/icon-192.png', data: { actionUrl: notification.actionUrl, type: notification.type } }) });
        totalSent++;
      } catch (e) {
        if ((e as any)?.status === 410) await supabase.from('push_subscriptions').update({ is_active: false }).eq('id', sub.id);
      }
    }
  }

  return { success: true, sent: totalSent };
}

// ─── schedule_email ─────────────────────────────────────────────────
async function scheduleEmail(params: Record<string, any>, supabase: any) {
  const { schedule_action = 'cron', event, userId } = params;

  const { data: schedulesData } = await supabase.from('system_settings').select('value').eq('category', 'email').eq('key', 'schedules').single();
  const schedules = (schedulesData?.value || []) as any[];
  const active = schedules.filter((s: any) => s.isActive);

  let emailsSent = 0;
  const results: any[] = [];

  if (schedule_action === 'event' && event && userId) {
    const eventSchedules = active.filter((s: any) => s.triggerType === 'event_based' && s.triggerEvent === event);
    for (const sch of eventSchedules) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) continue;
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
      const { error } = await supabase.functions.invoke('notification-engine', { body: { action: 'send_email', to: userData.user.email, template: sch.templateId, variables: { user_name: profile?.full_name || userData.user.email.split('@')[0] }, skipAuth: true } });
      if (!error) emailsSent++;
      results.push({ schedule: sch.name, sent: error ? 0 : 1, errors: error ? [error.message] : [] });
    }
  }

  if (schedule_action === 'cron') {
    const scheduledJobs = active.filter((s: any) => s.triggerType === 'scheduled');
    for (const sch of scheduledJobs) {
      const sr = { schedule: sch.name, sent: 0, errors: [] as string[] };
      let users: any[] = [];
      const audience = sch.targetAudience;

      if (audience === 'inactive_users') {
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - (sch.inactiveDays || 7));
        const { data } = await supabase.from('profiles').select('id, full_name, email').lt('last_login', cutoff.toISOString()).limit(100);
        users = (data || []).filter((u: any) => u.email);
      } else if (audience === 'new_users') {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        const { data } = await supabase.from('profiles').select('id, full_name, email').gte('created_at', weekAgo.toISOString()).limit(100);
        users = (data || []).filter((u: any) => u.email);
      } else {
        const { data } = await supabase.from('profiles').select('id, full_name, email').limit(100);
        users = (data || []).filter((u: any) => u.email);
      }

      for (const user of users) {
        const { error } = await supabase.functions.invoke('notification-engine', { body: { action: 'send_email', to: user.email, template: sch.templateId, variables: { user_name: user.full_name || user.email.split('@')[0] }, skipAuth: true } });
        if (!error) { sr.sent++; emailsSent++; }
        else sr.errors.push(`${user.email}: ${error.message}`);
        await new Promise(r => setTimeout(r, 100));
      }
      results.push(sr);
    }
  }

  return { success: true, emailsSent, results };
}

// ─── lease_alert ────────────────────────────────────────────────────
async function leaseAlert(_params: Record<string, any>, supabase: any) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() + 14);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  const { data: bookings, error } = await supabase.from('rental_bookings')
    .select('id, check_out_date, total_amount, property_id, customer_id, properties(title, owner_id)')
    .in('booking_status', ['confirmed', 'pending'])
    .gte('check_out_date', today).lte('check_out_date', cutoffDate)
    .order('check_out_date', { ascending: true });
  if (error) throw error;

  let alertsCreated = 0;
  for (const booking of bookings || []) {
    const daysLeft = Math.ceil((new Date(booking.check_out_date).getTime() - now.getTime()) / 86400000);
    const priority = daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'high' : 'medium';
    const emoji = daysLeft <= 3 ? '⚠️' : daysLeft <= 7 ? '🔔' : '📋';
    const title = `${emoji} Sewa "${(booking as any).properties?.title}" berakhir dalam ${daysLeft} hari`;

    const { data: existing } = await supabase.from('admin_alerts').select('id').eq('reference_id', booking.id).eq('reference_type', 'lease_expiry').gte('created_at', `${today}T00:00:00Z`).limit(1);
    if (existing?.length) continue;

    await supabase.from('admin_alerts').insert({
      title, message: `Booking #${booking.id.slice(0, 8)} akan berakhir pada ${booking.check_out_date}.`,
      type: 'lease_expiry', priority, alert_category: 'rental',
      reference_id: booking.id, reference_type: 'lease_expiry',
      action_required: daysLeft <= 7,
      metadata: { booking_id: booking.id, property_id: booking.property_id, tenant_id: booking.customer_id, days_remaining: daysLeft, check_out_date: booking.check_out_date },
    });
    alertsCreated++;
  }

  return { success: true, expiring: bookings?.length || 0, alerts_created: alertsCreated };
}

// ─── visit_reminder ─────────────────────────────────────────────────
async function visitReminder(_params: Record<string, any>, supabase: any) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const resend = resendKey ? new Resend(resendKey) : null;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tmrw = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  const { data: visits, error } = await supabase.from('property_visits').select('*')
    .in('status', ['pending', 'confirmed']).in('visit_date', [todayStr, tmrw])
    .or('reminder_24h_sent.eq.false,reminder_1h_sent.eq.false');
  if (error) throw error;

  const results = { sent_24h: 0, sent_1h: 0, in_app: 0, errors: 0 };

  for (const visit of visits || []) {
    const [vh, vm] = visit.start_time.split(':').map(Number);
    const visitDt = new Date(`${visit.visit_date}T${String(vh).padStart(2, '0')}:${String(vm).padStart(2, '0')}:00`);
    const hoursUntil = (visitDt.getTime() - now.getTime()) / 3600000;

    if (!visit.reminder_24h_sent && hoursUntil > 1.5 && hoursUntil <= 25) {
      try {
        if (resend && visit.visitor_email) {
          await resend.emails.send({ from: 'Property Visits <onboarding@resend.dev>', to: [visit.visitor_email], subject: 'Reminder: Property Visit Tomorrow', html: buildVisitEmailHtml(visit, '24h') });
        }
        await supabase.from('user_notifications').insert({ user_id: visit.visitor_id, title: 'Visit Tomorrow', message: `Your property visit is scheduled for tomorrow at ${visit.start_time.slice(0, 5)}.`, type: 'visit_reminder', action_url: '/dashboard' });
        await supabase.from('property_visits').update({ reminder_24h_sent: true }).eq('id', visit.id);
        results.sent_24h++; results.in_app++;
      } catch { results.errors++; }
    }

    if (!visit.reminder_1h_sent && hoursUntil > 0 && hoursUntil <= 1.5) {
      try {
        if (resend && visit.visitor_email) {
          await resend.emails.send({ from: 'Property Visits <onboarding@resend.dev>', to: [visit.visitor_email], subject: 'Reminder: Property Visit in 1 Hour', html: buildVisitEmailHtml(visit, '1h') });
        }
        await supabase.from('user_notifications').insert({ user_id: visit.visitor_id, title: 'Visit Starting Soon', message: `Your visit starts in about 1 hour at ${visit.start_time.slice(0, 5)}.`, type: 'visit_reminder', action_url: '/dashboard' });
        await supabase.from('property_visits').update({ reminder_1h_sent: true }).eq('id', visit.id);
        results.sent_1h++; results.in_app++;
      } catch { results.errors++; }
    }
  }

  return { success: true, results };
}

function buildVisitEmailHtml(visit: any, type: '24h' | '1h'): string {
  const timeStr = visit.start_time.slice(0, 5);
  const heading = type === '24h' ? 'Your Visit is Tomorrow' : 'Your Visit is in 1 Hour';
  const subtitle = type === '24h' ? `Scheduled for <strong>${visit.visit_date}</strong> at <strong>${timeStr}</strong>.` : `Starts at <strong>${timeStr}</strong> today.`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 24px;">
<div style="background:#f8f9fa;border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:24px;">
<h1 style="margin:0 0 8px;font-size:22px;color:#111827;">${heading}</h1>
<p style="margin:0;font-size:14px;color:#6b7280;">${subtitle}</p>
</div>
<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
<table style="width:100%;font-size:14px;color:#374151;">
<tr><td style="padding:6px 0;color:#9ca3af;">Date</td><td style="padding:6px 0;text-align:right;font-weight:600;">${visit.visit_date}</td></tr>
<tr><td style="padding:6px 0;color:#9ca3af;">Time</td><td style="padding:6px 0;text-align:right;font-weight:600;">${timeStr} – ${visit.end_time?.slice(0, 5) || ''}</td></tr>
<tr><td style="padding:6px 0;color:#9ca3af;">Status</td><td style="padding:6px 0;text-align:right;font-weight:600;">${visit.status}</td></tr>
</table></div>
<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;">Automated reminder from Astra Villa Realty.</p>
</div></body></html>`;
}

// ─── main handler ───────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { action, ...params } = body;
    log('Invoked', { action });

    let result: Record<string, unknown>;

    switch (action as Action) {
      case 'send_email':
        result = await sendEmail(params, supabase, req);
        break;
      case 'push_notification':
        result = await pushNotification(params, supabase);
        break;
      case 'schedule_email':
        result = await scheduleEmail(params, supabase);
        break;
      case 'lease_alert':
        result = await leaseAlert(params, supabase);
        break;
      case 'visit_reminder':
        result = await visitReminder(params, supabase);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    log('Success', { action });
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log('ERROR', { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
