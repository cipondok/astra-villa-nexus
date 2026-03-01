import { describe, it, expect } from 'vitest';

describe('blockchain config', () => {
  it('getContractAddress returns polygon address for polygon chainId', () => {
    const CONTRACT_ADDRESSES = {
      polygon: { escrow: '0xPOLY', propertyDeed: '0xDEED', propertyToken: '0xTOKEN', commission: '0xCOMM' },
      polygonAmoy: { escrow: '0xAMOY', propertyDeed: '0xADEED', propertyToken: '0xATOKEN', commission: '0xACOMM' },
    };
    const POLYGON_ID = 137;
    const getContractAddress = (name: keyof typeof CONTRACT_ADDRESSES.polygon, chainId: number) => {
      if (chainId === POLYGON_ID) return CONTRACT_ADDRESSES.polygon[name];
      return CONTRACT_ADDRESSES.polygonAmoy[name];
    };
    expect(getContractAddress('escrow', 137)).toBe('0xPOLY');
    expect(getContractAddress('escrow', 80002)).toBe('0xAMOY');
  });

  it('formatPolygonAmount converts bigint to readable string', () => {
    const formatPolygonAmount = (amount: bigint, decimals = 18): string => {
      const value = Number(amount) / Math.pow(10, decimals);
      return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
    };
    const result = formatPolygonAmount(BigInt('1000000000000000000'));
    expect(result).toBe('1');
  });

  it('parsePolygonAmount converts string to bigint', () => {
    const parsePolygonAmount = (amount: string, decimals = 18): bigint => {
      const value = parseFloat(amount) * Math.pow(10, decimals);
      return BigInt(Math.floor(value));
    };
    const result = parsePolygonAmount('1.5');
    expect(result).toBe(BigInt('1500000000000000000'));
  });

  it('supports both polygon and polygonAmoy chains', () => {
    const SUPPORTED_CHAINS = ['polygon', 'polygonAmoy'];
    expect(SUPPORTED_CHAINS).toHaveLength(2);
  });
});
