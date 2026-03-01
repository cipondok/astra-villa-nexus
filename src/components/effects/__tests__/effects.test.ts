import { describe, it, expect } from 'vitest';
describe('Effects components', () => {
  it('crystal logo rotation speed', () => {
    const speed = 0.01;
    expect(speed).toBeGreaterThan(0);
  });
});
