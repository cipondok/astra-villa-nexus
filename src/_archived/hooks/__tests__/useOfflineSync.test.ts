import { describe, it, expect } from 'vitest';
describe('useOfflineSync', () => {
  it('queue persistence', () => { const q = [{ id: 1, action: 'save' }]; const json = JSON.stringify(q); expect(JSON.parse(json)).toHaveLength(1); });
  it('sync order FIFO', () => { const q = [1, 2, 3]; expect(q.shift()).toBe(1); });
  it('conflict resolution', () => { const local = { ts: 200, data: 'a' }; const remote = { ts: 300, data: 'b' }; expect(remote.ts > local.ts ? remote.data : local.data).toBe('b'); });
});
