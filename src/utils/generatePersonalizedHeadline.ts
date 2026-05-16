/**
 * ASTRA Villa AI Personalization Engine
 * Generates personalized homepage headlines and subtitles
 * based on user AI profile data.
 *
 * Constraints:
 *   Headline: max 10 words
 *   Subtitle: max 18 words
 *   Tone: Luxury real estate, premium, aspirational
 */

interface UserAiProfile {
  buyer_type: 'investor' | 'balanced' | 'lifestyle';
  preferred_city: string;
  avg_budget: number;
  property_type_preference?: string;
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export function generatePersonalizedHeadline(profile: UserAiProfile): PersonalizedHeadline {
  const { buyer_type, preferred_city, avg_budget, property_type_preference } = profile;
  const city = preferred_city || '';
  const budget = avg_budget > 0 ? formatBudgetShort(avg_budget) : '';
  const propType = property_type_preference ? capitalize(property_type_preference) : '';

  // ── Investor variants ──
  if (buyer_type === 'investor') {
    if (city && propType) {
      return {
        headline: `Elite ${propType} Investments in ${city}`,
        subtitle: `AI-curated ${propType.toLowerCase()} assets with proven yield potential, tailored to your portfolio.`,
      };
    }
    if (city && budget) {
      return {
        headline: `High-Yield ${city} Properties, Curated for You`,
        subtitle: `Investment opportunities near your IDR ${budget} target with exceptional ROI potential.`,
      };
    }
    if (city) {
      return {
        headline: `Strategic ${city} Investments Await`,
        subtitle: `Data-driven property selections in ${city} optimized for maximum capital growth.`,
      };
    }
    if (propType) {
      return {
        headline: `Premium ${propType} Investment Opportunities`,
        subtitle: `AI-matched high-yield ${propType.toLowerCase()} properties aligned with your investor profile.`,
      };
    }
    return {
      headline: `Unlock Exclusive Investment Opportunities`,
      subtitle: `AI-curated high-yield properties engineered for discerning investors like you.`,
    };
  }

  // ── Lifestyle variants ──
  if (buyer_type === 'lifestyle') {
    if (city && propType) {
      return {
        headline: `Exquisite ${city} ${propType} Living Awaits`,
        subtitle: `Handpicked ${propType.toLowerCase()} residences with world-class amenities matched to your taste.`,
      };
    }
    if (city && budget) {
      return {
        headline: `Your Dream ${city} Lifestyle Starts Here`,
        subtitle: `Premium properties with exceptional design and comfort near your IDR ${budget} range.`,
      };
    }
    if (city) {
      return {
        headline: `Discover ${city}'s Most Coveted Residences`,
        subtitle: `Curated luxury properties in ${city} selected for refined living and timeless design.`,
      };
    }
    if (propType) {
      return {
        headline: `Find Your Perfect ${propType} Sanctuary`,
        subtitle: `AI-selected ${propType.toLowerCase()} properties prioritizing comfort, design, and elevated living.`,
      };
    }
    return {
      headline: `Extraordinary Living, Personally Curated`,
      subtitle: `AI-selected residences prioritizing world-class comfort, design, and premium lifestyle.`,
    };
  }

  // ── Balanced variants ──
  if (city && propType) {
    return {
      headline: `Intelligent ${propType} Matches in ${city}`,
      subtitle: `Smart picks balancing investment value and lifestyle quality across ${city}'s finest ${propType.toLowerCase()} listings.`,
    };
  }
  if (city && budget) {
    return {
      headline: `Smart ${city} Picks at Your Budget`,
      subtitle: `Balanced selections blending capital growth and living quality near IDR ${budget}.`,
    };
  }
  if (city) {
    return {
      headline: `${city}'s Best Properties, AI-Matched for You`,
      subtitle: `Intelligent recommendations balancing strong returns and exceptional living in ${city}.`,
    };
  }
  if (propType) {
    return {
      headline: `Your Ideal ${propType}, Intelligently Matched`,
      subtitle: `AI-powered ${propType.toLowerCase()} recommendations balancing investment and lifestyle quality.`,
    };
  }
  return {
    headline: `Your Perfect Property, AI-Matched`,
    subtitle: `Intelligent recommendations balancing investment potential and premium living quality.`,
  };
}
