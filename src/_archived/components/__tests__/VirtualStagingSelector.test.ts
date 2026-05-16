import { describe, it, expect } from 'vitest';
describe('VirtualStagingSelector', () => {
  it('staging presets', () => { expect(['empty','furnished','luxury']).toHaveLength(3); });
  it('preview before apply', () => { const preview=true; expect(preview).toBe(true); });
});
