import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "score"; // "score" | "message"

    // ── MODE: Generate negotiation message ────────────────────────────────
    if (mode === "message") {
      const { stage, buyer_type, price_gap, urgency, language } = body;
      const msg = generateNegotiationMessage(
        stage || "active",
        buyer_type || "investor",
        price_gap || 10,
        urgency || "medium",
        language || "id"
      );
      return json({ ...msg });
    }

    // ── MODE: Score all active negotiations ────────────────────────────────
    // Fetch deal transactions in negotiation stages
    const { data: deals } = await supabase
      .from("deal_transactions" as any)
      .select("id, property_id, buyer_id, seller_id, status, offer_price, counter_price, created_at, updated_at")
      .in("status", ["inquiry", "negotiation", "offer_pending", "counter_offer"])
      .limit(200);

    if (!deals?.length) {
      return json({ processed: 0, message: "No active negotiations" });
    }

    const propertyIds = [...new Set(deals.map((d: any) => d.property_id).filter(Boolean))];
    const buyerIds = [...new Set(deals.map((d: any) => d.buyer_id).filter(Boolean))];

    // Parallel signal fetching
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [intentRes, behaviorRes, probabilityRes] = await Promise.all([
      supabase
        .from("investor_intent_scores" as any)
        .select("user_id, intent_score")
        .in("user_id", buyerIds),
      supabase
        .from("ai_behavior_tracking")
        .select("property_id, event_type, user_id")
        .in("property_id", propertyIds)
        .gte("created_at", thirtyDaysAgo),
      supabase
        .from("deal_probability_scores" as any)
        .select("property_id, overall_close_probability, liquidity_zone_score")
        .in("property_id", propertyIds),
    ]);

    // Build lookup maps
    const intentMap: Record<string, number> = {};
    for (const i of intentRes.data || []) {
      intentMap[i.user_id] = Math.max(intentMap[i.user_id] || 0, Number(i.intent_score) || 0);
    }

    const interactionMap: Record<string, number> = {};
    for (const b of behaviorRes.data || []) {
      const key = `${b.user_id}_${b.property_id}`;
      interactionMap[key] = (interactionMap[key] || 0) + 1;
    }

    const probMap: Record<string, { prob: number; liq: number }> = {};
    for (const p of probabilityRes.data || []) {
      probMap[p.property_id] = {
        prob: Number(p.overall_close_probability) || 50,
        liq: Number(p.liquidity_zone_score) || 50,
      };
    }

    // ── Scoring weights ───────────────────────────────────────────────────
    const W = { intent: 0.25, frequency: 0.20, priceAlign: 0.20, liquidity: 0.15, concession: 0.20 };

    const results: any[] = [];

    for (const deal of deals) {
      const offerPrice = Number(deal.offer_price) || 0;
      const counterPrice = Number(deal.counter_price) || offerPrice;
      const priceGap = counterPrice > 0
        ? Math.abs(counterPrice - offerPrice) / counterPrice * 100
        : 0;

      // Buyer intent
      const buyerIntent = Math.min(intentMap[deal.buyer_id] || 30, 100);

      // Interaction frequency (normalized)
      const interKey = `${deal.buyer_id}_${deal.property_id}`;
      const interactions = interactionMap[interKey] || 0;
      const frequencyScore = Math.min(interactions * 5, 100);

      // Price alignment progress (smaller gap = higher score)
      const priceAlignment = Math.max(0, 100 - priceGap * 5);

      // Liquidity zone
      const liqScore = probMap[deal.property_id]?.liq || 50;

      // Concession signal: if counter < initial listing, seller is flexible
      const concessionSignal = counterPrice > 0 && offerPrice > 0
        ? Math.min(Math.abs(counterPrice - offerPrice) / counterPrice * 100 * 3, 100)
        : 30;

      // Momentum score
      const momentum = Math.round(
        W.intent * buyerIntent +
        W.frequency * frequencyScore +
        W.priceAlign * priceAlignment +
        W.liquidity * liqScore +
        W.concession * concessionSignal
      );

      // Drop risk: inverse of momentum with inactivity factor
      const daysSinceUpdate = (Date.now() - new Date(deal.updated_at || deal.created_at).getTime()) / 86400000;
      const inactivityPenalty = Math.min(daysSinceUpdate * 5, 40);
      const dropRisk = Math.round(Math.min(Math.max(100 - momentum + inactivityPenalty, 0), 100));

      // Stage mapping
      const stage = mapStage(deal.status);

      // Next action recommendation
      const action = recommendAction(momentum, dropRisk, priceGap, stage, daysSinceUpdate);

      // Confidence
      const dataPoints = (buyerIntent > 0 ? 1 : 0) + (interactions > 0 ? 1 : 0) +
        (offerPrice > 0 ? 1 : 0) + (counterPrice > 0 ? 1 : 0);
      const confidence = Math.min(dataPoints * 25, 100);

      results.push({
        deal_id: deal.id,
        property_id: deal.property_id,
        buyer_id: deal.buyer_id,
        seller_id: deal.seller_id,
        negotiation_stage: stage,
        buyer_offer_price: offerPrice,
        seller_counter_price: counterPrice,
        price_gap_percentage: Math.round(priceGap * 10) / 10,
        interaction_frequency_score: frequencyScore,
        buyer_intent_strength: buyerIntent,
        seller_flexibility_score: concessionSignal,
        negotiation_momentum_score: momentum,
        risk_of_drop_probability: dropRisk,
        recommended_next_action: action,
        ai_confidence_level: confidence,
        last_updated_at: new Date().toISOString(),
      });
    }

    // Batch upsert
    let upserted = 0;
    for (let i = 0; i < results.length; i += 50) {
      const chunk = results.slice(i, i + 50);
      const { error } = await supabase
        .from("negotiation_deal_intelligence")
        .upsert(chunk, { onConflict: "deal_id" });
      if (!error) upserted += chunk.length;
    }

    // Summary
    const hotDeals = results.filter((r) => r.negotiation_momentum_score >= 80);
    const atRisk = results.filter((r) => r.risk_of_drop_probability >= 60);
    const avgMomentum = results.length
      ? Math.round(results.reduce((a, b) => a + b.negotiation_momentum_score, 0) / results.length)
      : 0;

    return json({
      processed: upserted,
      avg_momentum: avgMomentum,
      hot_negotiations: hotDeals.length,
      at_risk_deals: atRisk.length,
      top_deal: hotDeals[0] ? {
        deal_id: hotDeals[0].deal_id,
        momentum: hotDeals[0].negotiation_momentum_score,
        action: hotDeals[0].recommended_next_action,
      } : null,
      highest_risk: atRisk[0] ? {
        deal_id: atRisk[0].deal_id,
        risk: atRisk[0].risk_of_drop_probability,
        action: atRisk[0].recommended_next_action,
      } : null,
      summary: `Negotiation Health: ${avgMomentum}% avg momentum. ${hotDeals.length} hot deals, ${atRisk.length} at risk.`,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function json(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json",
    },
  });
}

