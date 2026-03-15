import { describe, it, expect } from 'vitest';
import { generateResponseUrgency } from '../useResponseUrgency';

describe('generateResponseUrgency', () => {
  it('returns RESPOND IMMEDIATELY for high intent + high match', () => {
    const r = generateResponseUrgency(90, 88);
    expect(r.label).toContain('RESPOND IMMEDIATELY');
    expect(r.variant).toBe('critical');
    expect(r.max_response_minutes).toBe(5);
  });

  it('returns HIGH PRIORITY for moderate-high scores', () => {
    const r = generateResponseUrgency(75, 70);
    expect(r.label).toContain('HIGH PRIORITY FOLLOW UP');
    expect(r.variant).toBe('high');
  });

  it('returns NORMAL RESPONSE for mid scores', () => {
    const r = generateResponseUrgency(50, 50);
    expect(r.label).toContain('NORMAL RESPONSE');
    expect(r.variant).toBe('normal');
  });

  it('returns LOW URGENCY for low scores', () => {
    const r = generateResponseUrgency(25, 20);
    expect(r.label).toContain('LOW URGENCY');
    expect(r.variant).toBe('low');
  });

  it('weights intent 55% and match 45%', () => {
    // 100*0.55 + 60*0.45 = 55+27 = 82 → CRITICAL
    const r = generateResponseUrgency(100, 60);
    expect(r.variant).toBe('critical');
  });

  it('clamps values', () => {
    const r = generateResponseUrgency(120, -5);
    // 100*0.55 + 0*0.45 = 55 → NORMAL
    expect(r.variant).toBe('normal');
  });
});
