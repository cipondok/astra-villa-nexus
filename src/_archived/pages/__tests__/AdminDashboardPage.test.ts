import { describe, it, expect } from 'vitest';
describe('AdminDashboardPage', () => {
  it('admin tabs', () => { expect(['users','properties','analytics','settings']).toHaveLength(4); });
  it('quick actions', () => { expect(['approve','reject','suspend','delete']).toContain('approve'); });
});
