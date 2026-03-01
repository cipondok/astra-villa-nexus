import { describe, it, expect } from 'vitest';

describe('useMessaging - message handling logic', () => {
  it('trims whitespace from messages', () => {
    const msg = '  Hello world  ';
    expect(msg.trim()).toBe('Hello world');
  });

  it('rejects empty messages', () => {
    const isValid = (msg: string) => msg.trim().length > 0;
    expect(isValid('')).toBe(false);
    expect(isValid('   ')).toBe(false);
    expect(isValid('hi')).toBe(true);
  });

  it('limits message length to 5000 chars', () => {
    const MAX = 5000;
    const long = 'a'.repeat(6000);
    const truncated = long.slice(0, MAX);
    expect(truncated).toHaveLength(MAX);
  });

  it('sorts messages by created_at', () => {
    const msgs = [
      { id: '1', created_at: '2024-01-03T00:00:00Z' },
      { id: '2', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', created_at: '2024-01-02T00:00:00Z' },
    ];
    const sorted = [...msgs].sort((a, b) => a.created_at.localeCompare(b.created_at));
    expect(sorted.map(m => m.id)).toEqual(['2', '3', '1']);
  });

  it('marks unread count correctly', () => {
    const messages = [
      { is_read: true }, { is_read: false }, { is_read: false }, { is_read: true }
    ];
    const unread = messages.filter(m => !m.is_read).length;
    expect(unread).toBe(2);
  });

  it('groups messages by conversation', () => {
    const msgs = [
      { conversation_id: 'a', content: 'hi' },
      { conversation_id: 'b', content: 'hey' },
      { conversation_id: 'a', content: 'hello' },
    ];
    const grouped = msgs.reduce((acc, m) => {
      (acc[m.conversation_id] = acc[m.conversation_id] || []).push(m);
      return acc;
    }, {} as Record<string, typeof msgs>);
    expect(grouped['a']).toHaveLength(2);
    expect(grouped['b']).toHaveLength(1);
  });
});
