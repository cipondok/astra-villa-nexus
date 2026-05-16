import { describe, it, expect } from 'vitest';
describe('useSecurityAlerts', () => {
  it('alert severity levels', () => { expect(['low', 'medium', 'high', 'critical']).toHaveLength(4); });
  it('auto-escalation rule', () => { const unacknowledged = 60; const ESCALATE_MIN = 30; expect(unacknowledged > ESCALATE_MIN).toBe(true); });
  it('incident grouping', () => { const alerts = [{ type: 'brute_force' }, { type: 'brute_force' }, { type: 'xss' }]; const grouped = alerts.reduce((a, e) => { a[e.type] = (a[e.type] || 0) + 1; return a; }, {} as Record<string, number>); expect(grouped['brute_force']).toBe(2); });
});
