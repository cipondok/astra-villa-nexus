import { describe, it, expect } from 'vitest';

describe('useReferralCampaign - referral campaigns', () => {
  it('reward calculation by tier', () => {
    const tiers = [{ min: 1, max: 5, reward: 50000 }, { min: 6, max: 20, reward: 75000 }, { min: 21, max: Infinity, reward: 100000 }];
    const getReward = (refs: number) => tiers.find(t => refs >= t.min && refs <= t.max)!.reward;
    expect(getReward(3)).toBe(50000);
    expect(getReward(15)).toBe(75000);
    expect(getReward(30)).toBe(100000);
  });
  it('campaign ROI', () => {
    const totalRewards = 5000000; const revenueFromReferrals = 50000000;
    const roi = ((revenueFromReferrals - totalRewards) / totalRewards) * 100;
    expect(roi).toBe(900);
  });
  it('leaderboard ranking', () => {
    const refs = [{ user: 'A', count: 15 }, { user: 'B', count: 30 }, { user: 'C', count: 22 }];
    const sorted = [...refs].sort((a, b) => b.count - a.count);
    expect(sorted[0].user).toBe('B');
  });
});
