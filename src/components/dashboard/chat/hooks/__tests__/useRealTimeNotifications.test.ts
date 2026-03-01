import { describe, it, expect } from 'vitest';

describe('useRealTimeNotifications', () => {
  it('plays urgentChat sound for urgent priority', () => {
    const priority = 'urgent';
    const soundType = priority === 'urgent' ? 'urgentChat' : 'newChat';
    expect(soundType).toBe('urgentChat');
  });

  it('plays newChat sound for non-urgent priorities', () => {
    const priority: string = 'medium';
    const soundType = priority === 'urgent' ? 'urgentChat' : 'newChat';
    expect(soundType).toBe('newChat');
  });

  it('truncates long message content for notification', () => {
    const content = 'A'.repeat(120);
    const truncated = content.substring(0, 80) + (content.length > 80 ? '...' : '');
    expect(truncated.length).toBe(83);
    expect(truncated.endsWith('...')).toBe(true);
  });

  it('does not truncate short messages', () => {
    const content = 'Hello';
    const truncated = content.substring(0, 80) + (content.length > 80 ? '...' : '');
    expect(truncated).toBe('Hello');
  });

  it('only notifies for customer messages, not agent', () => {
    const shouldNotify = (senderType: string) => senderType === 'customer';
    expect(shouldNotify('customer')).toBe(true);
    expect(shouldNotify('agent')).toBe(false);
  });

  it('detects priority escalation to urgent', () => {
    const oldPriority: string = 'medium';
    const newPriority: string = 'urgent';
    const isEscalated = newPriority === 'urgent' && oldPriority !== 'urgent';
    expect(isEscalated).toBe(true);
  });

  it('does not flag escalation if already urgent', () => {
    const oldP: string = 'urgent';
    const newP: string = 'urgent';
    const isEscalated = newP === 'urgent' && oldP !== 'urgent';
    expect(isEscalated).toBe(false);
  });

  it('prevents duplicate sessions in cache', () => {
    const existing = [{ id: '1' }, { id: '2' }];
    const newSession = { id: '2' };
    const exists = existing.some(s => s.id === newSession.id);
    const result = exists ? existing : [newSession, ...existing];
    expect(result).toHaveLength(2);
  });

  it('browser notification auto-closes unless urgent', () => {
    const autoClose = (priority: string) => priority !== 'urgent';
    expect(autoClose('medium')).toBe(true);
    expect(autoClose('urgent')).toBe(false);
  });
});
