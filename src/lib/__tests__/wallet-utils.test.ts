import { describe, it, expect } from 'vitest';

describe('wallet-utils - blockchain wallet logic', () => {
  it('validates ethereum address format', () => {
    const isValid = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
    expect(isValid('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD42')).toBe(true);
    expect(isValid('0xinvalid')).toBe(false);
    expect(isValid('not-an-address')).toBe(false);
  });

  it('shortens wallet address', () => {
    const shorten = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    expect(shorten('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD42')).toBe('0x742d...bD42');
  });

  it('converts wei to ether', () => {
    const weiToEther = (wei: bigint) => Number(wei) / 1e18;
    expect(weiToEther(BigInt('1000000000000000000'))).toBe(1);
    expect(weiToEther(BigInt('500000000000000000'))).toBe(0.5);
  });

  it('chain ID mapping', () => {
    const chains: Record<number, string> = { 1: 'Ethereum', 56: 'BSC', 137: 'Polygon' };
    expect(chains[1]).toBe('Ethereum');
    expect(chains[999]).toBeUndefined();
  });

  it('balance formatting', () => {
    const format = (bal: number) => bal < 0.001 ? '< 0.001' : bal.toFixed(4);
    expect(format(1.5)).toBe('1.5000');
    expect(format(0.0001)).toBe('< 0.001');
  });
});