function mapStage(status: string): string {
  const map: Record<string, string> = {
    inquiry: "initial",
    negotiation: "active",
    offer_pending: "offer",
    counter_offer: "counter",
    escrow: "escrow_ready",
  };
  return map[status] || "initial";
}

function recommendAction(
  momentum: number,
  risk: number,
  priceGap: number,
  stage: string,
  daysSinceUpdate: number
): string {
  if (daysSinceUpdate > 7 && risk > 60) {
    return "🚨 Send re-engagement message — deal inactive for " + Math.round(daysSinceUpdate) + " days. Use soft urgency + competing buyer framing.";
  }
  if (momentum >= 80 && stage === "counter") {
    return "🎯 Move to escrow framing — momentum is strong. Present escrow security benefits and timeline clarity.";
  }
  if (momentum >= 80) {
    return "🔥 Maintain pace — schedule next interaction within 24h. Reinforce commitment with comparable recent closings.";
  }
  if (priceGap > 15 && risk > 50) {
    return "💰 Suggest 2-3% concession window to close the price gap. Frame as limited-time flexibility.";
  }
  if (priceGap > 10) {
    return "📊 Share market data showing comparable pricing to align expectations. Reduce gap with evidence.";
  }
  if (risk > 60) {
    return "⚠️ Increase contact frequency — buyer engagement declining. Send viewing reminder or new market insight.";
  }
  if (stage === "initial") {
    return "📞 Convert inquiry to active negotiation — present 3 key value points and request budget confirmation.";
  }
  if (stage === "offer") {
    return "🤝 Acknowledge offer positively. Counter with structured terms (payment timeline, escrow deposit) rather than just price.";
  }
  return "✅ Negotiation progressing normally. Monitor for momentum changes and maintain regular touchpoints.";
}

