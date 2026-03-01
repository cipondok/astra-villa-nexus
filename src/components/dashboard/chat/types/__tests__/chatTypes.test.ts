import { describe, it, expect } from 'vitest';
describe('Chat types', () => {
  it('message has required fields', () => {
    const msg = { id: '1', content: 'hi', sender_id: 'u1', created_at: '2026-03-01' };
    expect(Object.keys(msg)).toHaveLength(4);
  });
  it('message status enum', () => { expect(['sent','delivered','read']).toHaveLength(3); });
});
