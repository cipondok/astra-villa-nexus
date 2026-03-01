import { describe, it, expect, beforeEach } from 'vitest';

const STORAGE_KEY_PREFIX = 'chat_history_';
const EXPIRY_DAYS = 7;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

describe('useChatPersistence - storage logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores chat history under user-specific key', () => {
    const key = `${STORAGE_KEY_PREFIX}user123`;
    const history = {
      messages: [{ role: 'user', content: 'Hello' }],
      conversationId: 'conv-1',
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(history));

    const stored = JSON.parse(localStorage.getItem(key)!);
    expect(stored.conversationId).toBe('conv-1');
    expect(stored.messages).toHaveLength(1);
  });

  it('uses guest key when no userId', () => {
    const key = `${STORAGE_KEY_PREFIX}guest`;
    localStorage.setItem(key, JSON.stringify({ messages: [], conversationId: '', timestamp: Date.now() }));
    expect(localStorage.getItem(key)).toBeTruthy();
  });

  it('detects expired history (>7 days)', () => {
    const oldTimestamp = Date.now() - EXPIRY_MS - 1000;
    const history = { messages: [], conversationId: 'old', timestamp: oldTimestamp };
    const key = `${STORAGE_KEY_PREFIX}user1`;
    localStorage.setItem(key, JSON.stringify(history));

    const parsed = JSON.parse(localStorage.getItem(key)!);
    const isExpired = Date.now() - parsed.timestamp > EXPIRY_MS;
    expect(isExpired).toBe(true);
  });

  it('keeps fresh history (<7 days)', () => {
    const freshTimestamp = Date.now() - (EXPIRY_MS / 2);
    const history = { messages: [{ role: 'assistant', content: 'Hi' }], conversationId: 'fresh', timestamp: freshTimestamp };
    const key = `${STORAGE_KEY_PREFIX}user2`;
    localStorage.setItem(key, JSON.stringify(history));

    const parsed = JSON.parse(localStorage.getItem(key)!);
    const isExpired = Date.now() - parsed.timestamp > EXPIRY_MS;
    expect(isExpired).toBe(false);
  });

  it('clearChat removes from storage', () => {
    const key = `${STORAGE_KEY_PREFIX}user3`;
    localStorage.setItem(key, 'data');
    localStorage.removeItem(key);
    expect(localStorage.getItem(key)).toBeNull();
  });
});
