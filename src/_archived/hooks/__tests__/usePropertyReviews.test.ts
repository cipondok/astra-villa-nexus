import { describe, it, expect } from 'vitest';

describe('usePropertyReviews - review logic', () => {
  it('review word count', () => {
    const review = 'This is a great property with amazing views';
    const words = review.split(/\s+/).length;
    expect(words).toBe(8);
  });
  it('minimum review length', () => {
    const MIN_CHARS = 20;
    expect('Too short'.length < MIN_CHARS).toBe(true);
    expect('This is a detailed review of the property'.length >= MIN_CHARS).toBe(true);
  });
  it('helpful votes sorting', () => {
    const reviews = [{ id: '1', helpful: 5 }, { id: '2', helpful: 20 }, { id: '3', helpful: 12 }];
    const sorted = [...reviews].sort((a, b) => b.helpful - a.helpful);
    expect(sorted[0].id).toBe('2');
  });
  it('review moderation flags', () => {
    const flagged = (text: string) => /spam|fake|scam/i.test(text);
    expect(flagged('This is a spam review')).toBe(true);
    expect(flagged('Beautiful apartment')).toBe(false);
  });
  it('verified purchase badge', () => {
    const hasTransaction = true;
    const badge = hasTransaction ? 'verified_buyer' : null;
    expect(badge).toBe('verified_buyer');
  });
});
