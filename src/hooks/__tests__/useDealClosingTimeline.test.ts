import { describe, it, expect } from 'vitest';
import {
  classifyClosingWindow,
  classifyNegotiationIntensity,
  classifyUrgencySignal,
} from '../useDealClosingTimeline';

describe('classifyClosingWindow', () => {
  it('returns FAST_CLOSE for composite >= 65', () => {
    expect(classifyClosingWindow(65)).toBe('FAST_CLOSE');
    expect(classifyClosingWindow(90)).toBe('FAST_CLOSE');
  });

  it('returns MODERATE_CLOSE for composite 40-64', () => {
    expect(classifyClosingWindow(40)).toBe('MODERATE_CLOSE');
    expect(classifyClosingWindow(64)).toBe('MODERATE_CLOSE');
  });

  it('returns SLOW_CLOSE for composite < 40', () => {
    expect(classifyClosingWindow(39)).toBe('SLOW_CLOSE');
    expect(classifyClosingWindow(0)).toBe('SLOW_CLOSE');
  });
});

describe('classifyNegotiationIntensity', () => {
  it('returns COMPETITIVE_BUYER_MARKET for high demand + inquiries', () => {
    expect(classifyNegotiationIntensity(70, 50, 5)).toBe('COMPETITIVE_BUYER_MARKET');
  });

  it('returns BALANCED_NEGOTIATION for moderate signals', () => {
    expect(classifyNegotiationIntensity(40, 40, 1)).toBe('BALANCED_NEGOTIATION');
  });

  it('returns PRICE_RESISTANCE_RISK for weak signals', () => {
    expect(classifyNegotiationIntensity(20, 20, 0)).toBe('PRICE_RESISTANCE_RISK');
  });

  it('requires both demand >= 65 AND inquiries >= 3 for competitive', () => {
    expect(classifyNegotiationIntensity(70, 50, 2)).toBe('BALANCED_NEGOTIATION');
    expect(classifyNegotiationIntensity(60, 50, 5)).toBe('BALANCED_NEGOTIATION');
  });
});

describe('classifyUrgencySignal', () => {
  it('returns IMMEDIATE_FOLLOWUP for fast close + inquiries', () => {
    expect(classifyUrgencySignal('FAST_CLOSE', 3, 10)).toBe('IMMEDIATE_FOLLOWUP');
  });

  it('returns STRATEGIC_NURTURING for moderate close', () => {
    expect(classifyUrgencySignal('MODERATE_CLOSE', 1, 30)).toBe('STRATEGIC_NURTURING');
  });

  it('returns STRATEGIC_NURTURING for mid-range days active', () => {
    expect(classifyUrgencySignal('SLOW_CLOSE', 0, 30)).toBe('STRATEGIC_NURTURING');
  });

  it('returns LONG_TERM_LISTING for slow close + long days', () => {
    expect(classifyUrgencySignal('SLOW_CLOSE', 0, 100)).toBe('LONG_TERM_LISTING');
  });
});
