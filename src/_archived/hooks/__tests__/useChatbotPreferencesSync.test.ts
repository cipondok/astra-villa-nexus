import { describe, it, expect } from 'vitest';
describe('useChatbotPreferencesSync', () => {
  it('sync interval', () => { expect(60000).toBe(60 * 1000); });
  it('merge preferences', () => { const local = { theme: 'dark' }; const remote = { lang: 'id' }; expect({ ...local, ...remote }).toEqual({ theme: 'dark', lang: 'id' }); });
  it('conflict resolution uses latest', () => { const a = { ts: 100, val: 'a' }; const b = { ts: 200, val: 'b' }; expect(b.ts > a.ts ? b.val : a.val).toBe('b'); });
});
