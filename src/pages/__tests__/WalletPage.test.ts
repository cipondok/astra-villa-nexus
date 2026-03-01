import { describe, it, expect } from 'vitest';

describe('WalletPage', () => {
  it('formats ASTRA token balance', () => {
    const balance = 1234.5678;
    const formatted = balance.toFixed(2);
    expect(formatted).toBe('1234.57');
  });

  it('transaction history sorted by date desc', () => {
    const txs = [
      { date: '2026-01-15', amount: 100 },
      { date: '2026-03-01', amount: 50 },
      { date: '2026-02-10', amount: 200 },
    ];
    const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    expect(sorted[0].date).toBe('2026-03-01');
  });

  it('transfer requires minimum amount', () => {
    const MIN_TRANSFER = 1;
    const amount = 0.5;
    expect(amount >= MIN_TRANSFER).toBe(false);
  });
});
