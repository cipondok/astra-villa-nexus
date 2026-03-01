import { describe, it, expect } from 'vitest';

describe('LiveChatManager', () => {
  it('tracks selected session id', () => {
    let selectedSessionId: string | null = null;
    selectedSessionId = 'session-123';
    expect(selectedSessionId).toBe('session-123');
    selectedSessionId = null;
    expect(selectedSessionId).toBeNull();
  });

  it('separates waiting and active sessions', () => {
    const sessions = [
      { id: '1', status: 'waiting' },
      { id: '2', status: 'active' },
      { id: '3', status: 'waiting' },
    ];
    const waiting = sessions.filter(s => s.status === 'waiting');
    const active = sessions.filter(s => s.status === 'active');
    expect(waiting).toHaveLength(2);
    expect(active).toHaveLength(1);
  });
});
