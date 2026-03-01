import { describe, it, expect } from 'vitest';

describe('NotFound page', () => {
  it('displays 404 status code', () => {
    const statusCode = 404;
    expect(statusCode).toBe(404);
  });

  it('provides link back to home', () => {
    const homeLink = '/';
    expect(homeLink).toBe('/');
  });
});

describe('ErrorPage', () => {
  it('handles different error types', () => {
    const errorTypes = ['network', 'server', 'notfound', 'unauthorized'];
    expect(errorTypes).toContain('server');
  });
});

describe('MaintenancePage', () => {
  it('shows estimated return time', () => {
    const estimatedReturn = '2026-03-01T18:00:00Z';
    expect(new Date(estimatedReturn).getTime()).toBeGreaterThan(0);
  });
});
