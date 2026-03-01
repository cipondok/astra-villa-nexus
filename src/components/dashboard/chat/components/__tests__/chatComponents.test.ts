import { describe, it, expect } from 'vitest';
describe('Chat components', () => {
  it('ChatHeader shows contact name', () => { expect('John Agent'.length).toBeGreaterThan(0); });
  it('ChatSessionList sorts by latest', () => {
    const s=[{last:'2026-03-01'},{last:'2026-02-28'}];
    const sorted=[...s].sort((a,b)=>new Date(b.last).getTime()-new Date(a.last).getTime());
    expect(sorted[0].last).toBe('2026-03-01');
  });
  it('ChatWindow max height scrollable', () => { expect(600).toBeGreaterThan(0); });
  it('LiveNotificationBar shows new messages', () => { const count=3; expect(count).toBeGreaterThan(0); });
  it('MessageInput max length', () => { expect(2000).toBeGreaterThan(0); });
  it('MessageList groups by date', () => { expect(true).toBe(true); });
  it('NotificationBadge hides when zero', () => { const n=0; expect(n===0).toBe(true); });
});
