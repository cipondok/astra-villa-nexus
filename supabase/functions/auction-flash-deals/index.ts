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
      // Auto-expire old deals
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

    // ── Flash Deal: Create ──
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
      return respond({ success: true, deal: data });
    }

    // ── Auctions: List active ──
    if (mode === "list_auctions") {
      // Auto-close expired auctions
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

      // Get bid counts per auction
      const auctionIds = (auctions || []).map((a: any) => a.id);
      let bidCounts: Record<string, number> = {};
      if (auctionIds.length > 0) {
        const { data: bids } = await supabase
          .from("mobile_auction_bids")
          .select("auction_id")
          .in("auction_id", auctionIds);
        (bids || []).forEach((b: any) => {
          bidCounts[b.auction_id] = (bidCounts[b.auction_id] || 0) + 1;
        });
      }

      return respond({
        auctions: (auctions || []).map((a: any) => ({
          ...a,
          bid_count: bidCounts[a.id] || a.total_bids || 0,
        })),
      });
    }

    // ── Auction: Place Bid ──
    if (mode === "place_bid") {
      const { auction_id, bidder_id, bid_amount } = body;
      if (!auction_id || !bidder_id || !bid_amount) throw new Error("Missing fields");

      // Verify auction is active
      const { data: auction } = await supabase
        .from("mobile_live_auctions")
        .select("id, current_bid, minimum_increment, end_time, status, extension_time")
        .eq("id", auction_id)
        .single();

      if (!auction || auction.status !== "active") throw new Error("Auction not active");
      if (new Date(auction.end_time) < new Date()) throw new Error("Auction ended");

      const minBid = (auction.current_bid || 0) + (auction.minimum_increment || 1000000);
      if (bid_amount < minBid) throw new Error(`Minimum bid: ${minBid}`);

      // Insert bid
      const { data: bid, error: bidErr } = await supabase
        .from("mobile_auction_bids")
        .insert({ auction_id, bidder_id, bid_amount, bid_status: "active" })
        .select("id")
        .single();
      if (bidErr) throw bidErr;

      // Update auction current_bid
      const updatePayload: any = {
        current_bid: bid_amount,
        total_bids: (auction as any).total_bids ? (auction as any).total_bids + 1 : 1,
        updated_at: new Date().toISOString(),
      };

      // Auto-extend if bid within last 5 minutes
      const timeLeft = new Date(auction.end_time).getTime() - Date.now();
      if (timeLeft < 5 * 60 * 1000 && auction.extension_time) {
        updatePayload.end_time = new Date(Date.now() + auction.extension_time * 60 * 1000).toISOString();
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
          title: "You've been outbid!",
          message: `A new bid of Rp ${bid_amount.toLocaleString("id-ID")} was placed. Place a higher bid to stay in the competition.`,
          type: "auction_outbid",
          reference_id: auction_id,
          is_read: false,
        }));
        await supabase.from("notifications").insert(notifications).catch(() => {});
      }

      return respond({ success: true, bid_id: bid?.id, new_current_bid: bid_amount });
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
      return respond({ success: true, auction: data });
    }

    // ── Combined Discovery ──
    if (mode === "discovery") {
      // Active flash deals
      const { data: deals } = await supabase
        .from("flash_deals")
        .select("*, property:properties!flash_deals_property_id_fkey(id, title, price, city, property_type, thumbnail_url, investment_score, demand_heat_score)")
        .eq("status", "active")
        .gt("end_time", new Date().toISOString())
        .order("end_time", { ascending: true })
        .limit(10);

      // Active auctions
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
