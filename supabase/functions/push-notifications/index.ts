import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  action: 'send' | 'send_to_user' | 'send_bulk' | 'subscribe' | 'unsubscribe';
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
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PUSH-NOTIFICATIONS] ${step}${detailsStr}`);
};

// Web Push notification sender
async function sendWebPush(
  endpoint: string,
  p256dhKey: string,
  authKey: string,
  payload: any
): Promise<boolean> {
  try {
    logStep('Sending web push', { endpoint: endpoint.substring(0, 50) + '...' });
    
    // In production, use web-push library with VAPID keys
    // For now, simulate successful send
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (!success) {
      throw new Error('Simulated push failure');
    }
    
    return true;
  } catch (error) {
    logStep('Push send failed', { error: String(error) });
    return false;
  }
}

// Check if notification should be sent based on preferences
async function shouldSendNotification(
  supabase: any,
  userId: string,
  notificationType: string
): Promise<boolean> {
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!prefs) {
    // Default to sending if no preferences set
    return true;
  }

  // Check if push is enabled
  if (!prefs.push_enabled) {
    return false;
  }

  // Check notification type preference
  const typeMap: Record<string, string> = {
    'new_listing': 'new_listings',
    'price_change': 'price_changes',
    'booking_update': 'booking_updates',
    'message': 'messages',
    'promotion': 'promotions',
    'system': 'system_alerts',
    'inquiry': 'messages',
  };

  const prefKey = typeMap[notificationType];
  if (prefKey && prefs[prefKey] === false) {
    return false;
  }

  // Check quiet hours
  if (prefs.quiet_hours_enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = prefs.quiet_start_time.split(':').map(Number);
    const [endHour, endMin] = prefs.quiet_end_time.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (startTime > endTime) {
      if (currentTime >= startTime || currentTime < endTime) {
        return false;
      }
    } else {
      if (currentTime >= startTime && currentTime < endTime) {
        return false;
      }
    }
  }

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Push notification request received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const request: PushNotificationRequest = await req.json();
    logStep("Processing request", { action: request.action });

    // Get authenticated user for subscribe/unsubscribe
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

        // Upsert subscription
        const { data, error } = await supabaseClient
          .from('push_subscriptions')
          .upsert({
            user_id: currentUserId,
            endpoint,
            p256dh_key: keys.p256dh,
            auth_key: keys.auth,
            device_type: deviceType || 'web',
            device_name: deviceName,
            browser,
            is_active: true,
            last_used_at: new Date().toISOString(),
          }, {
            onConflict: 'endpoint',
          })
          .select()
          .single();

        if (error) throw error;

        logStep("Subscription saved", { id: data.id });
        response = { success: true, subscription_id: data.id };
        break;
      }

      case 'unsubscribe': {
        if (!currentUserId) throw new Error("Authentication required");
        if (!request.subscription?.endpoint) throw new Error("Endpoint required");

        const { error } = await supabaseClient
          .from('push_subscriptions')
          .delete()
          .eq('user_id', currentUserId)
          .eq('endpoint', request.subscription.endpoint);

        if (error) throw error;

        logStep("Subscription removed");
        response = { success: true };
        break;
      }

      case 'send_to_user': {
        if (!request.userId) throw new Error("User ID required");
        if (!request.notification) throw new Error("Notification data required");

        const { title, body, icon, image, actionUrl, type, metadata } = request.notification;

        // Check preferences
        const shouldSend = await shouldSendNotification(supabaseClient, request.userId, type);
        
        if (!shouldSend) {
          logStep("Notification blocked by preferences", { userId: request.userId, type });
          response = { success: true, sent: 0, blocked: 'preferences' };
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
        await supabaseClient
          .from('notification_history')
          .insert({
            user_id: request.userId,
            title,
            body,
            icon,
            image,
            action_url: actionUrl,
            notification_type: type,
            metadata,
            is_sent: true,
            sent_at: new Date().toISOString(),
          });

        // Send to all subscriptions
        const pushPayload = {
          title,
          body,
          icon: icon || '/icon-192.png',
          image,
          data: {
            actionUrl,
            type,
            ...metadata,
          },
        };

        let sentCount = 0;
        for (const sub of subscriptions) {
          const success = await sendWebPush(
            sub.endpoint,
            sub.p256dh_key,
            sub.auth_key,
            pushPayload
          );

          if (success) {
            sentCount++;
            // Update last used
            await supabaseClient
              .from('push_subscriptions')
              .update({ last_used_at: new Date().toISOString() })
              .eq('id', sub.id);
          } else {
            // Mark subscription as inactive if failed
            await supabaseClient
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id);
          }
        }

        logStep("Notifications sent", { userId: request.userId, sent: sentCount });
        response = { success: true, sent: sentCount, total: subscriptions.length };
        break;
      }

      case 'send_bulk': {
        if (!request.userIds || request.userIds.length === 0) {
          throw new Error("User IDs required");
        }
        if (!request.notification) throw new Error("Notification data required");

        let totalSent = 0;
        let totalBlocked = 0;

        for (const userId of request.userIds) {
          const shouldSend = await shouldSendNotification(
            supabaseClient, 
            userId, 
            request.notification.type
          );

          if (!shouldSend) {
            totalBlocked++;
            continue;
          }

          // Get subscriptions
          const { data: subscriptions } = await supabaseClient
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

          if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
              const success = await sendWebPush(
                sub.endpoint,
                sub.p256dh_key,
                sub.auth_key,
                request.notification
              );
              if (success) totalSent++;
            }
          }
        }

        logStep("Bulk notifications sent", { sent: totalSent, blocked: totalBlocked });
        response = { success: true, sent: totalSent, blocked: totalBlocked };
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
