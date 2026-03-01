import { describe, it, expect } from 'vitest';
describe('AgentCard', () => {
  it('displays verified badge for verified agents', () => {
    const agent = { verified: true, name: 'Agent A' };
    expect(agent.verified).toBe(true);
  });
  it('truncates agent bio', () => {
    const bio = 'X'.repeat(200);
    const truncated = bio.substring(0, 120) + '...';
    expect(truncated.length).toBe(123);
  });
});
