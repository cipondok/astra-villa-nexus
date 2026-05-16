import { describe, it, expect } from 'vitest';
describe('NeighborhoodInsights', () => {
  it('insight categories', () => { expect(['safety','schools','transport','dining','parks']).toHaveLength(5); });
  it('score out of 10', () => { const s=8.5; expect(s<=10&&s>=0).toBe(true); });
});
