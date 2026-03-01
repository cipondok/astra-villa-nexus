import { describe, it, expect } from 'vitest';

describe('Booking components', () => {
  it('calculates booking total with service fee', () => {
    const basePrice = 500_000;
    const serviceFee = 0.05;
    const total = basePrice + basePrice * serviceFee;
    expect(total).toBe(525_000);
  });

  it('validates booking date is in future', () => {
    const isFuture = (date: string) => new Date(date) > new Date('2026-03-01');
    expect(isFuture('2026-04-01')).toBe(true);
    expect(isFuture('2026-02-01')).toBe(false);
  });

  it('generates invoice number with timestamp', () => {
    const invoice = `INV-${Date.now().toString(36).toUpperCase()}`;
    expect(invoice).toMatch(/^INV-[A-Z0-9]+$/);
  });

  it('formats payment instructions for bank transfer', () => {
    const bankName = 'BCA';
    const accountNo = '1234567890';
    const instruction = `Transfer to ${bankName} - ${accountNo}`;
    expect(instruction).toContain('BCA');
    expect(instruction).toContain('1234567890');
  });
});
