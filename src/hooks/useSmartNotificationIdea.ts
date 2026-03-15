export interface SmartNotificationInput {
  city: string;
  market_momentum: string;
  new_listings: number;
}

export interface SmartNotificationResult {
  urgency_notification: string;
  curiosity_notification: string;
  investment_notification: string;
}

/**
 * Generates 3 smart push notification variants (urgency, curiosity, investment)
 * based on user's city interest, market momentum, and new listing count.
 * Pure client-side — zero latency, no AI call needed.
 */
export function generateSmartNotifications(input: SmartNotificationInput): SmartNotificationResult {
  const { city, market_momentum, new_listings } = input;
  const momentum = market_momentum.toLowerCase().replace(/\s+/g, '_');

  // Urgency notification
  const urgencyMap: Record<string, string> = {
    accelerating: `🚨 ${new_listings} properti baru di ${city} baru saja tayang! Pasar sedang panas — amankan pilihan Anda sebelum terlambat.`,
    stable: `⏰ ${new_listings} listing baru tersedia di ${city}. Pasar stabil — waktu tepat untuk bandingkan dan putuskan sebelum harga bergerak.`,
    decelerating: `💡 ${new_listings} properti baru di ${city} dengan harga menarik. Momentum melambat — ini jendela negosiasi terbaik Anda.`,
    cooling: `🔔 Pasar ${city} sedang koreksi — ${new_listings} listing baru hadir dengan potensi harga di bawah rata-rata. Jangan lewatkan!`,
  };

  // Curiosity notification
  const curiosityMap: Record<string, string> = {
    accelerating: `🔍 Ada sesuatu yang menarik di ${city}... ${new_listings} properti baru yang belum banyak orang tahu. Lihat sebelum viral!`,
    stable: `✨ Temukan hidden gem di ${city} — ${new_listings} listing baru dengan karakter unik. Mana yang cocok untuk Anda?`,
    decelerating: `🗺️ ${city} punya kejutan! ${new_listings} properti baru di lokasi yang jarang muncul. Penasaran? Cek sekarang.`,
    cooling: `🎯 Properti di ${city} yang biasanya sulit dijangkau kini mulai terbuka. ${new_listings} opsi baru menanti eksplorasi Anda.`,
  };

  // Investment notification
  const investmentMap: Record<string, string> = {
    accelerating: `📈 Momentum investasi ${city} sedang naik! ${new_listings} properti baru dengan potensi capital gain tinggi baru tersedia.`,
    stable: `💰 Peluang yield stabil di ${city} — ${new_listings} listing baru cocok untuk passive income jangka panjang.`,
    decelerating: `🏷️ Harga mulai koreksi di ${city}. ${new_listings} properti baru bisa jadi entry point investasi cerdas Anda.`,
    cooling: `🎪 Value buying window terbuka di ${city}! ${new_listings} aset baru di bawah harga pasar — ideal untuk investor jangka panjang.`,
  };

  const fallbackMomentum = 'stable';
  const key = Object.keys(urgencyMap).includes(momentum) ? momentum : fallbackMomentum;

  return {
    urgency_notification: urgencyMap[key],
    curiosity_notification: curiosityMap[key],
    investment_notification: investmentMap[key],
  };
}
