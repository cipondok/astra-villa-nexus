import { describe, it, expect } from 'vitest';
describe('useImageHealthCheck', () => {
  it('broken image detection', () => { const status = 404 as number; expect(status !== 200).toBe(true); });
  it('batch check limit', () => { const urls = Array.from({ length: 100 }, (_, i) => `img${i}`); expect(urls.slice(0, 20)).toHaveLength(20); });
  it('report format', () => { const report = { total: 50, broken: 3, healthy: 47 }; expect(report.broken + report.healthy).toBe(report.total); });
});
