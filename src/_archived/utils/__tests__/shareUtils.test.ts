import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shareProperty } from '../shareUtils';

describe('shareProperty', () => {
  const property = {
    id: 'prop-1',
    title: 'Nice House',
    price: 500000,
    location: 'Jakarta',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Default: no share API, clipboard available
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true });
    Object.defineProperty(window, 'parent', { value: window, writable: true, configurable: true });
  });

  it('uses clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const result = await shareProperty(property);
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Nice House')
    );
  });

  it('uses native share API when available', async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: shareFn, writable: true, configurable: true });

    const result = await shareProperty(property);
    expect(result).toBe(true);
    expect(shareFn).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nice House' })
    );
  });

  it('falls back to execCommand when clipboard fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      writable: true,
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(true);

    const result = await shareProperty(property);
    expect(result).toBe(true);
  });

  it('returns false when all methods fail', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      writable: true,
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(false);

    const result = await shareProperty(property);
    expect(result).toBe(false);
  });
});
