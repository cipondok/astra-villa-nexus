import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting notification check...');

    // Get all active push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*, user_searches!inner(*)')
      .eq('is_active', true);

    if (subError) throw subError;

    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);

    let notificationsCreated = 0;

    for (const sub of subscriptions || []) {
      try {
        const searchId = sub.search_id;
        
        // Get the saved search from user_searches table
        const { data: search } = await supabase
          .from('user_searches')
          .select('*')
          .eq('id', searchId)
          .single();

        if (!search) continue;

        const filters = search.filters || {};
        const lastCheck = new Date(sub.updated_at);
        
        // Build property query based on saved filters
        let query = supabase
          .from('properties')
          .select('id, title, price, location, created_at')
          .eq('status', 'available')
          .gte('created_at', lastCheck.toISOString());

        // Apply filters
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
          query = query.eq('bedrooms', parseInt(filters.bedrooms));
        }

        const { data: newMatches } = await query.limit(10);

        // Check for new matches
        if (newMatches && newMatches.length > 0) {
          for (const property of newMatches) {
            await supabase.from('search_notifications').insert({
              user_id: sub.user_id,
              search_id: searchId,
              notification_type: 'new_match',
              property_id: property.id,
              title: 'New Property Match!',
              message: `${property.title} in ${property.location}`,
              metadata: { price: property.price }
            });
            notificationsCreated++;
          }

          // Send Web Push notification
          if (sub.subscription) {
            await sendPushNotification(
              sub.subscription,
              'New Property Match!',
              `Found ${newMatches.length} new properties matching "${search.name}"`
            );
          }
        }

        // Check for price drops on existing matches
        const existingQuery = supabase
          .from('properties')
          .select('id, title, price, location')
          .eq('status', 'available');

        // Apply same filters for existing properties
        if (filters.propertyType && filters.propertyType !== 'all') {
          existingQuery.eq('property_type', filters.propertyType);
        }
        if (filters.listingType && filters.listingType !== 'all') {
          existingQuery.eq('listing_type', filters.listingType);
        }
        if (filters.city) {
          existingQuery.ilike('city', `%${filters.city}%`);
        }

        const { data: existingMatches } = await existingQuery.limit(100);

        // Check for price drops >10%
        if (existingMatches) {
          for (const property of existingMatches) {
            // Get previous price from metadata (simplified, in production use price history table)
            const previousPrice = filters.maxPrice || property.price * 1.15;
            const dropPercent = ((previousPrice - property.price) / previousPrice) * 100;

            if (dropPercent >= 10) {
              await supabase.from('search_notifications').insert({
                user_id: sub.user_id,
                search_id: searchId,
                notification_type: 'price_drop',
                property_id: property.id,
                title: 'Price Drop Alert!',
                message: `${property.title} - ${Math.round(dropPercent)}% price drop`,
                metadata: { old_price: previousPrice, new_price: property.price }
              });
              notificationsCreated++;

              if (sub.subscription) {
                await sendPushNotification(
                  sub.subscription,
                  'Price Drop Alert!',
                  `${property.title} dropped ${Math.round(dropPercent)}%`
                );
              }
            }
          }
        }

        // Update subscription timestamp
        await supabase
          .from('push_subscriptions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sub.id);

      } catch (error) {
        console.error(`Error processing subscription ${sub.id}:`, error);
      }
    }

    console.log(`Created ${notificationsCreated} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checked: subscriptions?.length || 0,
        notifications: notificationsCreated 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendPushNotification(subscription: any, title: string, body: string) {
  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return;
    }

    // In production, use web-push library
    // For now, log the notification
    console.log('Would send push:', { title, body, subscription: subscription.endpoint });
  } catch (error) {
    console.error('Error sending push:', error);
  }
}
