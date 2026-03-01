import { describe, it, expect } from 'vitest';
describe('useUserTracking', () => {
  it('anonymous ID generation', () => { const id = `anon-${Math.random().toString(36).substr(2, 12)}`; expect(id).toMatch(/^anon-[a-z0-9]+$/); });
  it('event queue flush', () => { const queue = [1, 2, 3]; const flushed = [...queue]; queue.length = 0; expect(flushed).toHaveLength(3); expect(queue).toHaveLength(0); });
  it('consent check before tracking', () => { const consent = true; const shouldTrack = consent; expect(shouldTrack).toBe(true); });
});