function generateNegotiationMessage(
  stage: string,
  buyerType: string,
  priceGap: number,
  urgency: string,
  language: string
): { whatsapp: string; call_points: string[]; psychology: string } {
  const isId = language === "id";

  if (stage === "initial") {
    return {
      whatsapp: isId
        ? `Halo! Terima kasih atas minat Anda pada properti ini. Saya memiliki beberapa insight eksklusif tentang potensi investasi di area ini. Apakah Anda bersedia membahas lebih detail? 🏡`
        : `Hi! Thank you for your interest in this property. I have some exclusive investment insights for this area. Would you like to discuss in more detail? 🏡`,
      call_points: [
        "Confirm investment timeline and budget range",
        "Highlight 2-3 unique property strengths",
        "Mention recent comparable transaction to anchor value",
      ],
      psychology: "Reciprocity trigger — offering exclusive insight creates obligation to engage.",
    };
  }

  if (priceGap > 15) {
    return {
      whatsapp: isId
        ? `Saya memahami posisi Anda. Berdasarkan data pasar terkini, properti serupa di area ini menutup transaksi di range yang sangat dekat dengan harga yang kami tawarkan. Saya bisa share datanya — apakah Anda tertarik melihat? Ini bisa membantu kita menemukan titik temu yang menguntungkan kedua belah pihak. 📊`
        : `I understand your position. Based on recent market data, similar properties in this area have closed near our offering price. I can share the data — would you like to see it? This could help us find a mutually beneficial agreement. 📊`,
      call_points: [
        "Present 3 comparable recent sales as evidence",
        "Frame current price as opportunity window",
        "Suggest splitting the difference as goodwill gesture",
      ],
      psychology: "Anchoring + social proof — comparable data shifts price perception.",
    };
  }

  if (urgency === "high" || stage === "counter") {
    return {
      whatsapp: isId
        ? `Update penting: kami telah menerima minat serius dari pihak lain untuk properti ini. Saya ingin memberi Anda kesempatan pertama karena Anda sudah dalam proses negosiasi. Bisakah kita finalisasi terms dalam 48 jam ke depan? ⏰`
        : `Important update: we've received serious interest from another party for this property. I'd like to give you first priority since you're already in negotiation. Can we finalize terms within 48 hours? ⏰`,
      call_points: [
        "Mention competing interest (genuine or implied)",
        "Emphasize their priority status as existing negotiator",
        "Propose specific deadline for decision",
      ],
      psychology: "Scarcity + loss aversion — competing interest triggers fear of missing out.",
    };
  }

  if (stage === "escrow_ready") {
    return {
      whatsapp: isId
        ? `Selamat! Kita sudah sangat dekat dengan kesepakatan. Untuk mengamankan properti ini, langkah selanjutnya adalah deposit escrow yang sepenuhnya dilindungi oleh sistem kami. Dana Anda aman sampai semua syarat terpenuhi. Siap untuk langkah final? 🔐`
        : `Congratulations! We're very close to an agreement. To secure this property, the next step is an escrow deposit fully protected by our system. Your funds are safe until all conditions are met. Ready for the final step? 🔐`,
      call_points: [
        "Explain escrow protection mechanism clearly",
        "Mention refund policy for buyer confidence",
        "Set specific timeline for deposit and closing",
      ],
      psychology: "Commitment + consistency — small deposit commitment leads to deal completion.",
    };
  }

  // Default active stage
  return {
    whatsapp: isId
      ? `Terima kasih atas diskusi kita sebelumnya. Saya telah meninjau kembali beberapa opsi dan ada fleksibilitas yang bisa kita explore bersama. Apakah Anda tersedia untuk bicara singkat hari ini? 💬`
      : `Thank you for our previous discussion. I've reviewed some options and there's flexibility we can explore together. Are you available for a quick chat today? 💬`,
    call_points: [
      "Reference previous conversation to build continuity",
      "Hint at flexibility without revealing specifics",
      "Propose specific meeting time rather than open-ended",
    ],
    psychology: "Consistency principle — referencing prior commitment reinforces engagement.",
  };
}
