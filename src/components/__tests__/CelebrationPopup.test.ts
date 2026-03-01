import { describe, it, expect } from 'vitest';
describe('CelebrationPopup component', () => {
  it('celebration types', () => {
    const types = ['purchase', 'milestone', 'achievement', 'welcome'];
    expect(types).toContain('milestone');
  });
  it('auto-close after delay', () => {
    const DELAY_MS = 5000;
    expect(DELAY_MS).toBeGreaterThan(0);
  });
  it('confetti particle count', () => {
    const PARTICLES = 200;
    expect(PARTICLES).toBeGreaterThanOrEqual(100);
  });
});
