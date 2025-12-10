import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, config, key } = await req.json();
    console.log('Algorithm Controller - action:', action);

    switch (action) {
      case 'update_config': {
        // Save all algorithm settings to system_settings table
        const settingsToSave = [
          { key: 'search_algorithm', value: config.searchAlgorithm, description: 'Search algorithm configuration' },
          { key: 'recommendation_engine', value: config.recommendationEngine, description: 'Recommendation engine configuration' },
          { key: 'behavior_analytics', value: config.behaviorAnalytics, description: 'Behavior analytics configuration' },
          { key: 'model_optimization', value: config.modelOptimization, description: '3D model optimization configuration' }
        ];

        for (const setting of settingsToSave) {
          const { error } = await supabase
            .from('system_settings')
            .upsert({
              category: 'algorithms',
              key: setting.key,
              value: setting.value,
              description: setting.description,
              updated_at: new Date().toISOString()
            }, { onConflict: 'category,key' });

          if (error) {
            console.error('Error saving setting:', setting.key, error);
            throw error;
          }
        }

        console.log('Algorithm settings saved successfully');
        return new Response(JSON.stringify({ success: true, message: 'Settings updated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_config': {
        // Get all algorithm settings
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('category', 'algorithms');

        if (error) throw error;

        const config: Record<string, any> = {};
        for (const setting of data || []) {
          config[setting.key] = setting.value;
        }

        return new Response(JSON.stringify({ success: true, config }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_setting': {
        // Get specific setting
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('category', 'algorithms')
          .eq('key', key)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        return new Response(JSON.stringify({ success: true, setting: data?.value || null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_ai_bot_settings': {
        // Get active AI bot settings for the chatbot
        const { data, error } = await supabase
          .from('ai_bot_settings')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        return new Response(JSON.stringify({ success: true, botSettings: data || null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'track_search': {
        // Track search analytics
        const { searchData } = config;
        const { error } = await supabase
          .from('search_analytics')
          .insert({
            visitor_id: searchData.visitor_id || null,
            user_id: searchData.user_id || null,
            search_query: searchData.search_query,
            search_filters: searchData.search_filters,
            results_count: searchData.results_count,
            response_time_ms: searchData.response_time_ms,
            cache_hit: searchData.cache_hit || false,
            session_id: searchData.session_id || null
          });

        if (error) {
          console.error('Error tracking search:', error);
          // Don't throw - search tracking is non-critical
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_bot_usage': {
        // Update AI bot usage statistics
        const { botId, incrementRequests } = config;
        
        // Get current stats
        const { data: bot, error: fetchError } = await supabase
          .from('ai_bot_settings')
          .select('usage_stats')
          .eq('id', botId)
          .single();

        if (fetchError) throw fetchError;

        const currentStats = (bot?.usage_stats as Record<string, any>) || { total_requests: 0 };
        const newStats = {
          ...currentStats,
          total_requests: (currentStats.total_requests || 0) + (incrementRequests || 1),
          last_used_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('ai_bot_settings')
          .update({ usage_stats: newStats, updated_at: new Date().toISOString() })
          .eq('id', botId);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Algorithm Controller error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
