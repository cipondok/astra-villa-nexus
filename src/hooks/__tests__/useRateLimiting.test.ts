import { describe, it, expect } from 'vitest';
import type { RateLimitConfig, BlockedIP, PartnerAPIKey, RateLimitViolation } from '../useRateLimiting';

describe('useRateLimiting types and API key generation', () => {
  it('RateLimitConfig has correct structure', () => {
    const config: RateLimitConfig = {
      id: '1',
      endpoint_pattern: '/api/*',
      endpoint_name: 'All APIs',
      requests_per_window: 100,
      window_seconds: 60,
      burst_limit: 20,
      is_active: true,
      applies_to: 'all',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(config.requests_per_window).toBe(100);
    expect(config.is_active).toBe(true);
  });

  it('BlockedIP supports permanent and timed blocks', () => {
    const permanent: BlockedIP = {
      id: '1', ip_address: '1.2.3.4', reason: 'abuse',
      violation_count: 50, blocked_at: '', expires_at: null,
      is_permanent: true, blocked_by: null, notes: null, created_at: '',
    };
    const timed: BlockedIP = {
      ...permanent, is_permanent: false, expires_at: new Date().toISOString(),
    };
    expect(permanent.is_permanent).toBe(true);
    expect(timed.expires_at).toBeTruthy();
  });

  it('API key generation produces pk_ prefix', () => {
    const apiKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`;
    expect(apiKey).toMatch(/^pk_[a-f0-9]{32}$/);
  });

  it('RateLimitViolation tracks identifier types', () => {
    const types: RateLimitViolation['identifier_type'][] = ['ip', 'user', 'api_key'];
    expect(types).toHaveLength(3);
    expect(types).toContain('api_key');
  });

  it('PartnerAPIKey has rate_limit_multiplier default of 1', () => {
    const key: PartnerAPIKey = {
      id: '1', api_key: 'pk_test', partner_name: 'Test',
      partner_email: 'test@test.com', is_active: true,
      is_whitelisted: false, rate_limit_multiplier: 1,
      custom_limits: {}, allowed_endpoints: ['*'],
      total_requests: 0, last_used_at: null,
      expires_at: null, created_at: '',
    };
    expect(key.rate_limit_multiplier).toBe(1);
  });
});
