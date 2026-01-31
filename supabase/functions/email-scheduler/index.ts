import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailSchedule {
  id: string;
  name: string;
  templateId: string;
  targetAudience: 'new_users' | 'inactive_users' | 'all_users' | 'verified_users' | 'unverified_users';
  triggerType: 'immediate' | 'scheduled' | 'event_based';
  triggerEvent?: string;
  scheduleDay?: number;
  scheduleTime?: string;
  inactiveDays?: number;
  isActive: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, event, userId } = await req.json();
    console.log(`Email scheduler action: ${action}, event: ${event}, userId: ${userId}`);

    // Fetch email schedules
    const { data: schedulesData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'email')
      .eq('key', 'schedules')
      .single();

    const schedules: EmailSchedule[] = schedulesData?.value as EmailSchedule[] || [];
    const activeSchedules = schedules.filter(s => s.isActive);

    let emailsSent = 0;
    const results: { schedule: string; sent: number; errors: string[] }[] = [];

    // Handle event-based triggers
    if (action === 'event' && event && userId) {
      const eventSchedules = activeSchedules.filter(
        s => s.triggerType === 'event_based' && s.triggerEvent === event
      );

      for (const schedule of eventSchedules) {
        try {
          // Get user info
          const { data: userData } = await supabase.auth.admin.getUserById(userId);
          if (!userData?.user?.email) continue;

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

          // Send email
          const { error } = await supabase.functions.invoke('send-email', {
            body: {
              to: userData.user.email,
              template: schedule.templateId,
              variables: {
                user_name: profile?.full_name || userData.user.email.split('@')[0],
                user_email: userData.user.email
              },
              skipAuth: true
            }
          });

          if (error) {
            console.error(`Error sending ${schedule.name}:`, error);
            results.push({ schedule: schedule.name, sent: 0, errors: [error.message] });
          } else {
            emailsSent++;
            results.push({ schedule: schedule.name, sent: 1, errors: [] });
          }
        } catch (err: any) {
          console.error(`Error processing ${schedule.name}:`, err);
          results.push({ schedule: schedule.name, sent: 0, errors: [err.message] });
        }
      }
    }

    // Handle scheduled (cron) runs
    if (action === 'cron') {
      const scheduledJobs = activeSchedules.filter(s => s.triggerType === 'scheduled');

      for (const schedule of scheduledJobs) {
        const scheduleResults = { schedule: schedule.name, sent: 0, errors: [] as string[] };

        try {
          let users: { id: string; email: string; name: string }[] = [];

          // Get users based on target audience
          switch (schedule.targetAudience) {
            case 'inactive_users': {
              const inactiveDays = schedule.inactiveDays || 7;
              const cutoffDate = new Date();
              cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

              const { data: inactiveUsers } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .lt('last_login', cutoffDate.toISOString())
                .limit(100);

              users = (inactiveUsers || []).map(u => ({
                id: u.id,
                email: u.email || '',
                name: u.full_name || ''
              })).filter(u => u.email);
              break;
            }

            case 'new_users': {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);

              const { data: newUsers } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .gte('created_at', weekAgo.toISOString())
                .limit(100);

              users = (newUsers || []).map(u => ({
                id: u.id,
                email: u.email || '',
                name: u.full_name || ''
              })).filter(u => u.email);
              break;
            }

            case 'unverified_users': {
              const threeDaysAgo = new Date();
              threeDaysAgo.setDate(threeDaysAgo.getDate() - (schedule.inactiveDays || 3));

              const { data: unverifiedUsers } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('email_verified', false)
                .lte('created_at', threeDaysAgo.toISOString())
                .limit(50);

              users = (unverifiedUsers || []).map(u => ({
                id: u.id,
                email: u.email || '',
                name: u.full_name || ''
              })).filter(u => u.email);
              break;
            }

            case 'verified_users': {
              const { data: verifiedUsers } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('email_verified', true)
                .limit(100);

              users = (verifiedUsers || []).map(u => ({
                id: u.id,
                email: u.email || '',
                name: u.full_name || ''
              })).filter(u => u.email);
              break;
            }

            case 'all_users': {
              const { data: allUsers } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .limit(100);

              users = (allUsers || []).map(u => ({
                id: u.id,
                email: u.email || '',
                name: u.full_name || ''
              })).filter(u => u.email);
              break;
            }
          }

          console.log(`Schedule "${schedule.name}": Found ${users.length} users`);

          // Send emails to users
          for (const user of users) {
            try {
              const { error } = await supabase.functions.invoke('send-email', {
                body: {
                  to: user.email,
                  template: schedule.templateId,
                  variables: {
                    user_name: user.name || user.email.split('@')[0],
                    user_email: user.email
                  },
                  skipAuth: true
                }
              });

              if (error) {
                scheduleResults.errors.push(`${user.email}: ${error.message}`);
              } else {
                scheduleResults.sent++;
                emailsSent++;
              }

              // Rate limiting - wait 100ms between emails
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err: any) {
              scheduleResults.errors.push(`${user.email}: ${err.message}`);
            }
          }

          results.push(scheduleResults);
        } catch (err: any) {
          console.error(`Error processing schedule ${schedule.name}:`, err);
          scheduleResults.errors.push(err.message);
          results.push(scheduleResults);
        }
      }

      // Update last run timestamp
      const updatedSchedules = schedules.map(s => {
        if (scheduledJobs.find(j => j.id === s.id)) {
          return { ...s, lastRun: new Date().toISOString() };
        }
        return s;
      });

      await supabase
        .from('system_settings')
        .upsert({
          category: 'email',
          key: 'schedules',
          value: updatedSchedules,
          description: 'Email scheduling configuration',
          is_public: false
        }, { onConflict: 'key' });
    }

    // Handle manual send
    if (action === 'send_now' && event) {
      const schedule = activeSchedules.find(s => s.id === event);
      if (schedule) {
        // Trigger the schedule manually
        console.log(`Manual trigger for schedule: ${schedule.name}`);
        // Implementation similar to cron handling above
      }
    }

    console.log(`Email scheduler completed. Total emails sent: ${emailsSent}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        results,
        message: `Processed ${results.length} schedules, sent ${emailsSent} emails`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in email-scheduler function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
