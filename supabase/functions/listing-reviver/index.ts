
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Listing reviver function triggered by cron job.');

    // 1. Get recent market trends (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: trends, error: trendsError } = await supabase
      .from('market_trends')
      .select('*')
      .gte('created_at', twentyFourHoursAgo);

    if (trendsError) throw trendsError;
    if (!trends || trends.length === 0) {
      console.log('No recent market trends found. Exiting.');
      return new Response(JSON.stringify({ message: 'No recent market trends.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${trends.length} new market trends.`);

    // 2. Find dormant listings (e.g., status is 'pending_approval' and not updated in 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
            id,
            title,
            owner_id,
            property_type,
            location
        `)
        .eq('status', 'pending_approval')
        .lte('updated_at', ninetyDaysAgo);
    
    if (propertiesError) throw propertiesError;
    if (!properties || properties.length === 0) {
        console.log('No dormant properties found. Exiting.');
        return new Response(JSON.stringify({ message: 'No dormant properties found.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`Found ${properties.length} dormant properties to check.`);

    let revivalCount = 0;
    // 3. Match listings to trends and process
    for (const trend of trends) {
        const matchingProperties = properties.filter(p =>
            (!trend.property_type || p.property_type === trend.property_type) &&
            (!trend.location || p.location.toLowerCase().includes(trend.location.toLowerCase()))
        );

        for (const property of matchingProperties) {
            // 4. Check if this property has already been revived for this trend
            const { data: existingLog, error: logError } = await supabase
                .from('property_revival_log')
                .select('id')
                .eq('property_id', property.id)
                .eq('market_trend_id', trend.id)
                .limit(1);

            if (logError) {
                console.error(`Error checking revival log for property ${property.id}:`, logError);
                continue;
            }

            if (existingLog && existingLog.length > 0) {
                console.log(`Property ${property.id} already revived for trend ${trend.id}. Skipping.`);
                continue;
            }

            // 5. Generate AI message
            const prompt = `A dormant property listing is being revived due to a new market trend.
            Property Title: "${property.title}"
            Property Type: ${property.property_type}
            Location: ${property.location}
            Market Trend: "${trend.description}"
            
            Based on this, generate a short, compelling notification message (under 200 characters) for the property owner. The message should be exciting and encourage them to check their listing. For example: "Interest rates dropped – your 2023 villa just got 40% more views!".
            Output only the message text.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openAIApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.8,
                    max_tokens: 60,
                }),
            });

            const aiResponse = await response.json();
            if (!response.ok || !aiResponse.choices?.[0]?.message?.content) {
                console.error('Failed to generate AI message for property:', property.id, aiResponse);
                continue;
            }
            const notificationMessage = aiResponse.choices[0].message.content.trim();
            const notificationTitle = `Your Listing "${property.title}" is Trending!`;
            
            // 6. Create notification for property owner
            const { error: notificationError } = await supabase.from('user_notifications').insert({
                user_id: property.owner_id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'info'
            });

            if (notificationError) {
                console.error(`Failed to create notification for property ${property.id}:`, notificationError);
                continue;
            }

            // 7. Bump the property's updated_at timestamp to make it "fresh"
            const { error: updateError } = await supabase
              .from('properties')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', property.id);

            if (updateError) {
                console.error(`Failed to update property timestamp for ${property.id}:`, updateError);
            }

            // 8. Log the revival
            const { error: revivalLogError } = await supabase.from('property_revival_log').insert({
                property_id: property.id,
                market_trend_id: trend.id,
                revival_details: {
                    message_sent: notificationMessage,
                    revived_at: new Date().toISOString()
                }
            });

            if (revivalLogError) {
                console.error(`Failed to log revival for property ${property.id}:`, revivalLogError);
            } else {
                revivalCount++;
                console.log(`Successfully revived property ${property.id} for trend ${trend.id}.`);
            }
        }
    }

    const message = `Listing revival process complete. Revived ${revivalCount} properties.`;
    console.log(message);
    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in listing-reviver function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
