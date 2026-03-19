import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── TIERED COMMISSION SCHEDULE ──
const COMMISSION_TIERS = [
  { tier: "Bronze",   minReferrals: 0,   rate: 0.05, bonus: 0 },
  { tier: "Silver",   minReferrals: 5,   rate: 0.06, bonus: 250_000 },
  { tier: "Gold",     minReferrals: 15,  rate: 0.075, bonus: 750_000 },
  { tier: "Platinum", minReferrals: 30,  rate: 0.09, bonus: 2_000_000 },
  { tier: "Diamond",  minReferrals: 50,  rate: 0.12, bonus: 5_000_000 },
];

function getCommissionTier(totalConverted: number) {
  let current = COMMISSION_TIERS[0];
  for (const t of COMMISSION_TIERS) {
    if (totalConverted >= t.minReferrals) current = t;
  }
  const nextIdx = COMMISSION_TIERS.indexOf(current) + 1;
  const next = nextIdx < COMMISSION_TIERS.length ? COMMISSION_TIERS[nextIdx] : null;
  return { current, next, all: COMMISSION_TIERS };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Invalid token" }, 401);

    const body = await req.json();
    const { action } = body;

    // ── GET DASHBOARD DATA ──
    if (action === "get_dashboard") {
      let { data: affiliate } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: referrals = [] } = await supabase
        .from("acquisition_referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      let commissions: any[] = [];
      if (affiliate) {
        const { data } = await supabase
          .from("affiliate_commissions")
          .select("*")
          .eq("affiliate_id", affiliate.id)
          .order("created_at", { ascending: false });
        commissions = data || [];
      }

      const convertedCount = referrals.filter((r: any) => r.status === "converted" || r.status === "rewarded").length;

      // Milestone system
      const milestones = [
        { level: 1, name: "Starter", threshold: 3, reward: 150000, desc: "Refer 3 users" },
        { level: 2, name: "Connector", threshold: 10, reward: 500000, desc: "Refer 10 users" },
        { level: 3, name: "Influencer", threshold: 25, reward: 1500000, desc: "Refer 25 users" },
        { level: 4, name: "Ambassador", threshold: 50, reward: 5000000, desc: "Refer 50 users" },
        { level: 5, name: "Legend", threshold: 100, reward: 15000000, desc: "Refer 100 users" },
      ];

      const currentMilestone = milestones.reduce((best, m) => convertedCount >= m.threshold ? m : best, milestones[0]);
      const nextMilestone = milestones.find((m) => convertedCount < m.threshold) || milestones[milestones.length - 1];

      // Commission tier
      const tierInfo = getCommissionTier(convertedCount);

      // Leaderboard
      const { data: leaderboard = [] } = await supabase
        .from("affiliates")
        .select("id, user_id, referral_code, total_referrals, total_earnings")
        .order("total_referrals", { ascending: false })
        .limit(10);

      const userIds = leaderboard.map((a: any) => a.user_id);
      const { data: profiles = [] } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
      const enrichedLeaderboard = leaderboard.map((a: any, idx: number) => {
        const profile = profileMap.get(a.user_id);
        return {
          rank: idx + 1,
          user_id: a.user_id,
          name: profile?.full_name || `User ${a.referral_code}`,
          avatar_url: profile?.avatar_url,
          total_referrals: a.total_referrals || 0,
          total_earnings: a.total_earnings || 0,
          is_current_user: a.user_id === user.id,
        };
      });

      const pendingCount = referrals.filter((r: any) => r.status === "pending" || r.status === "signed_up").length;
      const totalEarnings = affiliate?.total_earnings || 0;
      const pendingEarnings = affiliate?.pending_earnings || 0;
      const paidEarnings = affiliate?.paid_earnings || 0;

      const recentActivity = referrals.slice(0, 15).map((r: any) => ({
        id: r.id,
        status: r.status,
        source_channel: r.source_channel,
        referee_email: r.referee_email ? r.referee_email.replace(/(.{2}).*(@.*)/, "$1***$2") : null,
        reward_amount: r.referrer_reward_amount,
        created_at: r.created_at,
        converted_at: r.converted_at,
      }));

      return json({
        affiliate,
        stats: {
          total_referrals: referrals.length,
          pending: pendingCount,
          converted: convertedCount,
          total_earnings: totalEarnings,
          pending_earnings: pendingEarnings,
          paid_earnings: paidEarnings,
        },
        commission_tier: tierInfo.current,
        next_tier: tierInfo.next,
        all_tiers: tierInfo.all,
        milestones,
        current_milestone: currentMilestone,
        next_milestone: nextMilestone,
        milestone_progress: nextMilestone
          ? Math.min(100, Math.round((convertedCount / nextMilestone.threshold) * 100))
          : 100,
        leaderboard: enrichedLeaderboard,
        recent_activity: recentActivity,
        commissions: commissions.slice(0, 20),
      });
    }

    // ── PROCESS COMMISSION (for deal completion) ──
    if (action === "process_commission") {
      const { referral_id, order_id, order_amount } = body;
      if (!referral_id || !order_amount) return json({ error: "referral_id and order_amount required" }, 400);

      // Find the referral
      const { data: referral } = await supabase
        .from("acquisition_referrals")
        .select("referrer_id, status")
        .eq("id", referral_id)
        .single();

      if (!referral) return json({ error: "Referral not found" }, 404);

      // Find affiliate
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id, total_referrals")
        .eq("user_id", referral.referrer_id)
        .single();

      if (!affiliate) return json({ error: "No affiliate record for referrer" }, 404);

      // Calculate tiered commission
      const tierInfo = getCommissionTier(affiliate.total_referrals || 0);
      const commissionAmount = Math.round(order_amount * tierInfo.current.rate);

      // Insert commission record
      const { data: commission, error: commErr } = await supabase
        .from("affiliate_commissions")
        .insert({
          affiliate_id: affiliate.id,
          referral_id,
          order_id: order_id || null,
          order_amount,
          commission_rate: tierInfo.current.rate * 100,
          commission_amount: commissionAmount,
          status: "pending",
        })
        .select()
        .single();

      if (commErr) return json({ error: "Failed to create commission" }, 500);

      // Update affiliate earnings
      await supabase.rpc("increment_affiliate_earnings", {
        p_affiliate_id: affiliate.id,
        p_amount: commissionAmount,
      }).then(() => {}).catch(() => {
        // Fallback: direct update if RPC doesn't exist
        supabase
          .from("affiliates")
          .update({
            pending_earnings: (affiliate as any).pending_earnings + commissionAmount,
          })
          .eq("id", affiliate.id);
      });

      // Mark referral as rewarded
      await supabase
        .from("acquisition_referrals")
        .update({
          status: "rewarded",
          rewarded_at: new Date().toISOString(),
          referrer_reward_amount: commissionAmount,
        })
        .eq("id", referral_id);

      return json({
        commission,
        tier: tierInfo.current.tier,
        rate: tierInfo.current.rate,
        message: `Commission of IDR ${commissionAmount.toLocaleString()} created at ${tierInfo.current.tier} tier (${(tierInfo.current.rate * 100)}%)`,
      });
    }

    // ── JOIN AFFILIATE PROGRAM ──
    if (action === "join_program") {
      const { data: existing } = await supabase
        .from("affiliates")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) return json({ error: "Already enrolled", affiliate_id: existing.id }, 400);

      const code = `REF-${(user.email?.split("@")[0] || user.id.slice(0, 6)).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data: affiliate, error } = await supabase
        .from("affiliates")
        .insert({
          user_id: user.id,
          referral_code: code,
          commission_rate: 5,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        console.error("Join error:", error);
        return json({ error: "Failed to join program" }, 500);
      }

      return json({ affiliate, message: "Welcome to the referral program!" });
    }

    // ── APPLY FOR AFFILIATE PARTNER ──
    if (action === "apply_affiliate_partner") {
      const { data: existing } = await supabase
        .from("affiliates")
        .select("id, status, commission_rate")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) return json({ error: "Join the referral program first" }, 400);

      const { error } = await supabase
        .from("affiliates")
        .update({ commission_rate: 10, status: "active" })
        .eq("id", existing.id);

      if (error) return json({ error: "Failed to upgrade" }, 500);

      return json({ message: "Upgraded to Affiliate Partner! Your commission rate is now 10%." });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("[referral-engine] error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
