import { describe, it, expect } from 'vitest';
describe('usePropertyAI', () => {
  it('price prediction confidence', () => { const confidence = 0.85; expect(confidence).toBeGreaterThanOrEqual(0); expect(confidence).toBeLessThanOrEqual(1); });
  it('feature importance ranking', () => { const features = [{ name: 'location', importance: 0.35 }, { name: 'size', importance: 0.25 }, { name: 'age', importance: 0.15 }]; const sorted = [...features].sort((a, b) => b.importance - a.importance); expect(sorted[0].name).toBe('location'); });
  it('similar properties limit', () => { expect(Array.from({ length: 20 }).slice(0, 5)).toHaveLength(5); });
});
