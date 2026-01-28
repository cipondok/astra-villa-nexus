import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Notification Scheduler Edge Function
 * 
 * Processes scheduled notifications:
 * - Price drop alerts for favorited properties
 * - New property matches for saved searches
 * - Viewing appointment reminders
 * - Market insight digests
 * 
 * Should be called via cron job (e.g., every 15 minutes)
 */

interface ScheduledNotification {
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  propertyId?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOTIFICATION-SCHEDULER] ${step}${detailsStr}`);
};

// Format price in Indonesian Rupiah
const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) {
    return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000_000) {
    return `Rp ${(price / 1_000_000).toFixed(0)}jt`;
  }
  return `Rp ${price.toLocaleString('id-ID')}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting notification scheduler");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json().catch(() => ({}));
    const { checkType = 'all' } = body;

    const notifications: ScheduledNotification[] = [];
    const results = {
      priceDrops: 0,
      newMatches: 0,
      viewingReminders: 0,
      errors: 0
    };

    // 1. Check for price drops on favorited properties
    if (checkType === 'all' || checkType === 'price_drops') {
      try {
        logStep("Checking price drops");

        // Get properties with recent price changes
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const { data: priceChanges } = await supabase
          .from('price_history')
          .select(`
            property_id,
            old_price,
            new_price,
            properties (id, title, location, images)
          `)
          .gte('changed_at', oneDayAgo.toISOString())
          .lt('new_price', 'old_price'); // Price decreased

        if (priceChanges && priceChanges.length > 0) {
          for (const change of priceChanges) {
            // Find users who favorited this property
            const { data: favorites } = await supabase
              .from('favorites')
              .select('user_id')
              .eq('property_id', change.property_id);

            if (favorites) {
              const dropPercent = Math.round(((change.old_price - change.new_price) / change.old_price) * 100);
              const property = change.properties as any;

              for (const fav of favorites) {
                notifications.push({
                  userId: fav.user_id,
                  type: 'price_drop',
                  title: `Price Drop Alert! 📉`,
                  body: `${property?.title || 'A property'} dropped ${dropPercent}%! Now ${formatPrice(change.new_price)}`,
                  actionUrl: `/property/${change.property_id}`,
                  propertyId: change.property_id,
                  metadata: {
                    oldPrice: change.old_price,
                    newPrice: change.new_price,
                    dropPercent
                  }
                });
                results.priceDrops++;
              }
            }
          }
        }
      } catch (error) {
        logStep("Error checking price drops", { error: String(error) });
        results.errors++;
      }
    }

    // 2. Check for new property matches
    if (checkType === 'all' || checkType === 'new_matches') {
      try {
        logStep("Checking new matches");

        // Get saved searches with notifications enabled
        const { data: savedSearches } = await supabase
          .from('user_searches')
          .select('*')
          .eq('notify_new_listings', true);

        if (savedSearches && savedSearches.length > 0) {
          // Get properties added in last hour
          const oneHourAgo = new Date();
          oneHourAgo.setHours(oneHourAgo.getHours() - 1);

          for (const search of savedSearches) {
            const filters = search.filters || {};
            
            let query = supabase
              .from('properties')
              .select('id, title, price, location, city')
              .eq('status', 'available')
              .gte('created_at', oneHourAgo.toISOString());

            // Apply saved search filters
            if (filters.propertyType && filters.propertyType !== 'all') {
              query = query.eq('property_type', filters.propertyType);
            }
            if (filters.listingType && filters.listingType !== 'all') {
              query = query.eq('listing_type', filters.listingType);
            }
            if (filters.city) {
              query = query.ilike('city', `%${filters.city}%`);
            }
            if (filters.minPrice) {
              query = query.gte('price', filters.minPrice);
            }
            if (filters.maxPrice) {
              query = query.lte('price', filters.maxPrice);
            }
            if (filters.bedrooms && filters.bedrooms !== 'all') {
              query = query.gte('bedrooms', parseInt(filters.bedrooms));
            }

            const { data: matches } = await query.limit(5);

            if (matches && matches.length > 0) {
              notifications.push({
                userId: search.user_id,
                type: 'new_match',
                title: `${matches.length} New Matches! 🏠`,
                body: `${matches.length} new properties match "${search.name}"`,
                actionUrl: `/properties?search=${search.id}`,
                metadata: {
                  searchId: search.id,
                  searchName: search.name,
                  matchCount: matches.length,
                  topMatch: matches[0]?.title
                }
              });
              results.newMatches++;
            }
          }
        }
      } catch (error) {
        logStep("Error checking new matches", { error: String(error) });
        results.errors++;
      }
    }

    // 3. Check for upcoming viewing appointments
    if (checkType === 'all' || checkType === 'viewing_reminders') {
      try {
        logStep("Checking viewing reminders");

        // Get appointments in next 24 hours
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: appointments } = await supabase
          .from('property_viewings')
          .select(`
            id,
            user_id,
            viewing_date,
            viewing_time,
            properties (id, title, location)
          `)
          .eq('status', 'confirmed')
          .gte('viewing_date', now.toISOString().split('T')[0])
          .lte('viewing_date', tomorrow.toISOString().split('T')[0]);

        if (appointments) {
          for (const appt of appointments) {
            const viewingDateTime = new Date(`${appt.viewing_date}T${appt.viewing_time}`);
            const hoursUntil = (viewingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            // Send reminder 24h and 2h before
            if ((hoursUntil >= 23 && hoursUntil <= 25) || (hoursUntil >= 1.5 && hoursUntil <= 2.5)) {
              const property = appt.properties as any;
              const timeStr = hoursUntil > 20 ? 'tomorrow' : 'in 2 hours';

              notifications.push({
                userId: appt.user_id,
                type: 'viewing',
                title: `Viewing Reminder 📅`,
                body: `Your viewing at ${property?.title || 'the property'} is ${timeStr}`,
                actionUrl: `/bookings/${appt.id}`,
                metadata: {
                  appointmentId: appt.id,
                  viewingDate: appt.viewing_date,
                  viewingTime: appt.viewing_time
                }
              });
              results.viewingReminders++;
            }
          }
        }
      } catch (error) {
        logStep("Error checking viewing reminders", { error: String(error) });
        results.errors++;
      }
    }

    // 4. Send all collected notifications
    logStep("Sending notifications", { total: notifications.length });

    let sentCount = 0;
    const pushUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/push-notifications`;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    for (const notif of notifications) {
      try {
        const response = await fetch(pushUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey
          },
          body: JSON.stringify({
            action: 'send_to_user',
            userId: notif.userId,
            notification: {
              title: notif.title,
              body: notif.body,
              type: notif.type,
              actionUrl: notif.actionUrl,
              metadata: notif.metadata,
              propertyId: notif.propertyId
            }
          })
        });

        const result = await response.json();
        if (result.success && result.sent > 0) {
          sentCount++;
        }
      } catch (error) {
        logStep("Error sending notification", { userId: notif.userId, error: String(error) });
        results.errors++;
      }
    }

    logStep("Scheduler complete", { ...results, totalSent: sentCount });

    return new Response(JSON.stringify({
      success: true,
      processed: notifications.length,
      sent: sentCount,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in notification-scheduler", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
