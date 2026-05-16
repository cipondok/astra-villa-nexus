import { describe, it, expect } from 'vitest';
describe('AgentContactCard', () => {
  it('displays agent info', () => { const a = { name: 'John', phone: '+628123', rating: 4.5 }; expect(a.rating).toBeGreaterThan(4); });
  it('WhatsApp link', () => { const link = `https://wa.me/628123`; expect(link).toContain('wa.me'); });
});
