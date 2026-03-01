import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDeviceFingerprint, getDeviceInfo, clearAllCookies } from '../deviceFingerprint';

describe('generateDeviceFingerprint', () => {
  it('returns a string of max 32 characters', () => {
    const fp = generateDeviceFingerprint();
    expect(typeof fp).toBe('string');
    expect(fp.length).toBeLessThanOrEqual(32);
  });

  it('returns consistent results for same environment', () => {
    const fp1 = generateDeviceFingerprint();
    const fp2 = generateDeviceFingerprint();
    expect(fp1).toBe(fp2);
  });
});

describe('getDeviceInfo', () => {
  it('returns object with expected keys', () => {
    const info = getDeviceInfo();
    expect(info).toHaveProperty('userAgent');
    expect(info).toHaveProperty('platform');
    expect(info).toHaveProperty('language');
    expect(info).toHaveProperty('screenResolution');
    expect(info).toHaveProperty('timezone');
    expect(info).toHaveProperty('cookieEnabled');
    expect(info).toHaveProperty('onlineStatus');
  });

  it('screenResolution matches WxH format', () => {
    const info = getDeviceInfo();
    expect(info.screenResolution).toMatch(/^\d+x\d+$/);
  });
});

describe('clearAllCookies', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('clears localStorage and sessionStorage', () => {
    localStorage.setItem('test-key', 'value');
    sessionStorage.setItem('test-key2', 'value2');

    clearAllCookies();

    expect(localStorage.getItem('test-key')).toBeNull();
    expect(sessionStorage.getItem('test-key2')).toBeNull();
  });
});
