export type PortfolioStrength = 'ELITE PORTFOLIO' | 'STRONG PORTFOLIO' | 'GROWING PORTFOLIO' | 'EARLY STAGE PORTFOLIO';

export interface PortfolioOverviewInput {
  property_count: number;
  avg_growth: number;
  avg_yield: number;
}

export interface PortfolioOverviewResult {
  portfolio_strength: PortfolioStrength;
  diversification_tip: string;
  next_investment_focus: string;
  composite_score: number;
}

/**
 * Generates portfolio overview insight from owned properties, growth, and yield.
 * Composite = portfolio_size_score * 0.25 + growth_norm * 0.40 + yield_norm * 0.35
 */
export function analyzePortfolioOverview(input: PortfolioOverviewInput): PortfolioOverviewResult {
  const { property_count, avg_growth, avg_yield } = input;

  // Size score: 1=20, 2=40, 3=55, 5+=80, 10+=100
  const sizeScore = Math.min(100, Math.round(Math.log2(Math.max(1, property_count) + 1) * 30));

  // Growth normalized: 80+ = 100, linear
  const growthNorm = Math.min(100, Math.round((Math.max(0, Math.min(100, avg_growth)) / 80) * 100));

  // Yield normalized: 8%+ = 100, linear
  const yieldNorm = Math.min(100, Math.round((Math.max(0, avg_yield) / 8) * 100));

  const composite = Math.round(sizeScore * 0.25 + growthNorm * 0.40 + yieldNorm * 0.35);

  if (composite >= 75) {
    return {
      portfolio_strength: 'ELITE PORTFOLIO',
      composite_score: composite,
      diversification_tip: property_count < 5
        ? 'Tambah 2-3 aset di kota sekunder (Semarang, Makassar) untuk mengurangi konsentrasi geografis dan menangkap pertumbuhan baru.'
        : 'Portfolio sudah solid. Pertimbangkan diversifikasi ke tipe aset berbeda (komersial, kost, atau tanah kavling) untuk hedging risiko sektoral.',
      next_investment_focus: 'Fokus pada aset dengan yield sewa tinggi di area emerging untuk memperkuat cashflow pasif dan compound growth jangka panjang.',
    };
  }

  if (composite >= 55) {
    return {
      portfolio_strength: 'STRONG PORTFOLIO',
      composite_score: composite,
      diversification_tip: property_count < 3
        ? 'Prioritaskan penambahan 1-2 aset di lokasi berbeda untuk mengurangi risiko konsentrasi. Pilih kota dengan growth score di atas 70.'
        : 'Seimbangkan antara aset capital gain (rumah di area berkembang) dan aset cashflow (kost/apartemen sewa) untuk stabilitas portfolio.',
      next_investment_focus: 'Cari properti di koridor infrastruktur baru (TOD, tol, LRT) dengan harga masih di bawah fair market untuk maksimalkan capital gain.',
    };
  }

  if (composite >= 35) {
    return {
      portfolio_strength: 'GROWING PORTFOLIO',
      composite_score: composite,
      diversification_tip: 'Jangan terburu-buru diversifikasi — fokus pada kualitas aset berikutnya. Pilih lokasi dengan demand tinggi dan likuiditas terbukti agar portfolio lebih resilient.',
      next_investment_focus: 'Prioritaskan aset dengan rental yield di atas 6% untuk membangun fondasi cashflow yang kuat sebelum mengejar capital gain agresif.',
    };
  }

  return {
    portfolio_strength: 'EARLY STAGE PORTFOLIO',
    composite_score: composite,
    diversification_tip: 'Fokus pada akuisisi aset pertama atau kedua yang solid — pilih lokasi proven dengan demand stabil. Diversifikasi bisa ditunda hingga portfolio memiliki minimal 3 aset.',
    next_investment_focus: 'Mulai dari properti residensial di kota utama (Jakarta, Bandung, Surabaya) dengan harga terjangkau dan potensi sewa yang sudah tervalidasi pasar.',
  };
}
