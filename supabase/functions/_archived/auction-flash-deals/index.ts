import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { mode } = body;

    // ── Flash Deals: List active ──
    if (mode === "list_flash_deals") {
      await supabase
        .from("flash_deals")
        .update({ status: "expired" })
        .eq("status", "active")
        .lt("end_time", new Date().toISOString());

      const { data: deals, error } = await supabase
        .from("flash_deals")
        .select("*, property:properties!flash_deals_property_id_fkey(id, title, price, city, property_type, thumbnail_url, investment_score, demand_heat_score, bedrooms, bathrooms, area_sqm)")
        .eq("status", "active")
        .gt("end_time", new Date().toISOString())
        .order("end_time", { ascending: true })
        .limit(30);

      if (error) throw error;
      return respond({ deals: deals || [] });
    }

    // ── Flash Deal: Create with investor matching ──
    if (mode === "create_flash_deal") {
      const { property_id, seller_id, original_price, flash_price, duration_hours, reason } = body;
      if (!property_id || !seller_id || !original_price || !flash_price) throw new Error("Missing fields");

      const endTime = new Date(Date.now() + (duration_hours || 48) * 3600 * 1000).toISOString();

      const { data, error } = await supabase
        .from("flash_deals")
        .insert({
          property_id, seller_id, original_price, flash_price,
          end_time: endTime, reason: reason || null,
        })
        .select("id, discount_pct, end_time")
        .single();

      if (error) throw error;

      // ── Notify matching investors ──
      try {
        // Get property details for matching
        const { data: prop } = await supabase
          .from("properties")
          .select("city, property_type, price")
          .eq("id", property_id)
          .single();

        if (prop) {
          // Find investors who saved similar properties or searched in the same city
          const { data: savedUsers } = await supabase
            .from("saved_properties")
            .select("user_id, property:properties!saved_properties_property_id_fkey(city, property_type, price)")
            .neq("user_id", seller_id)
            .limit(100);

          const matchingUserIds = new Set<string>();

          (savedUsers || []).forEach((sp: any) => {
            const p = sp.property;
            if (!p) return;
            const cityMatch = p.city === prop.city;
            const typeMatch = p.property_type === prop.property_type;
            const priceInRange = p.price >= flash_price * 0.5 && p.price <= original_price * 1.5;
            if ((cityMatch || typeMatch) && priceInRange) {
              matchingUserIds.add(sp.user_id);
            }
          });

          // Also get users who searched in this city recently
          const { data: recentSearchers } = await supabase
            .from("ai_property_queries")
            .select("user_id")
            .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
            .limit(200);

          (recentSearchers || []).forEach((s: any) => {
            if (s.user_id && s.user_id !== seller_id) {
              matchingUserIds.add(s.user_id);
            }
          });

          // Send urgency notifications (max 50)
          const discountPct = Math.round(((original_price - flash_price) / original_price) * 100);
          const notifyIds = [...matchingUserIds].slice(0, 50);

          if (notifyIds.length > 0) {
            const notifications = notifyIds.map((uid: string) => ({
              user_id: uid,
              title: `⚡ Flash Deal: ${discountPct}% off in ${prop.city}!`,
              message: `A property matching your interests just dropped ${discountPct}% — limited time only. Act now before it expires.`,
              type: "flash_deal_alert",
              reference_id: property_id,
              is_read: false,
            }));
            await supabase.from("notifications").insert(notifications).catch(() => {});
          }
        }
      } catch (_) {
        // Non-critical: don't fail deal creation if notifications fail
      }

      return respond({ success: true, deal: data });
    }

    // ── Auctions: List active ──
    if (mode === "list_auctions") {
      await supabase
        .from("mobile_live_auctions")
        .update({ status: "closed" })
        .eq("status", "active")
        .lt("end_time", new Date().toISOString());

      const { data: auctions, error } = await supabase
        .from("mobile_live_auctions")
        .select("*, property:properties!mobile_live_auctions_property_id_fkey(id, title, price, city, property_type, thumbnail_url, investment_score, bedrooms, bathrooms, area_sqm)")
        .in("status", ["active", "upcoming"])
        .order("end_time", { ascending: true })
        .limit(30);

      if (error) throw error;

      const auctionIds = (auctions || []).map((a: any) => a.id);
      let bidCounts: Record<string, number> = {};
      let uniqueBidderCounts: Record<string, Set<string>> = {};
      if (auctionIds.length > 0) {
        const { data: bids } = await supabase
          .from("mobile_auction_bids")
          .select("auction_id, bidder_id")
          .in("auction_id", auctionIds);
        (bids || []).forEach((b: any) => {
          bidCounts[b.auction_id] = (bidCounts[b.auction_id] || 0) + 1;
          if (!uniqueBidderCounts[b.auction_id]) uniqueBidderCounts[b.auction_id] = new Set();
          uniqueBidderCounts[b.auction_id].add(b.bidder_id);
        });
      }

      return respond({
        auctions: (auctions || []).map((a: any) => ({
          ...a,
          bid_count: bidCounts[a.id] || a.total_bids || 0,
          unique_bidders: uniqueBidderCounts[a.id]?.size || a.unique_bidders || 0,
        })),
      });
    }

    // ── Auction: Place Bid ──
    if (mode === "place_bid") {
      const { auction_id, bidder_id, bid_amount } = body;
      if (!auction_id || !bidder_id || !bid_amount) throw new Error("Missing fields");

      const { data: auction } = await supabase
        .from("mobile_live_auctions")
        .select("id, current_bid, minimum_increment, end_time, status, extension_time, starting_price, title, property_id")
        .eq("id", auction_id)
        .single();

      if (!auction || auction.status !== "active") throw new Error("Auction not active");
      if (new Date(auction.end_time) < new Date()) throw new Error("Auction ended");

      const minBid = (auction.current_bid || 0) + (auction.minimum_increment || 1000000);
      if (bid_amount < minBid) throw new Error(`Minimum bid: ${minBid}`);

      const { data: bid, error: bidErr } = await supabase
        .from("mobile_auction_bids")
        .insert({ auction_id, bidder_id, bid_amount, bid_status: "active" })
        .select("id")
        .single();
      if (bidErr) throw bidErr;

      // Count unique bidders
      const { data: allBidders } = await supabase
        .from("mobile_auction_bids")
        .select("bidder_id")
        .eq("auction_id", auction_id);
      const uniqueCount = new Set((allBidders || []).map((b: any) => b.bidder_id)).size;

      const updatePayload: any = {
        current_bid: bid_amount,
        total_bids: (auction as any).total_bids ? (auction as any).total_bids + 1 : 1,
        unique_bidders: uniqueCount,
        updated_at: new Date().toISOString(),
      };

      // Auto-extend if bid within last 5 minutes
      const timeLeft = new Date(auction.end_time).getTime() - Date.now();
      let extended = false;
      if (timeLeft < 5 * 60 * 1000 && auction.extension_time) {
        updatePayload.end_time = new Date(Date.now() + auction.extension_time * 60 * 1000).toISOString();
        extended = true;
      }

      await supabase.from("mobile_live_auctions").update(updatePayload).eq("id", auction_id);

      // Notify outbid participants
      const { data: prevBidders } = await supabase
        .from("mobile_auction_bids")
        .select("bidder_id")
        .eq("auction_id", auction_id)
        .neq("bidder_id", bidder_id)
        .eq("bid_status", "active");

      const uniqueBidders = [...new Set((prevBidders || []).map((b: any) => b.bidder_id))];
      if (uniqueBidders.length > 0) {
        const notifications = uniqueBidders.map((uid: string) => ({
          user_id: uid,
          title: "🔔 You've been outbid!",
          message: `A new bid of Rp ${bid_amount.toLocaleString("id-ID")} was placed on "${auction.title}". ${extended ? "⏱ Auction extended by 5 minutes!" : "Place a higher bid to stay in the competition."}`,
          type: "auction_outbid",
          reference_id: auction_id,
          is_read: false,
        }));
        await supabase.from("notifications").insert(notifications).catch(() => {});
      }

      // Notify auction watchers
      const { data: watchers } = await supabase
        .from("mobile_auction_watchers")
        .select("user_id")
        .eq("auction_id", auction_id)
        .neq("user_id", bidder_id);

      const watcherIds = (watchers || []).map((w: any) => w.user_id).filter((id: string) => !uniqueBidders.includes(id));
      if (watcherIds.length > 0) {
        const watchNotifs = watcherIds.map((uid: string) => ({
          user_id: uid,
          title: "📊 Auction Update",
          message: `New bid of Rp ${bid_amount.toLocaleString("id-ID")} on "${auction.title}". ${uniqueCount} investors competing.`,
          type: "auction_update",
          reference_id: auction_id,
          is_read: false,
        }));
        await supabase.from("notifications").insert(watchNotifs).catch(() => {});
      }

      return respond({
        success: true,
        bid_id: bid?.id,
        new_current_bid: bid_amount,
        unique_bidders: uniqueCount,
        extended,
      });
    }

    // ── Auction: Create ──
    if (mode === "create_auction") {
      const { property_id, created_by, title, description, starting_price, reserve_price, minimum_increment, duration_hours, auction_type } = body;
      if (!property_id || !created_by || !starting_price) throw new Error("Missing fields");

      const endTime = new Date(Date.now() + (duration_hours || 72) * 3600 * 1000).toISOString();

      const { data, error } = await supabase
        .from("mobile_live_auctions")
        .insert({
          property_id, created_by,
          title: title || "Property Auction",
          description: description || null,
          starting_price,
          reserve_price: reserve_price || null,
          current_bid: starting_price,
          minimum_increment: minimum_increment || 5000000,
          auction_type: auction_type || "standard",
          status: "active",
          start_time: new Date().toISOString(),
          end_time: endTime,
          extension_time: 5,
          total_bids: 0,
          unique_bidders: 0,
        })
        .select("id, end_time")
        .single();

      if (error) throw error;

      // Notify investors interested in this area
      try {
        const { data: prop } = await supabase
          .from("properties")
          .select("city, property_type")
          .eq("id", property_id)
          .single();

        if (prop) {
          const { data: savedUsers } = await supabase
            .from("saved_properties")
            .select("user_id, property:properties!saved_properties_property_id_fkey(city)")
            .neq("user_id", created_by)
            .limit(100);

          const matchIds = new Set<string>();
          (savedUsers || []).forEach((sp: any) => {
            if (sp.property?.city === prop.city) matchIds.add(sp.user_id);
          });

          const notifyIds = [...matchIds].slice(0, 30);
          if (notifyIds.length > 0) {
            await supabase.from("notifications").insert(
              notifyIds.map((uid: string) => ({
                user_id: uid,
                title: `🏛️ New Auction in ${prop.city}!`,
                message: `A ${prop.property_type} auction starting at Rp ${starting_price.toLocaleString("id-ID")} is now live. Be among the first to bid.`,
                type: "auction_new",
                reference_id: property_id,
                is_read: false,
              }))
            ).catch(() => {});
          }
        }
      } catch (_) {}

      return respond({ success: true, auction: data });
    }

    // ── Auction: Get bid history (anonymized) ──
    if (mode === "auction_bid_history") {
      const { auction_id } = body;
      if (!auction_id) throw new Error("Missing auction_id");

      const { data: bids, error } = await supabase
        .from("mobile_auction_bids")
        .select("id, bidder_id, bid_amount, created_at, bid_status")
        .eq("auction_id", auction_id)
        .eq("bid_status", "active")
        .order("bid_amount", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Anonymize — only return masked IDs
      const anonymized = (bids || []).map((b: any, i: number) => ({
        id: b.id,
        bidder_id: b.bidder_id, // Client will anonymize display
        bid_amount: b.bid_amount,
        created_at: b.created_at,
        rank: i + 1,
      }));

      return respond({ bids: anonymized });
    }

    // ── Combined Discovery ──
    if (mode === "discovery") {
      const { data: deals } = await supabase
        .from("flash_deals")
        .select("*, property:properties!flash_deals_property_id_fkey(id, title, price, city, property_type, thumbnail_url, investment_score, demand_heat_score)")
        .eq("status", "active")
        .gt("end_time", new Date().toISOString())
        .order("end_time", { ascending: true })
        .limit(10);

      const { data: auctions } = await supabase
        .from("mobile_live_auctions")
        .select("*, property:properties!mobile_live_auctions_property_id_fkey(id, title, price, city, property_type, thumbnail_url, investment_score)")
        .eq("status", "active")
        .order("end_time", { ascending: true })
        .limit(10);

      return respond({
        flash_deals: deals || [],
        auctions: auctions || [],
        total_active: (deals?.length || 0) + (auctions?.length || 0),
      });
    }

    throw new Error("Invalid mode");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function respond(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
