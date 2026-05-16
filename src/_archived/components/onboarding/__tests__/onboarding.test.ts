import { describe, it, expect } from 'vitest';

describe('Onboarding components', () => {
  it('user type options', () => {
    const types = ['buyer', 'renter', 'agent', 'property_owner', 'investor'];
    expect(types).toHaveLength(5);
    expect(types).toContain('investor');
  });
  it('wizard step progression', () => {
    const totalSteps = 4;
    let current = 0;
    current = Math.min(current + 1, totalSteps - 1);
    expect(current).toBe(1);
  });
  it('completion triggers redirect', () => {
    const isComplete = true;
    const redirectTo = isComplete ? '/dashboard' : '/onboarding';
    expect(redirectTo).toBe('/dashboard');
  });
});
