import { describe, it, expect } from 'vitest';
import { detectExitTiming } from '../useExitTiming';

describe('detectExitTiming', () => {
  it('returns STRONG SELL WINDOW at peak with high gain + liquidity', () => {
    const r = detectExitTiming(35, 'peak', 80);
    expect(r.signal).toBe('STRONG SELL WINDOW');
    expect(r.variant).toBe('sell_now');
  });

  it('returns PROFIT BOOKING OPPORTUNITY for good gain at peak', () => {
    const r = detectExitTiming(20, 'peak', 55);
    expect(r.signal).toBe('PROFIT BOOKING OPPORTUNITY');
  });

  it('returns HOLD FOR FURTHER GROWTH during expansion', () => {
    const r = detectExitTiming(15, 'expansion', 60);
    expect(r.signal).toBe('HOLD FOR FURTHER GROWTH');
  });

  it('returns LONG TERM ASSET HOLD during recovery with low gain', () => {
    const r = detectExitTiming(3, 'recovery', 40);
    expect(r.signal).toBe('LONG TERM ASSET HOLD');
    expect(r.variant).toBe('long_hold');
  });

  it('handles negative capital gain', () => {
    const r = detectExitTiming(-10, 'correction', 30);
    expect(r.signal).toBe('LONG TERM ASSET HOLD');
  });

  it('handles correction cycle with decent gain', () => {
    const r = detectExitTiming(25, 'correction', 70);
    expect(r.signal).toBe('PROFIT BOOKING OPPORTUNITY');
  });
});
