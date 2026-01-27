import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Email templates for upgrade campaigns
const emailTemplates = {
  // Campaign 1: The One That Got Away
  interested_viewer: {
    subject: {
      en: "Someone just viewed your property 5 times...",
      id: "Seseorang baru saja melihat properti Anda 5 kali..."
    },
    body: {
      en: (data: any) => `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🏠 A Serious Buyer is Interested!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${data.userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Great news! Someone has viewed <strong>${data.propertyName}</strong> 
              <span style="color: #7c3aed; font-weight: bold;">5 times</span> in the last 24 hours.
            </p>
            
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">🔒 Viewer Details (Hidden)</p>
              <div style="filter: blur(4px); user-select: none;">
                <p style="margin: 5px 0; color: #374151;">Name: John D•••••</p>
                <p style="margin: 5px 0; color: #374151;">Email: j••••@gmail.com</p>
                <p style="margin: 5px 0; color: #374151;">Phone: +62 812 •••• ••••</p>
              </div>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Free accounts can't see buyer details. Upgrade now and we'll reveal their 
              contact info + browsing history.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.upgradeUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🔓 Reveal Buyer Details
              </a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              ⏰ Offer expires in 2 hours
            </p>
          </div>
        </div>
      `,
      id: (data: any) => `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🏠 Pembeli Serius Tertarik!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hai ${data.userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Kabar baik! Seseorang telah melihat <strong>${data.propertyName}</strong> 
              <span style="color: #7c3aed; font-weight: bold;">5 kali</span> dalam 24 jam terakhir.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.upgradeUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🔓 Lihat Detail Pembeli
              </a>
            </div>
          </div>
        </div>
      `
    }
  },

  // Campaign 2: Competitor Alert
  competitor_alert: {
    subject: {
      en: "12 similar properties just listed in your area",
      id: "12 properti serupa baru saja didaftarkan di area Anda"
    },
    body: {
      en: (data: any) => `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Competition is Heating Up!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${data.userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Your listing <strong>${data.propertyName}</strong> has dropped from 
              <span style="color: #22c55e;">Page 1</span> to 
              <span style="color: #ef4444;">Page 3</span> in search results.
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                📉 <strong>${data.competitorCount}</strong> similar properties were listed this week in ${data.area}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Pro members get <strong>Featured badges</strong> and <strong>priority placement</strong> 
              that keep them on Page 1.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.upgradeUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Get Featured Now - 50% OFF
              </a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              First month 50% off - Today only
            </p>
          </div>
        </div>
      `,
      id: (data: any) => `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Kompetisi Semakin Ketat!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hai ${data.userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Listing Anda turun dari halaman 1 ke halaman 3.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.upgradeUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Dapatkan Featured - DISKON 50%
              </a>
            </div>
          </div>
        </div>
      `
    }
  },

  // Campaign 3: Almost There
  almost_there: {
    subject: {
      en: "You're 1 step away from your first lead",
      id: "Anda 1 langkah lagi dari lead pertama Anda"
    },
    body: {
      en: (data: any) => `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎯 You're So Close!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${data.userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              You've done the hard work - 
              <span style="color: #10b981; font-weight: bold;">${data.viewCount} views</span> 
              this week on your property!
            </p>
            
            <div style="background: #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 24px;">👥 ${data.missedInquiries}</p>
              <p style="margin: 0; color: #166534; font-size: 14px;">
                interested buyers couldn't reach you
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Don't let your hard work go to waste. Unlock unlimited inquiries for 
              <strong>less than a coffee per day</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.upgradeUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ☕ Unlock for Rp 15.000/day
              </a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Cancel anytime. No commitment.
            </p>
          </div>
        </div>
      `,
      id: (data: any) => `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎯 Anda Hampir Sampai!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hai ${data.userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Kerja keras Anda membuahkan hasil - 
              <span style="color: #10b981; font-weight: bold;">${data.viewCount} kunjungan</span> 
              minggu ini!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.upgradeUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ☕ Buka dengan Rp 15.000/hari
              </a>
            </div>
          </div>
        </div>
      `
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, campaign_type, user_id, data, language = "en" } = await req.json();

    console.log(`Upgrade campaign: ${action}`, { campaign_type, user_id });

    switch (action) {
      case "send_campaign_email": {
        if (!RESEND_API_KEY) {
          console.log("RESEND_API_KEY not configured, skipping email");
          return new Response(
            JSON.stringify({ success: true, message: "Email skipped - API key not configured" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const template = emailTemplates[campaign_type as keyof typeof emailTemplates];
        if (!template) {
          throw new Error(`Unknown campaign type: ${campaign_type}`);
        }

        // Get user email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user_id)
          .single();

        if (!profile?.email) {
          throw new Error("User email not found");
        }

        const lang = language as "en" | "id";
        const emailData = {
          ...data,
          userName: profile.full_name || "User",
          upgradeUrl: `${Deno.env.get("SITE_URL") || "https://astra-villa-realty.lovable.app"}/pricing`
        };

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Astra Realty <noreply@astrarealty.com>",
            to: [profile.email],
            subject: template.subject[lang],
            html: template.body[lang](emailData),
          }),
        });

        if (!emailResponse.ok) {
          const error = await emailResponse.text();
          console.error("Email send error:", error);
          throw new Error("Failed to send email");
        }

        // Log the campaign email
        await supabase.from("notifications").insert({
          user_id,
          title: template.subject[lang],
          message: `Upgrade campaign: ${campaign_type}`,
          type: "marketing",
          reference_id: campaign_type,
        });

        return new Response(
          JSON.stringify({ success: true, message: "Campaign email sent" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "trigger_campaign": {
        // Batch trigger campaigns for users meeting criteria
        const { data: freeUsers } = await supabase
          .from("profiles")
          .select("id, membership_level")
          .in("membership_level", ["basic", null]);

        // This would be called by a scheduled job
        console.log(`Found ${freeUsers?.length || 0} free users for campaign targeting`);

        return new Response(
          JSON.stringify({ success: true, targeted_users: freeUsers?.length || 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("Upgrade campaign error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
