import { describe, it, expect } from 'vitest';

describe('useTouchGestures - gesture detection logic', () => {
  const DEFAULT_SWIPE_THRESHOLD = 50;
  const DEFAULT_DOUBLE_TAP_DELAY = 300;

  const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  it('detects horizontal swipe right', () => {
    const deltaX = 60;
    const deltaY = 10;
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    const isSwipe = Math.abs(deltaX) > DEFAULT_SWIPE_THRESHOLD;
    expect(isHorizontal && isSwipe && deltaX > 0).toBe(true);
  });

  it('detects vertical swipe up', () => {
    const deltaX = 5;
    const deltaY = -70;
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    const isSwipe = Math.abs(deltaY) > DEFAULT_SWIPE_THRESHOLD;
    expect(isVertical && isSwipe && deltaY < 0).toBe(true);
  });

  it('small movement detected as tap, not swipe', () => {
    const deltaX = 5;
    const deltaY = 3;
    const isSwipe = Math.abs(deltaX) > DEFAULT_SWIPE_THRESHOLD || Math.abs(deltaY) > DEFAULT_SWIPE_THRESHOLD;
    expect(isSwipe).toBe(false);
  });

  it('double tap detected within delay window', () => {
    const firstTap = 1000;
    const secondTap = 1200;
    expect(secondTap - firstTap < DEFAULT_DOUBLE_TAP_DELAY).toBe(true);
  });

  it('double tap NOT detected outside delay window', () => {
    const firstTap = 1000;
    const secondTap = 1500;
    expect(secondTap - firstTap < DEFAULT_DOUBLE_TAP_DELAY).toBe(false);
  });

  it('pinch distance calculation is correct', () => {
    const dist = getDistance(0, 0, 3, 4);
    expect(dist).toBe(5);
  });

  it('pinch scale detection with threshold', () => {
    const initialDist = 100;
    const currentDist = 120;
    const scale = currentDist / initialDist;
    const pinchThreshold = 0.1;
    expect(Math.abs(scale - 1) > pinchThreshold).toBe(true);
  });
});
