import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PushNotificationRequest {
  action: 'send' | 'send_to_user' | 'send_bulk' | 'subscribe' | 'unsubscribe' | 'track_interaction' | 'get_stats';
  userId?: string;
  userIds?: string[];
  notification?: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    actionUrl?: string;
    type: string;
    metadata?: Record<string, any>;
    propertyId?: string;
  };
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    deviceType?: string;
    deviceName?: string;
    browser?: string;
  };
  // For tracking
  notificationId?: string;
  interactionType?: string;
  timestamp?: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PUSH-NOTIFICATIONS] ${step}${detailsStr}`);
};

// VAPID keys for Web Push - In production, store in secrets
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BNbxGYNMhEIi9zrneh7mqB9EzTvB0y3JbYlgDHCvxyHDR8Lf7mWN1oP3Wk7WpMvxjsNFYKK7MvJ0Lg6E_xQA5Qc';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY') || '';

// Web Push notification sender using Web Push Protocol
async function sendWebPush(
  endpoint: string,
  p256dhKey: string,
  authKey: string,
  payload: any
): Promise<{ success: boolean; error?: string }> {
  try {
    logStep('Sending web push', { endpoint: endpoint.substring(0, 50) + '...' });
    
    // Check if FCM endpoint
    const isFCM = endpoint.includes('fcm.googleapis.com') || endpoint.includes('firebase');
    
    if (isFCM && FCM_SERVER_KEY) {
      // Use FCM HTTP v1 API
      return await sendFCMPush(endpoint, payload);
    }
    
    // For web-push, we need to implement the Web Push Protocol
    // This is a simplified version - in production use web-push library
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400', // 24 hours
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Push failed', { status: response.status, error: errorText });
      
      // 410 Gone means subscription is expired
      if (response.status === 410) {
        return { success: false, error: 'subscription_expired' };
      }
      
      return { success: false, error: errorText };
    }
    
    logStep('Push sent successfully');
    return { success: true };
  } catch (error) {
    logStep('Push send error', { error: String(error) });
    return { success: false, error: String(error) };
  }
}

// FCM HTTP v1 Push
async function sendFCMPush(endpoint: string, payload: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract registration token from endpoint
    const token = endpoint.split('/').pop();
    
    const fcmPayload = {
      message: {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.image
        },
        webpush: {
          fcm_options: {
            link: payload.data?.actionUrl || '/'
          },
          notification: {
            icon: payload.icon || '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [100, 50, 100]
          }
        },
        data: payload.data || {}
      }
    };

    // In production, use OAuth2 for FCM v1 API
    // For now, use legacy API with server key
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icon-192.png',
          click_action: payload.data?.actionUrl || '/'
        },
        data: payload.data
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    if (result.failure > 0) {
      return { success: false, error: 'FCM delivery failed' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Check if notification should be sent based on preferences and quiet hours
async function shouldSendNotification(
  supabase: any,
  userId: string,
  notificationType: string
): Promise<{ shouldSend: boolean; reason?: string }> {
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!prefs) {
    return { shouldSend: true };
  }

  // Check if push is enabled
  if (!prefs.push_enabled) {
    return { shouldSend: false, reason: 'push_disabled' };
  }

  // Check notification type preference
  const typeMap: Record<string, string> = {
    'new_listing': 'new_listings',
    'new_match': 'new_listings',
    'price_change': 'price_changes',
    'price_drop': 'price_changes',
    'booking_update': 'booking_updates',
    'viewing': 'booking_updates',
    'message': 'messages',
    'inquiry': 'messages',
    'promotion': 'promotions',
    'market': 'promotions',
    'system': 'system_alerts',
  };

  const prefKey = typeMap[notificationType];
  if (prefKey && prefs[prefKey] === false) {
    return { shouldSend: false, reason: 'type_disabled' };
  }

  // Check quiet hours
  if (prefs.quiet_hours_enabled && prefs.quiet_start_time && prefs.quiet_end_time) {
    const now = new Date();
    // Use UTC+7 for Indonesia timezone
    const indonesiaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentMinutes = indonesiaTime.getUTCHours() * 60 + indonesiaTime.getUTCMinutes();
    
    const [startHour, startMin] = prefs.quiet_start_time.split(':').map(Number);
    const [endHour, endMin] = prefs.quiet_end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (startMinutes > endMinutes) {
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return { shouldSend: false, reason: 'quiet_hours' };
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return { shouldSend: false, reason: 'quiet_hours' };
      }
    }
  }

  return { shouldSend: true };
}

// Track notification interaction for analytics
async function trackInteraction(
  supabase: any,
  data: { notificationId?: string; userId?: string; interactionType: string; metadata?: any }
) {
  try {
    // Update notification_history if we have the notification ID
    if (data.notificationId) {
      await supabase
        .from('notification_history')
        .update({
          is_read: data.interactionType === 'clicked',
          read_at: data.interactionType === 'clicked' ? new Date().toISOString() : null
        })
        .eq('id', data.notificationId);
    }

    // Log to activity_logs for analytics
    if (data.userId) {
      await supabase.from('activity_logs').insert({
        user_id: data.userId,
        activity_type: `notification_${data.interactionType}`,
        activity_description: `User ${data.interactionType} notification`,
        metadata: data.metadata
      });
    }

    logStep('Interaction tracked', data);
  } catch (error) {
    logStep('Failed to track interaction', { error: String(error) });
  }
}

// Get notification statistics
async function getNotificationStats(supabase: any, userId?: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let query = supabase
      .from('notification_history')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    const total = notifications?.length || 0;
    const sent = notifications?.filter((n: any) => n.is_sent).length || 0;
    const read = notifications?.filter((n: any) => n.is_read).length || 0;

    // Group by type
    const byType = (notifications || []).reduce((acc: any, n: any) => {
      const type = n.notification_type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      sent,
      read,
      clickRate: sent > 0 ? ((read / sent) * 100).toFixed(1) : '0',
      byType
    };
  } catch (error) {
    logStep('Failed to get stats', { error: String(error) });
    return { total: 0, sent: 0, read: 0, clickRate: '0', byType: {} };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const _authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await _authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    logStep("Push notification request received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const request: PushNotificationRequest = await req.json();
    logStep("Processing request", { action: request.action });

    // Get authenticated user
    let currentUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      currentUserId = userData?.user?.id || null;
    }

    let response: any = {};

    switch (request.action) {
      case 'subscribe': {
        if (!currentUserId) throw new Error("Authentication required");
        if (!request.subscription) throw new Error("Subscription data required");

        const { endpoint, keys, deviceType, deviceName, browser } = request.subscription;

        // Check for existing subscription
        const { data: existing } = await supabaseClient
          .from('push_subscriptions')
          .select('id')
          .eq('endpoint', endpoint)
          .maybeSingle();

        if (existing) {
          // Update existing
          await supabaseClient
            .from('push_subscriptions')
            .update({
              user_id: currentUserId,
              p256dh_key: keys.p256dh,
              auth_key: keys.auth,
              device_type: deviceType || 'web',
              device_name: deviceName,
              browser,
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          response = { success: true, subscription_id: existing.id, updated: true };
        } else {
          // Create new
          const { data, error } = await supabaseClient
            .from('push_subscriptions')
            .insert({
              user_id: currentUserId,
              endpoint,
              p256dh_key: keys.p256dh,
              auth_key: keys.auth,
              device_type: deviceType || 'web',
              device_name: deviceName,
              browser,
              is_active: true,
            })
            .select()
            .single();

          if (error) throw error;

          // Track subscription event
          await trackInteraction(supabaseClient, {
            userId: currentUserId,
            interactionType: 'subscribed',
            metadata: { deviceType, browser }
          });

          response = { success: true, subscription_id: data.id };
        }

        logStep("Subscription saved", response);
        break;
      }

      case 'unsubscribe': {
        if (!currentUserId) throw new Error("Authentication required");
        if (!request.subscription?.endpoint) throw new Error("Endpoint required");

        const { error } = await supabaseClient
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', currentUserId)
          .eq('endpoint', request.subscription.endpoint);

        if (error) throw error;

        await trackInteraction(supabaseClient, {
          userId: currentUserId,
          interactionType: 'unsubscribed'
        });

        logStep("Subscription deactivated");
        response = { success: true };
        break;
      }

      case 'send_to_user': {
        if (!request.userId) throw new Error("User ID required");
        if (!request.notification) throw new Error("Notification data required");

        const { title, body, icon, image, actionUrl, type, metadata, propertyId } = request.notification;

        // Check preferences
        const { shouldSend, reason } = await shouldSendNotification(supabaseClient, request.userId, type);
        
        if (!shouldSend) {
          logStep("Notification blocked", { userId: request.userId, type, reason });
          response = { success: true, sent: 0, blocked: reason };
          break;
        }

        // Get active subscriptions
        const { data: subscriptions } = await supabaseClient
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', request.userId)
          .eq('is_active', true);

        if (!subscriptions || subscriptions.length === 0) {
          logStep("No active subscriptions for user");
          response = { success: true, sent: 0, reason: 'no_subscriptions' };
          break;
        }

        // Save to notification history
        const { data: historyEntry } = await supabaseClient
          .from('notification_history')
          .insert({
            user_id: request.userId,
            title,
            body,
            icon,
            image,
            action_url: actionUrl,
            notification_type: type,
            metadata: { ...metadata, propertyId },
            is_sent: true,
            sent_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        // Prepare push payload
        const pushPayload = {
          title,
          body,
          icon: icon || '/icon-192.png',
          image,
          data: {
            notificationId: historyEntry?.id,
            actionUrl,
            type,
            propertyId,
            ...metadata,
          },
        };

        // Send to all subscriptions
        let sentCount = 0;
        let failedCount = 0;

        for (const sub of subscriptions) {
          const result = await sendWebPush(
            sub.endpoint,
            sub.p256dh_key,
            sub.auth_key,
            pushPayload
          );

          if (result.success) {
            sentCount++;
            await supabaseClient
              .from('push_subscriptions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', sub.id);
          } else {
            failedCount++;
            // Deactivate expired subscriptions
            if (result.error === 'subscription_expired') {
              await supabaseClient
                .from('push_subscriptions')
                .update({ is_active: false })
                .eq('id', sub.id);
            }
          }
        }

        logStep("Notifications sent", { userId: request.userId, sent: sentCount, failed: failedCount });
        response = { success: true, sent: sentCount, failed: failedCount, total: subscriptions.length };
        break;
      }

      case 'send_bulk': {
        if (!request.userIds || request.userIds.length === 0) {
          throw new Error("User IDs required");
        }
        if (!request.notification) throw new Error("Notification data required");

        let totalSent = 0;
        let totalBlocked = 0;
        let totalFailed = 0;

        // Process in batches
        const batchSize = 10;
        for (let i = 0; i < request.userIds.length; i += batchSize) {
          const batch = request.userIds.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (userId) => {
            const { shouldSend, reason } = await shouldSendNotification(
              supabaseClient, 
              userId, 
              request.notification!.type
            );

            if (!shouldSend) {
              totalBlocked++;
              return;
            }

            const { data: subscriptions } = await supabaseClient
              .from('push_subscriptions')
              .select('*')
              .eq('user_id', userId)
              .eq('is_active', true);

            if (!subscriptions || subscriptions.length === 0) {
              return;
            }

            // Save history
            await supabaseClient
              .from('notification_history')
              .insert({
                user_id: userId,
                ...request.notification,
                is_sent: true,
                sent_at: new Date().toISOString(),
              });

            for (const sub of subscriptions) {
              const result = await sendWebPush(
                sub.endpoint,
                sub.p256dh_key,
                sub.auth_key,
                request.notification
              );
              if (result.success) {
                totalSent++;
              } else {
                totalFailed++;
              }
            }
          }));
        }

        logStep("Bulk notifications sent", { sent: totalSent, blocked: totalBlocked, failed: totalFailed });
        response = { success: true, sent: totalSent, blocked: totalBlocked, failed: totalFailed };
        break;
      }

      case 'track_interaction': {
        await trackInteraction(supabaseClient, {
          notificationId: request.notificationId,
          userId: currentUserId || undefined,
          interactionType: request.interactionType || 'unknown',
          metadata: { timestamp: request.timestamp }
        });
        response = { success: true };
        break;
      }

      case 'get_stats': {
        const stats = await getNotificationStats(supabaseClient, request.userId);
        response = { success: true, stats };
        break;
      }

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in push-notifications", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
