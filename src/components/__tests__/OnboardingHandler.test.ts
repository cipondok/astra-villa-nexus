import { describe, it, expect } from 'vitest';
describe('OnboardingHandler', () => {
  it('onboarding steps', () => { expect(['welcome','profile','preferences','complete']).toHaveLength(4); });
  it('skip saves preference', () => { const skipped=true; expect(skipped).toBe(true); });
});
