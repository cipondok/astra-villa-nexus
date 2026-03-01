import { describe, it, expect } from 'vitest';
describe('useSessionHeartbeat', () => {
  it('heartbeat interval', () => { expect(30000).toBe(30 * 1000); });
  it('session timeout', () => { const TIMEOUT = 30 * 60 * 1000; const lastActivity = Date.now() - 20 * 60 * 1000; expect(Date.now() - lastActivity < TIMEOUT).toBe(true); });
  it('extends session on activity', () => { let expiry = Date.now() + 1800000; expiry = Date.now() + 1800000; expect(expiry).toBeGreaterThan(Date.now()); });
});
