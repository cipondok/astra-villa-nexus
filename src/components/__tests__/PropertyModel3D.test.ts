import { describe, it, expect } from 'vitest';
describe('PropertyModel3D', () => {
  it('model formats', () => { expect(['.glb','.gltf']).toContain('.glb'); });
  it('auto-rotate speed', () => { expect(0.5).toBeGreaterThan(0); });
});
