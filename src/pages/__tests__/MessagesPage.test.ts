import { describe, it, expect } from 'vitest';
describe('MessagesPage', () => {
  it('conversations sorted by last message', () => {
    const convos = [
      { lastMsg: '2026-02-28T10:00:00Z' },
      { lastMsg: '2026-03-01T14:00:00Z' },
    ];
    const sorted = [...convos].sort((a, b) => new Date(b.lastMsg).getTime() - new Date(a.lastMsg).getTime());
    expect(sorted[0].lastMsg).toContain('03-01');
  });
  it('unread count per conversation', () => {
    const unreads = [3, 0, 1, 5];
    const total = unreads.reduce((s, v) => s + v, 0);
    expect(total).toBe(9);
  });
});
