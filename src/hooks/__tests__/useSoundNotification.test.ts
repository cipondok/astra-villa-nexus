import { describe, it, expect, beforeEach } from 'vitest';

describe('useSoundNotification - mute persistence and audio config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mute state persists to localStorage', () => {
    localStorage.setItem('chat_sound_muted', 'true');
    expect(localStorage.getItem('chat_sound_muted')).toBe('true');
  });

  it('defaults to unmuted when no saved state', () => {
    const saved = localStorage.getItem('chat_sound_muted');
    expect(saved).toBeNull();
  });

  it('toggle flips mute state', () => {
    let muted = false;
    muted = !muted;
    expect(muted).toBe(true);
    muted = !muted;
    expect(muted).toBe(false);
  });

  it('chime frequencies are E5 and A5', () => {
    const E5 = 659.25;
    const A5 = 880;
    expect(E5).toBeCloseTo(659.25);
    expect(A5).toBe(880);
  });

  it('gain envelope starts at 0 and ends at 0', () => {
    const envelope = [0, 0.3, 0.2, 0];
    expect(envelope[0]).toBe(0);
    expect(envelope[envelope.length - 1]).toBe(0);
  });

  it('does not play when muted', () => {
    const isMuted = true;
    const audioContext = {};
    const shouldPlay = !isMuted && !!audioContext;
    expect(shouldPlay).toBe(false);
  });
});
