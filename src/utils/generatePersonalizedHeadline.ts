/**
 * ASTRA Villa AI Personalization Engine
 * Generates personalized homepage headlines and subtitles
 * based on user AI profile data.
 */

interface UserAiProfile {
  buyer_type: 'investor' | 'balanced' | 'lifestyle';
  preferred_city: string;
  avg_budget: number;
}

interface PersonalizedHeadline {
  headline: string;
  subtitle: string;
}

const formatBudgetShort = (n: number): string => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  if (n > 0) return n.toLocaleString('id-ID');
  return '';
};

export function generatePersonalizedHeadline(profile: UserAiProfile): PersonalizedHeadline {
  const { buyer_type, preferred_city, avg_budget } = profile;
  const city = preferred_city || '';
  const budget = avg_budget > 0 ? formatBudgetShort(avg_budget) : '';

  // ── Investor variants ──
  if (buyer_type === 'investor') {
    if (city && budget) {
      return {
        headline: `High-Yield ${city} Properties Curated for You`,
        subtitle: `AI-matched investment opportunities near your IDR ${budget} target with proven ROI potential.`,
      };
    }
    if (city) {
      return {
        headline: `Strategic ${city} Investments Await You`,
        subtitle: `Data-driven property picks in ${city} optimized for maximum returns.`,
      };
    }
    return {
      headline: `Unlock Premium Investment Opportunities`,
      subtitle: `AI-curated high-yield properties tailored to your investor profile.`,
    };
  }

  // ── Lifestyle variants ──
  if (buyer_type === 'lifestyle') {
    if (city && budget) {
      return {
        headline: `Your Dream ${city} Lifestyle Starts Here`,
        subtitle: `Handpicked properties with premium amenities near your IDR ${budget} range.`,
      };
    }
    if (city) {
      return {
        headline: `Discover ${city}'s Finest Living Spaces`,
        subtitle: `Curated lifestyle properties in ${city} matched to your taste.`,
      };
    }
    return {
      headline: `Find the Lifestyle You Deserve`,
      subtitle: `AI-selected properties prioritizing comfort, design, and premium living.`,
    };
  }

  // ── Balanced variants ──
  if (city && budget) {
    return {
      headline: `Smart ${city} Matches at Your Budget`,
      subtitle: `Balanced picks blending investment value and lifestyle quality near IDR ${budget}.`,
    };
  }
  if (city) {
    return {
      headline: `Intelligent ${city} Property Matches for You`,
      subtitle: `AI-powered recommendations balancing returns and living quality in ${city}.`,
    };
  }
  return {
    headline: `Your Perfect Property, AI-Matched`,
    subtitle: `Smart recommendations balancing investment potential and lifestyle quality.`,
  };
}
