import { useMemo } from 'react';
import { UserAiProfile } from '@/hooks/useUserAiProfile';

interface PropertyForMatch {
  city?: string;
  price?: number;
  has_pool?: boolean;
  property_type?: string;
  investment_score?: number;
}

interface MatchResult {
  matchScore: number;
  confidenceScore: number;
  collaborativeOverlap: number;
}

/**
 * Client-side mirror of the ai-match-engine-v2 scoring logic.
 * Computes a match score (0-100) for a single property against
 * the user's AI profile without an extra network call.
 */
export function usePropertyMatchScore(
  property: PropertyForMatch | null,
  profile: UserAiProfile | null | undefined,
): MatchResult {
  return useMemo(() => {
    if (!property || !profile) return { matchScore: 0, confidenceScore: 0, collaborativeOverlap: 0 };

    let score = 0;

    // Location (25 pts)
    if (profile.preferred_city && property.city === profile.preferred_city) {
      score += 25;
    }

    // Price (22 pts)
    if (profile.avg_budget > 0 && property.price) {
      const diff = Math.abs(property.price - profile.avg_budget) / profile.avg_budget;
      if (diff <= 0.1) score += 22;
      else if (diff <= 0.2) score += 18;
      else if (diff <= 0.4) score += 12;
      else if (diff <= 0.6) score += 6;
    }

    // Feature – pool affinity (15 pts)
    if (profile.pool_affinity_percent > 60 && property.has_pool) {
      score += 15;
    } else if (profile.pool_affinity_percent > 30 && property.has_pool) {
      score += 8;
    }

    // Property type (13 pts)
    if (profile.property_type_preference && property.property_type === profile.property_type_preference) {
      score += 13;
    }

    // Investment alignment (15 pts)
    if (property.investment_score && profile.buyer_type === 'investor') {
      score += Math.min(15, Math.round(property.investment_score * 0.15));
    } else if (property.investment_score && profile.buyer_type === 'balanced') {
      score += Math.min(10, Math.round(property.investment_score * 0.1));
    }

    // Popularity baseline (10 pts) — give a baseline since we don't have per-property popularity here
    score += 5;

    // Confidence based on interaction volume
    let confidence = 0;
    if (profile.total_interactions >= 20) confidence = 80;
    else if (profile.total_interactions >= 10) confidence = 60;
    else if (profile.total_interactions >= 5) confidence = 40;
    else confidence = 20;

    // Boost confidence if we have strong signals
    if (profile.preferred_city) confidence = Math.min(100, confidence + 10);
    if (profile.avg_budget > 0) confidence = Math.min(100, confidence + 10);

    return {
      matchScore: Math.min(100, score),
      confidenceScore: confidence,
      collaborativeOverlap: profile.total_interactions >= 10 ? Math.floor(profile.total_interactions / 5) : 0,
    };
  }, [property, profile]);
}
