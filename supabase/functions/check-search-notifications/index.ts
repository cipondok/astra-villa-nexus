import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔔 Starting saved search notification check...');

    // Fetch all active searches with email notifications enabled
    const { data: searches, error: searchError } = await supabase
      .from('user_searches')
      .select('*')
      .eq('email_notifications', true)
      .eq('is_active', true);

    if (searchError) throw searchError;

    console.log(`📋 Found ${searches?.length || 0} saved searches with email alerts`);

    let notificationsCreated = 0;
    let emailsSent = 0;

    for (const search of searches || []) {
      try {
        const filters = (search.filters || {}) as Record<string, any>;
        const lastChecked = search.updated_at || search.created_at;

        // Build query for new properties since last check
        let query = supabase
          .from('properties')
          .select('id, title, price, location, city, district, images, created_at, property_type, listing_type, bedrooms')
          .eq('status', 'approved')
          .gte('created_at', lastChecked);

        // Apply saved filters
        if (filters.propertyType && filters.propertyType !== 'all') {
          query = query.eq('property_type', filters.propertyType);
        }
        if (filters.listingType && filters.listingType !== 'all') {
          query = query.eq('listing_type', filters.listingType);
        }
        if (filters.city && filters.city !== 'all') {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters.location && filters.location !== 'all') {
          query = query.ilike('city', `%${filters.location}%`);
        }
        if (filters.minPrice) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters.priceRange && Array.isArray(filters.priceRange)) {
          if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
          if (filters.priceRange[1] < 50000000000) query = query.lte('price', filters.priceRange[1]);
        }
        if (filters.bedrooms && filters.bedrooms !== 'all') {
          query = query.gte('bedrooms', parseInt(filters.bedrooms));
        }
        if (filters.propertyTypes && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0) {
          query = query.in('property_type', filters.propertyTypes);
        }

        const { data: newMatches } = await query.order('created_at', { ascending: false }).limit(20);

        if (newMatches && newMatches.length > 0) {
          // Create in-app notifications
          for (const property of newMatches.slice(0, 10)) {
            await supabase.from('search_notifications').insert({
              user_id: search.user_id,
              search_id: search.id,
              notification_type: 'new_match',
              property_id: property.id,
              title: 'New Property Match!',
              message: `${property.title} in ${property.city || property.location || 'N/A'}`,
              metadata: { price: property.price, listing_type: property.listing_type },
            });
            notificationsCreated++;
          }

          // Send email notification
          const emailSent = await sendEmailNotification(
            supabase,
            supabaseUrl,
            search.user_id,
            search.name,
            newMatches
          );
          if (emailSent) emailsSent++;
        }

        // Update timestamp so we don't re-check the same period
        await supabase
          .from('user_searches')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', search.id);

      } catch (error) {
        console.error(`Error processing search ${search.id}:`, error);
      }
    }

    console.log(`✅ Created ${notificationsCreated} notifications, sent ${emailsSent} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        searched: searches?.length || 0,
        notifications: notificationsCreated,
        emails: emailsSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendEmailNotification(
  supabase: any,
  supabaseUrl: string,
  userId: string,
  searchName: string,
  matches: any[]
): Promise<boolean> {
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      console.error('Could not fetch user email:', userError);
      return false;
    }

    const userEmail = userData.user.email;
    const top5 = matches.slice(0, 5);

    const formatPrice = (price: number) => {
      if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
      if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}Jt`;
      return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const propertyListHtml = top5
      .map(
        (p: any) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
          <h3 style="margin:0 0 4px;font-size:14px;color:#1a1a1a;">${p.title}</h3>
          <p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:#2563eb;">${formatPrice(p.price)}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;">${p.city || p.district || p.location || ''} · ${p.property_type || ''} · ${p.bedrooms || '?'} BR</p>
        </td>
      </tr>`
      )
      .join('');

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#ffffff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">🏠 New Property Matches!</h2>
        <p style="color:#6b7280;margin-bottom:20px;">
          Found <strong>${matches.length}</strong> new ${matches.length === 1 ? 'property' : 'properties'} matching your saved search "<strong>${searchName}</strong>"
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;">
          ${propertyListHtml}
        </table>
        ${matches.length > 5 ? `<p style="color:#6b7280;font-size:13px;margin-top:12px;">...and ${matches.length - 5} more</p>` : ''}
        <a href="https://astra-villa-realty.lovable.app/properties" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">View All Matches</a>
        <p style="margin-top:24px;font-size:11px;color:#9ca3af;">You received this because you enabled email alerts for "${searchName}". Manage your saved searches to unsubscribe.</p>
      </div>
    `;

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        to: userEmail,
        subject: `${matches.length} New Properties Matching "${searchName}"`,
        html,
        skipAuth: true,
      }),
    });

    if (!response.ok) {
      console.error('Email send failed:', await response.text());
      return false;
    }
    console.log(`📧 Email sent to ${userEmail} for search "${searchName}"`);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}
