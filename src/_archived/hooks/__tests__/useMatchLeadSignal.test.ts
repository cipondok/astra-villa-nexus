import { describe, it, expect } from 'vitest';
import { generateMatchLeadSignal } from '../useMatchLeadSignal';

describe('generateMatchLeadSignal', () => {
  it('returns HOT MATCH LEAD for high match + high intent', () => {
    const r = generateMatchLeadSignal(90, 85);
    expect(r.label).toContain('HOT MATCH LEAD');
    expect(r.variant).toBe('hot');
    expect(r.priority).toBe(1);
  });

  it('returns HIGH POTENTIAL BUYER for moderate-high scores', () => {
    const r = generateMatchLeadSignal(70, 60);
    expect(r.label).toContain('HIGH POTENTIAL BUYER');
    expect(r.variant).toBe('high');
  });

  it('returns EXPLORING USER for moderate scores', () => {
    const r = generateMatchLeadSignal(45, 40);
    expect(r.label).toContain('EXPLORING USER');
    expect(r.variant).toBe('exploring');
  });

  it('returns LOW MATCH INTEREST for low scores', () => {
    const r = generateMatchLeadSignal(20, 15);
    expect(r.label).toContain('LOW MATCH INTEREST');
    expect(r.variant).toBe('low');
  });

  it('weights match 60% and intent 40%', () => {
    // 100*0.6 + 50*0.4 = 80 → HOT
    const r = generateMatchLeadSignal(100, 50);
    expect(r.variant).toBe('hot');
  });

  it('clamps out-of-range values', () => {
    const r = generateMatchLeadSignal(120, -10);
    // 100*0.6 + 0*0.4 = 60 → HIGH
    expect(r.variant).toBe('high');
  });
});
