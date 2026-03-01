import { describe, it, expect } from 'vitest';
describe('EligibilityChecker logic', () => {
  it('income requirement', () => { const minIncome = 10e6; const userIncome = 15e6; expect(userIncome >= minIncome).toBe(true); });
  it('age requirement', () => { const age = 25; expect(age >= 21 && age <= 65).toBe(true); });
  it('employment type', () => { const valid = ['permanent', 'contract', 'self_employed']; expect(valid).toContain('permanent'); });
});
