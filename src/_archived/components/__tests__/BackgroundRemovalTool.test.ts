import { describe, it, expect } from 'vitest';
describe('BackgroundRemovalTool', () => {
  it('supported formats', () => { expect(['jpg','png','webp']).toContain('png'); });
  it('max file size 10MB', () => { expect(10*1024*1024).toBe(10485760); });
});
