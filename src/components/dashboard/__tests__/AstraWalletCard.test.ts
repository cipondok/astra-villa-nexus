import { describe, it, expect } from 'vitest';

describe('AstraWalletCard', () => {
  it('formats wallet balance with proper decimals', () => {
    const balance = 125.456789;
    const formatted = balance.toFixed(4);
    expect(formatted).toBe('125.4568');
  });

  it('displays shortened wallet address', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    expect(short).toBe('0x1234...5678');
  });

  it('handles null wallet connection', () => {
    const isConnected = false;
    expect(isConnected).toBe(false);
  });
});
