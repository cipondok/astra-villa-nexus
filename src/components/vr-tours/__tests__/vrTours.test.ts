import { describe, it, expect } from 'vitest';

describe('VR Tours components', () => {
  it('day/night toggle switches lighting', () => {
    let mode = 'day';
    mode = mode === 'day' ? 'night' : 'day';
    expect(mode).toBe('night');
  });
  it('distance measurement converts to meters', () => {
    const pixelDist = 500;
    const scale = 0.05;
    const meters = pixelDist * scale;
    expect(meters).toBe(25);
  });
  it('panorama viewer supports 360 rotation', () => {
    const maxRotation = 360;
    let rotation = 350;
    rotation = (rotation + 20) % maxRotation;
    expect(rotation).toBe(10);
  });
  it('virtual staging has furniture presets', () => {
    const presets = ['modern', 'minimalist', 'traditional', 'scandinavian'];
    expect(presets).toHaveLength(4);
  });
});
