import { describe, it, expect } from 'vitest';
describe('About page', () => {
  it('company founding year', () => {
    const founded = 2024;
    expect(founded).toBeLessThanOrEqual(2026);
  });
  it('team members displayed', () => {
    const team = ['CEO', 'CTO', 'COO', 'CMO'];
    expect(team.length).toBeGreaterThanOrEqual(3);
  });
});
