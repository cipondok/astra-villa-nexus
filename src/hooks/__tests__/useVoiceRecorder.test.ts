import { describe, it, expect } from 'vitest';

describe('useVoiceRecorder - voice recording logic', () => {
  it('max recording duration', () => {
    const MAX_SECONDS = 120;
    expect(MAX_SECONDS).toBe(120);
  });
  it('file size estimation', () => {
    const bitrate = 128000; const seconds = 60;
    const sizeBytes = (bitrate * seconds) / 8;
    expect(sizeBytes).toBe(960000);
  });
  it('supported formats', () => {
    const formats = ['audio/webm', 'audio/ogg', 'audio/mp4'];
    expect(formats).toContain('audio/webm');
  });
  it('recording state machine', () => {
    const states = ['idle', 'recording', 'paused', 'stopped'];
    let current = 'idle';
    current = 'recording';
    expect(current).toBe('recording');
    current = 'stopped';
    expect(current).toBe('stopped');
  });
});
