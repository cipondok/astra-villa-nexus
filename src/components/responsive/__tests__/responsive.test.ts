import { describe, it, expect } from 'vitest';
describe('Responsive components', () => {
  it('responsive grid columns by breakpoint', () => {
    const cols = (width: number) => width >= 1024 ? 4 : width >= 768 ? 3 : width >= 640 ? 2 : 1;
    expect(cols(1200)).toBe(4);
    expect(cols(800)).toBe(3);
    expect(cols(500)).toBe(1);
  });
});
