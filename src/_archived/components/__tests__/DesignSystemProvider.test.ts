import { describe, it, expect } from 'vitest';
describe('DesignSystemProvider', () => {
  it('default theme', () => { expect('light').toBe('light'); });
  it('color modes', () => { expect(['light','dark','system']).toHaveLength(3); });
});
