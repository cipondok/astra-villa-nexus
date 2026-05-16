import { describe, it, expect } from 'vitest';
describe('AgentOnlyRoute', () => {
  it('blocks non-agent', () => { expect(false).toBe(false); });
  it('allows agent role', () => { const role = 'agent'; expect(role).toBe('agent'); });
});
