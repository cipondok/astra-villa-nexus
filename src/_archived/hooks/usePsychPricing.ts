export interface PsychPricingInput {
  price: number;
  demand_level: string;
  price_position: string;
}

export interface PsychPricingResult {
  recommended_psychological_price: string;
  pricing_strategy: string;
  buyer_perception_effect: string;
}

/**
 * Generate psychological pricing recommendations.
 * Pure client-side logic — no API call needed.
 */
export function generatePsychPricing(input: PsychPricingInput): PsychPricingResult {
  const { price, demand_level, price_position } = input;
  const demandUp = demand_level.toUpperCase();
  const posUp = price_position.toUpperCase();

  // Charm price: round down to nearest X99/X49
  const billions = Math.floor(price / 1_000_000_000);
  const remainder = price - billions * 1_000_000_000;
  const hundreds = Math.floor(remainder / 100_000_000);

  let charmPrice: number;
  if (price >= 1_000_000_000) {
    // e.g. 1.550.000.000 → 1.499.000.000
    if (hundreds >= 5) {
      charmPrice = billions * 1_000_000_000 + (hundreds) * 100_000_000 - 1_000_000;
    } else {
      charmPrice = billions * 1_000_000_000 + (hundreds > 0 ? hundreds : 1) * 100_000_000 - 1_000_000;
    }
  } else {
    // Sub-billion: e.g. 850.000.000 → 849.000.000
    const roundedDown = Math.floor(price / 1_000_000) * 1_000_000 - 1_000_000;
    charmPrice = Math.max(roundedDown, price * 0.95);
  }

  const fmtPrice = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  // Strategy selection based on demand + position
  let strategy: string;
  let perception: string;

  if (demandUp.includes("HIGH") || demandUp.includes("VERY")) {
    if (posUp.includes("BELOW") || posUp.includes("UNDER")) {
      strategy = `Gunakan harga premium rounded (${fmtPrice(price)}) tanpa diskon — permintaan tinggi dan harga sudah di bawah pasar. Tambahkan label "Harga Terbatas" untuk urgency.`;
      perception = "Pembeli merasa mendapat deal langka di area high-demand. Harga bulat menciptakan kesan eksklusivitas.";
    } else {
      strategy = `Terapkan charm pricing ${fmtPrice(charmPrice)} — secara psikologis terlihat di bracket harga lebih rendah. Kombinasikan dengan "Penawaran berlaku 7 hari" untuk urgency.`;
      perception = "Angka 9 di akhir menciptakan ilusi harga lebih murah. Deadline waktu memicu fear of missing out (FOMO).";
    }
  } else if (demandUp.includes("MODERATE")) {
    strategy = `Gunakan charm pricing ${fmtPrice(charmPrice)} dan tawarkan insentif (free AJB/BPHTB) untuk perceived value. Tampilkan "Sudah X orang tertarik" sebagai social proof.`;
    perception = "Kombinasi harga charm + insentif meningkatkan perceived value tanpa menurunkan harga asli.";
  } else {
    // LOW demand
    strategy = `Turunkan ke charm price ${fmtPrice(charmPrice)} dan gunakan anchoring — tampilkan harga awal ${fmtPrice(price)} dicoret. Tambahkan "Harga Spesial Bulan Ini".`;
    perception = "Efek anchoring membuat pembeli merasa mendapat potongan signifikan. Label promo menciptakan urgency.";
  }

  return {
    recommended_psychological_price: fmtPrice(charmPrice),
    pricing_strategy: strategy,
    buyer_perception_effect: perception,
  };
}
