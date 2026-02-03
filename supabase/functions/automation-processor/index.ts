import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationTask {
  id: string;
  workflow_id: string;
  task_type: string;
  payload: Record<string, unknown>;
  priority: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, task_type, payload, webhook_url, batch_size = 10 } = await req.json();

    console.log(`[Automation Processor] Action: ${action}, Type: ${task_type}`);

    switch (action) {
      case 'process_queue': {
        // Fetch pending tasks
        const { data: tasks, error: fetchError } = await supabase
          .from('automation_task_queue')
          .select('*')
          .eq('status', 'pending')
          .order('priority', { ascending: true })
          .order('scheduled_at', { ascending: true })
          .limit(batch_size);

        if (fetchError) throw fetchError;

        console.log(`[Automation] Processing ${tasks?.length || 0} tasks`);

        const results = [];
        for (const task of tasks || []) {
          const startTime = Date.now();
          
          try {
            // Mark as processing
            await supabase
              .from('automation_task_queue')
              .update({ status: 'processing', started_at: new Date().toISOString() })
              .eq('id', task.id);

            // Process based on task type
            let result;
            switch (task.task_type) {
              case 'onboarding':
                result = await processOnboarding(supabase, task.payload);
                break;
              case 'listing_review':
                result = await processListingReview(supabase, task.payload);
                break;
              case 'message_response':
                result = await processMessageResponse(supabase, task.payload);
                break;
              case 'report_generation':
                result = await processReportGeneration(supabase, task.payload);
                break;
              case 'partner_action':
                result = await processPartnerAction(supabase, task.payload);
                break;
              default:
                result = { success: true, message: 'Generic task processed' };
            }

            const executionTime = Date.now() - startTime;

            // Mark as completed
            await supabase
              .from('automation_task_queue')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                execution_time_ms: executionTime,
                result
              })
              .eq('id', task.id);

            results.push({ id: task.id, status: 'completed', executionTime });
          } catch (taskError) {
            console.error(`[Automation] Task ${task.id} failed:`, taskError);
            
            await supabase
              .from('automation_task_queue')
              .update({
                status: task.attempts + 1 >= task.max_attempts ? 'failed' : 'pending',
                attempts: task.attempts + 1,
                error_message: taskError.message
              })
              .eq('id', task.id);

            results.push({ id: task.id, status: 'failed', error: taskError.message });
          }
        }

        // Update metrics
        await updateMetrics(supabase, results);

        return new Response(JSON.stringify({ 
          success: true, 
          processed: results.length,
          results 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'trigger_zapier': {
        if (!webhook_url) {
          throw new Error('Webhook URL is required');
        }

        console.log(`[Automation] Triggering Zapier webhook: ${webhook_url}`);

        const response = await fetch(webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'astra-automation',
            ...payload
          })
        });

        // Log the webhook call
        await supabase.from('zapier_webhook_logs').insert({
          webhook_url,
          request_payload: payload,
          response_status: response.status,
          is_success: response.ok
        });

        return new Response(JSON.stringify({ 
          success: response.ok,
          status: response.status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'add_task': {
        const { data, error } = await supabase
          .from('automation_task_queue')
          .insert({
            task_type,
            payload,
            priority: payload.priority || 5
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, task: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('[Automation Processor] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Task processors
async function processOnboarding(supabase: any, payload: any) {
  console.log('[Onboarding] Processing user:', payload.user_id);
  
  // Simulate onboarding steps
  const steps = ['welcome_email', 'preference_setup', 'first_recommendation'];
  
  for (const step of steps) {
    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Award tokens
  if (payload.user_id) {
    await supabase.from('astra_token_transactions').insert({
      user_id: payload.user_id,
      amount: 100,
      transaction_type: 'earned',
      description: 'Welcome bonus for completing onboarding'
    });
  }

  return { success: true, steps_completed: steps.length };
}

async function processListingReview(supabase: any, payload: any) {
  console.log('[Listing Review] Processing property:', payload.property_id);
  
  // Simulate AI review
  const aiScore = Math.random() * 0.5 + 0.5; // 0.5 - 1.0
  const approved = aiScore >= 0.85;

  if (payload.property_id) {
    await supabase
      .from('properties')
      .update({ 
        is_verified: approved,
        verification_notes: approved ? 'Auto-approved by AI' : 'Pending manual review'
      })
      .eq('id', payload.property_id);
  }

  return { success: true, ai_score: aiScore, approved };
}

async function processMessageResponse(supabase: any, payload: any) {
  console.log('[Message] Processing message:', payload.message_id);
  
  // Simulate AI response generation
  const intents = ['inquiry', 'viewing_request', 'price_negotiation', 'general'];
  const detectedIntent = intents[Math.floor(Math.random() * intents.length)];
  
  return { 
    success: true, 
    intent: detectedIntent,
    auto_responded: detectedIntent === 'general'
  };
}

async function processReportGeneration(supabase: any, payload: any) {
  console.log('[Report] Generating report:', payload.report_type);
  
  // Simulate report generation
  const reportData = {
    type: payload.report_type,
    generated_at: new Date().toISOString(),
    data_points: Math.floor(Math.random() * 1000) + 500
  };

  return { success: true, report: reportData };
}

async function processPartnerAction(supabase: any, payload: any) {
  console.log('[Partner] Processing action for partner:', payload.partner_id);
  
  return { 
    success: true, 
    action: payload.action_type,
    processed_at: new Date().toISOString()
  };
}

async function updateMetrics(supabase: any, results: any[]) {
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  
  const successCount = results.filter(r => r.status === 'completed').length;
  const failCount = results.filter(r => r.status === 'failed').length;

  // Upsert metrics
  await supabase.from('automation_metrics').upsert({
    metric_date: today,
    metric_hour: hour,
    users_onboarded: successCount,
    failed_tasks: failCount
  }, {
    onConflict: 'metric_date,metric_hour'
  });
}
