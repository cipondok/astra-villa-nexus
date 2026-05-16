import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestBatcher } from '../requestBatcher';

// Don't import the supabase-dependent batchers, just test the class
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

describe('RequestBatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('batches multiple requests into one processor call', async () => {
    const processor = vi.fn(async (keys: string[]) => {
      const map = new Map<string, string>();
      keys.forEach(k => map.set(k, `result-${k}`));
      return map;
    });

    const batcher = new RequestBatcher(processor, { batchDelay: 10 });

    const p1 = batcher.load('a');
    const p2 = batcher.load('b');
    const p3 = batcher.load('c');

    vi.advanceTimersByTime(10);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    expect(r1).toBe('result-a');
    expect(r2).toBe('result-b');
    expect(r3).toBe('result-c');
    expect(processor).toHaveBeenCalledTimes(1);
    expect(processor).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('deduplicates keys in a batch', async () => {
    const processor = vi.fn(async (keys: string[]) => {
      const map = new Map<string, string>();
      keys.forEach(k => map.set(k, `val-${k}`));
      return map;
    });

    const batcher = new RequestBatcher(processor, { batchDelay: 10 });

    const p1 = batcher.load('x');
    const p2 = batcher.load('x');

    vi.advanceTimersByTime(10);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe('val-x');
    expect(r2).toBe('val-x');
    // Keys should be deduplicated
    expect(processor.mock.calls[0][0]).toEqual(['x']);
  });

  it('rejects when key has no result', async () => {
    const processor = vi.fn(async () => new Map<string, string>());

    const batcher = new RequestBatcher(processor, { batchDelay: 5 });
    const p = batcher.load('missing');

    vi.advanceTimersByTime(5);

    await expect(p).rejects.toThrow('No result for key: missing');
  });

  it('rejects all requests when processor throws', async () => {
    const processor = vi.fn(async () => { throw new Error('DB down'); });

    const batcher = new RequestBatcher(processor, { batchDelay: 5 });
    const p1 = batcher.load('a');
    const p2 = batcher.load('b');

    vi.advanceTimersByTime(5);

    await expect(p1).rejects.toThrow('DB down');
    await expect(p2).rejects.toThrow('DB down');
  });

  it('flushes immediately when batch size reached', async () => {
    const processor = vi.fn(async (keys: string[]) => {
      const map = new Map<string, number>();
      keys.forEach(k => map.set(k, 1));
      return map;
    });

    const batcher = new RequestBatcher(processor, { batchSize: 2, batchDelay: 1000 });

    const p1 = batcher.load('a');
    const p2 = batcher.load('b');

    // Should flush immediately without advancing timers
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(1);
    expect(r2).toBe(1);
    expect(processor).toHaveBeenCalledTimes(1);
  });
});
