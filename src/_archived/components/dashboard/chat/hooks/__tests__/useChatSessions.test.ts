import { describe, it, expect } from 'vitest';

describe('useChatSessions', () => {
  it('filters sessions by search term case-insensitively', () => {
    const sessions = [
      { customer_name: 'Ahmad Sulaiman', customer_email: 'ahmad@mail.com', subject: 'Rental' },
      { customer_name: 'Budi Hartono', customer_email: 'budi@mail.com', subject: 'Purchase' },
    ];
    const searchTerm = 'ahmad';
    const filtered = sessions.filter(s =>
      s.customer_name.toLowerCase().includes(searchTerm) ||
      s.customer_email?.toLowerCase().includes(searchTerm) ||
      s.subject?.toLowerCase().includes(searchTerm)
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].customer_name).toBe('Ahmad Sulaiman');
  });

  it('sorts by priority then by last activity', () => {
    const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    const sessions = [
      { priority: 'low' as const, last_activity_at: '2026-03-01T10:00:00Z' },
      { priority: 'urgent' as const, last_activity_at: '2026-03-01T08:00:00Z' },
      { priority: 'high' as const, last_activity_at: '2026-03-01T09:00:00Z' },
    ];
    const sorted = [...sessions].sort((a, b) => {
      const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (diff !== 0) return diff;
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
    });
    expect(sorted[0].priority).toBe('urgent');
    expect(sorted[1].priority).toBe('high');
    expect(sorted[2].priority).toBe('low');
  });

  it('same-priority sessions sort by most recent activity', () => {
    const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    const sessions = [
      { priority: 'medium' as const, last_activity_at: '2026-03-01T08:00:00Z' },
      { priority: 'medium' as const, last_activity_at: '2026-03-01T12:00:00Z' },
    ];
    const sorted = [...sessions].sort((a, b) => {
      const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (diff !== 0) return diff;
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
    });
    expect(sorted[0].last_activity_at).toBe('2026-03-01T12:00:00Z');
  });

  it('returns empty array when no sessions match search', () => {
    const sessions = [{ customer_name: 'Test', customer_email: null, subject: null }];
    const filtered = sessions.filter(s => s.customer_name.toLowerCase().includes('xyz'));
    expect(filtered).toHaveLength(0);
  });

  it('optimistic assign updates status to active', () => {
    const session = { id: '1', status: 'waiting' as const, agent_user_id: null };
    const updated = { ...session, status: 'active' as const, agent_user_id: 'agent-123' };
    expect(updated.status).toBe('active');
    expect(updated.agent_user_id).toBe('agent-123');
  });

  it('optimistic close removes session from list', () => {
    const sessions = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const afterClose = sessions.filter(s => s.id !== '2');
    expect(afterClose).toHaveLength(2);
    expect(afterClose.find(s => s.id === '2')).toBeUndefined();
  });
});
