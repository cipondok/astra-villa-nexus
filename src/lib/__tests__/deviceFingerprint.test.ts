import { describe, it, expect } from 'vitest';
import { getDeviceInfo } from '../deviceFingerprint';

describe('getDeviceInfo', () => {
  it('returns device type', () => {
    const info = getDeviceInfo();
    expect(['desktop', 'mobile', 'tablet']).toContain(info.deviceType);
  });

  it('returns browser name', () => {
    const info = getDeviceInfo();
    expect(typeof info.browserName).toBe('string');
    expect(info.browserName.length).toBeGreaterThan(0);
  });

  it('returns OS name', () => {
    const info = getDeviceInfo();
    expect(typeof info.osName).toBe('string');
  });

  it('returns all expected fields', () => {
    const info = getDeviceInfo();
    expect(info).toHaveProperty('deviceType');
    expect(info).toHaveProperty('browserName');
    expect(info).toHaveProperty('browserVersion');
    expect(info).toHaveProperty('osName');
    expect(info).toHaveProperty('osVersion');
  });
});
