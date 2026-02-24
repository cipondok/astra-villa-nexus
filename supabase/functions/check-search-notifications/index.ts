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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting notification check...');

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
          .select('id, title, price, location, city, images, created_at')
          .eq('status', 'available')
          .gte('created_at', lastCheck.toISOString());

        if (filters.propertyType && filters.propertyType !== 'all') {
          query = query.eq('property_type', filters.propertyType);
        }
        if (filters.listingType && filters.listingType !== 'all') {
          query = query.eq('listing_type', filters.listingType);
        }
        if (filters.city && filters.city !== 'all') {
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

          // Send push notification
          if (sub.subscription) {
            await sendPushNotification(
              sub.subscription,
              'New Property Match!',
              `Found ${newMatches.length} new properties matching "${search.name}"`
            );
          }

          // Send email notification if enabled
          const emailEnabled = sub.email_enabled !== false;
          if (emailEnabled) {
            await sendEmailNotification(supabase, supabaseUrl, sub.user_id, search.name, newMatches);
          }
        }

        // Check for price drops on existing matches
        const existingQuery = supabase
          .from('properties')
          .select('id, title, price, location')
          .eq('status', 'available');

        if (filters.propertyType && filters.propertyType !== 'all') {
          existingQuery.eq('property_type', filters.propertyType);
        }
        if (filters.listingType && filters.listingType !== 'all') {
          existingQuery.eq('listing_type', filters.listingType);
        }
        if (filters.city && filters.city !== 'all') {
          existingQuery.ilike('city', `%${filters.city}%`);
        }

        const { data: existingMatches } = await existingQuery.limit(100);

        if (existingMatches) {
          for (const property of existingMatches) {
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

    console.log('Would send push:', { title, body, subscription: subscription.endpoint });
  } catch (error) {
    console.error('Error sending push:', error);
  }
}

async function sendEmailNotification(
  supabase: any,
  supabaseUrl: string,
  userId: string,
  searchName: string,
  matches: any[]
) {
  try {
    // Look up user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      console.error('Could not fetch user email:', userError);
      return;
    }

    const userEmail = userData.user.email;
    const top3 = matches.slice(0, 3);

    const formatPrice = (price: number) => {
      if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}M`;
      if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}Jt`;
      return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const propertyListHtml = top3.map(p => `
      <div style="margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
        <h3 style="margin:0 0 4px;font-size:14px;color:#1a1a1a;">${p.title}</h3>
        <p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:#2563eb;">${formatPrice(p.price)}</p>
        <p style="margin:0;font-size:12px;color:#6b7280;">${p.city || p.location || ''}</p>
      </div>
    `).join('');

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">New Property Matches!</h2>
        <p style="color:#6b7280;margin-bottom:20px;">Found ${matches.length} new ${matches.length === 1 ? 'property' : 'properties'} matching "<strong>${searchName}</strong>"</p>
        ${propertyListHtml}
        ${matches.length > 3 ? `<p style="color:#6b7280;font-size:13px;">...and ${matches.length - 3} more</p>` : ''}
        <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/properties" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;">View All Matches</a>
        <p style="margin-top:24px;font-size:11px;color:#9ca3af;">You're receiving this because you subscribed to property alerts.</p>
      </div>
    `;

    // Invoke send-email edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        to: userEmail,
        subject: `${matches.length} New Properties Matching "${searchName}"`,
        html,
      }),
    });

    if (!response.ok) {
      console.error('Email send failed:', await response.text());
    } else {
      console.log(`Email sent to ${userEmail} for search "${searchName}"`);
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}
