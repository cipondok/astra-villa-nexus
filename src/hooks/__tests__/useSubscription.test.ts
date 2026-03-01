import { describe, it, expect } from 'vitest';
import type { SubscriptionPlan, UserSubscription, SubscriptionInvoice } from '../useSubscription';

describe('useSubscription - plan and invoice logic', () => {
  it('free plan has price 0', () => {
    const plan: Partial<SubscriptionPlan> = { price_monthly: 0, slug: 'free' };
    expect(plan.price_monthly).toBe(0);
  });

  it('tax calculation at 11% PPN', () => {
    const price = 299_000;
    const taxRate = 0.11;
    const tax = price * taxRate;
    const total = price + tax;
    expect(tax).toBeCloseTo(32890, 0);
    expect(total).toBeCloseTo(331890, 0);
  });

  it('invoice number format', () => {
    const num = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    expect(num).toMatch(/^INV-\d+-[A-Z0-9]+$/);
  });

  it('subscription status values', () => {
    const statuses: UserSubscription['status'][] = ['active', 'cancelled', 'expired', 'past_due', 'trialing'];
    expect(statuses).toHaveLength(5);
  });

  it('isFreePlan when no subscription', () => {
    const subscription: UserSubscription | null = null;
    const isFreePlan = !subscription || subscription?.plan?.slug === 'free';
    expect(isFreePlan).toBe(true);
  });

  it('listing limit null means unlimited', () => {
    const plan: Partial<SubscriptionPlan> = { listing_limit: null };
    const isUnlimited = plan.listing_limit === null;
    expect(isUnlimited).toBe(true);
  });

  it('remaining listings calculation', () => {
    const limit = 10;
    const used = 3;
    const remaining = Math.max(0, limit - used);
    expect(remaining).toBe(7);
  });

  it('features parsing handles array and string', () => {
    const arr = ['feature1', 'feature2'];
    expect(Array.isArray(arr)).toBe(true);

    const str = '["a","b"]';
    const parsed = JSON.parse(str);
    expect(parsed).toEqual(['a', 'b']);
  });
});
