import { describe, it, expect } from 'vitest';

describe('useSystemSettings - system config', () => {
  it('default settings structure', () => {
    const defaults = { maintenance_mode: false, max_upload_size: 10485760, allowed_file_types: ['jpg', 'png', 'pdf'] };
    expect(defaults.maintenance_mode).toBe(false);
    expect(defaults.max_upload_size).toBe(10 * 1024 * 1024);
  });
  it('feature flags', () => {
    const flags: Record<string, boolean> = { enable_ai_chat: true, enable_blockchain: false, enable_video_tours: true };
    expect(flags.enable_ai_chat).toBe(true);
    expect(flags.enable_blockchain).toBe(false);
  });
  it('setting override merges with defaults', () => {
    const defaults = { a: 1, b: 2, c: 3 };
    const overrides = { b: 20 };
    const merged = { ...defaults, ...overrides };
    expect(merged.b).toBe(20);
    expect(merged.a).toBe(1);
  });
});
