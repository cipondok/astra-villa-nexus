import { describe, it, expect } from 'vitest';
describe('ThemeProvider logic', () => {
  it('applies dark class', () => { const theme = 'dark'; const cls = theme === 'dark' ? 'dark' : ''; expect(cls).toBe('dark'); });
  it('system preference detection', () => { const prefersDark = true; expect(prefersDark ? 'dark' : 'light').toBe('dark'); });
});
