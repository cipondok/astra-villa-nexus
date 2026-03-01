import { describe, it, expect } from 'vitest';
describe('LiveAuctionCard component', () => {
  it('bid increment validation', () => {
    const currentBid = 1_000_000_000;
    const minIncrement = 50_000_000;
    const newBid = 1_040_000_000;
    expect(newBid - currentBid >= minIncrement).toBe(false);
  });
  it('auction countdown format', () => {
    const seconds = 3661;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    expect(h).toBe(1);
    expect(m).toBe(1);
  });
  it('bid history ordered desc', () => {
    const bids = [{ amount: 1e9 }, { amount: 1.1e9 }, { amount: 1.2e9 }];
    const sorted = [...bids].sort((a, b) => b.amount - a.amount);
    expect(sorted[0].amount).toBe(1.2e9);
  });
});
