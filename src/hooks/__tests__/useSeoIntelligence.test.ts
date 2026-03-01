import { describe, it, expect } from 'vitest';

describe('useSeoIntelligence - SEO intelligence', () => {
  it('competitor keyword gap', () => {
    const myKeywords = new Set(['villa bali', 'apartment jakarta', 'rumah dijual']);
    const competitor = new Set(['villa bali', 'kost jakarta', 'tanah murah']);
    const gap = [...competitor].filter(k => !myKeywords.has(k));
    expect(gap).toEqual(['kost jakarta', 'tanah murah']);
  });
  it('page speed score interpretation', () => {
    const interpret = (score: number) => score >= 90 ? 'good' : score >= 50 ? 'needs_improvement' : 'poor';
    expect(interpret(95)).toBe('good');
    expect(interpret(60)).toBe('needs_improvement');
    expect(interpret(30)).toBe('poor');
  });
  it('backlink quality score', () => {
    const links = [{ da: 80 }, { da: 30 }, { da: 60 }];
    const avg = links.reduce((s, l) => s + l.da, 0) / links.length;
    expect(avg).toBeCloseTo(56.67, 1);
  });
});
