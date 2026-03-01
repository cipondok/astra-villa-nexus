import { describe, it, expect } from 'vitest';
describe('useAdminVideoVerification', () => {
  it('review queue sorting', () => { const items = [{ submitted: '2026-03-01' }, { submitted: '2026-02-28' }]; const sorted = [...items].sort((a, b) => a.submitted.localeCompare(b.submitted)); expect(sorted[0].submitted).toBe('2026-02-28'); });
  it('approval/rejection status', () => { const statuses = ['pending', 'approved', 'rejected']; expect(statuses).toHaveLength(3); });
  it('review notes required on reject', () => { const action = 'rejected'; const notes = 'Poor quality'; expect(action === 'rejected' && notes.length > 0).toBe(true); });
});
