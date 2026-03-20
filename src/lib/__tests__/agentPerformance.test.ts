import { describe, it, expect } from 'vitest';
import {
  scoreResponseSpeed,
  scoreViewingConversion,
  scoreDealsClosed,
  scoreCustomerSatisfaction,
  scoreListingQuality,
  classifyTier,
  scoreAgent,
} from '../agentPerformance';

describe('scoreResponseSpeed', () => {
  it('perfect for ≤5 min', () => expect(scoreResponseSpeed(3)).toBe(100));
  it('low for slow response', () => expect(scoreResponseSpeed(150)).toBeLessThan(30));
});

describe('scoreViewingConversion', () => {
  it('high for 60%+ rate', () => expect(scoreViewingConversion(12, 20)).toBe(100));
  it('fallback when no leads', () => expect(scoreViewingConversion(0, 0)).toBe(50));
});

describe('scoreDealsClosed', () => {
  it('high when exceeding target', () => expect(scoreDealsClosed(8, 5)).toBe(100));
  it('low when far below target', () => expect(scoreDealsClosed(1, 10)).toBeLessThan(30));
});

describe('scoreCustomerSatisfaction', () => {
  it('high for 4.8 with many reviews', () => expect(scoreCustomerSatisfaction(4.8, 15)).toBeGreaterThan(85));
  it('fallback for no reviews', () => expect(scoreCustomerSatisfaction(5, 0)).toBe(40));
});

describe('classifyTier', () => {
  it('DIAMOND for 90+', () => expect(classifyTier(92)).toBe('DIAMOND'));
  it('GOLD for 60-74', () => expect(classifyTier(65)).toBe('GOLD'));
  it('BRONZE for <40', () => expect(classifyTier(30)).toBe('BRONZE'));
});

describe('scoreAgent', () => {
  it('returns valid composite and badges for top agent', () => {
    const r = scoreAgent({
      avg_response_minutes: 8, viewings_booked: 15, viewings_from_leads: 20,
      deals_closed_period: 6, deals_target: 5, avg_rating: 4.7, total_reviews: 12,
      listings_optimized: 18, total_listings: 20, active_streak_days: 14, career_deals: 25,
    });
    expect(r.performance_score).toBeGreaterThan(70);
    expect(r.badges.filter(b => b.earned).length).toBeGreaterThan(3);
    expect(['PLATINUM', 'DIAMOND', 'GOLD']).toContain(r.tier);
  });

  it('identifies bonus eligibility', () => {
    const r = scoreAgent({
      avg_response_minutes: 5, viewings_booked: 18, viewings_from_leads: 20,
      deals_closed_period: 8, deals_target: 5, avg_rating: 4.9, total_reviews: 20,
      listings_optimized: 19, total_listings: 20, active_streak_days: 35, career_deals: 40,
    });
    expect(r.bonus_eligible).toBe(true);
  });
});
